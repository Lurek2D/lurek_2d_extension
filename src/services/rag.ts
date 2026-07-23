import * as child_process from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { loadRagContract } from "./ragContract.js";

const PYTHON_EXECUTABLE = process.env.LUREK_PYTHON || process.env.PYTHON || "python";
const QUERY_SCRIPT = "tools/rag/query.py";
const BUILD_SCRIPT = "tools/rag/build_index.py";
export const DEFAULT_RAG_SEARCH_TIMEOUT_MS = 15_000;
export const DEFAULT_RAG_BUILD_TIMEOUT_MS = 60_000;

export interface RagCommandResult {
  ok: boolean;
  exitCode: number;
  spawnError?: string;
  stdout: string;
  stderr: string;
  payload?: unknown;
  parseError?: string;
  errorCode?: string | number;
  signal?: string;
}

export interface RagQueryPayload {
  query?: string;
  profile?: string;
  fts_query?: string;
  mode?: string;
  error?: string;
  results?: unknown[];
}

export interface RagQueryOptions {
  profile?: "game" | "engine" | "all";
  limit?: number;
  timeoutMs?: number;
}

export function getRagContract(workspaceRoot: string) {
  return loadRagContract(workspaceRoot);
}

function createTempOutputPath(): string {
  return path.join(
    os.tmpdir(),
    `lurek2d-rag-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.json`,
  );
}

function execRagCommand(
  workspaceRoot: string,
  script: string,
  args: string[],
  timeoutMs: number,
): Promise<RagCommandResult> {
  const outputPath = createTempOutputPath();
  const command = [script, ...args, "--json", "--output", outputPath];

  return new Promise((resolve) => {
    child_process.execFile(
      PYTHON_EXECUTABLE,
      command,
      {
        cwd: workspaceRoot,
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024 * 5, // 5MB buffer for large JSON outputs
        encoding: "utf-8",
      },
      (error, stdout, stderr) => {
        let exitCode = 0;
        let spawnError: string | undefined;
        if (error) {
          if (typeof error.code === "number") {
            exitCode = error.code;
          } else {
            exitCode = -1;
            if (typeof error.code === "string") {
              spawnError = `${error.code}: ${error.message}`;
            } else if (error.message) {
              spawnError = error.message;
            } else {
              spawnError = "Unknown process spawn error";
            }
          }
          if (error.signal && !spawnError) {
            spawnError = `Process terminated with signal: ${error.signal}`;
          }
        }
        let payload: unknown = undefined;
        let parseError: string | undefined;
        const commandStdout = stdout || "";
        const commandStderr = stderr || "";

        try {
          if (fs.existsSync(outputPath)) {
            payload = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
          }
        } catch (jsonError) {
          parseError = jsonError instanceof Error ? jsonError.message : String(jsonError);
        } finally {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
        }

        const wasFailure = exitCode !== 0;
        resolve({
          ok: !wasFailure,
          exitCode,
          spawnError,
          stdout: commandStdout,
          stderr: commandStderr,
          payload,
          parseError,
          errorCode: error?.code,
          signal: error?.signal,
        });
      },
    );
  });
}

export function execRagQuery(
  workspaceRoot: string,
  query: string,
  options: RagQueryOptions = {},
): Promise<RagCommandResult> {
  const {
    profile = "all",
    limit,
    timeoutMs = DEFAULT_RAG_SEARCH_TIMEOUT_MS,
  } = options;
  const contract = getRagContract(workspaceRoot);
  const resolvedLimit = limit ?? contract.searchLimit.default;
  const normalizedLimit = Number(resolvedLimit);

  return execRagCommand(
    workspaceRoot,
    QUERY_SCRIPT,
    [query, "--profile", profile, "--limit", String(normalizedLimit)],
    timeoutMs,
  );
}

export function execRagBuildIndex(
  workspaceRoot: string,
  directories: string[] = [],
  timeoutMs = 60_000,
): Promise<RagCommandResult> {
  return execRagCommand(workspaceRoot, BUILD_SCRIPT, directories, timeoutMs);
}
