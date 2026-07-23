import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { LurekProcessService } from "../services/lurekProcess.js";

/**
 * Runs the game from the given URI (Explorer context), configured srcDir, or workspace root.
 */
export async function runGame(lurekProcess: LurekProcessService, uri?: vscode.Uri): Promise<void> {
  // When invoked from the Explorer context menu the folder URI is always a directory
  // (enforced by `when: "explorerResourceIsFolder"` in package.json).
  if (uri) {
    try {
      await lurekProcess.run(uri.fsPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Failed to run Lurek2D: ${msg}`);
    }
    return;
  }

  const root = getWorkspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return;
  }

  // Determine game directory
  const srcDir = vscode.workspace
    .getConfiguration("lurek")
    .get<string>("srcDir", "");
  const gameDir = srcDir ? path.join(root, srcDir) : root;

  try {
    await lurekProcess.run(gameDir);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Failed to run Lurek2D: ${msg}`);
  }
}

/**
 * Stops the currently running game.
 */
export function stopGame(lurekProcess: LurekProcessService): void {
  if (!lurekProcess.isRunning()) {
    vscode.window.showInformationMessage("No Lurek2D game is running.");
    return;
  }
  lurekProcess.stop();
  vscode.window.showInformationMessage("Lurek2D game stopped.");
}

/**
 * Runs the game with user-provided extra arguments.
 */
export async function runWithArgs(
  lurekProcess: LurekProcessService
): Promise<void> {
  const args = await vscode.window.showInputBox({
    prompt: "Enter arguments for Lurek2D",
    placeHolder: "e.g. --debug --fps-cap 60",
  });
  if (args === undefined) {
    return;
  }

  const root = getWorkspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return;
  }

  const srcDir = vscode.workspace
    .getConfiguration("lurek")
    .get<string>("srcDir", "");
  const gameDir = srcDir ? path.join(root, srcDir) : root;

  try {
    await lurekProcess.run(gameDir, args.split(/\s+/).filter(Boolean));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Failed to run Lurek2D: ${msg}`);
  }
}

/**
 * Shows a quick-pick list of single-file examples and runs the selected one.
 */
export async function runExample(
  lurekProcess: LurekProcessService
): Promise<void> {
  const root = getWorkspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return;
  }

  const examplesDir = path.join(root, "content", "examples");
  if (!fs.existsSync(examplesDir)) {
    vscode.window.showWarningMessage("No content/examples/ directory found.");
    return;
  }

  const examples = fs
    .readdirSync(examplesDir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".lua"))
    .map((e) => ({
      label: e.name.replace(/\.lua$/, ""),
      file: e.name,
    }));

  if (examples.length === 0) {
    vscode.window.showWarningMessage("No examples found.");
    return;
  }

  const selected = await vscode.window.showQuickPick(examples, {
    placeHolder: "Select an example to run",
  });
  if (!selected) {
    return;
  }

  try {
    await lurekProcess.run(path.join(examplesDir, selected.file));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Failed to run example: ${msg}`);
  }
}

function getWorkspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
