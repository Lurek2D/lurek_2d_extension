import * as vscode from "vscode";
import { EDITOR_IMPLEMENTATIONS } from "../editors/implementations.js";

/**
 * Registers all editor commands and returns the disposables.
 */
export function registerEditorCommands(
  context: vscode.ExtensionContext
): vscode.Disposable[] {
  return EDITOR_IMPLEMENTATIONS.map((editor) =>
    vscode.commands.registerCommand(editor.spec.command, () =>
      editor.open(context)
    ),
  );
}
