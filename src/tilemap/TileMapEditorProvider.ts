import * as vscode from "vscode";
import type { TileMapDocument } from "./types.js";
import type { WebviewToHostMessage, HostToWebviewMessage } from "./messages.js";
import { validateTileMap } from "./validation.js";
import { getWebviewContent } from "./tileMapContent.js";

/**
 * CustomTextEditorProvider for *.ltm.json TileMap files.
 *
 * VS Code owns dirty-state tracking, Undo/Redo, and Ctrl+S — all applied
 * through WorkspaceEdit so the JSON text document is always the source of truth.
 */
export class TileMapEditorProvider implements vscode.CustomTextEditorProvider {

    static readonly VIEW_TYPE = "lurek2d.tilemap";

    static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new TileMapEditorProvider(context);
        return vscode.window.registerCustomEditorProvider(
            TileMapEditorProvider.VIEW_TYPE,
            provider,
            { webviewOptions: { retainContextWhenHidden: true } },
        );
    }

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
    ): Promise<void> {
        webviewPanel.webview.options = { enableScripts: true };
        webviewPanel.webview.html = getWebviewContent(webviewPanel.webview, this.context.extensionUri);

        // Webview → Host
        webviewPanel.webview.onDidReceiveMessage((message: WebviewToHostMessage) => {
            switch (message.type) {
                case "ready":
                    this.sendInitialize(document, webviewPanel);
                    break;
                case "updateDocument":
                    this.applyDocumentEdit(document, message.document);
                    break;
                case "requestValidate":
                    this.sendValidationResults(document, webviewPanel);
                    break;
                case "requestExport":
                    this.handleExport(document);
                    break;
            }
        });

        // File changes (Undo/Redo, external edits) → Webview
        const changeSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                this.sendDocumentUpdated(document, webviewPanel);
            }
        });

        webviewPanel.onDidDispose(() => changeSubscription.dispose());
    }

    // ── Private helpers ───────────────────────────────────────────

    private sendInitialize(document: vscode.TextDocument, panel: vscode.WebviewPanel): void {
        const text = document.getText().trim();
        let data: TileMapDocument;

        if (text.length === 0) {
            data = TileMapEditorProvider.createDefaultTileMap();
            // Write the default document so the file gains the dirty indicator
            this.applyDocumentEdit(document, data);
        } else {
            try {
                data = JSON.parse(text) as TileMapDocument;
            } catch {
                vscode.window.showErrorMessage("Lurek2D: Failed to parse TileMap JSON.");
                return;
            }
        }

        const msg: HostToWebviewMessage = { type: "initialize", document: data };
        panel.webview.postMessage(msg);
        this.sendValidationResults(document, panel, data);
    }

    private sendDocumentUpdated(document: vscode.TextDocument, panel: vscode.WebviewPanel): void {
        try {
            const data = JSON.parse(document.getText()) as TileMapDocument;
            const msg: HostToWebviewMessage = { type: "documentUpdated", document: data };
            panel.webview.postMessage(msg);
        } catch {
            // Ignore parse errors during incremental typing
        }
    }

    /**
     * Applies the new document content as a WorkspaceEdit.
     * This lets VS Code track dirty state and provide native Undo/Redo.
     */
    private applyDocumentEdit(document: vscode.TextDocument, content: TileMapDocument): void {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            JSON.stringify(content, null, 2),
        );
        vscode.workspace.applyEdit(edit);
    }

    private sendValidationResults(
        document: vscode.TextDocument,
        panel: vscode.WebviewPanel,
        preParsed?: TileMapDocument,
    ): void {
        try {
            const data = preParsed ?? (JSON.parse(document.getText()) as TileMapDocument);
            const issues = validateTileMap(data);
            const msg: HostToWebviewMessage = { type: "validationResults", issues };
            panel.webview.postMessage(msg);
        } catch {
            const msg: HostToWebviewMessage = {
                type: "validationResults",
                issues: [{ severity: "error", message: "JSON syntax error", source: "core" }],
            };
            panel.webview.postMessage(msg);
        }
    }

    private handleExport(_document: vscode.TextDocument): void {
        vscode.window.showInformationMessage("Lurek2D: TileMap export — stub. The .ltm.json is already the exchange format.");
    }

    static createDefaultTileMap(): TileMapDocument {
        const width = 16;
        const height = 16;
        return {
            version: "1.0.0",
            width,
            height,
            tileSize: 32,
            name: "New Map",
            layers: [
                { id: "layer_0", name: "Background", visible: true, data: new Array(width * height).fill(0) },
            ],
        };
    }
}
