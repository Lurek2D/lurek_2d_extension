import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

// ─── Helpers ──────────────────────────────────────────────

function listPatternFiles(extensionPath: string): Array<{ name: string; fullPath: string }> {
  const dir = path.join(extensionPath, "data", "patterns");
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".lua"))
    .map((f) => ({ name: f.replace(".lua", ""), fullPath: path.join(dir, f) }));
}

// ─── Commands ─────────────────────────────────────────────

export function registerLibraryCommands(context: vscode.ExtensionContext): void {
  // ── lurek.library.browse ──────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand("lurek.library.browse", async () => {
      const patterns = listPatternFiles(context.extensionPath);
      if (patterns.length === 0) {
        vscode.window.showInformationMessage("No patterns found in data/patterns/.");
        return;
      }

      const picked = await vscode.window.showQuickPick(
        patterns.map((p) => ({
          label: p.name,
          description: `data/patterns/${p.name}.lua`,
          fullPath: p.fullPath,
        })),
        { placeHolder: "Browse Lurek2D patterns" }
      );
      if (!picked) {
        return;
      }

      // Show preview with option to copy to project
      const action = await vscode.window.showQuickPick(
        [
          { label: "Preview", description: "Open the pattern file in a new tab" },
          { label: "Copy to project", description: "Copy to libs/ folder in your project" },
        ],
        { placeHolder: `${picked.label}: What would you like to do?` }
      );

      if (!action) {
        return;
      }

      if (action.label === "Preview") {
        const doc = await vscode.workspace.openTextDocument(picked.fullPath);
        await vscode.window.showTextDocument(doc, { preview: true });
      } else {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
          vscode.window.showErrorMessage("No workspace folder open.");
          return;
        }

        const libsDir = path.join(workspaceRoot, "libs");
        if (!fs.existsSync(libsDir)) {
          fs.mkdirSync(libsDir, { recursive: true });
        }

        const dest = path.join(libsDir, `${picked.label}.lua`);
        if (fs.existsSync(dest)) {
          const overwrite = await vscode.window.showWarningMessage(
            `libs/${picked.label}.lua already exists. Overwrite?`,
            "Yes",
            "No"
          );
          if (overwrite !== "Yes") {
            return;
          }
        }

        fs.copyFileSync(picked.fullPath, dest);
        vscode.window.showInformationMessage(`Copied ${picked.label} to libs/${picked.label}.lua`);
      }
    })
  );

  // ── lurek.library.insertSnippet ───────────────────────────
  // Use the built-in picker so users get one standard snippet experience.
  // Source of truth remains content/snippets/*.lua -> data/snippets.json.
  context.subscriptions.push(
    vscode.commands.registerCommand("lurek.library.insertSnippet", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        // No editor open -> open a Lua buffer first so snippet scope resolves correctly.
        const doc = await vscode.workspace.openTextDocument({ language: "lua" });
        await vscode.window.showTextDocument(doc);
      }

      await vscode.commands.executeCommand("editor.action.insertSnippet");
    })
  );

  // ── lurek.library.newPattern ──────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand("lurek.library.newPattern", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage("Select some Lua code first to create a pattern from it.");
        return;
      }

      const selectedText = editor.document.getText(editor.selection);

      const name = await vscode.window.showInputBox({
        prompt: "Pattern name",
        placeHolder: "my-pattern",
        validateInput: (v) => {
          if (!v.trim()) {
            return "Name cannot be empty";
          }
          if (/[<>:"/\\|?*\s]/.test(v)) {
            return "Name should be a simple identifier (use dashes, no spaces)";
          }
          return undefined;
        },
      });
      if (!name) {
        return;
      }

      const category = await vscode.window.showInputBox({
        prompt: "Category",
        placeHolder: "e.g. gameplay, ui, utility",
      });

      const description = await vscode.window.showInputBox({
        prompt: "Brief description",
        placeHolder: "What does this pattern do?",
      });

      const header = [
        `--- ${name} pattern for Lurek2D.`,
        `--- ${description ?? "Custom pattern."}`,
        `---`,
        `--- Category: ${category ?? "general"}`,
        `---`,
        "",
      ].join("\n");

      const patternsDir = path.join(context.extensionPath, "data", "patterns");
      if (!fs.existsSync(patternsDir)) {
        fs.mkdirSync(patternsDir, { recursive: true });
      }

      const destFile = path.join(patternsDir, `${name}.lua`);
      if (fs.existsSync(destFile)) {
        const overwrite = await vscode.window.showWarningMessage(
          `Pattern "${name}" already exists. Overwrite?`,
          "Yes",
          "No"
        );
        if (overwrite !== "Yes") {
          return;
        }
      }

      fs.writeFileSync(destFile, header + selectedText + "\n", "utf-8");
      vscode.window.showInformationMessage(`Pattern "${name}" saved to data/patterns/${name}.lua`);
    })
  );
}
