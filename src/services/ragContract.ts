import * as fs from "fs";
import * as path from "path";

const DEFAULT_WATCH_EXTENSIONS = [
  ".md",
  ".lua",
  ".rs",
  ".py",
  ".toml",
  ".html",
  ".js",
  ".ts",
  ".css",
  ".wgsl",
  ".json",
];
const DEFAULT_WATCH_PREFIXES = [
  "AGENTS.md",
  ".agents",
  ".codex",
  ".github",
  "content",
  "docs",
  "extension",
  "ideas",
  "library",
  "pages",
  "src",
  "tests",
  "tools",
];
const DEFAULT_INDEXING_ALLOWED_EXTENSIONS = [
  ".md",
  ".lua",
  ".rs",
  ".py",
  ".toml",
  ".json",
  ".html",
  ".js",
  ".ts",
  ".css",
  ".wgsl",
];
const DEFAULT_INDEXING_TARGET_DIRS = [
  "AGENTS.md",
  ".agents",
  ".codex",
  ".github",
  "content",
  "docs",
  "extension",
  "ideas",
  "library",
  "pages",
  "src",
  "tests",
  "tools",
];

function cloneRagContract(template: RagContract): RagContract {
  return {
    ...template,
    searchLimit: { ...template.searchLimit },
    readNeighbors: { ...template.readNeighbors },
    readContentChars: { ...template.readContentChars },
    contextLimit: { ...template.contextLimit },
    contextNeighbors: { ...template.contextNeighbors },
    contextContentChars: { ...template.contextContentChars },
    evalLimit: { ...template.evalLimit },
    watch: {
      extensions: [...template.watch.extensions],
      prefixes: [...template.watch.prefixes],
    },
    indexing: {
      allowedExtensions: [...template.indexing.allowedExtensions],
      defaultTargetDirs: [...template.indexing.defaultTargetDirs],
    },
  };
}

interface RagRange {
  min: number;
  max: number;
  default: number;
}

interface RawContract {
  search?: { limit?: Partial<RagRange> };
  read?: { neighbors?: Partial<RagRange>; content_chars?: Partial<RagRange> };
  context?: {
    limit?: Partial<RagRange>;
    neighbors?: Partial<RagRange>;
    content_chars?: Partial<RagRange>;
  };
  eval?: { limit?: Partial<RagRange> };
  indexing?: {
    allowed_extensions?: string[];
    default_target_dirs?: string[];
  };
  watch?: {
    extensions?: string[];
    prefixes?: string[];
  };
}

interface RagWatchConfig {
  extensions: string[];
  prefixes: string[];
}

interface RagIndexingConfig {
  allowedExtensions: string[];
  defaultTargetDirs: string[];
}

export interface RagContract {
  searchLimit: RagRange;
  readNeighbors: RagRange;
  readContentChars: RagRange;
  contextLimit: RagRange;
  contextNeighbors: RagRange;
  contextContentChars: RagRange;
  evalLimit: RagRange;
  watch: RagWatchConfig;
  indexing: RagIndexingConfig;
}

const BASE_RAG_CONTRACT: RagContract = {
  searchLimit: { min: 1, max: 25, default: 8 },
  readNeighbors: { min: 0, max: 3, default: 1 },
  readContentChars: { min: 500, max: 100000, default: 12000 },
  contextLimit: { min: 1, max: 25, default: 8 },
  contextNeighbors: { min: 0, max: 3, default: 1 },
  contextContentChars: { min: 500, max: 100000, default: 8000 },
  evalLimit: { min: 3, max: 25, default: 10 },
  watch: {
    extensions: DEFAULT_WATCH_EXTENSIONS,
    prefixes: DEFAULT_WATCH_PREFIXES,
  },
  indexing: {
    allowedExtensions: DEFAULT_INDEXING_ALLOWED_EXTENSIONS,
    defaultTargetDirs: DEFAULT_INDEXING_TARGET_DIRS,
  },
};

function asInt(value: unknown, fallback: number): number {
  if (value === undefined || value === null) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function asRange(value: unknown, fallback: RagRange): RagRange {
  if (value === undefined || value === null || typeof value !== "object") {
    return { ...fallback };
  }
  let min = asInt((value as Partial<RagRange>).min, fallback.min);
  let max = asInt((value as Partial<RagRange>).max, fallback.max);
  let defaultValue = asInt((value as Partial<RagRange>).default, fallback.default);
  if (min > max) {
    [min, max] = [max, min];
  }
  if (defaultValue < min) {
    defaultValue = min;
  } else if (defaultValue > max) {
    defaultValue = max;
  }
  return {
    min,
    max,
    default: defaultValue,
  };
}

function asStringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return normalized.length > 0 ? normalized : [...fallback];
}

export function loadRagContract(workspaceRoot: string): RagContract {
  const contractPath = path.join(workspaceRoot, "tools", "rag", "rag_contract.json");
  try {
    if (!fs.existsSync(contractPath)) {
      return cloneRagContract(BASE_RAG_CONTRACT);
    }
    const raw = JSON.parse(fs.readFileSync(contractPath, "utf-8")) as RawContract;
    return {
      searchLimit: asRange(raw.search?.limit, BASE_RAG_CONTRACT.searchLimit),
      readNeighbors: asRange(raw.read?.neighbors, BASE_RAG_CONTRACT.readNeighbors),
      readContentChars: asRange(
        raw.read?.content_chars,
        BASE_RAG_CONTRACT.readContentChars,
      ),
      contextLimit: asRange(raw.context?.limit, BASE_RAG_CONTRACT.contextLimit),
      contextNeighbors: asRange(
        raw.context?.neighbors,
        BASE_RAG_CONTRACT.contextNeighbors,
      ),
      contextContentChars: asRange(
        raw.context?.content_chars,
        BASE_RAG_CONTRACT.contextContentChars,
      ),
      evalLimit: asRange(raw.eval?.limit, BASE_RAG_CONTRACT.evalLimit),
      watch: {
        extensions: asStringList(raw.watch?.extensions, BASE_RAG_CONTRACT.watch.extensions),
        prefixes: asStringList(raw.watch?.prefixes, BASE_RAG_CONTRACT.watch.prefixes),
      },
      indexing: {
        allowedExtensions: asStringList(
          raw.indexing?.allowed_extensions,
          BASE_RAG_CONTRACT.indexing.allowedExtensions,
        ),
        defaultTargetDirs: asStringList(
          raw.indexing?.default_target_dirs,
          BASE_RAG_CONTRACT.indexing.defaultTargetDirs,
        ),
      },
    };
  } catch {
    return cloneRagContract(BASE_RAG_CONTRACT);
  }
}

export function getRagContract(workspaceRoot: string): RagContract {
  return loadRagContract(workspaceRoot);
}

export const DEFAULT_RAG_CONTRACT = cloneRagContract(BASE_RAG_CONTRACT);
