import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { buildRunCommand } from "./parallelCargo.js";

/**
 * Manages the Lurek2D game process lifecycle — launching, stopping,
 * and reporting status.
 */
export class LurekProcessService {
  private readonly terminals = new Set<vscode.Terminal>();
  private readonly terminalCloseListener: vscode.Disposable;
  private runCounter = 0;
  private readonly _onStatusChange = new vscode.EventEmitter<boolean>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor() {
    this.terminalCloseListener = vscode.window.onDidCloseTerminal((terminal) => {
      if (!this.terminals.delete(terminal)) {
        return;
      }

      if (this.terminals.size === 0) {
        this._onStatusChange.fire(false);
        void vscode.commands.executeCommand("setContext", "lurek.gameRunning", false);
      }
    });
  }

  /**
   * Runs the game in an integrated terminal.
   */
  async run(gameDir: string, args: string[] = []): Promise<void> {
    const saveOnRun = vscode.workspace
      .getConfiguration("lurek")
      .get<boolean>("saveOnRun", true);
    if (saveOnRun) {
      await vscode.workspace.saveAll(false);
    }

    const workspaceRoot = getWorkspaceRootForPath(gameDir) ?? getWorkspaceRoot();
    const launchArgs = [gameDir, ...args];
    const useCargoRun = Boolean(workspaceRoot && isCargoWorkspace(workspaceRoot));
    const terminalOptions: vscode.TerminalOptions = {
      name: `Lurek2D Debug #${++this.runCounter}`,
    };
    if (workspaceRoot) {
      terminalOptions.cwd = workspaceRoot;
    }
    if (!useCargoRun) {
      const binary = getConfiguredBinaryPath();
      if (!binary || !fs.existsSync(binary)) {
        throw new Error(
          "Lurek2D binary not found. In non-Cargo workspaces set lurek.lurekPath or lurek.enginePath."
        );
      }
      // Launch the installed binary directly so paths like Program Files do not
      // depend on the user's shell quoting rules.
      terminalOptions.shellPath = binary;
      terminalOptions.shellArgs = launchArgs;
    }

    const terminal = vscode.window.createTerminal(terminalOptions);
    this.terminals.add(terminal);
    terminal.show();
    if (useCargoRun) {
      terminal.sendText(buildRunCommand("debug", launchArgs));
    }

    this._onStatusChange.fire(true);
    void vscode.commands.executeCommand("setContext", "lurek.gameRunning", true);
  }

  /**
   * Stops the running game process.
   */
  stop(): void {
    const running = Array.from(this.terminals);
    this.terminals.clear();

    for (const terminal of running) {
      terminal.dispose();
    }

    this._onStatusChange.fire(false);
    void vscode.commands.executeCommand("setContext", "lurek.gameRunning", false);
  }

  /**
   * Returns whether a game process is currently running.
   */
  isRunning(): boolean {
    return this.terminals.size > 0;
  }

  dispose(): void {
    this.stop();
    this.terminalCloseListener.dispose();
    this._onStatusChange.dispose();
  }
}

function isCargoWorkspace(workspaceRoot: string): boolean {
  return fs.existsSync(path.join(workspaceRoot, "Cargo.toml"));
}

function getWorkspaceRoot(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  return folders?.[0]?.uri.fsPath;
}

function getWorkspaceRootForPath(fsPath: string): string | undefined {
  const folders = vscode.workspace.workspaceFolders ?? [];
  let bestMatch: string | undefined;
  for (const folder of folders) {
    const root = folder.uri.fsPath;
    if (fsPath === root || fsPath.startsWith(root + path.sep)) {
      if (!bestMatch || root.length > bestMatch.length) {
        bestMatch = root;
      }
    }
  }
  return bestMatch;
}

function getConfiguredBinaryPath(): string {
  const config = vscode.workspace.getConfiguration("lurek");
  const configuredPaths = [
    config.get<string>("lurekPath", ""),
    config.get<string>("enginePath", ""),
  ];

  for (const configuredPath of configuredPaths) {
    const trimmed = configuredPath.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return "";
}
