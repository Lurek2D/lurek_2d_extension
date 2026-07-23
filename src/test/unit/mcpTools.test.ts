/**
 * Unit tests for MCP tool handlers using a real fixture workspace.
 */
import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import {
  getToolDefinitions,
  handleGetApiDoc,
  handleListExamples,
  handleGetModuleInfo,
  handleInspectLuaFile,
  handleGetTestCoverage,
  handleGetProjectStructure,
  handleRagBuildIndex,
  handleRagSearch,
} from "../../mcp/tools";

type ExtensionManifest = { name?: string };

function findExtensionRoot(): string {
  const candidates = [
    path.resolve(__dirname, "../../.."),
    path.resolve(__dirname, "../.."),
    process.cwd(),
    path.join(process.cwd(), "extension", "vscode"),
  ];

  for (const candidate of candidates) {
    const packagePath = path.join(candidate, "package.json");
    if (!fs.existsSync(packagePath)) continue;
    const manifest = JSON.parse(fs.readFileSync(packagePath, "utf-8")) as ExtensionManifest;
    if (manifest.name === "lurek2d-toolkit") return candidate;
  }

  throw new Error(`Unable to locate extension/vscode from ${process.cwd()}.`);
}

function fixtureWorkspace(name: string): string {
  return path.join(findExtensionRoot(), "src", "test", "fixtures", name);
}

const WORKSPACE_ROOT = fixtureWorkspace("mcp-workspace");
const EMPTY_WORKSPACE_ROOT = fixtureWorkspace("mcp-empty-workspace");

suite("MCP tool definitions", () => {
  test("includes expected non-editor tool surface", () => {
    const names = getToolDefinitions(WORKSPACE_ROOT).map((tool) => tool.name).sort();

    assert.ok(names.includes("lurek2d.getApiDoc"));
    assert.ok(names.includes("lurek2d.runLuaTest"));
    assert.ok(names.includes("lurek2d.getModuleInfo"));
    assert.ok(names.includes("lurek2d.inspectLuaFile"));
    assert.ok(names.includes("lurek2d.getTestCoverage"));
    assert.ok(names.includes("lurek2d.getProjectStructure"));
    assert.ok(names.includes("lurek2d.ragSearch"));
    assert.ok(names.includes("rag_search"));
  });
});

suite("MCP Tools - lurek2d.getApiDoc", () => {
  test("returns documentation for a valid function name", async () => {
    const result = await handleGetApiDoc(WORKSPACE_ROOT)({ query: "lurek.render.draw" });

    assert.ok(result.includes("lurek.render.draw"));
    assert.ok(result.includes("Draw a sprite"));
  });

  test("returns error message for unknown function", async () => {
    const result = await handleGetApiDoc(WORKSPACE_ROOT)({ query: "lurek.nonexistent.thing" });

    assert.ok(result.includes("No documentation found"));
  });

  test("returns markdown formatted content for .lua API file", async () => {
    const result = await handleGetApiDoc(WORKSPACE_ROOT)({ query: "lurek.render.draw" });

    assert.ok(result.includes("```lua"));
  });

  test("returns error when query parameter is missing", async () => {
    const result = await handleGetApiDoc(WORKSPACE_ROOT)({});

    assert.ok(result.includes("Error"));
  });
});

suite("MCP Tools - lurek2d.listExamples", () => {
  test("returns Lua example file stems", async () => {
    const result = await handleListExamples(WORKSPACE_ROOT)({});

    assert.ok(result.includes("render"));
    assert.ok(result.includes("audio"));
    assert.ok(!result.includes("README.md"));
  });

  test("returns message when no examples exist", async () => {
    const result = await handleListExamples(EMPTY_WORKSPACE_ROOT)({});

    assert.ok(result.includes("No examples found"));
  });
});

suite("MCP Tools - RAG input validation", () => {
  test("ragSearch returns error when query parameter is missing", async () => {
    const result = await handleRagSearch(WORKSPACE_ROOT)({});

    assert.ok(result.includes("Error: 'query' parameter is required."));
  });

  test("ragSearch returns error for invalid profile values", async () => {
    const result = await handleRagSearch(WORKSPACE_ROOT)({ query: "RAG", profile: "invalid" });

    assert.ok(result.includes("Error: profile must be one of"));
  });

  test("ragSearch returns error for invalid limit value", async () => {
    const result = await handleRagSearch(WORKSPACE_ROOT)({ query: "RAG", limit: 99 });

    assert.ok(result.includes("Error"));
  });

  test("ragBuildIndex validates target arrays before invoking tooling", async () => {
    const result = await handleRagBuildIndex(WORKSPACE_ROOT)({ targets: ["content", 42] });

    assert.ok(result.includes("Error"));
    assert.ok(result.includes("targets"));
  });
});

suite("MCP Tools - lurek2d.getModuleInfo", () => {
  test("returns tier info and dependencies for a known module", async () => {
    const result = await handleGetModuleInfo(WORKSPACE_ROOT)({ module: "render" });
    const parsed = JSON.parse(result);

    assert.strictEqual(parsed.tier, "Platform Services");
    assert.deepStrictEqual(parsed.dependencies, ["color", "math"]);
    assert.ok(parsed.apiFunctions.includes("lurek.render.draw"));
  });

  test("returns error for unknown module name", async () => {
    const result = await handleGetModuleInfo(WORKSPACE_ROOT)({ module: "nonexistent_module" });

    assert.ok(result.includes("not found"));
    assert.ok(result.includes("render"));
  });

  test("returns error when module parameter is missing", async () => {
    const result = await handleGetModuleInfo(WORKSPACE_ROOT)({});

    assert.ok(result.includes("Error"));
  });
});

suite("MCP Tools - lurek2d.inspectLuaFile", () => {
  test("returns functions and requires for a valid Lua file", async () => {
    const result = await handleInspectLuaFile(WORKSPACE_ROOT)({ path: "content/examples/render.lua" });
    const parsed = JSON.parse(result);

    assert.ok(parsed.functions.some((fn: { name: string }) => fn.name === "helper"));
    assert.ok(parsed.requires.some((req: { module: string }) => req.module === "utils"));
    assert.strictEqual(parsed.file, "content/examples/render.lua");
  });

  test("returns error for non-existent file path", async () => {
    const result = await handleInspectLuaFile(WORKSPACE_ROOT)({ path: "content/examples/missing.lua" });

    assert.ok(result.includes("File not found"));
  });

  test("rejects paths with directory traversal or absolute escape", async () => {
    const outsidePath = path.join(path.parse(WORKSPACE_ROOT).root, "outside.lua");
    const result = await handleInspectLuaFile(WORKSPACE_ROOT)({ path: outsidePath });

    assert.ok(result.includes("Error: file path must be within the workspace"));
  });

  test("returns error when path parameter is missing", async () => {
    const result = await handleInspectLuaFile(WORKSPACE_ROOT)({});

    assert.ok(result.includes("Error"));
  });
});

suite("MCP Tools - lurek2d.getTestCoverage", () => {
  test("returns total and covered counts", async () => {
    const result = await handleGetTestCoverage(WORKSPACE_ROOT)({});
    const parsed = JSON.parse(result);

    assert.strictEqual(parsed.summary.totalFunctions, 3);
    assert.strictEqual(parsed.summary.coveredByTests, 1);
    assert.ok(parsed.summary.totalFunctions >= parsed.summary.coveredByTests);
  });

  test("uncovered array contains only valid function names", async () => {
    const result = await handleGetTestCoverage(WORKSPACE_ROOT)({});
    const parsed = JSON.parse(result);
    const renderModule = parsed.modules.find((entry: { module: string }) => entry.module === "render");

    assert.ok(renderModule.uncovered.includes("lurek.render.clear"));
    for (const fn of renderModule.uncovered) {
      assert.ok(fn.startsWith("lurek."));
    }
  });

  test("works with module filter parameter", async () => {
    const result = await handleGetTestCoverage(WORKSPACE_ROOT)({ module: "audio" });
    const parsed = JSON.parse(result);

    assert.strictEqual(parsed.modules.length, 1);
    assert.strictEqual(parsed.modules[0].module, "audio");
  });

  test("returns error when lurek-api.json is missing", async () => {
    const result = await handleGetTestCoverage(EMPTY_WORKSPACE_ROOT)({});

    assert.ok(result.includes("Error"));
  });
});

suite("MCP Tools - lurek2d.getProjectStructure", () => {
  test("returns categorized file tree", async () => {
    const result = await handleGetProjectStructure(WORKSPACE_ROOT)({});
    const parsed = JSON.parse(result);

    assert.ok(parsed.categories !== undefined);
    assert.ok(parsed.totalFiles > 0);
  });

  test("categories include scripts, images, audio, configs", async () => {
    const result = await handleGetProjectStructure(WORKSPACE_ROOT)({});
    const parsed = JSON.parse(result);

    assert.ok("scripts" in parsed.categories);
    assert.ok("images" in parsed.categories);
    assert.ok("audio" in parsed.categories);
    assert.ok("configs" in parsed.categories);
  });

  test("returns empty structure when no content exists", async () => {
    const result = await handleGetProjectStructure(EMPTY_WORKSPACE_ROOT)({});
    const parsed = JSON.parse(result);

    assert.strictEqual(parsed.totalFiles, 0);
  });
});
