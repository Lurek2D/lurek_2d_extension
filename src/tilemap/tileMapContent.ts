import * as vscode from "vscode";
import * as crypto from "crypto";

/** Generates a cryptographically random nonce for the CSP script-src directive. */
function getNonce(): string {
    return crypto.randomBytes(16).toString("base64");
}

/**
 * Returns the complete HTML document for the TileMap Editor webview.
 * A fresh nonce is generated on every call to prevent script injection.
 */
export function getWebviewContent(webview: vscode.Webview, _extensionUri: vscode.Uri): string {
    const nonce = getNonce();
    const csp = [
        `default-src 'none'`,
        `style-src ${webview.cspSource} 'unsafe-inline'`,
        `script-src 'nonce-${nonce}'`,
        `img-src ${webview.cspSource} data:`,
    ].join("; ");

    return /* html */`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <title>TileMap Editor</title>
    <style>
        :root {
            --bg: var(--vscode-editor-background);
            --fg: var(--vscode-editor-foreground);
            --border: var(--vscode-panel-border);
            --hover-bg: var(--vscode-list-hoverBackground);
            --active-bg: var(--vscode-list-activeSelectionBackground);
        }
        *, *::before, *::after { box-sizing: border-box; }
        body, html {
            margin: 0; padding: 0; height: 100vh;
            display: flex; flex-direction: column;
            color: var(--fg); background: var(--bg);
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            overflow: hidden;
        }
        #toolbar {
            border-bottom: 1px solid var(--border);
            padding: 6px 8px; display: flex; gap: 6px; flex-shrink: 0;
        }
        #main-area { display: flex; flex: 1; overflow: hidden; }
        #left-rail {
            width: 120px; flex-shrink: 0;
            border-right: 1px solid var(--border);
            padding: 8px; display: flex; flex-direction: column; gap: 4px;
            overflow-y: auto;
        }
        #workspace {
            flex: 1; overflow: auto; display: flex;
            justify-content: center; align-items: center;
            background: var(--vscode-editorWidget-background, #1e1e1e);
        }
        #inspector {
            width: 210px; flex-shrink: 0;
            border-left: 1px solid var(--border);
            padding: 8px; display: flex; flex-direction: column; gap: 6px;
            overflow-y: auto;
        }
        #bottom-panel {
            height: 120px; flex-shrink: 0;
            border-top: 1px solid var(--border);
            padding: 6px 8px; overflow-y: auto;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
        }
        #status-bar {
            border-top: 1px solid var(--border);
            padding: 3px 8px; font-size: 11px;
            display: flex; justify-content: space-between;
            background: var(--vscode-statusBar-background);
            color: var(--vscode-statusBar-foreground);
            flex-shrink: 0;
        }
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none; padding: 4px 8px; cursor: pointer;
            font-size: 12px;
        }
        button:hover { background: var(--vscode-button-hoverBackground); }
        .tool-btn { width: 100%; text-align: left; }
        .tool-btn.active { outline: 2px solid var(--active-bg); }
        .palette-wrap { display: flex; flex-wrap: wrap; gap: 2px; margin-top: 4px; }
        .palette-item {
            width: 28px; height: 28px; cursor: pointer;
            border: 1px solid var(--border);
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; font-weight: bold;
        }
        .palette-item.active { border: 2px solid var(--active-bg); }
        canvas {
            display: block; cursor: crosshair;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .log-error { color: var(--vscode-notificationsErrorIcon-foreground, #f44747); }
        .log-warning { color: var(--vscode-notificationsWarningIcon-foreground, #dcdcaa); }
        .section-title { font-weight: bold; font-size: 11px; margin-top: 6px; }
        label { display: flex; flex-direction: column; font-size: 11px; }
        input[type="text"], input[type="number"] {
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--border);
            padding: 3px 4px; margin-top: 2px;
            width: 100%;
        }
        select {
            background: var(--vscode-dropdown-background, var(--vscode-input-background));
            color: var(--vscode-dropdown-foreground, var(--fg));
            border: 1px solid var(--border);
            padding: 3px 4px; width: 100%; margin-top: 2px;
        }
    </style>
</head>
<body>
    <div id="toolbar">
        <button id="btn-validate">Validate</button>
        <button id="btn-export">Export JSON</button>
        <button id="btn-zoom-in">Zoom +</button>
        <button id="btn-zoom-out">Zoom -</button>
        <button id="btn-grid">Toggle Grid</button>
    </div>

    <div id="main-area">
        <div id="left-rail">
            <div class="section-title">Tools</div>
            <button class="tool-btn active" data-tool="brush">Brush</button>
            <button class="tool-btn" data-tool="eraser">Eraser</button>
            <button class="tool-btn" data-tool="fill">Fill (stub)</button>
            <button class="tool-btn" data-tool="select">Select (stub)</button>

            <div class="section-title" style="margin-top:12px;">Palette (0-9)</div>
            <div class="palette-wrap" id="palette"></div>
        </div>

        <div id="workspace">
            <canvas id="canvas"></canvas>
        </div>

        <div id="inspector">
            <div class="section-title">Map Properties</div>
            <label>Name <input type="text"   id="prop-name"></label>
            <label>Width <input type="number" id="prop-width" min="1"></label>
            <label>Height <input type="number" id="prop-height" min="1"></label>
            <label>Tile Size <input type="number" id="prop-tilesize" min="1"></label>
            <div class="section-title" style="margin-top:8px;">Layers</div>
            <select id="layer-select"></select>
        </div>
    </div>

    <div id="bottom-panel">
        <strong>Diagnostics</strong>
        <div id="diagnostics-log">No issues.</div>
    </div>

    <div id="status-bar">
        <span id="stat-tool">Tool: brush</span>
        <span id="stat-tile">Tile: 1</span>
        <span id="stat-zoom">Zoom: 100%</span>
        <span>Save: Ctrl+S</span>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        // ── App state ──────────────────────────────────────────────
        /** @type {import('./types').TileMapDocument | null} */
        let documentData = null;
        const state = {
            tool: 'brush',
            activeTileId: 1,
            activeLayerIndex: 0,
            zoom: 1.0,
            showGrid: true,
            isMouseDown: false,
        };

        const TILE_COLORS = [
            '#1e1e1e','#e06c75','#98c379','#e5c07b',
            '#61afef','#c678dd','#56b6c2','#abb2bf',
            '#5c6370','#be5046',
        ];

        // ── DOM refs ──────────────────────────────────────────────
        const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
        const ctx    = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
        const diagLog = document.getElementById('diagnostics-log');

        // ── UI initialisation ─────────────────────────────────────
        function initUI() {
            // Palette
            const paletteDiv = document.getElementById('palette');
            for (let i = 0; i < 10; i++) {
                const div = document.createElement('div');
                div.className = 'palette-item' + (i === state.activeTileId ? ' active' : '');
                div.style.backgroundColor = TILE_COLORS[i] ?? '#333';
                div.style.color = i === 0 ? '#888' : '#fff';
                div.textContent = String(i);
                div.addEventListener('click', () => {
                    document.querySelectorAll('.palette-item').forEach(el => el.classList.remove('active'));
                    div.classList.add('active');
                    state.activeTileId = i;
                    updateStatusBar();
                });
                paletteDiv.appendChild(div);
            }

            // Toolbar buttons
            document.getElementById('btn-validate').addEventListener('click', () =>
                vscode.postMessage({ type: 'requestValidate' }));
            document.getElementById('btn-export').addEventListener('click', () =>
                vscode.postMessage({ type: 'requestExport' }));
            document.getElementById('btn-zoom-in').addEventListener('click', () => {
                state.zoom = Math.min(4.0, state.zoom + 0.5);
                updateStatusBar(); renderCanvas();
            });
            document.getElementById('btn-zoom-out').addEventListener('click', () => {
                state.zoom = Math.max(0.25, state.zoom - 0.25);
                updateStatusBar(); renderCanvas();
            });
            document.getElementById('btn-grid').addEventListener('click', () => {
                state.showGrid = !state.showGrid; renderCanvas();
            });

            // Tool buttons
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tool-btn').forEach(el => el.classList.remove('active'));
                    btn.classList.add('active');
                    state.tool = btn.getAttribute('data-tool') ?? 'brush';
                    updateStatusBar();
                });
            });

            // Inspector bindings
            for (const prop of ['name', 'width', 'height', 'tilesize']) {
                const el = /** @type {HTMLInputElement} */ (document.getElementById('prop-' + prop));
                el.addEventListener('change', () => {
                    if (!documentData) return;
                    const val = el.value;
                    if (prop === 'name')     { documentData.name = val; }
                    if (prop === 'width')    { documentData.width = Math.max(1, parseInt(val, 10) || 1); resizeLayers(); }
                    if (prop === 'height')   { documentData.height = Math.max(1, parseInt(val, 10) || 1); resizeLayers(); }
                    if (prop === 'tilesize') { documentData.tileSize = Math.max(1, parseInt(val, 10) || 1); }
                    sendDocumentUpdate();
                    renderCanvas();
                });
            }

            document.getElementById('layer-select').addEventListener('change', (e) => {
                state.activeLayerIndex = parseInt(/** @type {HTMLSelectElement} */(e.target).value, 10);
            });

            // Canvas mouse events
            canvas.addEventListener('mousedown', (e) => { state.isMouseDown = true; handleCanvasAction(e); });
            canvas.addEventListener('mousemove', (e) => { if (state.isMouseDown) handleCanvasAction(e); });
            window.addEventListener('mouseup', () => {
                if (state.isMouseDown) {
                    state.isMouseDown = false;
                    sendDocumentUpdate();
                }
            });
        }

        // ── Domain logic ──────────────────────────────────────────
        function resizeLayers() {
            const newLen = documentData.width * documentData.height;
            for (const layer of documentData.layers) {
                layer.data = new Array(newLen).fill(0);
            }
        }

        function handleCanvasAction(e) {
            if (!documentData || !documentData.layers[state.activeLayerIndex]) return;
            const rect = canvas.getBoundingClientRect();
            const ts   = documentData.tileSize * state.zoom;
            const x    = (e.clientX - rect.left) * (canvas.width  / rect.width);
            const y    = (e.clientY - rect.top)  * (canvas.height / rect.height);
            const gx   = Math.floor(x / ts);
            const gy   = Math.floor(y / ts);

            if (gx >= 0 && gx < documentData.width && gy >= 0 && gy < documentData.height) {
                const idx = gy * documentData.width + gx;
                if (state.tool === 'brush')  applyTile(idx, state.activeTileId);
                if (state.tool === 'eraser') applyTile(idx, 0);
                // fill / select are stubs — handled server-side in a future iteration
            }
        }

        function applyTile(index, tileId) {
            const layer = documentData.layers[state.activeLayerIndex];
            if (layer.data[index] !== tileId) {
                layer.data[index] = tileId;
                renderCanvas();
            }
        }

        // ── Rendering ─────────────────────────────────────────────
        function renderCanvas() {
            if (!documentData) return;
            const ts = documentData.tileSize * state.zoom;
            canvas.width  = documentData.width  * ts;
            canvas.height = documentData.height * ts;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const layer of documentData.layers) {
                if (!layer.visible) continue;
                for (let y = 0; y < documentData.height; y++) {
                    for (let x = 0; x < documentData.width; x++) {
                        const id = layer.data[y * documentData.width + x];
                        if (id > 0 && id < TILE_COLORS.length) {
                            ctx.fillStyle = TILE_COLORS[id];
                            ctx.fillRect(x * ts, y * ts, ts, ts);
                        }
                    }
                }
            }

            if (state.showGrid) {
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let x = 0; x <= canvas.width; x += ts) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
                for (let y = 0; y <= canvas.height; y += ts) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
                ctx.stroke();
            }
        }

        function updateUIFromDocument() {
            if (!documentData) return;
            /** @type {HTMLInputElement} */ (document.getElementById('prop-name')).value = documentData.name;
            /** @type {HTMLInputElement} */ (document.getElementById('prop-width')).value = String(documentData.width);
            /** @type {HTMLInputElement} */ (document.getElementById('prop-height')).value = String(documentData.height);
            /** @type {HTMLInputElement} */ (document.getElementById('prop-tilesize')).value = String(documentData.tileSize);

            const ls = /** @type {HTMLSelectElement} */ (document.getElementById('layer-select'));
            ls.innerHTML = '';
            documentData.layers.forEach((layer, i) => {
                const opt = document.createElement('option');
                opt.value = String(i);
                opt.textContent = layer.name;
                ls.appendChild(opt);
            });
            ls.value = String(Math.min(state.activeLayerIndex, documentData.layers.length - 1));

            renderCanvas();
        }

        function updateStatusBar() {
            document.getElementById('stat-tool').textContent = 'Tool: ' + state.tool;
            document.getElementById('stat-tile').textContent = 'Tile: ' + state.activeTileId;
            document.getElementById('stat-zoom').textContent = 'Zoom: ' + Math.round(state.zoom * 100) + '%';
        }

        // ── Host communication ────────────────────────────────────
        function sendDocumentUpdate() {
            vscode.postMessage({ type: 'updateDocument', document: documentData });
        }

        window.addEventListener('message', event => {
            const msg = event.data;
            switch (msg.type) {
                case 'initialize':
                case 'documentUpdated':
                    documentData = msg.document;
                    updateUIFromDocument();
                    break;
                case 'validationResults':
                    diagLog.innerHTML = '';
                    if (msg.issues.length === 0) {
                        diagLog.textContent = 'No issues. (Valid)';
                    } else {
                        for (const issue of msg.issues) {
                            const div = document.createElement('div');
                            div.className = issue.severity === 'error' ? 'log-error' : 'log-warning';
                            div.textContent = \`[\${issue.source}] \${issue.severity.toUpperCase()}: \${issue.message}\`;
                            diagLog.appendChild(div);
                        }
                    }
                    break;
            }
        });

        // ── Boot ──────────────────────────────────────────────────
        initUI();
        vscode.postMessage({ type: 'ready' });
    </script>
</body>
</html>`;
}
