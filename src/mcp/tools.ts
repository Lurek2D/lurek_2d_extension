import * as fs from "fs";
import * as path from "path";
import { resolveWorkspaceApiDocPath, searchApiDocumentation } from "../services/apiDocs.js";
import { execParallelCargoCommand } from "../services/parallelCargo.js";
import {
  RagCommandResult,
  RagQueryOptions,
  DEFAULT_RAG_BUILD_TIMEOUT_MS,
  execRagQuery,
  execRagBuildIndex,
} from "../services/rag.js";
import { getRagContract } from "../services/ragContract.js";
import { ApiDataService } from "../services/apiData.js";
import { LuaDocumentAnalyzer } from "../services/luaParser.js";

/**
 * MCP tool definition following the Model Context Protocol schema.
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<
      string,
      {
        type: string;
        description: string;
        enum?: Array<string> | Array<number>;
        default?: string | number | boolean;
        minimum?: number;
        maximum?: number;
      }
    >;
    required?: string[];
    additionalProperties?: boolean;
  };
}

/**
 * A tool handler function that accepts arguments and returns a text result.
 */
export type ToolHandler = (
  args: Record<string, unknown>
) => Promise<string>;

interface RagToolSummary {
  ok: boolean;
  operation: string;
  output: unknown;
  exit_code: number;
  stderr?: string;
  error?: string;
  spawnError?: string;
}

function ragResponseToText(result: RagCommandResult, operation: string): string {
  const payload = result.payload as Record<string, unknown> | null;
  const payloadError = payload && typeof payload === "object" && "error" in payload
    ? String(payload.error)
    : undefined;
  const summary: RagToolSummary = {
    ok: result.ok && !payloadError,
    operation,
    output: payload ?? null,
    exit_code: result.exitCode,
  };
  if (payloadError) {
    summary.error = payloadError;
  }
  if (!result.ok && (result.parseError || result.stderr || result.stdout)) {
    summary.error = [payloadError, result.parseError, result.stderr, result.stdout]
      .filter((value): value is string => Boolean(value && String(value).trim().length > 0))
      .join(" | ");
  } else if (result.parseError) {
    summary.error = result.parseError;
  }
  if (result.stderr) {
    summary.stderr = result.stderr.trim();
  }
  if (result.spawnError) {
    summary.spawnError = result.spawnError;
  }
  return JSON.stringify(summary, null, 2);
}

function normalizeRagProfile(value: unknown): "game" | "engine" | "all" {
  if (value === "game" || value === "engine" || value === "all") {
    return value;
  }
  return "all";
}

function normalizeRagLimit(
  value: unknown,
  range: { min: number; max: number; default: number }
): number {
  if (value === undefined) {
    return range.default;
  }
  const normalized = Number(value);
  if (!Number.isInteger(normalized)) {
    throw new Error("`limit` must be an integer.");
  }
  if (normalized < range.min || normalized > range.max) {
    throw new Error(
      `limit must be between ${range.min} and ${range.max}.`
    );
  }
  return normalized;
}

function toRagTargets(value: unknown, fieldName: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`'${fieldName}' must be an array of strings.`);
  }
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      throw new Error(`'${fieldName}' must contain only strings.`);
    }
    const normalized = item.trim();
    if (normalized) {
      result.push(normalized);
    }
  }
  return result;
}

/**
 * Returns all MCP tool definitions for the Lurek2D server.
 */
export function getToolDefinitions(workspaceRoot: string = process.cwd()): ToolDefinition[] {
  const ragContract = getRagContract(workspaceRoot);

  return [
    {
      name: "lurek2d.runExample",
      description:
        "Build and run a named Lurek2D example, returning its output.",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              'Name of the example directory (e.g. "hello_world").',
          },
        },
        required: ["name"],
      },
    },
    {
      name: "lurek2d.getApiDoc",
      description:
        "Search the Lurek2D Lua API documentation for a query string.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              'Search query (e.g. "lurek.graphics.draw" or "physics").',
          },
        },
        required: ["query"],
      },
    },
    {
      name: "lurek2d.listExamples",
      description: "List all available Lurek2D example files.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "lurek2d.runLuaTest",
      description: "Run a Lua test file against a debug build of Lurek2D.",
      inputSchema: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description:
              "Path to the Lua test file, relative to workspace root.",
          },
        },
        required: ["file"],
      },
    },
    {
      name: "lurek2d.checkBuild",
      description:
        "Run the wrapper-backed repo check flow and return compiler diagnostics.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "lurek2d.getLogs",
      description:
        "Return the last N lines of Lurek2D engine log output.",
      inputSchema: {
        type: "object",
        properties: {
          lines: {
            type: "number",
            description:
              "Number of log lines to return (default: 50).",
          },
        },
      },
    },
    {
      name: "lurek2d.ragSearch",
      description:
        "Search the local Lurek2D RAG index for API examples, specs, and best practices.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              'Search query keywords (e.g. "lurek.graphics draw", "audio play").',
          },
          limit: {
            type: "integer",
            description: "Maximum number of results to return.",
            minimum: ragContract.searchLimit.min,
            maximum: ragContract.searchLimit.max,
            default: ragContract.searchLimit.default,
          },
          profile: {
            type: "string",
            description: "Target developer profile (game, engine, or all).",
            enum: ["game", "engine", "all"],
            default: "all",
          },
        },
        additionalProperties: false,
        required: ["query"],
      },
    },
    {
      name: "rag_search",
      description:
        "Search the local Lurek2D RAG index for API examples, specs, and best practices.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              'Search query keywords (e.g. "lurek.graphics draw", "audio play").',
          },
          limit: {
            type: "integer",
            description: "Maximum number of results to return.",
            minimum: ragContract.searchLimit.min,
            maximum: ragContract.searchLimit.max,
            default: ragContract.searchLimit.default,
          },
          profile: {
            type: "string",
            description: "Target developer profile (game, engine, or all).",
            enum: ["game", "engine", "all"],
            default: "all",
          },
        },
        additionalProperties: false,
        required: ["query"],
      },
    },
    {
      name: "lurek2d.ragBuildIndex",
      description: "Trigger an on-demand rebuild of the local RAG index.",
      inputSchema: {
        type: "object",
        properties: {
          directories: {
            type: "array",
            items: { type: "string" },
            description: "Optional list of specific directories to index. Defaults to all.",
          },
          targets: {
            type: "array",
            items: { type: "string" },
            description: "Alias for directories.",
          },
        },
        additionalProperties: false,
      },
    },
    {
      name: "rag_rebuild_index",
      description: "Rebuild or incrementally refresh the local RAG index.",
      inputSchema: {
        type: "object",
        properties: {
          targets: {
            type: "array",
            items: { type: "string" },
            description: "Optional list of specific directories or files to index. Defaults to all.",
          },
          directories: {
            type: "array",
            items: { type: "string" },
            description: "Alias for `targets`; kept for MCP naming parity.",
          },
        },
        additionalProperties: false,
      },
    },
    {
      name: "lurek2d.getModuleInfo",
      description:
        "Get metadata about a Lurek2D engine module including tier, file list, dependencies, and lurek.* API surface.",
      inputSchema: {
        type: "object",
        properties: {
          module: {
            type: "string",
            description:
              'Name of the engine module (e.g. "render", "physics", "audio").',
          },
        },
        required: ["module"],
      },
    },
    {
      name: "lurek2d.inspectLuaFile",
      description:
        "Parse a Lua file and return its structure: functions defined, requires used, globals accessed, and lurek.* callbacks.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Workspace-relative path to a .lua file.",
          },
        },
        required: ["path"],
      },
    },
    {
      name: "lurek2d.getTestCoverage",
      description:
        "Get test coverage summary: total API functions, covered by tests, and uncovered list. Optionally filter by module.",
      inputSchema: {
        type: "object",
        properties: {
          module: {
            type: "string",
            description:
              'Optional module name to filter (e.g. "graphics", "audio"). Omit for all modules.',
          },
        },
      },
    },
    {
      name: "lurek2d.getProjectStructure",
      description:
        "Scan the workspace and return a categorized file tree of game project assets (lua scripts, images, audio, configs).",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ];
}

/**
/**
 * Creates the handler for `lurek2d.runExample`.
 *
 * Builds and runs the specified single-file example via the wrapper-backed run path.
 */
export function handleRunExample(
  workspaceRoot: string
): ToolHandler {
  return async (args) => {
    const name = args.name as string | undefined;
    if (!name) {
      return "Error: 'name' parameter is required.";
    }

    const exampleName = name.endsWith(".lua") ? name : `${name}.lua`;
    const examplePath = path.join(workspaceRoot, "content", "examples", exampleName);
    if (!fs.existsSync(examplePath)) {
      const available = listExampleFiles(workspaceRoot);
      return `Example "${name}" not found. Available: ${available.join(", ")}`;
    }

    const relativeExamplePath = path.posix.join("content", "examples", exampleName);
    return execParallelCargoCommand(workspaceRoot, ["run", "debug", "--", relativeExamplePath], 120_000);
  };
}

/**
 * Creates the handler for `lurek2d.getApiDoc`.
 *
 * Searches the canonical workspace API reference for sections matching the
 * query string (case-insensitive).
 */
export function handleGetApiDoc(
  workspaceRoot: string
): ToolHandler {
  return async (args) => {
    const query = args.query as string | undefined;
    if (!query) {
      return "Error: 'query' parameter is required.";
    }

    const apiDocPath = resolveWorkspaceApiDocPath(workspaceRoot);

    if (!apiDocPath || !fs.existsSync(apiDocPath)) {
      return "API reference not found. Expected docs/api/lurek.lua or docs/api/lurek.md.";
    }

    const content = fs.readFileSync(apiDocPath, "utf-8");
    const matches = searchApiDocumentation(content, apiDocPath, query);

    if (matches.length === 0) {
      return `No documentation found for "${query}".`;
    }

    if (apiDocPath.endsWith(".lua")) {
      return matches.map((match) => `\`\`\`lua\n${match}\n\`\`\``).join("\n\n---\n\n");
    }

    return matches.join("\n\n---\n\n");
  };
}

/**
 * Creates the handler for `lurek2d.listExamples`.
 *
 * Returns a newline-separated list of example file stems.
 */
export function handleListExamples(
  workspaceRoot: string
): ToolHandler {
  return async () => {
    const examples = listExampleFiles(workspaceRoot);
    if (examples.length === 0) {
      return "No examples found in content/examples/.";
    }
    return examples.join("\n");
  };
}

/**
 * Creates the handler for `lurek2d.runLuaTest`.
 *
 * Runs a Lua test file via the wrapper-backed debug run path.
 */
export function handleRunLuaTest(
  workspaceRoot: string
): ToolHandler {
  return async (args) => {
    const file = args.file as string | undefined;
    if (!file) {
      return "Error: 'file' parameter is required.";
    }

    // Prevent path traversal
    const resolved = path.resolve(workspaceRoot, file);
    if (!resolved.startsWith(workspaceRoot)) {
      return "Error: file path must be within the workspace.";
    }

    if (!fs.existsSync(resolved)) {
      return `Test file not found: ${file}`;
    }

    const relativeFile = path.relative(workspaceRoot, resolved).replace(/\\/g, "/");
    return execParallelCargoCommand(workspaceRoot, ["run", "debug", "--", relativeFile], 120_000);
  };
}

/**
 * Creates the handler for `lurek2d.checkBuild`.
 *
 * Runs the wrapper-backed repo check flow and returns the compiler output.
 */
export function handleCheckBuild(
  workspaceRoot: string
): ToolHandler {
  return async () => {
    return execParallelCargoCommand(workspaceRoot, ["check"], 120_000);
  };
}

/**
 * Creates the handler for `lurek2d.getLogs`.
 *
 * Returns the last N lines from the engine log file, if any.
 * Falls back to a message indicating no log file was found.
 */
export function handleGetLogs(
  workspaceRoot: string
): ToolHandler {
  return async (args) => {
    const lines = (args.lines as number) || 50;

    // Check common log file locations
    const logPaths = [
      path.join(workspaceRoot, "lurek2d.log"),
      path.join(workspaceRoot, "target", "lurek2d.log"),
    ];

    for (const logPath of logPaths) {
      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, "utf-8");
        const allLines = content.split("\n");
        const tail = allLines.slice(-lines);
        return tail.join("\n");
      }
    }

    return "No log file found. Engine logs are written to stdout by default. Use RUST_LOG=lurek2d=debug to enable verbose logging.";
  };
}

/**
 * Lists example file stems from the workspace content/examples/ folder.
 */
function listExampleFiles(workspaceRoot: string): string[] {
  const examplesDir = path.join(workspaceRoot, "content", "examples");
  if (!fs.existsSync(examplesDir)) {
    return [];
  }
  try {
    return fs
      .readdirSync(examplesDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".lua"))
      .map((entry) => entry.name.replace(/\.lua$/, ""));
  } catch {
    return [];
  }
}

/**
 * Creates the handler for `lurek2d.ragSearch`.
 *
 * Queries the local SQLite RAG index.
 */
export function handleRagSearch(
  workspaceRoot: string
): ToolHandler {
  return async (args) => {
    const query = args.query as string | undefined;
    if (!query) {
      return "Error: 'query' parameter is required.";
    }
    if (typeof query !== "string" || !query.trim()) {
      return "Error: 'query' must be a non-empty string.";
    }
    const profile = normalizeRagProfile(args.profile);
    if (args.profile !== undefined && profile !== args.profile) {
      return "Error: profile must be one of: game, engine, all.";
    }
    const ragContract = getRagContract(workspaceRoot);
    let limit: number;
    try {
      limit = normalizeRagLimit(args.limit, ragContract.searchLimit);
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : String(err)}`;
    }

    const options: RagQueryOptions = {
      profile,
      limit,
    };
    const result = await execRagQuery(
      workspaceRoot,
      query,
      options,
    );
    return ragResponseToText(result, "ragSearch");
  };
}

/**
 * Creates the handler for `lurek2d.ragBuildIndex`.
 *
 * Builds the local SQLite RAG index on-demand.
 */
export function handleRagBuildIndex(
  workspaceRoot: string
): ToolHandler {
  return async (args) => {
    const request = args as Record<string, unknown>;
    let directories: string[];
    try {
      directories = toRagTargets(request.directories, "directories");
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
    let targets: string[] = [];
    try {
      targets = toRagTargets(request.targets, "targets");
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
    const merged = Array.from(new Set([...directories, ...targets]));
    const result = await execRagBuildIndex(
      workspaceRoot,
      merged,
      DEFAULT_RAG_BUILD_TIMEOUT_MS,
    );
    return ragResponseToText(result, "ragBuildIndex");
  };
}

/** Known module tier mapping (Foundations → Edge/Integration). */
const MODULE_TIERS: Record<string, string> = {
  log: "Foundations", math: "Foundations", color: "Foundations",
  event: "Foundations", timer: "Foundations", data: "Foundations",
  runtime: "Core Runtime", app: "Core Runtime", window: "Core Runtime",
  input: "Core Runtime", filesystem: "Core Runtime",
  render: "Platform Services", audio: "Platform Services",
  font: "Platform Services", image: "Platform Services",
  physics: "Feature Systems", animation: "Feature Systems",
  particle: "Feature Systems", tilemap: "Feature Systems",
  sprite: "Feature Systems", camera: "Feature Systems",
  scene: "Feature Systems", tween: "Feature Systems",
  ui: "Feature Systems", ecs: "Feature Systems",
  light: "Feature Systems", effect: "Feature Systems",
  pathfind: "Feature Systems", ai: "Feature Systems",
  charts: "Feature Systems", compute: "Feature Systems",
  network: "Edge/Integration", mods: "Edge/Integration",
  save: "Edge/Integration", thread: "Edge/Integration",
  repl: "Edge/Integration", debugbridge: "Edge/Integration",
  devtools: "Edge/Integration", terminal: "Edge/Integration",
  i18n: "Edge/Integration", serial: "Edge/Integration",
};

/**
 * Creates the handler for `lurek2d.getModuleInfo`.
 *
 * Returns module metadata: tier, files, dependencies, and API surface.
 */
export function handleGetModuleInfo(
  workspaceRoot: string
): ToolHandler {
  return async (args) => {
    const moduleName = args.module as string | undefined;
    if (!moduleName) {
      return "Error: 'module' parameter is required.";
    }

    const moduleDir = path.join(workspaceRoot, "src", moduleName);
    if (!fs.existsSync(moduleDir)) {
      const available = fs.readdirSync(path.join(workspaceRoot, "src"), { withFileTypes: true })
        .filter(e => e.isDirectory() && !e.name.startsWith("."))
        .map(e => e.name);
      return `Module "${moduleName}" not found in src/. Available: ${available.join(", ")}`;
    }

    // Collect files
    const files = collectFiles(moduleDir, moduleDir);

    // Determine tier
    const tier = MODULE_TIERS[moduleName] || "Unknown";

    // Scan for dependencies (use statements referencing other crate modules)
    const deps = new Set<string>();
    for (const file of files) {
      if (file.endsWith(".rs")) {
        const fullPath = path.join(moduleDir, file);
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          const useMatches = content.matchAll(/use\s+crate::(\w+)/g);
          for (const m of useMatches) {
            if (m[1] !== moduleName) {
              deps.add(m[1]);
            }
          }
        } catch { /* skip unreadable */ }
      }
    }

    // Get API surface from lua_api binding file
    const apiFile = path.join(workspaceRoot, "src", "lua_api", `${moduleName}_api.rs`);
    const apiFunctions: string[] = [];
    if (fs.existsSync(apiFile)) {
      try {
        const apiContent = fs.readFileSync(apiFile, "utf-8");
        const fnMatches = apiContent.matchAll(/---\s*@summary\s+(.+)|"(lurek\.\w+[\w.]*\w*)"/g);
        for (const m of fnMatches) {
          if (m[2]) {
            apiFunctions.push(m[2]);
          }
        }
      } catch { /* skip */ }
    }

    // Also try loading from ApiDataService data
    const apiDataPath = resolveExtensionApiDataPath(workspaceRoot);
    if (fs.existsSync(apiDataPath) && apiFunctions.length === 0) {
      try {
        const raw = JSON.parse(fs.readFileSync(apiDataPath, "utf-8"));
        const modules = raw.modules as { name: string; functions?: { fullPath: string }[] }[];
        const mod = modules?.find(m => m.name === moduleName);
        if (mod?.functions) {
          for (const fn of mod.functions) {
            apiFunctions.push(fn.fullPath);
          }
        }
      } catch { /* skip */ }
    }

    const result = {
      module: moduleName,
      tier,
      files,
      fileCount: files.length,
      dependencies: Array.from(deps).sort(),
      apiFunctions,
      apiFunctionCount: apiFunctions.length,
    };

    return JSON.stringify(result, null, 2);
  };
}

/**
 * Creates the handler for `lurek2d.inspectLuaFile`.
 *
 * Parses a Lua file and returns its structural information.
 */
export function handleInspectLuaFile(
  workspaceRoot: string
): ToolHandler {
  return async (args) => {
    const filePath = args.path as string | undefined;
    if (!filePath) {
      return "Error: 'path' parameter is required.";
    }

    // Prevent path traversal
    const resolved = path.resolve(workspaceRoot, filePath);
    if (!resolved.startsWith(workspaceRoot)) {
      return "Error: file path must be within the workspace.";
    }

    if (!fs.existsSync(resolved)) {
      return `File not found: ${filePath}`;
    }

    if (!resolved.endsWith(".lua")) {
      return "Error: only .lua files can be inspected.";
    }

    const content = fs.readFileSync(resolved, "utf-8");
    const analyzer = new LuaDocumentAnalyzer();
    const info = analyzer.analyze(content);

    const functions = info.symbols
      .filter(s => s.kind === "function" || s.kind === "method")
      .map(s => ({
        name: s.name,
        kind: s.kind,
        line: s.line + 1,
        parameters: s.parameters || [],
        isLocal: s.isLocal,
      }));

    const requires = info.requires.map(r => ({
      module: r.modulePath,
      localName: r.localName,
      line: r.line + 1,
    }));

    const callbacks = info.callbacks.map(c => ({
      name: c.name,
      line: c.line + 1,
      parameters: c.parameters || [],
    }));

    const globals = info.symbols
      .filter(s => !s.isLocal && s.kind !== "function" && s.kind !== "method" && s.kind !== "parameter")
      .map(s => ({ name: s.name, kind: s.kind, line: s.line + 1 }));

    const result = {
      file: filePath,
      functions,
      requires,
      callbacks,
      globals,
      lineCount: content.split("\n").length,
    };

    return JSON.stringify(result, null, 2);
  };
}

/**
 * Creates the handler for `lurek2d.getTestCoverage`.
 *
 * Cross-references API functions with test files in tests/lua/unit/.
 */
export function handleGetTestCoverage(
  workspaceRoot: string
): ToolHandler {
  return async (args) => {
    const filterModule = args.module as string | undefined;

    // Load API data
    const apiDataPath = resolveExtensionApiDataPath(workspaceRoot);
    if (!fs.existsSync(apiDataPath)) {
      return "Error: lurek-api.json not found. Run 'python tools/docs/gen_extension_api.py' first.";
    }

    let apiData: { modules?: { name: string; functions?: { name: string; fullPath: string }[] }[] };
    try {
      apiData = JSON.parse(fs.readFileSync(apiDataPath, "utf-8"));
    } catch {
      return "Error: failed to parse lurek-api.json.";
    }

    if (!apiData.modules) {
      return "Error: no modules found in lurek-api.json.";
    }

    // Collect test file contents
    const testDir = path.join(workspaceRoot, "tests", "lua", "unit");
    const testContents = new Map<string, string>();
    if (fs.existsSync(testDir)) {
      const testFiles = collectFiles(testDir, testDir).filter(f => f.endsWith(".lua"));
      for (const tf of testFiles) {
        try {
          testContents.set(tf, fs.readFileSync(path.join(testDir, tf), "utf-8"));
        } catch { /* skip */ }
      }
    }

    const allTestContent = Array.from(testContents.values()).join("\n");

    const results: {
      module: string;
      total: number;
      covered: number;
      uncovered: string[];
    }[] = [];

    for (const mod of apiData.modules) {
      if (filterModule && mod.name !== filterModule) {
        continue;
      }

      const functions = mod.functions || [];
      const covered: string[] = [];
      const uncovered: string[] = [];

      for (const fn of functions) {
        // Check if the function name appears in any test file
        if (allTestContent.includes(fn.fullPath) || allTestContent.includes(fn.name)) {
          covered.push(fn.fullPath);
        } else {
          uncovered.push(fn.fullPath);
        }
      }

      results.push({
        module: mod.name,
        total: functions.length,
        covered: covered.length,
        uncovered,
      });
    }

    const totalFns = results.reduce((sum, r) => sum + r.total, 0);
    const totalCovered = results.reduce((sum, r) => sum + r.covered, 0);

    const output = {
      summary: {
        totalFunctions: totalFns,
        coveredByTests: totalCovered,
        coveragePercent: totalFns > 0 ? Math.round((totalCovered / totalFns) * 100) : 0,
      },
      modules: results,
    };

    return JSON.stringify(output, null, 2);
  };
}

/**
 * Creates the handler for `lurek2d.getProjectStructure`.
 *
 * Scans the workspace for game project files and returns a categorized tree.
 */
export function handleGetProjectStructure(
  workspaceRoot: string
): ToolHandler {
  return async () => {
    const categories: Record<string, string[]> = {
      scripts: [],
      images: [],
      audio: [],
      configs: [],
      shaders: [],
      fonts: [],
      other: [],
    };

    const extensionMap: Record<string, keyof typeof categories> = {
      ".lua": "scripts",
      ".png": "images",
      ".jpg": "images",
      ".jpeg": "images",
      ".bmp": "images",
      ".dds": "images",
      ".gif": "images",
      ".webp": "images",
      ".ogg": "audio",
      ".wav": "audio",
      ".mp3": "audio",
      ".flac": "audio",
      ".toml": "configs",
      ".json": "configs",
      ".wgsl": "shaders",
      ".glsl": "shaders",
      ".ttf": "fonts",
      ".otf": "fonts",
      ".fnt": "fonts",
    };

    // Scan content/ directory (game assets and scripts)
    const contentDir = path.join(workspaceRoot, "content");
    if (fs.existsSync(contentDir)) {
      const files = collectFiles(contentDir, workspaceRoot);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const category = extensionMap[ext] || "other";
        categories[category].push(file);
      }
    }

    // Scan assets/ directory
    const assetsDir = path.join(workspaceRoot, "assets");
    if (fs.existsSync(assetsDir)) {
      const files = collectFiles(assetsDir, workspaceRoot);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const category = extensionMap[ext] || "other";
        categories[category].push(file);
      }
    }

    // Check for root-level main.lua or conf.toml
    const rootLua = path.join(workspaceRoot, "main.lua");
    if (fs.existsSync(rootLua)) {
      categories.scripts.push("main.lua");
    }
    const rootConf = path.join(workspaceRoot, "conf.toml");
    if (fs.existsSync(rootConf)) {
      categories.configs.push("conf.toml");
    }

    const result = {
      totalFiles: Object.values(categories).reduce((sum, arr) => sum + arr.length, 0),
      categories: Object.fromEntries(
        Object.entries(categories)
          .filter(([, files]) => files.length > 0)
          .map(([cat, files]) => [cat, { count: files.length, files }])
      ),
    };

    return JSON.stringify(result, null, 2);
  };
}

/**
 * Recursively collects file paths relative to a base directory.
 * Skips hidden directories and common non-project folders.
 */
function collectFiles(dir: string, baseDir: string, maxDepth = 5): string[] {
  const results: string[] = [];
  const skipDirs = new Set(["node_modules", "target", ".git", "__pycache__", "dist"]);

  function walk(current: string, depth: number): void {
    if (depth > maxDepth) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) {
          walk(fullPath, depth + 1);
        }
      } else {
        const relative = path.relative(baseDir, fullPath).replace(/\\/g, "/");
        results.push(relative);
      }
    }
  }

  walk(dir, 0);
  return results;
}

function resolveExtensionApiDataPath(workspaceRoot: string): string {
  const candidates = [
    path.join(workspaceRoot, "extension", "vscode", "data", "lurek-api.json"),
    path.join(workspaceRoot, "extensions", "vscode", "data", "lurek-api.json"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}
