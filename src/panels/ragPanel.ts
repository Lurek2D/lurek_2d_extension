import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import { execRagQuery, RagQueryPayload } from "../services/rag.js";
import { getRagContract } from "../services/ragContract.js";

export class RagPanel {
  public static currentPanel: RagPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private readonly workspaceRoot: string;
  private readonly ragSearchLimitMax: number;
  private readonly ragSearchLimitMin: number;
  private readonly ragSearchLimitDefault: number;

  private constructor(panel: vscode.WebviewPanel, workspaceRoot: string) {
    this._panel = panel;
    this.workspaceRoot = workspaceRoot;
    const contract = getRagContract(workspaceRoot);
    this.ragSearchLimitMin = contract.searchLimit.min;
    this.ragSearchLimitMax = contract.searchLimit.max;
    this.ragSearchLimitDefault = contract.searchLimit.default;

    this._update();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "search":
            await this.handleSearch(message.query, message.profile, message.limit);
            return;
          case "openFile":
            this.handleOpenFile(message.path);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public static createOrShow(workspaceRoot: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (RagPanel.currentPanel) {
      RagPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "lurek2dRag",
      "Lurek2D RAG Search",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    RagPanel.currentPanel = new RagPanel(panel, workspaceRoot);
  }

  private async handleSearch(
    query: unknown,
    profile: "all" | "game" | "engine",
    limitValue: unknown
  ) {
    const normalizedQuery = typeof query === "string" ? query.trim() : "";
    if (!normalizedQuery) {
      this._panel.webview.postMessage({ command: "error", error: "Search query is required." });
      return;
    }

    const parsedLimit = Number(limitValue);
    const resolvedLimit = Number.isInteger(parsedLimit)
      ? parsedLimit
      : this.ragSearchLimitDefault;
    if (resolvedLimit < this.ragSearchLimitMin || resolvedLimit > this.ragSearchLimitMax) {
      this._panel.webview.postMessage({
        command: "error",
        error: `Limit must be between ${this.ragSearchLimitMin} and ${this.ragSearchLimitMax}.`,
      });
      return;
    }

    try {
      this._panel.webview.postMessage({ command: "loading" });
      const result = await execRagQuery(this.workspaceRoot, normalizedQuery, {
        profile,
        limit: resolvedLimit,
      });
      if (!result.ok) {
        const extra = [result.parseError, result.stderr || result.stdout]
          .filter(Boolean)
          .map(String)
          .join("\n")
          .trim();
        this._panel.webview.postMessage({
          command: "error",
          error: extra || "RAG query failed.",
        });
        return;
      }

      const payload = result.payload as RagQueryPayload | undefined;
      if (!payload) {
        this._panel.webview.postMessage({
          command: "error",
          error: "RAG returned an empty JSON payload.",
        });
        return;
      }
      if (payload.error) {
        this._panel.webview.postMessage({ command: "error", error: payload.error });
      } else {
        this._panel.webview.postMessage({
          command: "results",
          results: payload.results || [],
        });
      }
    } catch (e: any) {
      this._panel.webview.postMessage({ command: "error", error: e.toString() });
    }
  }

  private handleOpenFile(rawPath: unknown): void {
    const target = this.toSafeWorkspaceUri(rawPath);
    if (!target) {
      this._panel.webview.postMessage({
        command: "error",
        error: "That search result path is invalid or outside the workspace.",
      });
      return;
    }
    vscode.commands.executeCommand("vscode.open", target);
  }

  private toSafeWorkspaceUri(rawPath: unknown): vscode.Uri | undefined {
    if (typeof rawPath !== "string") {
      return undefined;
    }
    const trimmed = rawPath.trim();
    if (!trimmed) {
      return undefined;
    }

    const workspaceRoot = path.resolve(this.workspaceRoot);
    const target = path.resolve(workspaceRoot, trimmed);

    const relative = path.relative(workspaceRoot, target);
    if (
      !relative
      || relative === ".."
      || relative.startsWith(`..${path.sep}`)
      || path.isAbsolute(relative)
    ) {
      return undefined;
    }
    if (!fs.existsSync(target)) {
      return undefined;
    }

    return vscode.Uri.file(target);
  }

  private _update() {
    this._panel.webview.html = this._getHtmlForWebview();
  }

  public dispose() {
    RagPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview() {
    const nonce = `${Math.random().toString(36).slice(2)}-${Date.now()}`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src data: https:; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'none'; font-src ${this._panel.webview.cspSource};"
  />
  <style nonce="${nonce}">
    body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-foreground); }
    .search-container { display: flex; gap: 10px; margin-bottom: 20px; }
    input, select, button, input[type="number"] {
      padding: 8px;
      border: 1px solid var(--vscode-input-border);
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
    }
    button { cursor: pointer; border: none; background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
    button:hover { background: var(--vscode-button-hoverBackground); }
    .result { margin-bottom: 20px; border: 1px solid var(--vscode-panel-border); padding: 10px; border-radius: 4px; }
    .result-title { font-weight: bold; margin-bottom: 5px; color: var(--vscode-textLink-foreground); }
    .result-path { font-size: 0.8em; opacity: 0.8; margin-bottom: 10px; }
    .result-type { font-size: 0.8em; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 2px 5px; border-radius: 10px; }
    .result-open { margin-top: 6px; }
    pre { background: var(--vscode-textCodeBlock-background); padding: 10px; overflow-x: auto; font-family: monospace; }
  </style>
</head>
<body>
  <h2>Lurek2D RAG Search</h2>
  <div class="search-container">
    <input id="query" type="text" placeholder="Enter search keywords..." autofocus />
    <select id="profile">
      <option value="all">Profile: All</option>
      <option value="game">Profile: Game Dev</option>
      <option value="engine">Profile: Engine Dev</option>
    </select>
    <input id="limit" type="number" min="${this.ragSearchLimitMin}" max="${this.ragSearchLimitMax}" value="${this.ragSearchLimitDefault}" />
    <button id="search-btn">Search</button>
  </div>
  <div id="status"></div>
  <div id="results"></div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const queryInput = document.getElementById("query");
    const profileSelect = document.getElementById("profile");
    const limitInput = document.getElementById("limit");
    const searchBtn = document.getElementById("search-btn");
    const statusDiv = document.getElementById("status");
    const resultsDiv = document.getElementById("results");

    const sanitizeText = (value) => String(value == null ? "" : value);
    const buildHighlightedSnippet = (raw) => {
      const safe = sanitizeText(raw).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return safe.replace(/\\[\\[(.*?)\\]\\]/g, "<mark>$1</mark>");
    };

    const clearResults = () => {
      while (resultsDiv.firstChild) {
        resultsDiv.removeChild(resultsDiv.firstChild);
      }
    };

    const setStatus = (text) => {
      if (!statusDiv) {
        return;
      }
      statusDiv.textContent = text;
    };

    const createElement = (tagName, { className, text, attrs } = {}) => {
      const node = document.createElement(tagName);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = sanitizeText(text);
      if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
          node.setAttribute(key, value);
        }
      }
      return node;
    };

    const renderResult = (r) => {
      const resultCard = createElement("div", { className: "result" });
      const header = createElement("div", { className: "result-title" });
      const title = createElement("span", { text: sanitizeText(r.title) });
      const badge = createElement("span", { className: "result-type", text: sanitizeText(r.type) });
      header.appendChild(title);
      header.appendChild(document.createTextNode(" "));
      header.appendChild(badge);
      resultCard.appendChild(header);

      const pathLine = createElement("div", { className: "result-path", text: sanitizeText(r.path) });
      resultCard.appendChild(pathLine);

      const code = createElement("pre");
      const snippet = buildHighlightedSnippet(r.context || "");
      code.innerHTML = snippet;
      resultCard.appendChild(code);

      const openBtn = createElement("button", {
        className: "result-open",
        text: "Open File",
        attrs: {
          "data-path": sanitizeText(r.path || ""),
          type: "button",
        },
      });
      resultCard.appendChild(openBtn);

      return resultCard;
    };

    const performSearch = () => {
      const query = sanitizeText(queryInput.value).trim();
      if (!query) {
        setStatus("Enter a query first.");
        return;
      }

      const limit = Number(limitInput.value);
      if (!Number.isInteger(limit) || limit < ${this.ragSearchLimitMin} || limit > ${this.ragSearchLimitMax}) {
        setStatus("Limit must be between ${this.ragSearchLimitMin} and ${this.ragSearchLimitMax}.");
        return;
      }

      vscode.postMessage({
        command: "search",
        query,
        profile: profileSelect.value,
        limit,
      });
    };

    searchBtn.addEventListener("click", performSearch);
    queryInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        performSearch();
      }
    });

    resultsDiv.addEventListener("click", (event) => {
      const button = event.target.closest(".result-open");
      if (!button || !(button instanceof HTMLButtonElement)) {
        return;
      }
      const filePath = button.getAttribute("data-path");
      if (!filePath) {
        return;
      }
      vscode.postMessage({ command: "openFile", path: filePath });
    });

    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.command) {
        case "loading":
          setStatus("Searching...");
          clearResults();
          break;
        case "error":
          setStatus("Error: " + sanitizeText(message.error));
          break;
        case "results":
          const results = Array.isArray(message.results) ? message.results : [];
          setStatus(String(results.length) + " results found.");
          clearResults();
          results.forEach((result) => {
            resultsDiv.appendChild(renderResult(result));
          });
          break;
      }
    });
  </script>
</body>
</html>`;
  }
}
