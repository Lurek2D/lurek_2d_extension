import type { EditorContent } from "./types.js";

type ToolbarButton = {
  readonly action: string;
  readonly icon: IconName;
  readonly label: string;
  readonly primary?: boolean;
};

type IconName =
  | "add"
  | "branch"
  | "brush"
  | "close"
  | "code"
  | "database"
  | "export"
  | "folder"
  | "grid"
  | "image"
  | "link"
  | "menu"
  | "new"
  | "node"
  | "open"
  | "palette"
  | "play"
  | "redo"
  | "refresh"
  | "reset"
  | "save"
  | "stop"
  | "undo"
  | "validate"
  | "zoomIn"
  | "zoomOut";

const STANDARD_FILE_ACTIONS: readonly ToolbarButton[] = [
  { action: "new", icon: "new", label: "New" },
  { action: "open", icon: "open", label: "Open" },
  { action: "save", icon: "save", label: "Save", primary: true },
  { action: "reset", icon: "reset", label: "Reset" },
  { action: "undo", icon: "undo", label: "Undo" },
  { action: "redo", icon: "redo", label: "Redo" },
];

export function pixelArtContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "pixelArt",
    title: "Pixel Art Editor",
    subtitle: "Sprite, palette, layers, frames",
    icon: "image",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "zoom-out", icon: "zoomOut", label: "Zoom out" },
      { action: "zoom-in", icon: "zoomIn", label: "Zoom in" },
      { action: "fit", icon: "grid", label: "Fit canvas" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle right panel" },
    ],
    left: `
      <section class="panel-section">
        <h2>Tools</h2>
        <div class="tool-grid">
          ${toolButton("pencil", "brush", "Pencil", true)}
          ${toolButton("eraser", "close", "Eraser")}
          ${toolButton("fill", "palette", "Fill")}
          ${toolButton("line", "link", "Line")}
          ${toolButton("rect", "grid", "Rectangle")}
          ${toolButton("pick", "image", "Pick color")}
        </div>
      </section>
      <section class="panel-section">
        <h2>Brush</h2>
        <label class="field">Size <input id="pixelBrush" type="range" min="1" max="6" value="1"></label>
        <label class="check"><input id="pixelMirrorX" type="checkbox"> Mirror X</label>
        <label class="check"><input id="pixelMirrorY" type="checkbox"> Mirror Y</label>
        <label class="check"><input id="pixelGrid" type="checkbox" checked> Grid overlay</label>
      </section>
      <section class="panel-section">
        <h2>Sprite</h2>
        <label class="field">Asset <input id="pixelAsset" value="hero_idle"></label>
        <div class="split">
          <label class="field">Width <input id="pixelWidth" type="number" min="8" max="128" value="32"></label>
          <label class="field">Height <input id="pixelHeight" type="number" min="8" max="128" value="32"></label>
        </div>
      </section>
      <section class="panel-section">
        <h2>Actions</h2>
        <div class="button-row">
          <button class="panel-button" data-pixel-command="add-frame">Add Frame</button>
          <button class="panel-button" data-pixel-command="copy-lua">Copy Lua</button>
        </div>
      </section>
    `,
    center: `
      <div class="context-strip">
        <span>LMB <i id="pixelColorChip" class="color-chip"></i></span>
        <span>RMB transparent</span>
        <span id="pixelZoomLabel">900%</span>
      </div>
      <div class="canvas-stage checker-stage">
        <canvas id="pixelCanvas" width="512" height="512"></canvas>
      </div>
      <div class="timeline-strip">
        <strong>Frames</strong>
        <div id="pixelFrames" class="frame-list"></div>
      </div>
    `,
    right: `
      <section class="panel-section">
        <h2>Palette</h2>
        <div id="pixelPalette" class="palette-grid"></div>
        <label class="field inline">Color <input id="pixelColor" type="color" value="#1a1c2c"></label>
      </section>
      <section class="panel-section">
        <h2>Layers</h2>
        <div id="pixelLayers" class="list-stack"></div>
        <div class="button-row">
          <button class="panel-button" data-pixel-command="add-layer">Add</button>
          <button class="panel-button" data-pixel-command="remove-layer">Remove</button>
        </div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="pixelPreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="pixelStatusTool">Tool: pencil</span><span id="pixelStatusPos">0, 0</span><span id="pixelStatusFrame">Frame 1 / 1</span><span id="pixelDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + pixelStyles(), script: pixelArtScript() };
}

export function databaseContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "database",
    title: "Database Editor",
    subtitle: "Typed tables, schema, validation, export",
    icon: "database",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "refresh", icon: "refresh", label: "Refresh" },
      { action: "add-row", icon: "add", label: "Add row" },
      { action: "add-column", icon: "grid", label: "Add column" },
      { action: "validate", icon: "validate", label: "Validate" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle right panel" },
    ],
    left: `
      <section class="panel-section">
        <h2>Tables</h2>
        <div id="dbTables" class="list-stack"></div>
      </section>
      <section class="panel-section">
        <h2>Filters</h2>
        <label class="field">Search <input id="dbSearch" placeholder="id, name, tag"></label>
        <label class="field">Type <select id="dbType"><option value="">All</option><option>weapon</option><option>armor</option><option>potion</option><option>material</option></select></label>
        <label class="check"><input id="dbErrorsOnly" type="checkbox"> Errors only</label>
      </section>
      <section class="panel-section">
        <h2>Actions</h2>
        <div class="button-row">
          <button class="panel-button" data-db-command="run-query">Run Query</button>
          <button class="panel-button" data-db-command="normalize">Normalize</button>
        </div>
      </section>
    `,
    center: `
      <div class="query-strip">
        <span>SQL</span>
        <input id="dbQuery" value="SELECT * FROM items WHERE price > 20;">
        <button class="panel-button primary" data-db-command="run-query">Run</button>
      </div>
      <div class="context-strip">
        <button class="segment active" data-db-view="grid">Grid</button>
        <button class="segment" data-db-view="schema">Schema</button>
        <button class="segment" data-db-view="runtime">Runtime</button>
        <div id="dbPills" class="pill-row"></div>
      </div>
      <div class="table-stage">
        <table id="databaseGrid" class="data-grid"></table>
      </div>
      <div class="formula-strip">
        <span id="dbSelected">No cell selected</span>
        <input id="dbFormula" placeholder="Edit selected value or formula">
      </div>
    `,
    right: `
      <section class="panel-section">
        <h2>Schema</h2>
        <div id="dbSchema" class="schema-list"></div>
      </section>
      <section class="panel-section">
        <h2>Selected Row</h2>
        <div id="dbInspector" class="property-list"><span class="muted">No row selected</span></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="dbPreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="dbStatusTable">Table: items</span><span id="dbStatusRows">4 rows</span><span id="dbStatusValidation">Valid</span><span id="dbDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + databaseStyles(), script: databaseScript() };
}

export function dialogContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "dialog",
    title: "Dialog Editor",
    subtitle: "Branching dialogue graph and node properties",
    icon: "node",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "validate", icon: "validate", label: "Validate graph" },
      { action: "play", icon: "play", label: "Preview dialog" },
      { action: "add-start", icon: "play", label: "Add start node" },
      { action: "add-npc", icon: "node", label: "Add NPC node" },
      { action: "add-player", icon: "add", label: "Add player response" },
      { action: "add-branch", icon: "branch", label: "Add branch node" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle properties" },
    ],
    left: `
      <section class="panel-section">
        <h2>Dialog Tools</h2>
        <div class="list-stack">
          <button class="list-row active" data-dialog-tool="select"><strong>Select</strong><small>drag nodes</small></button>
          <button class="list-row" data-dialog-tool="connect"><strong>Connect</strong><small>create edges</small></button>
          <button class="list-row" data-dialog-tool="condition"><strong>Condition</strong><small>branch logic</small></button>
          <button class="list-row" data-dialog-tool="script"><strong>Script Trigger</strong><small>Lua hook</small></button>
        </div>
      </section>
      <section class="panel-section">
        <h2>State Variables</h2>
        <div class="tag-list"><span>reputation</span><span>has_met_king</span><span>audience_token</span></div>
      </section>
      <section class="panel-section">
        <h2>Flow Actions</h2>
        <div class="button-row">
          <button class="panel-button" data-dialog-command="auto-layout">Auto Layout</button>
          <button class="panel-button" data-dialog-command="simulate">Simulate</button>
        </div>
      </section>
    `,
    center: `
      <div class="context-strip">
        <span id="dialogSummary">6 nodes / 6 links</span>
        <span>Ctrl+drag connects nodes</span>
        <span id="dialogZoom">Zoom 75%</span>
      </div>
      <div id="dialogGraph" class="graph-stage"></div>
    `,
    right: `
      <section class="panel-section">
        <h2>Node Properties</h2>
        <div id="dialogInspector" class="property-list"></div>
      </section>
      <section class="panel-section">
        <h2>Validation</h2>
        <pre id="dialogValidation" class="output-box compact"></pre>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="dialogPreview" class="output-box"></pre>
      </section>
    `,
    status: `<span>Dialog: king_audience</span><span id="dialogNodeStatus">Selected: start</span><span id="dialogDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + dialogStyles(), script: dialogScript() };
}

export function procMapContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "procMap",
    title: "Procedural World Generator",
    subtitle: "Seeds, biome weights, tile export",
    icon: "grid",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "generate", icon: "refresh", label: "Generate map", primary: true },
      { action: "randomize", icon: "reset", label: "Randomize seed" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-png", icon: "image", label: "Export PNG" },
      { action: "toggle-view", icon: "grid", label: "Toggle biome/height view" },
      { action: "export-lua", icon: "code", label: "Export Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle palette" },
    ],
    left: `
      <section class="panel-section">
        <h2>World Size</h2>
        <label class="field">Preset <select id="procSize"><option>512x384</option><option selected>1024x768</option><option>2048x1024</option></select></label>
        <label class="field">Seed <input id="procSeed" type="number" value="8472910"></label>
      </section>
      <section class="panel-section">
        <h2>Algorithm</h2>
        <label class="field">Mode <select id="procAlgorithm"><option>Perlin Noise</option><option>Cellular Automata</option><option>Ridged Multifractal</option></select></label>
        <label class="field">Elevation <input id="procElevation" type="range" min="0" max="100" value="57"></label>
        <label class="field">Moisture <input id="procMoisture" type="range" min="0" max="100" value="46"></label>
        <label class="field">Temperature <input id="procTemperature" type="range" min="0" max="100" value="62"></label>
        <label class="field">Persistence <input id="procPersistence" type="range" min="0" max="100" value="66"></label>
      </section>
      <section class="panel-section">
        <h2>Actions</h2>
        <div class="button-row">
          <button class="panel-button" data-proc-command="generate">Generate</button>
          <button class="panel-button" data-proc-command="reset-params">Reset Params</button>
        </div>
      </section>
    `,
    center: `
      <div class="context-strip">
        <span id="procSeedStatus">Seed: 8472910</span>
        <span id="procBiomeStatus">6 biomes</span>
        <span>Drag: pan / wheel: zoom</span>
      </div>
      <div class="map-stage">
        <canvas id="procCanvas" width="1024" height="640"></canvas>
      </div>
    `,
    right: `
      <section class="panel-section">
        <h2>Biomes</h2>
        <div id="procBiomes" class="biome-list"></div>
      </section>
      <section class="panel-section">
        <h2>Tiles</h2>
        <div id="procTiles" class="tile-palette"></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="procPreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="procStatusSeed">Seed: 8472910</span><span>Map: 1024x768</span><span id="procStatusView">View: biome</span><span id="procDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + procMapStyles(), script: procMapScript() };
}

export function tileMapContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "tileMap",
    title: "Tile Map Editor",
    subtitle: "lurek.tilemap grid, layers, collision, properties",
    icon: "grid",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "brush", icon: "brush", label: "Brush" },
      { action: "fill", icon: "palette", label: "Flood fill" },
      { action: "collision", icon: "validate", label: "Collision mask" },
      { action: "zoom-out", icon: "zoomOut", label: "Zoom out" },
      { action: "zoom-in", icon: "zoomIn", label: "Zoom in" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export lurek.tilemap Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle properties" },
    ],
    left: `
      <section class="panel-section">
        <h2>Tilemap API</h2>
        <label class="field">Factory <select id="tileFactory"><option>lurek.tilemap.newTileMap</option><option>lurek.tilemap.newChunkMap</option><option>lurek.tilemap.newIsoMap</option></select></label>
        <div class="split">
          <label class="field">Tile W <input id="tileW" type="number" min="8" max="128" value="32"></label>
          <label class="field">Tile H <input id="tileH" type="number" min="8" max="128" value="32"></label>
        </div>
        <label class="field">Chunk Size <input id="tileChunk" type="number" min="8" max="128" value="32"></label>
      </section>
      <section class="panel-section">
        <h2>Tools</h2>
        <div class="tool-grid">
          ${toolButton("brush", "brush", "Brush", true)}
          ${toolButton("erase", "close", "Erase")}
          ${toolButton("fill", "palette", "Fill")}
          ${toolButton("collision", "validate", "Collision")}
          ${toolButton("stamp", "image", "Stamp")}
          ${toolButton("property", "node", "Property")}
        </div>
      </section>
      <section class="panel-section">
        <h2>Layers</h2>
        <div id="tileLayers" class="list-stack"></div>
        <div class="button-row"><button class="panel-button" data-tile-command="add-layer">Add Layer</button><button class="panel-button" data-tile-command="toggle-grid">Grid</button></div>
      </section>
    `,
    center: `
      <div class="context-strip"><span id="tileApiStatus">API: lurek.tilemap.newTileMap</span><span id="tileCoord">0, 0</span><span id="tileZoom">Zoom 100%</span></div>
      <div class="tilemap-stage"><canvas id="tileCanvas" width="960" height="640"></canvas></div>
    `,
    right: `
      <section class="panel-section">
        <h2>Tileset</h2>
        <label class="field">First GID <input id="tileFirstGid" type="number" value="1"></label>
        <label class="field">Columns <input id="tileColumns" type="number" value="8"></label>
        <div id="tilePalette" class="tile-palette"></div>
      </section>
      <section class="panel-section">
        <h2>Selected Tile</h2>
        <div id="tileInspector" class="property-list"></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="tilePreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="tileStatusLayer">Layer: Ground</span><span id="tileStatusTiles">32x20 tiles</span><span id="tileDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + pixelStyles() + tileMapStyles(), script: tileMapScript() };
}

export function sceneFlowContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "sceneFlow",
    title: "Scene Flow Editor",
    subtitle: "lurek.scene stack, transitions, registered scenes",
    icon: "branch",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "validate", icon: "validate", label: "Validate flow" },
      { action: "play", icon: "play", label: "Preview transition" },
      { action: "add-scene", icon: "node", label: "Add scene" },
      { action: "add-transition", icon: "branch", label: "Add transition" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export lurek.scene Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle properties" },
    ],
    left: `
      <section class="panel-section">
        <h2>Scene API</h2>
        <div class="list-stack">
          <button class="list-row active" data-scene-mode="switchTo"><strong>switchTo</strong><small>replace top</small></button>
          <button class="list-row" data-scene-mode="push"><strong>push</strong><small>stack scene</small></button>
          <button class="list-row" data-scene-mode="pushOverlay"><strong>pushOverlay</strong><small>overlay UI</small></button>
          <button class="list-row" data-scene-mode="popTo"><strong>popTo</strong><small>return path</small></button>
        </div>
      </section>
      <section class="panel-section">
        <h2>Transitions</h2>
        <label class="field">Transition <select id="sceneTransition"><option>fade</option><option>slideLeft</option><option>iris</option><option>none</option></select></label>
        <label class="field">Duration <input id="sceneDuration" type="number" min="0" max="5" step="0.1" value="0.35"></label>
        <label class="field">Easing <select id="sceneEasing"><option>quadOut</option><option>linear</option><option>cubicInOut</option></select></label>
      </section>
      <section class="panel-section">
        <h2>Actions</h2>
        <div class="button-row"><button class="panel-button" data-scene-command="trace">Trace Path</button><button class="panel-button" data-scene-command="register">Register All</button></div>
      </section>
    `,
    center: `
      <div class="context-strip"><span id="sceneFlowSummary">5 scenes / 5 transitions</span><span>API: lurek.scene.registerScene + switchTo</span><span id="sceneFlowStatus">Ready</span></div>
      <div id="sceneFlowGraph" class="graph-stage"></div>
    `,
    right: `
      <section class="panel-section">
        <h2>Scene Properties</h2>
        <div id="sceneFlowInspector" class="property-list"></div>
      </section>
      <section class="panel-section">
        <h2>Runtime Stack</h2>
        <div id="sceneStack" class="list-stack"></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="sceneFlowPreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="sceneFlowSelected">Selected: boot</span><span>Namespace: lurek.scene</span><span id="sceneFlowDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + dialogStyles() + sceneFlowStyles(), script: sceneFlowScript() };
}

export function particleContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "particle",
    title: "Particle Designer",
    subtitle: "lurek.particle emitter config and live preview",
    icon: "palette",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "play", icon: "play", label: "Start preview", primary: true },
      { action: "stop", icon: "stop", label: "Stop preview" },
      { action: "burst", icon: "add", label: "Emit burst" },
      { action: "reset-sim", icon: "reset", label: "Reset simulation" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export lurek.particle Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle properties" },
    ],
    left: `
      <section class="panel-section">
        <h2>Particle API</h2>
        <label class="field">Factory <select id="particleFactory"><option>lurek.particle.newSystem</option><option>lurek.particle.newPreset</option><option>lurek.particle.fromTOML</option></select></label>
        <label class="field">Preset <select id="particlePreset"><option>spark</option><option>smoke</option><option>rain</option><option>explosion</option></select></label>
      </section>
      <section class="panel-section">
        <h2>Emitter</h2>
        <label class="field">Shape <select id="particleShape"><option>cone</option><option>circle</option><option>box</option><option>edge</option></select></label>
        <label class="field">Emission Rate <input id="particleRate" type="range" min="1" max="120" value="45"></label>
        <label class="field">Max Particles <input id="particleMax" type="number" min="16" max="2000" value="420"></label>
        <label class="field">Lifetime <input id="particleLife" type="range" min="0.2" max="6" step="0.1" value="1.8"></label>
      </section>
      <section class="panel-section">
        <h2>Forces</h2>
        <label class="field">Gravity Y <input id="particleGravity" type="range" min="-500" max="800" value="210"></label>
        <label class="field">Speed <input id="particleSpeed" type="range" min="10" max="500" value="180"></label>
      </section>
    `,
    center: `
      <div class="context-strip"><span id="particleCount">0 particles</span><span id="particleApiStatus">API: lurek.particle.newSystem</span><span>Space: preview / Burst: emit</span></div>
      <div class="particle-stage"><canvas id="particleCanvas" width="960" height="640"></canvas></div>
    `,
    right: `
      <section class="panel-section">
        <h2>Color Over Life</h2>
        <div id="particleGradient" class="gradient-editor"></div>
        <label class="field inline">Start <input id="particleStartColor" type="color" value="#ffd166"></label>
        <label class="field inline">End <input id="particleEndColor" type="color" value="#ef476f"></label>
      </section>
      <section class="panel-section">
        <h2>Runtime Methods</h2>
        <div class="tag-list"><span>system:emit(count)</span><span>system:setGravity(x,y)</span><span>system:setLifetimeRange(min,max)</span><span>system:start()</span></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="particlePreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="particleStatus">Preview stopped</span><span>Namespace: lurek.particle</span><span id="particleDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + particleStyles(), script: particleScript() };
}

export function skeletonRiggingContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "skeletonRigging",
    title: "Skeleton Rigging Editor",
    subtitle: "lurek.spine bones, slots, IK, skin weights",
    icon: "node",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "add-bone", icon: "add", label: "Add bone" },
      { action: "add-slot", icon: "image", label: "Add slot" },
      { action: "add-ik", icon: "branch", label: "Add IK constraint" },
      { action: "play", icon: "play", label: "Preview animation" },
      { action: "stop", icon: "stop", label: "Stop preview" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export lurek.spine Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle properties" },
    ],
    left: `
      <section class="panel-section">
        <h2>Spine API</h2>
        <label class="field">Factory <select id="spineFactory"><option>lurek.spine.newSkeleton</option><option>lurek.spine.skeletonFromJson</option><option>lurek.spine.newSkeletonAnimation</option></select></label>
        <label class="field">Rig Name <input id="spineName" value="hero_rig"></label>
      </section>
      <section class="panel-section">
        <h2>Rig Tools</h2>
        <div class="tool-grid">
          ${toolButton("select", "node", "Select", true)}
          ${toolButton("bone", "link", "Bone")}
          ${toolButton("slot", "image", "Slot")}
          ${toolButton("weight", "palette", "Weight")}
          ${toolButton("ik", "branch", "IK")}
          ${toolButton("pose", "play", "Pose")}
        </div>
      </section>
      <section class="panel-section">
        <h2>Bones</h2>
        <div id="spineBones" class="list-stack"></div>
      </section>
    `,
    center: `
      <div class="context-strip"><span id="spineApiStatus">API: lurek.spine.newSkeleton</span><span id="spinePose">Pose: idle</span><span>Drag bones / keyframe pose</span></div>
      <div class="rig-stage"><canvas id="spineCanvas" width="960" height="640"></canvas></div>
      <div class="timeline-strip"><strong>Timeline</strong><div id="spineTimeline" class="frame-list"></div></div>
    `,
    right: `
      <section class="panel-section">
        <h2>Bone Properties</h2>
        <div id="spineInspector" class="property-list"></div>
      </section>
      <section class="panel-section">
        <h2>Slots / Attachments</h2>
        <div id="spineSlots" class="list-stack"></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="spinePreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="spineSelected">Selected: torso</span><span>Namespace: lurek.spine</span><span id="spineDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + pixelStyles() + skeletonRiggingStyles(), script: skeletonRiggingScript() };
}

export function globeContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "globe",
    title: "Globe Editor",
    subtitle: "lurek.globe 2D regions, markers, polygons, render preview",
    icon: "grid",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "add-region", icon: "add", label: "Add region" },
      { action: "add-marker", icon: "node", label: "Add marker" },
      { action: "add-polygon", icon: "branch", label: "Add polygon" },
      { action: "toggle-render", icon: "play", label: "Toggle render mode" },
      { action: "voronoi", icon: "refresh", label: "Generate Voronoi" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export lurek.globe Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle properties" },
    ],
    left: `
      <section class="panel-section">
        <h2>Globe API</h2>
        <label class="field">Factory <select id="globeFactory"><option>lurek.globe.new</option><option>lurek.globe.generateVoronoi</option><option>lurek.globe.loadFromPNG</option></select></label>
        <label class="field">Map Name <input id="globeName" value="campaign_world"></label>
      </section>
      <section class="panel-section">
        <h2>2D Authoring</h2>
        <div class="tool-grid">
          ${toolButton("select", "node", "Select", true)}
          ${toolButton("region", "palette", "Region")}
          ${toolButton("marker", "add", "Marker")}
          ${toolButton("polygon", "branch", "Polygon")}
          ${toolButton("route", "link", "Route")}
          ${toolButton("sample", "grid", "Sample")}
        </div>
      </section>
      <section class="panel-section">
        <h2>Projection</h2>
        <label class="field">Mode <select id="globeProjection"><option>equirectangular</option><option>mercator</option><option>orthographic preview</option></select></label>
        <label class="field">Render Mode <select id="globeMode"><option>2D authoring</option><option>globe render</option></select></label>
      </section>
    `,
    center: `
      <div class="context-strip"><span id="globeApiStatus">API: lurek.globe.new</span><span id="globeCoord">lat 0 / lon 0</span><span id="globeRenderStatus">Mode: 2D authoring</span></div>
      <div class="globe-stage"><canvas id="globeCanvas" width="960" height="640"></canvas></div>
    `,
    right: `
      <section class="panel-section">
        <h2>Selected Feature</h2>
        <div id="globeInspector" class="property-list"></div>
      </section>
      <section class="panel-section">
        <h2>Regions / Markers</h2>
        <div id="globeFeatures" class="list-stack"></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="globePreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="globeSelected">Selected: capital</span><span>Namespace: lurek.globe</span><span id="globeDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + globeStyles(), script: globeScript() };
}

export function provinceContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "province",
    title: "Province Editor",
    subtitle: "lurek.province pixel ID map and runtime render mode",
    icon: "image",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "brush", icon: "brush", label: "Brush province color" },
      { action: "fill", icon: "palette", label: "Flood fill province" },
      { action: "sample", icon: "image", label: "Sample province ID" },
      { action: "toggle-render", icon: "play", label: "Toggle runtime render" },
      { action: "sanitize", icon: "validate", label: "Sanitize marked PNG" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export lurek.province Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle properties" },
    ],
    left: `
      <section class="panel-section">
        <h2>Province API</h2>
        <label class="field">Factory <select id="provinceFactory"><option>lurek.province.newFromPng</option><option>lurek.province.sanitizeMarkedPng</option></select></label>
        <label class="field">Map Name <input id="provinceName" value="campaign_provinces"></label>
      </section>
      <section class="panel-section">
        <h2>Pixel Tools</h2>
        <div class="tool-grid">
          ${toolButton("brush", "brush", "Brush", true)}
          ${toolButton("fill", "palette", "Fill")}
          ${toolButton("erase", "close", "Erase")}
          ${toolButton("sample", "image", "Sample")}
          ${toolButton("border", "grid", "Borders")}
          ${toolButton("metadata", "node", "Meta")}
        </div>
      </section>
      <section class="panel-section">
        <h2>Render</h2>
        <label class="field">View <select id="provinceView"><option>ID color map</option><option>Runtime render</option><option>Wealth heatmap</option><option>Owner overlay</option></select></label>
        <label class="check"><input id="provinceBorders" type="checkbox" checked> Show borders</label>
      </section>
    `,
    center: `
      <div class="context-strip"><span id="provinceApiStatus">API: lurek.province.newFromPng</span><span id="provinceCoord">0, 0</span><span id="provinceMode">View: ID color map</span></div>
      <div class="province-stage"><canvas id="provinceCanvas" width="960" height="640"></canvas></div>
    `,
    right: `
      <section class="panel-section">
        <h2>Province Metadata</h2>
        <div id="provinceInspector" class="property-list"></div>
      </section>
      <section class="panel-section">
        <h2>Palette Color = ID</h2>
        <div id="provincePalette" class="tile-palette"></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="provincePreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="provinceSelected">Selected: province_001</span><span>Namespace: lurek.province</span><span id="provinceDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + pixelStyles() + provinceStyles(), script: provinceScript() };
}

export function aiBehaviorContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "aiBehavior",
    title: "AI Behavior Tree Editor",
    subtitle: "lurek.ai selectors, sequences, decorators, actions",
    icon: "branch",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "add-selector", icon: "branch", label: "Add selector" },
      { action: "add-sequence", icon: "node", label: "Add sequence" },
      { action: "add-condition", icon: "validate", label: "Add condition" },
      { action: "add-action", icon: "play", label: "Add action" },
      { action: "tick", icon: "refresh", label: "Tick tree" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export lurek.ai Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle properties" },
    ],
    left: `
      <section class="panel-section">
        <h2>AI API</h2>
        <label class="field">Factory <select id="aiFactory"><option>lurek.ai.newBehaviorTree</option><option>lurek.ai.newSelector</option><option>lurek.ai.newSequence</option><option>lurek.ai.newAction</option><option>lurek.ai.newCondition</option></select></label>
        <label class="field">Tree Name <input id="aiTreeName" value="enemy_guard_patrol"></label>
      </section>
      <section class="panel-section">
        <h2>Tree Tools</h2>
        <div class="tool-grid">
          ${toolButton("select", "node", "Select", true)}
          ${toolButton("composite", "branch", "Composite")}
          ${toolButton("decorator", "refresh", "Decorator")}
          ${toolButton("condition", "validate", "Condition")}
          ${toolButton("action", "play", "Action")}
          ${toolButton("link", "link", "Link")}
        </div>
      </section>
      <section class="panel-section">
        <h2>Blackboard</h2>
        <div id="aiBlackboard" class="schema-list"></div>
      </section>
    `,
    center: `
      <div class="context-strip"><span id="aiApiStatus">API: lurek.ai.newBehaviorTree</span><span id="aiTraceStatus">Trace: idle</span><span id="aiSummary">0 nodes</span></div>
      <div class="graph-stage ai-tree-stage"><canvas id="aiTreeCanvas" width="960" height="640"></canvas></div>
      <div class="timeline-strip"><strong>Execution Trace</strong><div id="aiTrace" class="frame-list"></div></div>
    `,
    right: `
      <section class="panel-section">
        <h2>Node Properties</h2>
        <div id="aiInspector" class="property-list"></div>
      </section>
      <section class="panel-section">
        <h2>Node Library</h2>
        <div class="tag-list"><span>lurek.ai.newSelector</span><span>lurek.ai.newSequence</span><span>lurek.ai.newGuard</span><span>lurek.ai.newRepeater</span><span>lurek.ai.newAction</span></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="aiPreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="aiSelected">Selected: root_selector</span><span>Namespace: lurek.ai</span><span id="aiDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + aiBehaviorStyles(), script: aiBehaviorScript() };
}

export function graphContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "graph",
    title: "FlowNet / Graph Layout Editor",
    subtitle: "lurek.graph flow data with automated layout calculations",
    icon: "branch",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "add-node", icon: "add", label: "Add node" },
      { action: "add-link", icon: "link", label: "Add link" },
      { action: "layout-layered", icon: "grid", label: "Auto layout layered" },
      { action: "layout-force", icon: "refresh", label: "Auto layout force" },
      { action: "validate", icon: "validate", label: "Validate graph" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export lurek.graph Lua" },
      { action: "toggle-right", icon: "menu", label: "Toggle properties" },
    ],
    left: `
      <section class="panel-section">
        <h2>Graph API</h2>
        <label class="field">Factory <select id="graphFactory"><option>lurek.graph.newGraph</option><option>FlowNet layout metadata</option><option>Graph + UI layout export</option></select></label>
        <label class="field">Graph Name <input id="graphName" value="combat_flownet"></label>
      </section>
      <section class="panel-section">
        <h2>Flow Tools</h2>
        <div class="tool-grid">
          ${toolButton("select", "node", "Select", true)}
          ${toolButton("process", "database", "Process")}
          ${toolButton("condition", "branch", "Branch")}
          ${toolButton("event", "play", "Event")}
          ${toolButton("link", "link", "Cable")}
          ${toolButton("comment", "code", "Note")}
        </div>
      </section>
      <section class="panel-section">
        <h2>Auto Layout</h2>
        <label class="field">Algorithm <select id="graphLayout"><option>layered dag</option><option>force directed</option><option>grid compact</option><option>radial</option></select></label>
        <label class="field">Node Gap <input id="graphGap" type="range" min="70" max="180" value="110"></label>
        <label class="check"><input id="graphSnap" type="checkbox" checked> Snap calculated positions</label>
      </section>
    `,
    center: `
      <div class="context-strip"><span id="graphApiStatus">API: lurek.graph.newGraph</span><span id="graphLayoutStatus">Layout: layered dag</span><span id="graphSummary">5 nodes / 5 links</span></div>
      <div class="graph-stage flownet-stage"><canvas id="flowGraphCanvas" width="960" height="640"></canvas></div>
    `,
    right: `
      <section class="panel-section">
        <h2>Selected Node</h2>
        <div id="graphInspector" class="property-list"></div>
      </section>
      <section class="panel-section">
        <h2>Layout Metrics</h2>
        <div id="graphMetrics" class="schema-list"></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="graphPreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="graphSelected">Selected: input_event</span><span>Namespace: lurek.graph</span><span id="graphDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + graphEditorStyles(), script: graphEditorScript() };
}

export function voxelContent(): EditorContent {
  const workspaceHtml = professionalShell({
    id: "voxel",
    title: "Voxel Sprite Baker",
    subtitle: "Build voxel volume, bake four-side PNG sprites for Lurek2D",
    icon: "grid",
    toolbar: [
      ...STANDARD_FILE_ACTIONS,
      { action: "brush", icon: "brush", label: "Paint voxel" },
      { action: "erase", icon: "close", label: "Erase voxel" },
      { action: "fill-layer", icon: "palette", label: "Fill layer" },
      { action: "bake-png", icon: "image", label: "Bake PNG sprite" },
      { action: "rotate", icon: "refresh", label: "Rotate preview" },
      { action: "export-json", icon: "export", label: "Export JSON" },
      { action: "export-lua", icon: "code", label: "Export Lua asset manifest" },
      { action: "toggle-right", icon: "menu", label: "Toggle properties" },
    ],
    left: `
      <section class="panel-section">
        <h2>Asset Pipeline</h2>
        <label class="field">Output <select id="voxelOutput"><option>4-side PNG sprite sheet</option><option>isometric PNG</option><option>front PNG only</option></select></label>
        <label class="field">Asset Name <input id="voxelName" value="crate_voxel_sprite"></label>
      </section>
      <section class="panel-section">
        <h2>Voxel Tools</h2>
        <div class="tool-grid">
          ${toolButton("brush", "brush", "Brush", true)}
          ${toolButton("erase", "close", "Erase")}
          ${toolButton("fill", "palette", "Fill")}
          ${toolButton("slice", "grid", "Slice")}
          ${toolButton("shade", "image", "Shade")}
          ${toolButton("sample", "node", "Sample")}
        </div>
      </section>
      <section class="panel-section">
        <h2>Volume</h2>
        <label class="field">Layer Z <input id="voxelLayer" type="range" min="0" max="7" value="3"></label>
        <label class="field inline">Color <input id="voxelColor" type="color" value="#4fc1ff"></label>
        <label class="check"><input id="voxelGrid" type="checkbox" checked> Show grid</label>
      </section>
    `,
    center: `
      <div class="context-strip"><span id="voxelMode">Mode: Brush</span><span id="voxelCoord">x 0 / y 0 / z 3</span><span id="voxelBakeStatus">Bake: pending</span></div>
      <div class="voxel-stage"><canvas id="voxelCanvas" width="960" height="640"></canvas></div>
      <div class="timeline-strip"><strong>4-side PNG Preview</strong><div id="voxelSides" class="frame-list"></div></div>
    `,
    right: `
      <section class="panel-section">
        <h2>Sprite Bake</h2>
        <div id="voxelInspector" class="property-list"></div>
      </section>
      <section class="panel-section">
        <h2>Palette</h2>
        <div id="voxelPalette" class="tile-palette"></div>
      </section>
      <section class="panel-section grow">
        <h2>Generated Output</h2>
        <pre id="voxelPreview" class="output-box"></pre>
      </section>
    `,
    status: `<span id="voxelSelected">Selected: layer 3</span><span>Runtime: baked PNG, no voxel renderer</span><span id="voxelDirty">Clean</span>`,
  });

  return { workspaceHtml, styles: professionalStyles() + voxelStyles(), script: voxelScript() };
}

function professionalShell(input: {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly icon: IconName;
  readonly toolbar: readonly ToolbarButton[];
  readonly left: string;
  readonly center: string;
  readonly right: string;
  readonly status: string;
}): string {
  return `
<div class="pro-editor ${input.id}-editor" data-panel="${input.id}">
  <header class="pro-topbar">
    <div class="panel-title">${iconSvg(input.icon)}<div><h1>${input.title}</h1><p>${input.subtitle}</p></div></div>
    <nav class="top-actions" aria-label="${input.title} toolbar">
      ${input.toolbar.map(toolbarButton).join("")}
    </nav>
  </header>
  <section class="pro-body">
    <aside class="side-panel left-panel" aria-label="${input.title} parameters">${input.left}</aside>
    <main class="workstage">${input.center}</main>
    <aside class="side-panel right-panel" aria-label="${input.title} properties">
      <div class="panel-close-row"><button class="icon-button small" data-action="close-right" title="Hide right panel" aria-label="Hide right panel">${iconSvg("close")}</button></div>
      ${input.right}
    </aside>
  </section>
  <footer class="pro-status">${input.status}</footer>
</div>`;
}

function toolbarButton(button: ToolbarButton): string {
  return `<button class="icon-button${button.primary ? " primary" : ""}" data-action="${button.action}" title="${button.label}" aria-label="${button.label}">${iconSvg(button.icon)}<span class="tooltip">${button.label}</span></button>`;
}

function toolButton(action: string, icon: IconName, label: string, active = false): string {
  return `<button class="tool-button${active ? " active" : ""}" data-pixel-tool="${action}" title="${label}" aria-label="${label}">${iconSvg(icon)}<span>${label}</span></button>`;
}

function iconSvg(name: IconName): string {
  const paths: Record<IconName, string> = {
    add: '<path d="M12 5v14M5 12h14"/>',
    branch: '<path d="M6 4v6a4 4 0 0 0 4 4h8"/><path d="M14 9l4 5-4 5"/><circle cx="6" cy="4" r="2"/>',
    brush: '<path d="M15 4l5 5-9 9H6v-5l9-9Z"/><path d="M6 18c-1 0-2 .8-2 2h6c0-1.2-1-2-4-2Z"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    code: '<path d="M9 18l-6-6 6-6M15 6l6 6-6 6"/>',
    database: '<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    export: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    folder: '<path d="M3 7h7l2 2h9v10H3z"/>',
    grid: '<path d="M4 4h16v16H4z"/><path d="M4 10h16M4 16h16M10 4v16M16 4v16"/>',
    image: '<path d="M4 5h16v14H4z"/><circle cx="9" cy="10" r="2"/><path d="M5 18l5-5 4 4 2-2 4 3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    new: '<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4"/><path d="M12 10v7M8.5 13.5h7"/>',
    node: '<rect x="4" y="5" width="7" height="5" rx="1"/><rect x="13" y="14" width="7" height="5" rx="1"/><path d="M11 8h3a3 3 0 0 1 3 3v3"/>',
    open: '<path d="M4 6h6l2 2h8v3"/><path d="M3 10h18l-3 9H6z"/>',
    palette: '<path d="M12 4a8 8 0 0 0 0 16h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h2a6 6 0 0 0-2-8Z"/><circle cx="8" cy="10" r="1"/><circle cx="11" cy="8" r="1"/><circle cx="15" cy="10" r="1"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    redo: '<path d="M19 7v6h-6"/><path d="M19 13a7 7 0 1 1-2-5"/>',
    refresh: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M19 12a7 7 0 0 0-12-5M5 12a7 7 0 0 0 12 5"/>',
    reset: '<path d="M4 4v6h6"/><path d="M20 20v-6h-6"/><path d="M5 10a8 8 0 0 1 13-3M19 14a8 8 0 0 1-13 3"/>',
    save: '<path d="M5 4h12l2 2v14H5z"/><path d="M8 4v6h8V4"/><path d="M8 20v-6h8v6"/>',
    stop: '<path d="M6 6h12v12H6z"/>',
    undo: '<path d="M5 7v6h6"/><path d="M5 13a7 7 0 1 0 2-5"/>',
    validate: '<path d="M20 6L9 17l-5-5"/>',
    zoomIn: '<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20M10 7v6M7 10h6"/>',
    zoomOut: '<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20M7 10h6"/>',
  };
  return `<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function professionalStyles(): string {
  return `
* { box-sizing: border-box; }
body { margin: 0; }
.pro-editor { --border: var(--vscode-panel-border); --panel: var(--vscode-sideBar-background); --bg: var(--vscode-editor-background); --muted: var(--vscode-descriptionForeground); height: 100vh; max-height: 100vh; min-height: 0; overflow: hidden; display: flex; flex-direction: column; color: var(--vscode-foreground); background: var(--bg); font-family: var(--vscode-font-family); font-size: 12px; }
.pro-topbar { flex: 0 0 48px; display: flex; align-items: center; gap: 14px; padding: 7px 10px; background: var(--vscode-titleBar-activeBackground); border-bottom: 1px solid var(--border); }
.panel-title { display: flex; align-items: center; gap: 9px; min-width: 250px; }
.panel-title .svg-icon { width: 28px; height: 28px; padding: 6px; border: 1px solid var(--border); border-radius: 5px; background: var(--vscode-editorGroupHeader-tabsBackground); color: var(--vscode-focusBorder); }
h1 { margin: 0; font-size: 14px; line-height: 18px; font-weight: 600; }
p { margin: 0; color: var(--muted); line-height: 16px; }
.top-actions { flex: 1; min-width: 0; display: flex; align-items: center; gap: 5px; overflow-x: auto; overflow-y: visible; scrollbar-width: thin; padding-bottom: 2px; }
.icon-button { position: relative; width: 32px; height: 32px; flex: 0 0 32px; display: grid; place-items: center; border: 1px solid var(--vscode-button-border, var(--border)); border-radius: 4px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); cursor: pointer; }
.icon-button.primary, .icon-button:hover, .tool-button.active, .segment.active, .list-row.active { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
.icon-button.small { width: 26px; height: 26px; flex-basis: 26px; }
.svg-icon { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.tooltip { position: absolute; z-index: 30; top: 36px; left: 50%; transform: translateX(-50%); pointer-events: none; opacity: 0; max-width: 160px; white-space: nowrap; padding: 4px 7px; border-radius: 4px; border: 1px solid var(--border); background: var(--vscode-editorWidget-background, #252526); color: var(--vscode-foreground); box-shadow: 0 4px 12px rgba(0,0,0,.35); transition: opacity .08s ease; }
.icon-button:hover .tooltip { opacity: 1; }
.pro-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 260px minmax(420px, 1fr) 286px; overflow: hidden; transition: grid-template-columns .15s ease; }
.pro-editor.right-collapsed .pro-body { grid-template-columns: 260px minmax(420px, 1fr) 0; }
.side-panel { min-height: 0; overflow: auto; background: var(--panel); border-color: var(--border); }
.left-panel { border-right: 1px solid var(--border); }
.right-panel { border-left: 1px solid var(--border); transition: opacity .15s ease; }
.right-collapsed .right-panel { opacity: 0; pointer-events: none; overflow: hidden; }
.panel-close-row { height: 34px; display: flex; justify-content: flex-end; align-items: center; padding: 4px 8px; border-bottom: 1px solid var(--border); }
.panel-section { padding: 10px 12px; border-bottom: 1px solid var(--border); }
.panel-section.grow { display: flex; flex-direction: column; min-height: 180px; }
.panel-section h2 { margin: 0 0 8px; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.workstage { min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }
.context-strip, .query-strip, .formula-strip, .timeline-strip { flex: 0 0 38px; display: flex; align-items: center; gap: 10px; padding: 0 11px; border-bottom: 1px solid var(--border); background: var(--bg); color: var(--muted); }
.timeline-strip, .formula-strip { border-top: 1px solid var(--border); border-bottom: 0; }
.field { display: grid; gap: 4px; margin: 0 0 8px; color: var(--muted); }
.field.inline { grid-template-columns: 1fr auto; align-items: center; }
.field input, .field select, .query-strip input, .formula-strip input, .property-list input, .property-list textarea { min-width: 0; width: 100%; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 5px 7px; }
.property-list textarea { min-height: 88px; resize: vertical; }
.check { display: flex; align-items: center; gap: 7px; margin: 8px 0; color: var(--vscode-foreground); }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.button-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.panel-button, .segment { min-height: 28px; border: 1px solid var(--vscode-button-border, var(--border)); border-radius: 4px; padding: 0 9px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); cursor: pointer; }
.panel-button.primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
.tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.tool-button { min-height: 54px; display: grid; place-items: center; gap: 4px; border: 1px solid var(--border); border-radius: 4px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); cursor: pointer; }
.tool-button .svg-icon { width: 18px; height: 18px; }
.tool-button span { font-size: 10px; }
.list-stack, .schema-list, .property-list, .tag-list { display: grid; gap: 6px; }
.list-row { min-height: 32px; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 5px 8px; border: 1px solid var(--border); border-radius: 4px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); cursor: pointer; text-align: left; }
.list-row small, .muted { color: var(--muted); }
.schema-card { border: 1px solid var(--border); border-radius: 5px; padding: 8px; background: var(--bg); }
.schema-card strong { display: block; font-size: 13px; }
.schema-card small { color: var(--muted); }
.tag-list { grid-template-columns: 1fr; }
.tag-list span, .pill-row span { display: inline-flex; align-items: center; min-height: 22px; border: 1px solid var(--border); border-radius: 999px; padding: 0 8px; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
.pill-row { margin-left: auto; display: flex; gap: 6px; }
.output-box { flex: 1; min-height: 0; margin: 0; overflow: auto; padding: 8px; border: 1px solid var(--border); border-radius: 5px; background: var(--vscode-textCodeBlock-background); color: var(--vscode-foreground); white-space: pre-wrap; font-size: 11px; line-height: 15px; }
.output-box.compact { max-height: 90px; }
.color-chip { display: inline-block; width: 24px; height: 18px; border: 1px solid var(--border); border-radius: 3px; vertical-align: middle; }
.pro-status { flex: 0 0 22px; display: flex; align-items: center; gap: 18px; padding: 0 10px; background: var(--vscode-statusBar-background); color: var(--vscode-statusBar-foreground); font-size: 11px; }
@media (max-width: 1080px) { .panel-title { min-width: 210px; } .pro-body { grid-template-columns: 230px minmax(360px, 1fr); } .right-panel { display: none; } }
`;
}

function pixelStyles(): string {
  return `
.canvas-stage { flex: 1; min-height: 0; display: grid; place-items: center; overflow: auto; background: #111; }
.checker-stage { background-image: linear-gradient(45deg, rgba(255,255,255,.035) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,.035) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,.035) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.035) 75%); background-size: 18px 18px; background-position: 0 0,0 9px,9px -9px,-9px 0; }
#pixelCanvas { image-rendering: pixelated; border: 1px solid var(--vscode-focusBorder); background: #101010; }
.palette-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
.swatch { aspect-ratio: 1; border: 1px solid rgba(255,255,255,.22); border-radius: 4px; cursor: pointer; }
.swatch.active { outline: 2px solid var(--vscode-focusBorder); }
.frame-list { display: flex; gap: 7px; align-items: center; overflow: auto; }
.frame-card { width: 56px; height: 44px; border: 1px solid var(--border); border-radius: 4px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-foreground); }
`;
}

function databaseStyles(): string {
  return `
.query-strip { gap: 8px; }
.query-strip input { font-family: Consolas, monospace; color: #9cdcfe; background: #09233a; }
.table-stage { flex: 1; min-height: 0; overflow: auto; }
.data-grid { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; }
.data-grid th, .data-grid td { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 7px 9px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.data-grid th { position: sticky; top: 0; z-index: 1; text-align: left; background: var(--bg); color: var(--muted); font-size: 11px; text-transform: uppercase; }
.data-grid td { color: var(--vscode-foreground); }
.data-grid tr.selected td { background: var(--vscode-list-activeSelectionBackground); color: var(--vscode-list-activeSelectionForeground); }
.data-grid td.invalid { background: var(--vscode-inputValidation-errorBackground); color: var(--vscode-errorForeground); }
`;
}

function dialogStyles(): string {
  return `
.graph-stage { position: relative; flex: 1; min-height: 0; overflow: hidden; background-color: #0e1616; background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 18px 18px; }
.edge-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.dialog-node { position: absolute; width: 132px; min-height: 52px; border: 1px solid #6ca7d6; border-radius: 5px; background: #1f2d35; box-shadow: 0 6px 18px rgba(0,0,0,.25); cursor: pointer; }
.dialog-node.selected { outline: 2px solid var(--vscode-focusBorder); }
.dialog-node header { padding: 5px 7px; border-bottom: 1px solid rgba(255,255,255,.12); background: rgba(79,193,255,.18); font-weight: 700; }
.dialog-node p { padding: 6px 7px; color: var(--vscode-foreground); }
`;
}

function procMapStyles(): string {
  return `
.map-stage { flex: 1; min-height: 0; display: grid; place-items: center; overflow: hidden; background: #101820; }
#procCanvas { width: 100%; height: 100%; image-rendering: pixelated; }
.biome-list { display: grid; gap: 6px; }
.biome-row { display: grid; grid-template-columns: 22px 1fr auto; gap: 8px; align-items: center; }
.biome-color, .tile-swatch { width: 22px; height: 22px; border-radius: 3px; border: 1px solid var(--border); }
.tile-palette { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
.tile-swatch { width: auto; aspect-ratio: 1; }
`;
}

function tileMapStyles(): string {
  return `
.tilemap-stage { flex: 1; min-height: 0; overflow: auto; display: grid; place-items: center; background-color: #101315; background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 32px 32px; }
#tileCanvas { image-rendering: pixelated; border: 1px solid var(--border); background: #151515; }
.tile-palette { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
.tile-chip { aspect-ratio: 1; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; }
.tile-chip.active { outline: 2px solid var(--vscode-focusBorder); }
`;
}

function sceneFlowStyles(): string {
  return `
.sceneFlow-editor .graph-stage { background-color: #0f151c; }
.scene-node { position: absolute; width: 136px; min-height: 58px; border: 1px solid #78aee8; border-radius: 5px; background: #1d2a36; color: var(--vscode-foreground); cursor: pointer; box-shadow: 0 8px 22px rgba(0,0,0,.25); }
.scene-node.selected { outline: 2px solid var(--vscode-focusBorder); }
.scene-node header { padding: 6px 8px; border-bottom: 1px solid rgba(255,255,255,.13); background: rgba(14,99,156,.55); font-weight: 700; }
.scene-node small { display: block; padding: 7px 8px; color: var(--muted); }
.stack-row { min-height: 28px; padding: 6px 8px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg); }
`;
}

function particleStyles(): string {
  return `
.particle-stage { flex: 1; min-height: 0; display: grid; place-items: center; overflow: hidden; background: radial-gradient(circle at center, #1b2530 0%, #0d1117 70%); }
#particleCanvas { width: 100%; height: 100%; }
.gradient-editor { height: 30px; border: 1px solid var(--border); border-radius: 5px; margin-bottom: 9px; background: linear-gradient(90deg, #ffd166, #ef476f); }
`;
}

function skeletonRiggingStyles(): string {
  return `
.rig-stage { flex: 1; min-height: 0; display: grid; place-items: center; overflow: hidden; background-color: #111618; background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 28px 28px; }
#spineCanvas { width: 100%; height: 100%; }
.bone-row { display: grid; grid-template-columns: 1fr auto; gap: 6px; align-items: center; }
.bone-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--vscode-focusBorder); }
.slot-chip { min-height: 30px; display: grid; grid-template-columns: 22px 1fr auto; gap: 7px; align-items: center; padding: 5px 7px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg); }
.slot-chip i { width: 22px; height: 22px; border-radius: 4px; border: 1px solid var(--border); }
`;
}

function globeStyles(): string {
  return `
.globe-stage { flex: 1; min-height: 0; display: grid; place-items: center; overflow: hidden; background-color: #0e151b; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 32px 32px; }
#globeCanvas { width: 100%; height: 100%; }
.feature-row { min-height: 34px; display: grid; grid-template-columns: 16px 1fr auto; gap: 8px; align-items: center; padding: 6px 8px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg); cursor: pointer; }
.feature-row.active { outline: 2px solid var(--vscode-focusBorder); }
.feature-row i { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,.35); }
`;
}

function provinceStyles(): string {
  return `
.province-stage { flex: 1; min-height: 0; display: grid; place-items: center; overflow: auto; background-color: #111; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 24px 24px; }
#provinceCanvas { image-rendering: pixelated; border: 1px solid var(--border); background: #101010; }
.province-chip { aspect-ratio: 1; border: 1px solid rgba(255,255,255,.24); border-radius: 4px; cursor: pointer; }
.province-chip.active { outline: 2px solid var(--vscode-focusBorder); }
`;
}

function aiBehaviorStyles(): string {
  return `
.ai-tree-stage { flex: 1; min-height: 0; display: grid; place-items: center; overflow: hidden; background-color: #111719; background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 28px 28px; }
#aiTreeCanvas { width: 100%; height: 100%; }
.trace-card { min-width: 82px; height: 44px; border: 1px solid var(--border); border-radius: 4px; display: grid; place-items: center; background: var(--vscode-button-secondaryBackground); color: var(--vscode-foreground); }
`;
}

function graphEditorStyles(): string {
  return `
.flownet-stage { flex: 1; min-height: 0; display: grid; place-items: center; overflow: hidden; background-color: #10151c; background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 30px 30px; }
#flowGraphCanvas { width: 100%; height: 100%; }
.metric-card { border: 1px solid var(--border); border-radius: 4px; padding: 7px 8px; background: var(--bg); }
.metric-card strong { display: block; font-size: 12px; }
`;
}

function voxelStyles(): string {
  return `
.voxel-stage { flex: 1; min-height: 0; display: grid; place-items: center; overflow: hidden; background-color: #101112; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 24px 24px; }
#voxelCanvas { width: 100%; height: 100%; image-rendering: pixelated; }
.voxel-side { width: 96px; height: 44px; border: 1px solid var(--border); border-radius: 4px; display: grid; place-items: center; background: var(--vscode-button-secondaryBackground); color: var(--vscode-foreground); font-size: 11px; }
.voxel-swatch { aspect-ratio: 1; border: 1px solid rgba(255,255,255,.24); border-radius: 4px; cursor: pointer; }
.voxel-swatch.active { outline: 2px solid var(--vscode-focusBorder); }
`;
}

function tileMapScript(): string {
  return `
(function(){
  const vscode = acquireVsCodeApi();
  const canvas = document.getElementById('tileCanvas');
  const ctx = canvas.getContext('2d');
  const cols = 32, rows = 20, tileSize = 28;
  const colors = ['#2c8a42','#7ec8d6','#e5d14f','#8d8d8d','#9b7653','#3b5dc9','#5d275d','#566c86'];
  const state = { tool:'brush', gid:1, layer:0, showGrid:true, selected:{x:0,y:0}, layers:[{name:'Ground',visible:true,cells:[]},{name:'Objects',visible:true,cells:[]},{name:'Collision',visible:true,cells:[]}] };
  state.layers.forEach((layer, li) => { layer.cells = Array.from({length:cols*rows}, (_, i) => li===0 ? ((i + Math.floor(i/cols)) % colors.length) + 1 : 0); });
  function idx(x,y){ return y*cols+x; }
  function serialize(){ return {kind:'lurek.tilemap', api:'lurek.tilemap.newTileMap', tileWidth:Number(document.getElementById('tileW').value), tileHeight:Number(document.getElementById('tileH').value), chunkSize:Number(document.getElementById('tileChunk').value), tileset:{firstGid:Number(document.getElementById('tileFirstGid').value), tileCount:colors.length, columns:Number(document.getElementById('tileColumns').value)}, layers:state.layers.map(layer=>({name:layer.name, visible:layer.visible, cells:layer.cells}))}; }
  function lua(){ const data=serialize(); return '-- Generated by Lurek2D Tile Map Editor\\nlocal tileset = lurek.tilemap.newTileSet('+data.tileset.firstGid+', '+data.tileset.tileCount+', '+data.tileset.columns+', '+data.tileWidth+', '+data.tileHeight+')\\nlocal map = lurek.tilemap.newTileMap('+data.tileWidth+', '+data.tileHeight+', '+data.chunkSize+', { culling = true, collision = true })\\nreturn { api = \"lurek.tilemap\", tileset = tileset, map = map, data = '+JSON.stringify(data,null,2)+' }\\n'; }
  function markDirty(){ document.getElementById('tileDirty').textContent='Modified'; vscode.postMessage({type:'stateChanged',dirty:true}); }
  function draw(){ canvas.width=cols*tileSize; canvas.height=rows*tileSize; ctx.fillStyle='#151515'; ctx.fillRect(0,0,canvas.width,canvas.height); state.layers.forEach((layer, li)=>{ if(!layer.visible) return; ctx.globalAlpha=li===0?1:.72; layer.cells.forEach((gid,i)=>{ if(!gid) return; ctx.fillStyle=colors[(gid-1)%colors.length]; ctx.fillRect((i%cols)*tileSize,Math.floor(i/cols)*tileSize,tileSize,tileSize); }); }); ctx.globalAlpha=1; if(state.showGrid){ ctx.strokeStyle='rgba(0,0,0,.35)'; for(let x=0;x<=cols;x++){ctx.beginPath();ctx.moveTo(x*tileSize+.5,0);ctx.lineTo(x*tileSize+.5,canvas.height);ctx.stroke();} for(let y=0;y<=rows;y++){ctx.beginPath();ctx.moveTo(0,y*tileSize+.5);ctx.lineTo(canvas.width,y*tileSize+.5);ctx.stroke();} } ctx.strokeStyle='#4fc1ff'; ctx.lineWidth=2; ctx.strokeRect(state.selected.x*tileSize+1,state.selected.y*tileSize+1,tileSize-2,tileSize-2); update(); }
  function update(){ document.getElementById('tileApiStatus').textContent='API: '+document.getElementById('tileFactory').value; document.getElementById('tileStatusLayer').textContent='Layer: '+state.layers[state.layer].name; document.getElementById('tilePreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3600); document.getElementById('tileInspector').innerHTML='<label class="field">X<input value="'+state.selected.x+'"></label><label class="field">Y<input value="'+state.selected.y+'"></label><label class="field">GID<input value="'+state.gid+'"></label><label class="field">Property<input value="spawn=false"></label>'; }
  function renderPalette(){ document.getElementById('tilePalette').innerHTML=colors.map((c,i)=>'<button class="tile-chip'+(state.gid===i+1?' active':'')+'" data-gid="'+(i+1)+'" style="background:'+c+'" title="gid '+(i+1)+'"></button>').join(''); }
  function renderLayers(){ document.getElementById('tileLayers').innerHTML=state.layers.map((l,i)=>'<button class="list-row'+(i===state.layer?' active':'')+'" data-layer="'+i+'"><strong>'+l.name+'</strong><small>'+l.cells.filter(Boolean).length+' tiles</small></button>').join(''); }
  function point(e){ const r=canvas.getBoundingClientRect(); return {x:Math.floor((e.clientX-r.left)/(r.width/cols)), y:Math.floor((e.clientY-r.top)/(r.height/rows))}; }
  canvas.addEventListener('mousedown', e=>{ const p=point(e); if(p.x<0||p.y<0||p.x>=cols||p.y>=rows) return; state.selected=p; if(state.tool==='erase') state.layers[state.layer].cells[idx(p.x,p.y)]=0; else if(state.tool==='fill') state.layers[state.layer].cells.fill(state.gid); else state.layers[state.layer].cells[idx(p.x,p.y)]=state.tool==='collision'?99:state.gid; markDirty(); draw(); renderLayers(); });
  canvas.addEventListener('mousemove', e=>{ const p=point(e); document.getElementById('tileCoord').textContent=p.x+', '+p.y; });
  document.addEventListener('click', e=>{ const t=e.target; const tool=t.closest?.('[data-pixel-tool]'); if(tool){ state.tool=tool.dataset.pixelTool; document.querySelectorAll('[data-pixel-tool]').forEach(b=>b.classList.toggle('active',b===tool)); update(); } const gid=t.closest?.('[data-gid]'); if(gid){ state.gid=Number(gid.dataset.gid); renderPalette(); update(); } const layer=t.closest?.('[data-layer]'); if(layer){ state.layer=Number(layer.dataset.layer); renderLayers(); update(); } });
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{ const a=button.dataset.action; if(a==='toggle-right') document.querySelector('.pro-editor').classList.toggle('right-collapsed'); if(a==='close-right') document.querySelector('.pro-editor').classList.add('right-collapsed'); if(a==='zoom-in'||a==='zoom-out') document.getElementById('tileZoom').textContent=a==='zoom-in'?'Zoom 125%':'Zoom 75%'; if(a==='save'||a==='export-json') vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'tilemap.ltm.json'}); if(a==='export-lua') vscode.postMessage({type:'export',format:'lua',content:lua(),fileName:'tilemap.lua'}); if(a==='new'||a==='reset'){ state.layers.forEach(l=>l.cells.fill(0)); markDirty(); draw(); renderLayers(); } }));
  document.querySelectorAll('[data-tile-command]').forEach(button=>button.addEventListener('click',()=>{ if(button.dataset.tileCommand==='toggle-grid'){ state.showGrid=!state.showGrid; draw(); } if(button.dataset.tileCommand==='add-layer'){ state.layers.push({name:'Layer '+(state.layers.length+1),visible:true,cells:Array.from({length:cols*rows},()=>0)}); state.layer=state.layers.length-1; markDirty(); renderLayers(); draw(); } }));
  ['tileFactory','tileW','tileH','tileChunk','tileFirstGid','tileColumns'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{ markDirty(); update(); }));
  renderPalette(); renderLayers(); draw();
})();`;
}

function sceneFlowScript(): string {
  return `
(function(){
  const vscode = acquireVsCodeApi();
  const scenes=[{id:'boot',name:'Boot',x:70,y:190,layer:0,mode:'switchTo'},{id:'menu',name:'MainMenu',x:250,y:120,layer:1,mode:'switchTo'},{id:'game',name:'Gameplay',x:470,y:170,layer:0,mode:'push'},{id:'pause',name:'PauseOverlay',x:690,y:100,layer:10,mode:'pushOverlay'},{id:'credits',name:'Credits',x:690,y:280,layer:1,mode:'switchTo'}];
  const links=[['boot','menu','fade'],['menu','game','slideLeft'],['game','pause','fade'],['pause','game','pop'],['menu','credits','fade']];
  let selected='boot', mode='switchTo';
  function serialize(){ return {kind:'lurek.sceneFlow', api:'lurek.scene', transition:document.getElementById('sceneTransition').value, duration:Number(document.getElementById('sceneDuration').value), easing:document.getElementById('sceneEasing').value, scenes, links}; }
  function lua(){ const data=serialize(); return '-- Generated by Lurek2D Scene Flow Editor\\nlocal scenes = {}\\n' + data.scenes.map(s=>'scenes.'+s.name+' = lurek.scene.define({ name = \"'+s.name+'\", layer = '+s.layer+' })\\nlurek.scene.registerScene(\"'+s.name+'\", scenes.'+s.name+')').join('\\n') + '\\n\\nreturn {\\n  start = function()\\n    lurek.scene.switchTo(scenes.'+data.scenes[0].name+', \"'+data.transition+'\", '+data.duration+', \"'+data.easing+'\")\\n  end,\\n  scenes = scenes,\\n  graph = '+JSON.stringify(data,null,2)+'\\n}\\n'; }
  function markDirty(){ document.getElementById('sceneFlowDirty').textContent='Modified'; vscode.postMessage({type:'stateChanged',dirty:true}); }
  function render(){ const graph=document.getElementById('sceneFlowGraph'); graph.innerHTML='<svg class="edge-layer" viewBox="0 0 900 480">'+links.map(([a,b,t])=>{ const from=scenes.find(s=>s.id===a), to=scenes.find(s=>s.id===b); return '<path d="M '+(from.x+136)+' '+(from.y+29)+' C '+(from.x+210)+' '+(from.y+29)+', '+(to.x-70)+' '+(to.y+29)+', '+to.x+' '+(to.y+29)+'" stroke="#78aee8" fill="none"/><text x="'+((from.x+to.x)/2+40)+'" y="'+((from.y+to.y)/2+18)+'" fill="#9aa0a6" font-size="11">'+t+'</text>'; }).join('')+'</svg>'+scenes.map(s=>'<button class="scene-node'+(s.id===selected?' selected':'')+'" data-scene="'+s.id+'" style="left:'+s.x+'px;top:'+s.y+'px"><header>'+s.name+'</header><small>lurek.scene.'+s.mode+' / layer '+s.layer+'</small></button>').join(''); inspect(); stack(); preview(); }
  function inspect(){ const s=scenes.find(scene=>scene.id===selected); document.getElementById('sceneFlowInspector').innerHTML='<label class="field">Scene Name<input data-scene-field="name" value="'+s.name+'"></label><label class="field">Mode<input value="lurek.scene.'+s.mode+'"></label><label class="field">Layer<input data-scene-field="layer" type="number" value="'+s.layer+'"></label><label class="field">Registered Key<input value="'+s.name+'"></label>'; document.getElementById('sceneFlowSelected').textContent='Selected: '+s.id; }
  function stack(){ document.getElementById('sceneStack').innerHTML=scenes.slice(0,3).map((s,i)=>'<div class="stack-row">'+(i+1)+'. '+s.name+' <span class="muted">layer '+s.layer+'</span></div>').join(''); }
  function preview(){ document.getElementById('sceneFlowSummary').textContent=scenes.length+' scenes / '+links.length+' transitions'; document.getElementById('sceneFlowPreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3600); }
  document.addEventListener('click', e=>{ const scene=e.target.closest?.('[data-scene]'); if(scene){ selected=scene.dataset.scene; render(); } const modeBtn=e.target.closest?.('[data-scene-mode]'); if(modeBtn){ mode=modeBtn.dataset.sceneMode; document.querySelectorAll('[data-scene-mode]').forEach(b=>b.classList.toggle('active',b===modeBtn)); } });
  document.addEventListener('input', e=>{ const input=e.target.closest?.('[data-scene-field]'); if(!input) return; const s=scenes.find(scene=>scene.id===selected); s[input.dataset.sceneField]=input.dataset.sceneField==='layer'?Number(input.value):input.value; markDirty(); render(); });
  ['sceneTransition','sceneDuration','sceneEasing'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{ markDirty(); preview(); }));
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{ const a=button.dataset.action; if(a==='toggle-right') document.querySelector('.pro-editor').classList.toggle('right-collapsed'); if(a==='close-right') document.querySelector('.pro-editor').classList.add('right-collapsed'); if(a==='add-scene'){ const id='scene_'+(scenes.length+1); scenes.push({id,name:'Scene'+(scenes.length+1),x:130+(scenes.length*90)%650,y:80+(scenes.length*65)%330,layer:0,mode}); selected=id; markDirty(); render(); } if(a==='add-transition'){ links.push([selected,'menu',document.getElementById('sceneTransition').value]); markDirty(); render(); } if(a==='save'||a==='export-json') vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'scene_flow.json'}); if(a==='export-lua') vscode.postMessage({type:'export',format:'lua',content:lua(),fileName:'scene_flow.lua'}); if(a==='validate'||a==='play') { document.getElementById('sceneFlowStatus').textContent='Path valid via lurek.scene.'+mode; preview(); } }));
  document.querySelectorAll('[data-scene-command]').forEach(button=>button.addEventListener('click',()=>{ document.getElementById('sceneFlowStatus').textContent=button.dataset.sceneCommand==='register'?'registerScene calls ready':'Trace reaches Gameplay'; preview(); }));
  render();
})();`;
}

function particleScript(): string {
  return `
(function(){
  const vscode = acquireVsCodeApi();
  const canvas=document.getElementById('particleCanvas');
  const ctx=canvas.getContext('2d');
  const particles=[]; let running=false, last=performance.now();
  function serialize(){ return {kind:'lurek.particle', api:document.getElementById('particleFactory').value, preset:document.getElementById('particlePreset').value, config:{shape:document.getElementById('particleShape').value, emissionRate:Number(document.getElementById('particleRate').value), maxParticles:Number(document.getElementById('particleMax').value), lifetime:Number(document.getElementById('particleLife').value), gravity:{x:0,y:Number(document.getElementById('particleGravity').value)}, speed:Number(document.getElementById('particleSpeed').value), colors:[document.getElementById('particleStartColor').value, document.getElementById('particleEndColor').value]}}; }
  function lua(){ const data=serialize(); return '-- Generated by Lurek2D Particle Designer\\nlocal system = lurek.particle.newSystem({\\n  max_particles = '+data.config.maxParticles+',\\n  emission_rate = '+data.config.emissionRate+',\\n  shape = \"'+data.config.shape+'\",\\n  lifetime = { '+Math.max(.1,data.config.lifetime*.5).toFixed(2)+', '+data.config.lifetime.toFixed(2)+' },\\n  speed = { '+Math.max(1,data.config.speed*.45).toFixed(1)+', '+data.config.speed.toFixed(1)+' },\\n  gravity = { 0, '+data.config.gravity.y+' },\\n  colors = { \"'+data.config.colors[0]+'\", \"'+data.config.colors[1]+'\" }\\n})\\nsystem:emit(48)\\nsystem:start()\\nreturn system\\n'; }
  function markDirty(){ document.getElementById('particleDirty').textContent='Modified'; vscode.postMessage({type:'stateChanged',dirty:true}); }
  function spawn(count){ const cfg=serialize().config; for(let i=0;i<count && particles.length<cfg.maxParticles;i++){ const a=(-Math.PI/2)+(Math.random()-.5)*1.2, sp=cfg.speed*(.45+Math.random()*.55); particles.push({x:canvas.width/2,y:canvas.height*.62,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:cfg.lifetime,age:0,size:2+Math.random()*5}); } }
  function colorMix(a,b,t){ const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16); const ar=[pa>>16,(pa>>8)&255,pa&255], br=[pb>>16,(pb>>8)&255,pb&255]; return 'rgb('+ar.map((v,i)=>Math.round(v+(br[i]-v)*t)).join(',')+')'; }
  function step(dt){ const cfg=serialize().config; if(running) spawn(Math.max(1,Math.round(cfg.emissionRate*dt))); for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.age+=dt; p.vy+=cfg.gravity.y*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.age>=p.life) particles.splice(i,1); } }
  function draw(){ canvas.width=canvas.clientWidth||960; canvas.height=canvas.clientHeight||640; ctx.clearRect(0,0,canvas.width,canvas.height); const cfg=serialize().config; const grd=ctx.createRadialGradient(canvas.width/2,canvas.height*.62,0,canvas.width/2,canvas.height*.62,220); grd.addColorStop(0,'rgba(79,193,255,.16)'); grd.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=grd; ctx.fillRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{ const t=Math.min(1,p.age/p.life); ctx.globalAlpha=1-t; ctx.fillStyle=colorMix(cfg.colors[0],cfg.colors[1],t); ctx.beginPath(); ctx.arc(p.x,p.y,p.size*(1-t*.55),0,Math.PI*2); ctx.fill(); }); ctx.globalAlpha=1; document.getElementById('particleCount').textContent=particles.length+' particles'; document.getElementById('particlePreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3000); document.getElementById('particleGradient').style.background='linear-gradient(90deg, '+cfg.colors[0]+', '+cfg.colors[1]+')'; }
  function tick(now){ const dt=Math.min(.05,(now-last)/1000); last=now; step(dt); draw(); requestAnimationFrame(tick); }
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{ const a=button.dataset.action; if(a==='toggle-right') document.querySelector('.pro-editor').classList.toggle('right-collapsed'); if(a==='close-right') document.querySelector('.pro-editor').classList.add('right-collapsed'); if(a==='play'){ running=true; document.getElementById('particleStatus').textContent='Preview running'; } if(a==='stop'){ running=false; document.getElementById('particleStatus').textContent='Preview stopped'; } if(a==='burst') spawn(80); if(a==='reset-sim'||a==='reset'||a==='new'){ particles.length=0; markDirty(); } if(a==='save'||a==='export-json') vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'particle_emitter.json'}); if(a==='export-lua') vscode.postMessage({type:'export',format:'lua',content:lua(),fileName:'particle_emitter.lua'}); draw(); }));
  ['particleFactory','particlePreset','particleShape','particleRate','particleMax','particleLife','particleGravity','particleSpeed','particleStartColor','particleEndColor'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{ document.getElementById('particleApiStatus').textContent='API: '+document.getElementById('particleFactory').value; markDirty(); draw(); }));
  spawn(80); requestAnimationFrame(tick);
})();`;
}

function pixelArtScript(): string {
  return `
(function(){
  const vscode = acquireVsCodeApi();
  const canvas = document.getElementById('pixelCanvas');
  const ctx = canvas.getContext('2d');
  const size = 32;
  const state = { tool:'pencil', color:'#1a1c2c', zoom:9, frame:0, dirty:false, palette:['#1a1c2c','#5d275d','#b13e53','#ef7d57','#ffcd75','#a7f070','#38b764','#257179','#29366f','#3b5dc9','#41a6f6','#73eff7','#f4f4f4','#94b0c2','#566c86','#333c57','#9b5b3f','#d95763','#ffa300','#fff024','#00e436','#29adff','#83769c','#ff77a8'], layers:[{name:'Base',visible:true,opacity:1},{name:'Shade',visible:true,opacity:.9},{name:'FX',visible:true,opacity:.75}], frames:[] };
  function blank(){ return Array.from({length:size*size}, () => ''); }
  function active(){ return state.frames[state.frame]; }
  function idx(x,y){ return y*size+x; }
  function seed(){ const p=blank(); for(let y=8;y<24;y++) for(let x=11;x<21;x++) p[idx(x,y)]='#3b5dc9'; for(let y=6;y<13;y++) for(let x=12;x<20;x++) p[idx(x,y)]='#ef7d57'; for(let x=9;x<23;x++) p[idx(x,24)]='#1a1c2c'; p[idx(14,9)]='#1a1c2c'; p[idx(18,9)]='#1a1c2c'; state.frames=[p]; }
  function markDirty(){ state.dirty=true; document.getElementById('pixelDirty').textContent='Modified'; vscode.postMessage({type:'stateChanged',dirty:true}); }
  function serialize(){ return {kind:'lurek.pixelArt', asset:document.getElementById('pixelAsset').value, width:size, height:size, palette:state.palette, layers:state.layers, frames:state.frames}; }
  function lua(){ return '-- Generated by Lurek2D Pixel Art Editor\\nreturn '+JSON.stringify(serialize(),null,2).replace(/"([^"]+)":/g,'$1 =')+'\\n'; }
  function draw(){ canvas.width=size*state.zoom; canvas.height=size*state.zoom; ctx.fillStyle='#101010'; ctx.fillRect(0,0,canvas.width,canvas.height); active().forEach((c,i)=>{ if(!c) return; ctx.fillStyle=c; ctx.fillRect((i%size)*state.zoom,Math.floor(i/size)*state.zoom,state.zoom,state.zoom); }); if(document.getElementById('pixelGrid').checked){ ctx.strokeStyle='rgba(255,255,255,.14)'; for(let i=0;i<=size;i++){ ctx.beginPath(); ctx.moveTo(i*state.zoom+.5,0); ctx.lineTo(i*state.zoom+.5,canvas.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*state.zoom+.5); ctx.lineTo(canvas.width,i*state.zoom+.5); ctx.stroke(); } } update(); }
  function update(){ document.getElementById('pixelColorChip').style.background=state.color; document.getElementById('pixelZoomLabel').textContent=Math.round(state.zoom*100)+'%'; document.getElementById('pixelStatusTool').textContent='Tool: '+state.tool; document.getElementById('pixelStatusFrame').textContent='Frame '+(state.frame+1)+' / '+state.frames.length; document.getElementById('pixelPreview').textContent=JSON.stringify(serialize(),null,2).slice(0,2600); }
  function renderPalette(){ document.getElementById('pixelPalette').innerHTML=state.palette.map(c=>'<button class="swatch'+(c===state.color?' active':'')+'" data-color="'+c+'" style="background:'+c+'" title="'+c+'"></button>').join(''); }
  function renderLayers(){ document.getElementById('pixelLayers').innerHTML=state.layers.map((l,i)=>'<button class="list-row'+(i===0?' active':'')+'"><strong>'+l.name+'</strong><small>'+Math.round(l.opacity*100)+'%</small></button>').join(''); }
  function renderFrames(){ document.getElementById('pixelFrames').innerHTML=state.frames.map((_,i)=>'<button class="frame-card'+(i===state.frame?' active':'')+'" data-frame="'+i+'">F'+(i+1)+'</button>').join(''); }
  function pos(e){ const r=canvas.getBoundingClientRect(); return {x:Math.floor((e.clientX-r.left)/state.zoom), y:Math.floor((e.clientY-r.top)/state.zoom)}; }
  canvas.addEventListener('mousedown', e=>{ const p=pos(e); if(p.x<0||p.y<0||p.x>=size||p.y>=size) return; active()[idx(p.x,p.y)] = state.tool==='eraser' ? '' : state.color; markDirty(); draw(); });
  canvas.addEventListener('mousemove', e=>{ const p=pos(e); document.getElementById('pixelStatusPos').textContent=p.x+', '+p.y; });
  document.addEventListener('click', e=>{ const target=e.target; const tool=target.closest?.('[data-pixel-tool]'); if(tool){ state.tool=tool.dataset.pixelTool; document.querySelectorAll('[data-pixel-tool]').forEach(b=>b.classList.toggle('active',b===tool)); update(); } const swatch=target.closest?.('.swatch'); if(swatch){ state.color=swatch.dataset.color; document.getElementById('pixelColor').value=state.color; renderPalette(); draw(); } const frame=target.closest?.('[data-frame]'); if(frame){ state.frame=Number(frame.dataset.frame); renderFrames(); draw(); } });
  document.getElementById('pixelBrush').addEventListener('input', update);
  document.getElementById('pixelColor').addEventListener('input', e=>{ state.color=e.target.value; renderPalette(); draw(); });
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{ const a=button.dataset.action; if(a==='toggle-right') document.querySelector('.pro-editor').classList.toggle('right-collapsed'); if(a==='close-right') document.querySelector('.pro-editor').classList.add('right-collapsed'); if(a==='zoom-in'){state.zoom=Math.min(18,state.zoom+1);draw();} if(a==='zoom-out'){state.zoom=Math.max(4,state.zoom-1);draw();} if(a==='fit'){state.zoom=9;draw();} if(a==='save'||a==='export-json') vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'pixel_art.json'}); if(a==='export-lua') vscode.postMessage({type:'export',format:'lua',content:lua(),fileName:'pixel_art.lua'}); if(a==='new'||a==='reset'){seed();markDirty();renderFrames();draw();}}));
  document.querySelectorAll('[data-pixel-command]').forEach(button=>button.addEventListener('click',()=>{ const c=button.dataset.pixelCommand; if(c==='add-frame'){state.frames.push(blank()); state.frame=state.frames.length-1; markDirty(); renderFrames(); draw();} if(c==='copy-lua') vscode.postMessage({type:'copy',text:lua()}); }));
  seed(); renderPalette(); renderLayers(); renderFrames(); draw();
})();`;
}

function databaseScript(): string {
  return `
(function(){
  const vscode = acquireVsCodeApi();
  const state = { active:'items', selected:null, tables:{ items:{ schema:[['id','string'],['name','string'],['type','enum'],['damage','int'],['price','int'],['weight','float'],['stackable','bool'],['tags','string'],['description','string']], rows:[{id:'sword_01',name:'Iron Sword',type:'weapon',damage:15,price:120,weight:3.2,stackable:false,tags:'melee,starter',description:'Reliable starter blade'},{id:'potion_01',name:'Health Potion',type:'potion',damage:0,price:25,weight:.5,stackable:true,tags:'consumable,healing',description:'Restores 50 HP'},{id:'armor_01',name:'Leather Armor',type:'armor',damage:0,price:80,weight:5,stackable:false,tags:'defense,light',description:'Light body armor'},{id:'ore_iron',name:'Iron Ore',type:'material',damage:0,price:9,weight:1.1,stackable:true,tags:'crafting,metal',description:'Basic crafting material'}]}, loot:{ schema:[['id','string'],['item_id','ref'],['weight','int'],['min_level','int'],['tags','string']], rows:[{id:'starter_sword',item_id:'sword_01',weight:12,min_level:1,tags:'starter'},{id:'common_potion',item_id:'potion_01',weight:60,min_level:1,tags:'healing'}]}} };
  function table(){ return state.tables[state.active]; }
  function serialize(){ return {kind:'lurek.database', activeTable:state.active, tables:state.tables}; }
  function markDirty(){ document.getElementById('dbDirty').textContent='Modified'; vscode.postMessage({type:'stateChanged',dirty:true}); }
  function render(){ renderTables(); renderSchema(); renderGrid(); inspect(); preview(); }
  function renderTables(){ document.getElementById('dbTables').innerHTML=Object.keys(state.tables).map(name=>'<button class="list-row'+(name===state.active?' active':'')+'" data-table="'+name+'"><strong>'+name+'</strong><small>'+state.tables[name].rows.length+' rows</small></button>').join(''); }
  function renderSchema(){ document.getElementById('dbSchema').innerHTML=table().schema.map(col=>'<div class="schema-card"><strong>'+col[0]+'</strong><small>'+col[1]+'</small></div>').join(''); }
  function filteredRows(){ const q=document.getElementById('dbSearch').value.toLowerCase(); const type=document.getElementById('dbType').value; return table().rows.filter(row=>(!q||JSON.stringify(row).toLowerCase().includes(q))&&(!type||row.type===type)); }
  function renderGrid(){ const rows=filteredRows(); const head='<thead><tr>'+table().schema.map(col=>'<th>'+col[0]+'<br><small>'+col[1]+'</small></th>').join('')+'</tr></thead>'; const body='<tbody>'+rows.map(row=>'<tr data-row="'+table().rows.indexOf(row)+'">'+table().schema.map(col=>'<td contenteditable="true" data-col="'+col[0]+'">'+String(row[col[0]]??'')+'</td>').join('')+'</tr>').join('')+'</tbody>'; document.getElementById('databaseGrid').innerHTML=head+body; document.getElementById('dbStatusTable').textContent='Table: '+state.active; document.getElementById('dbStatusRows').textContent=rows.length+' / '+table().rows.length+' rows'; document.getElementById('dbPills').innerHTML='<span>'+rows.length+' rows</span><span>'+table().schema.length+' columns</span><span>0 errors</span>'; }
  function inspect(){ if(!state.selected){ document.getElementById('dbInspector').innerHTML='<span class="muted">No row selected</span>'; return; } const row=table().rows[state.selected.row]; document.getElementById('dbInspector').innerHTML=table().schema.map(col=>'<label class="field">'+col[0]+'<input data-inspect="'+col[0]+'" value="'+String(row[col[0]]??'')+'"></label>').join(''); }
  function validate(){ const ids=new Set(); const errors=[]; table().rows.forEach((row,i)=>{ if(!row.id) errors.push('Row '+(i+1)+': id required'); if(ids.has(row.id)) errors.push('Duplicate id '+row.id); ids.add(row.id); }); document.getElementById('dbStatusValidation').textContent=errors.length?errors.length+' errors':'Valid'; return errors; }
  function preview(){ document.getElementById('dbPreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3600); validate(); }
  document.addEventListener('click', e=>{ const t=e.target; const tableButton=t.closest?.('[data-table]'); if(tableButton){state.active=tableButton.dataset.table; state.selected=null; render();} const row=t.closest?.('#databaseGrid tbody tr'); if(row){document.querySelectorAll('#databaseGrid tr').forEach(r=>r.classList.remove('selected')); row.classList.add('selected'); state.selected={row:Number(row.dataset.row), col:t.dataset.col}; document.getElementById('dbSelected').textContent=(state.selected.col||'row')+'['+(state.selected.row+1)+']'; inspect();} });
  document.addEventListener('input', e=>{ const cell=e.target.closest?.('#databaseGrid td'); if(cell&&state.selected){ table().rows[state.selected.row][cell.dataset.col]=cell.textContent; markDirty(); preview(); inspect(); } const input=e.target.closest?.('[data-inspect]'); if(input&&state.selected){ table().rows[state.selected.row][input.dataset.inspect]=input.value; markDirty(); renderGrid(); preview(); } });
  ['dbSearch','dbType','dbErrorsOnly'].forEach(id=>document.getElementById(id).addEventListener('input',render));
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{ const a=button.dataset.action; if(a==='toggle-right') document.querySelector('.pro-editor').classList.toggle('right-collapsed'); if(a==='close-right') document.querySelector('.pro-editor').classList.add('right-collapsed'); if(a==='add-row'){ const row={id:'row_'+(table().rows.length+1)}; table().schema.forEach(col=>{ if(!(col[0] in row)) row[col[0]]=''; }); table().rows.push(row); markDirty(); render(); } if(a==='add-column'){ const name='value_'+(table().schema.length+1); table().schema.push([name,'string']); table().rows.forEach(row=>row[name]=''); markDirty(); render(); } if(a==='save'||a==='export-json') vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'game_database.json'}); if(a==='export-lua') vscode.postMessage({type:'export',format:'lua',content:'return '+JSON.stringify(serialize(),null,2),fileName:'game_database.lua'}); if(a==='validate'||a==='refresh') preview(); }));
  document.querySelectorAll('[data-db-command]').forEach(button=>button.addEventListener('click',()=>{ if(button.dataset.dbCommand==='normalize'){ table().rows.forEach(row=>{ if(row.id) row.id=String(row.id).toLowerCase().replace(/\\s+/g,'_'); }); markDirty(); render(); } }));
  render();
})();`;
}

function dialogScript(): string {
  return `
(function(){
  const vscode = acquireVsCodeApi();
  const nodes=[{id:'start',type:'Start',x:70,y:190,text:'Start'},{id:'npc1',type:'NPC',x:250,y:150,text:'Welcome, traveler.'},{id:'player1',type:'Player Response',x:450,y:130,text:'Who are you?'},{id:'branch1',type:'Branch Condition',x:450,y:230,text:'reputation > 75'},{id:'npc2',type:'NPC',x:650,y:92,text:'I am King Aegis.'},{id:'reward',type:'Script Trigger',x:650,y:260,text:'grant_audience_token'}];
  const edges=[['start','npc1'],['npc1','player1'],['npc1','branch1'],['player1','npc2'],['branch1','reward'],['branch1','npc2']];
  let selected='npc1';
  function serialize(){ return {kind:'lurek.dialog', id:'king_audience', nodes, edges}; }
  function markDirty(){ document.getElementById('dialogDirty').textContent='Modified'; vscode.postMessage({type:'stateChanged',dirty:true}); }
  function render(){ const graph=document.getElementById('dialogGraph'); graph.innerHTML='<svg class="edge-layer" viewBox="0 0 900 480">'+edges.map(([a,b])=>{ const from=nodes.find(n=>n.id===a), to=nodes.find(n=>n.id===b); return '<path d="M '+(from.x+132)+' '+(from.y+26)+' C '+(from.x+210)+' '+(from.y+26)+', '+(to.x-70)+' '+(to.y+26)+', '+to.x+' '+(to.y+26)+'" stroke="#6ca7d6" fill="none"/>'; }).join('')+'</svg>'+nodes.map(n=>'<button class="dialog-node'+(n.id===selected?' selected':'')+'" data-node="'+n.id+'" style="left:'+n.x+'px;top:'+n.y+'px"><header>'+n.type+'</header><p>'+n.text+'</p></button>').join(''); inspect(); preview(); }
  function inspect(){ const n=nodes.find(node=>node.id===selected); document.getElementById('dialogInspector').innerHTML='<label class="field">Node ID<input data-node-field="id" value="'+n.id+'"></label><label class="field">Type<input data-node-field="type" value="'+n.type+'"></label><label class="field">Line Text<textarea data-node-field="text">'+n.text+'</textarea></label><label class="field">Lua Trigger<input value="on_dialog_'+n.id+'"></label>'; document.getElementById('dialogNodeStatus').textContent='Selected: '+n.id; }
  function preview(){ document.getElementById('dialogValidation').textContent='Graph valid. Start node reaches '+(nodes.length-1)+' nodes.'; document.getElementById('dialogPreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3200); document.getElementById('dialogSummary').textContent=nodes.length+' nodes / '+edges.length+' links'; }
  document.addEventListener('click', e=>{ const node=e.target.closest?.('[data-node]'); if(node){ selected=node.dataset.node; render(); } const tool=e.target.closest?.('[data-dialog-tool]'); if(tool){ document.querySelectorAll('[data-dialog-tool]').forEach(b=>b.classList.toggle('active',b===tool)); } });
  document.addEventListener('input', e=>{ const input=e.target.closest?.('[data-node-field]'); if(!input) return; const n=nodes.find(node=>node.id===selected); n[input.dataset.nodeField]=input.value; markDirty(); render(); });
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{ const a=button.dataset.action; if(a==='toggle-right') document.querySelector('.pro-editor').classList.toggle('right-collapsed'); if(a==='close-right') document.querySelector('.pro-editor').classList.add('right-collapsed'); if(a==='add-npc'||a==='add-player'||a==='add-branch'||a==='add-start'){ const id='node_'+(nodes.length+1); nodes.push({id,type:a.replace('add-','').toUpperCase(),x:160+(nodes.length*70)%560,y:80+(nodes.length*55)%300,text:'New node'}); selected=id; markDirty(); render(); } if(a==='save'||a==='export-json') vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'dialog.king_audience.json'}); if(a==='export-lua') vscode.postMessage({type:'export',format:'lua',content:'return '+JSON.stringify(serialize(),null,2),fileName:'dialog.king_audience.lua'}); if(a==='validate'||a==='play') preview(); }));
  document.querySelectorAll('[data-dialog-command]').forEach(button=>button.addEventListener('click',()=>preview()));
  render();
})();`;
}

function procMapScript(): string {
  return `
(function(){
  const vscode = acquireVsCodeApi();
  const canvas=document.getElementById('procCanvas');
  const ctx=canvas.getContext('2d');
  const biomes=[['Ocean','#2364a6'],['Coastal','#7ec8d6'],['Forest','#2c8a42'],['Desert','#e5d14f'],['Mountains','#8d8d8d'],['Snow','#f0f0f0']];
  let view='biome';
  function seed(){ return Number(document.getElementById('procSeed').value)||1; }
  function value(x,y,s,scale){ return (Math.sin((x*12.9898*scale+y*78.233*scale+s)*.018)+Math.sin((x*4.31+y*9.73+s)*.071)+2)/4; }
  function pick(height,wet,temp){ if(height<.30) return biomes[0]; if(height<.37) return biomes[1]; if(height>.82) return temp<55?biomes[5]:biomes[4]; if(wet>.58) return biomes[2]; if(temp>58&&wet<.48) return biomes[3]; return biomes[2]; }
  function serialize(){ return {kind:'lurek.procMap', seed:seed(), size:document.getElementById('procSize').value, algorithm:document.getElementById('procAlgorithm').value, elevation:document.getElementById('procElevation').value, moisture:document.getElementById('procMoisture').value, temperature:document.getElementById('procTemperature').value, persistence:document.getElementById('procPersistence').value, biomes:biomes.map(b=>({name:b[0],color:b[1]}))}; }
  function draw(){ const s=seed(), elev=Number(document.getElementById('procElevation').value)/100, moisture=Number(document.getElementById('procMoisture').value)/100, temp=Number(document.getElementById('procTemperature').value); const w=96,h=60,cell=Math.ceil(canvas.width/w); ctx.fillStyle='#111'; ctx.fillRect(0,0,canvas.width,canvas.height); for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const continent=(value(x,y,s,.55)+value(x+80,y-30,s,.18))/2; const detail=value(x+17,y+91,s,.9); const wet=(value(x+211,y+41,s,.42)+moisture)/2; const height=Math.max(0,Math.min(1,continent*.72+detail*.18+elev*.25-.10)); const biome=pick(height,wet,temp); ctx.fillStyle=view==='height'?heightColor(height):biome[1]; ctx.fillRect(x*cell,y*cell,cell,cell); if(height>.70&&biome[0]!=='Ocean'){ ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x*cell+cell*.35,y*cell+cell*.2,cell*.3,cell*.6); } } ctx.strokeStyle='rgba(0,0,0,.22)'; for(let x=0;x<w;x+=4){ ctx.beginPath(); ctx.moveTo(x*cell,0); ctx.lineTo(x*cell,h*cell); ctx.stroke(); } update(); }
  function heightColor(v){ const c=Math.round(60+v*180); return 'rgb('+c+','+c+','+c+')'; }
  function update(){ document.getElementById('procSeedStatus').textContent='Seed: '+seed(); document.getElementById('procStatusSeed').textContent='Seed: '+seed(); document.getElementById('procStatusView').textContent='View: '+view; document.getElementById('procPreview').textContent=JSON.stringify(serialize(),null,2).slice(0,2600); }
  function renderPalettes(){ document.getElementById('procBiomes').innerHTML=biomes.map(b=>'<div class="biome-row"><i class="biome-color" style="background:'+b[1]+'"></i><strong>'+b[0]+'</strong><small>enabled</small></div>').join(''); document.getElementById('procTiles').innerHTML=biomes.concat(biomes).map(b=>'<i class="tile-swatch" style="background:'+b[1]+'"></i>').join(''); }
  ['procSize','procSeed','procAlgorithm','procElevation','procMoisture','procTemperature','procPersistence'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{ document.getElementById('procDirty').textContent='Modified'; draw(); }));
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{ const a=button.dataset.action; if(a==='toggle-right') document.querySelector('.pro-editor').classList.toggle('right-collapsed'); if(a==='close-right') document.querySelector('.pro-editor').classList.add('right-collapsed'); if(a==='generate'||a==='refresh') draw(); if(a==='randomize'){ document.getElementById('procSeed').value=String(Math.floor(Math.random()*9999999)); draw(); } if(a==='toggle-view'){ view=view==='biome'?'height':'biome'; draw(); } if(a==='save'||a==='export-json') vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'world_config.json'}); if(a==='export-lua') vscode.postMessage({type:'export',format:'lua',content:'return '+JSON.stringify(serialize(),null,2),fileName:'world_config.lua'}); if(a==='export-png') vscode.postMessage({type:'export',format:'png',content:canvas.toDataURL('image/png'),fileName:'world_preview.png'}); }));
  document.querySelectorAll('[data-proc-command]').forEach(button=>button.addEventListener('click',()=>{ if(button.dataset.procCommand==='reset-params'){ document.getElementById('procElevation').value='57'; document.getElementById('procMoisture').value='46'; document.getElementById('procTemperature').value='62'; document.getElementById('procPersistence').value='66'; } draw(); }));
  renderPalettes(); draw();
})();`;
}

function skeletonRiggingScript(): string {
  return `
(function(){
  const vscode = acquireVsCodeApi();
  const canvas=document.getElementById('spineCanvas');
  const ctx=canvas.getContext('2d');
  const bones=[
    {id:'root',name:'root',parent:null,x:480,y:420,len:0,rot:0,color:'#8fd14f'},
    {id:'torso',name:'torso',parent:'root',x:480,y:330,len:94,rot:-90,color:'#4fc1ff'},
    {id:'head',name:'head',parent:'torso',x:480,y:242,len:42,rot:-90,color:'#ffd166'},
    {id:'arm_l',name:'arm_l',parent:'torso',x:426,y:310,len:82,rot:-152,color:'#ef476f'},
    {id:'arm_r',name:'arm_r',parent:'torso',x:534,y:310,len:82,rot:-28,color:'#ef476f'},
    {id:'leg_l',name:'leg_l',parent:'root',x:445,y:424,len:98,rot:110,color:'#9bdeac'},
    {id:'leg_r',name:'leg_r',parent:'root',x:515,y:424,len:98,rot:70,color:'#9bdeac'}
  ];
  const slots=[['body','torso','#4fc1ff'],['head_sprite','head','#ffd166'],['weapon','arm_r','#ef476f'],['boots','leg_l','#9bdeac']];
  let selected='torso', tool='select', playing=false, tick=0;
  function bone(id){ return bones.find(b=>b.id===id); }
  function end(b){ const r=b.rot*Math.PI/180; return {x:b.x+Math.cos(r)*b.len,y:b.y+Math.sin(r)*b.len}; }
  function serialize(){ return {kind:'lurek.spine', api:document.getElementById('spineFactory').value, name:document.getElementById('spineName').value, bones:bones.map(b=>({id:b.id,name:b.name,parent:b.parent,x:Math.round(b.x),y:Math.round(b.y),length:b.len,rotation:b.rot})), slots:slots.map(s=>({name:s[0],bone:s[1],attachment:s[0]+'.png'})), ik:[{name:'arm_aim',target:'arm_r',bendPositive:true}], animations:{idle:{duration:1.2,keyframes:[0,.4,.8,1.2]}}}; }
  function lua(){ const data=serialize(); return '-- Generated by Lurek2D Skeleton Rigging Editor\\nlocal skeleton = lurek.spine.newSkeleton(\"'+data.name+'\")\\nlocal rig = lurek.spine.skeletonFromJson('+JSON.stringify(JSON.stringify(data))+')\\nlocal idle = lurek.spine.newSkeletonAnimation(\"idle\", 1.2)\\nreturn { skeleton = skeleton, rig = rig, idle = idle, data = '+JSON.stringify(data,null,2)+' }\\n'; }
  function markDirty(){ document.getElementById('spineDirty').textContent='Modified'; vscode.postMessage({type:'stateChanged',dirty:true}); }
  function resize(){ canvas.width=canvas.clientWidth||960; canvas.height=canvas.clientHeight||640; }
  function drawJoint(x,y,color,size){ ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='rgba(0,0,0,.55)'; ctx.stroke(); }
  function draw(){ resize(); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.strokeStyle='rgba(255,255,255,.06)'; for(let x=0;x<canvas.width;x+=28){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();} for(let y=0;y<canvas.height;y+=28){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();} const sway=playing?Math.sin(tick*.08)*9:0; bones.forEach(b=>{ if(b.parent){ const p=bone(b.parent); const pe=end(p); b.x=pe.x; b.y=pe.y; } }); bones.forEach(b=>{ const e=end(Object.assign({},b,{rot:b.rot+(b.id==='arm_r'?sway:0)})); ctx.lineWidth=b.id===selected?7:4; ctx.strokeStyle=b.color; ctx.beginPath(); ctx.moveTo(b.x,b.y); ctx.lineTo(e.x,e.y); ctx.stroke(); drawJoint(b.x,b.y,b.color,b.id===selected?7:5); if(b.len>0) drawJoint(e.x,e.y,b.color,4); }); inspect(); renderLists(); preview(); document.getElementById('spinePose').textContent=playing?'Pose: preview':'Pose: idle'; }
  function inspect(){ const b=bone(selected); document.getElementById('spineInspector').innerHTML='<label class="field">Bone ID<input data-spine-field="id" value="'+b.id+'"></label><label class="field">Name<input data-spine-field="name" value="'+b.name+'"></label><label class="field">Parent<input value="'+(b.parent||'none')+'"></label><label class="field">Length<input data-spine-field="len" type="number" value="'+b.len+'"></label><label class="field">Rotation<input data-spine-field="rot" type="number" value="'+b.rot+'"></label>'; document.getElementById('spineSelected').textContent='Selected: '+b.name; }
  function renderLists(){ document.getElementById('spineBones').innerHTML=bones.map(b=>'<button class="list-row'+(b.id===selected?' active':'')+'" data-bone="'+b.id+'"><span class="bone-row"><i class="bone-dot" style="background:'+b.color+'"></i><strong>'+b.name+'</strong></span><small>'+((b.parent)||'root')+'</small></button>').join(''); document.getElementById('spineSlots').innerHTML=slots.map(s=>'<div class="slot-chip"><i style="background:'+s[2]+'"></i><strong>'+s[0]+'</strong><small>'+s[1]+'</small></div>').join(''); document.getElementById('spineTimeline').innerHTML=[0,.2,.4,.6,.8,1].map((n,i)=>'<button class="frame-card">K'+(i+1)+'<br><small>'+n.toFixed(1)+'s</small></button>').join(''); }
  function preview(){ document.getElementById('spineApiStatus').textContent='API: '+document.getElementById('spineFactory').value; document.getElementById('spinePreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3600); }
  function nearest(x,y){ let best=bones[0], bd=999999; bones.forEach(b=>{ const e=end(b); [[b.x,b.y],[e.x,e.y]].forEach(p=>{ const d=(p[0]-x)*(p[0]-x)+(p[1]-y)*(p[1]-y); if(d<bd){bd=d; best=b;} }); }); return best; }
  canvas.addEventListener('mousedown', e=>{ const r=canvas.getBoundingClientRect(); const x=(e.clientX-r.left)*(canvas.width/r.width), y=(e.clientY-r.top)*(canvas.height/r.height); selected=nearest(x,y).id; if(tool==='bone'){ const parent=selected; const id='bone_'+(bones.length+1); bones.push({id,name:id,parent,x,y,len:70,rot:-70,color:'#c586c0'}); selected=id; markDirty(); } draw(); });
  document.addEventListener('click', e=>{ const t=e.target; const b=t.closest?.('[data-bone]'); if(b){ selected=b.dataset.bone; draw(); } const toolButton=t.closest?.('[data-pixel-tool]'); if(toolButton){ tool=toolButton.dataset.pixelTool; document.querySelectorAll('[data-pixel-tool]').forEach(x=>x.classList.toggle('active',x===toolButton)); } });
  document.addEventListener('input', e=>{ const input=e.target.closest?.('[data-spine-field]'); if(input){ const b=bone(selected); const f=input.dataset.spineField; b[f]=f==='len'||f==='rot'?Number(input.value):input.value; markDirty(); draw(); } if(e.target.id==='spineFactory'||e.target.id==='spineName'){ markDirty(); preview(); } });
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{ const a=button.dataset.action; if(a==='toggle-right') document.querySelector('.pro-editor').classList.toggle('right-collapsed'); if(a==='close-right') document.querySelector('.pro-editor').classList.add('right-collapsed'); if(a==='play') playing=true; if(a==='stop') playing=false; if(a==='add-bone'){ const p=bone(selected); const e=end(p); const id='bone_'+(bones.length+1); bones.push({id,name:id,parent:selected,x:e.x,y:e.y,len:72,rot:-65,color:'#c586c0'}); selected=id; markDirty(); } if(a==='add-slot'){ slots.push(['slot_'+(slots.length+1),selected,'#9cdcfe']); markDirty(); } if(a==='add-ik'){ document.getElementById('spinePose').textContent='IK constraint added to '+selected; markDirty(); } if(a==='new'||a==='reset'){ selected='torso'; playing=false; markDirty(); } if(a==='save'||a==='export-json') vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'hero_rig.spine.json'}); if(a==='export-lua') vscode.postMessage({type:'export',format:'lua',content:lua(),fileName:'hero_rig.lua'}); draw(); }));
  function loop(){ tick++; draw(); requestAnimationFrame(loop); }
  loop();
})();`;
}

function globeScript(): string {
  return `
(function(){
  const vscode = acquireVsCodeApi();
  const canvas=document.getElementById('globeCanvas');
  const ctx=canvas.getContext('2d');
  const features=[
    {id:'north_realm',type:'region',name:'North Realm',color:'#4fc1ff',points:[[-82,-22],[-34,-44],[8,-18],[-12,18],[-70,14]]},
    {id:'sunreach',type:'region',name:'Sunreach',color:'#ffd166',points:[[18,-18],[84,-14],[72,24],[30,32],[4,12]]},
    {id:'capital',type:'marker',name:'Capital',color:'#ef476f',lat:12,lon:-38},
    {id:'harbor',type:'marker',name:'Harbor',color:'#9cdcfe',lat:-8,lon:46}
  ];
  let selected='capital', render=false, tool='select';
  function serialize(){ return {kind:'lurek.globe', api:document.getElementById('globeFactory').value, name:document.getElementById('globeName').value, projection:document.getElementById('globeProjection').value, mode:render?'globe render':'2D authoring', regions:features.filter(f=>f.type==='region'), markers:features.filter(f=>f.type==='marker'), routes:[{from:'capital',to:'harbor',method:'lurek.globe.greatCirclePath'}]}; }
  function lua(){ const data=serialize(); return '-- Generated by Lurek2D Globe Editor\\nlocal globe = lurek.globe.new(\"'+data.name+'\", { projection = \"'+data.projection+'\" })\\nlocal registry = lurek.globe.newRegistry()\\n-- Optional procedural seed list can call lurek.globe.generateVoronoi(name, seeds, spec)\\nreturn { globe = globe, registry = registry, data = '+JSON.stringify(data,null,2)+' }\\n'; }
  function markDirty(){ document.getElementById('globeDirty').textContent='Modified'; vscode.postMessage({type:'stateChanged',dirty:true}); }
  function resize(){ canvas.width=canvas.clientWidth||960; canvas.height=canvas.clientHeight||640; }
  function xy(lat,lon){ return {x:(lon+180)/360*canvas.width,y:(90-lat)/180*canvas.height}; }
  function project(lat,lon){ const cx=canvas.width/2, cy=canvas.height/2, r=Math.min(canvas.width,canvas.height)*.38; const lam=lon*Math.PI/180, phi=lat*Math.PI/180; return {x:cx+r*Math.cos(phi)*Math.sin(lam), y:cy-r*Math.sin(phi), z:Math.cos(phi)*Math.cos(lam), r}; }
  function draw2d(){ ctx.fillStyle='#10202c'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.strokeStyle='rgba(255,255,255,.10)'; for(let lon=-180;lon<=180;lon+=30){ const p=xy(0,lon); ctx.beginPath(); ctx.moveTo(p.x,0); ctx.lineTo(p.x,canvas.height); ctx.stroke(); } for(let lat=-60;lat<=60;lat+=30){ const p=xy(lat,0); ctx.beginPath(); ctx.moveTo(0,p.y); ctx.lineTo(canvas.width,p.y); ctx.stroke(); } features.filter(f=>f.type==='region').forEach(f=>{ ctx.fillStyle=f.color+'aa'; ctx.strokeStyle=f.id===selected?'#ffffff':f.color; ctx.lineWidth=f.id===selected?3:1.5; ctx.beginPath(); f.points.forEach((p,i)=>{ const q=xy(p[1],p[0]); if(i) ctx.lineTo(q.x,q.y); else ctx.moveTo(q.x,q.y); }); ctx.closePath(); ctx.fill(); ctx.stroke(); }); features.filter(f=>f.type==='marker').forEach(f=>{ const p=xy(f.lat,f.lon); ctx.fillStyle=f.color; ctx.beginPath(); ctx.arc(p.x,p.y,f.id===selected?9:6,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#111'; ctx.stroke(); }); }
  function drawGlobe(){ const cx=canvas.width/2, cy=canvas.height/2, r=Math.min(canvas.width,canvas.height)*.38; ctx.fillStyle='#101820'; ctx.fillRect(0,0,canvas.width,canvas.height); const g=ctx.createRadialGradient(cx-r*.25,cy-r*.25,r*.1,cx,cy,r); g.addColorStop(0,'#3aa0cf'); g.addColorStop(1,'#0e3858'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.clip(); features.filter(f=>f.type==='region').forEach(f=>{ ctx.fillStyle=f.color+'99'; ctx.strokeStyle=f.color; ctx.beginPath(); f.points.forEach((p,i)=>{ const q=project(p[1],p[0]); if(q.z<-.2) return; if(i) ctx.lineTo(q.x,q.y); else ctx.moveTo(q.x,q.y); }); ctx.closePath(); ctx.fill(); ctx.stroke(); }); features.filter(f=>f.type==='marker').forEach(f=>{ const p=project(f.lat,f.lon); if(p.z<0) return; ctx.fillStyle=f.color; ctx.beginPath(); ctx.arc(p.x,p.y,7,0,Math.PI*2); ctx.fill(); }); ctx.restore(); }
  function draw(){ resize(); ctx.save(); render?drawGlobe():draw2d(); ctx.restore(); update(); }
  function update(){ document.getElementById('globeApiStatus').textContent='API: '+document.getElementById('globeFactory').value; document.getElementById('globeRenderStatus').textContent='Mode: '+(render?'globe render':'2D authoring'); document.getElementById('globeMode').value=render?'globe render':'2D authoring'; document.getElementById('globePreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3600); const f=features.find(x=>x.id===selected); document.getElementById('globeSelected').textContent='Selected: '+(f?f.name:'none'); document.getElementById('globeInspector').innerHTML=f?'<label class="field">ID<input value="'+f.id+'"></label><label class="field">Type<input value="'+f.type+'"></label><label class="field">Name<input data-globe-field="name" value="'+f.name+'"></label><label class="field inline">Color<input data-globe-field="color" type="color" value="'+f.color+'"></label>':'<span class="muted">No feature selected</span>'; document.getElementById('globeFeatures').innerHTML=features.map(f=>'<button class="feature-row'+(f.id===selected?' active':'')+'" data-feature="'+f.id+'"><i style="background:'+f.color+'"></i><strong>'+f.name+'</strong><small>'+f.type+'</small></button>').join(''); }
  function nearest(x,y){ let best=features[0], bd=999999; features.forEach(f=>{ const pts=f.type==='marker'?[[f.lon,f.lat]]:f.points; pts.forEach(p=>{ const q=xy(p[1],p[0]); const d=(q.x-x)*(q.x-x)+(q.y-y)*(q.y-y); if(d<bd){bd=d; best=f;} }); }); return best; }
  canvas.addEventListener('mousemove', e=>{ const r=canvas.getBoundingClientRect(); const lon=((e.clientX-r.left)/r.width*360-180).toFixed(1); const lat=(90-(e.clientY-r.top)/r.height*180).toFixed(1); document.getElementById('globeCoord').textContent='lat '+lat+' / lon '+lon; });
  canvas.addEventListener('mousedown', e=>{ const r=canvas.getBoundingClientRect(); const x=(e.clientX-r.left)*(canvas.width/r.width), y=(e.clientY-r.top)*(canvas.height/r.height); const lat=90-y/canvas.height*180, lon=x/canvas.width*360-180; if(tool==='marker'){ const id='marker_'+(features.length+1); features.push({id,type:'marker',name:'Marker '+features.length,color:'#c586c0',lat,lon}); selected=id; markDirty(); } else selected=nearest(x,y).id; draw(); });
  document.addEventListener('click', e=>{ const t=e.target; const f=t.closest?.('[data-feature]'); if(f){ selected=f.dataset.feature; draw(); } const toolButton=t.closest?.('[data-pixel-tool]'); if(toolButton){ tool=toolButton.dataset.pixelTool; document.querySelectorAll('[data-pixel-tool]').forEach(x=>x.classList.toggle('active',x===toolButton)); } });
  document.addEventListener('input', e=>{ const input=e.target.closest?.('[data-globe-field]'); if(input){ const f=features.find(x=>x.id===selected); f[input.dataset.globeField]=input.value; markDirty(); draw(); } if(e.target.id==='globeFactory'||e.target.id==='globeName'||e.target.id==='globeProjection'){ markDirty(); draw(); } if(e.target.id==='globeMode'){ render=e.target.value==='globe render'; draw(); } });
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{ const a=button.dataset.action; if(a==='toggle-right') document.querySelector('.pro-editor').classList.toggle('right-collapsed'); if(a==='close-right') document.querySelector('.pro-editor').classList.add('right-collapsed'); if(a==='toggle-render'){ render=!render; draw(); } if(a==='add-marker'){ const id='marker_'+(features.length+1); features.push({id,type:'marker',name:'Marker '+features.length,color:'#c586c0',lat:8,lon:86}); selected=id; markDirty(); } if(a==='add-region'||a==='add-polygon'){ const id='region_'+(features.length+1); features.push({id,type:'region',name:'Region '+features.length,color:'#8fd14f',points:[[-120,-10],[-80,-28],[-46,-4],[-68,28],[-112,22]]}); selected=id; markDirty(); } if(a==='voronoi'){ document.getElementById('globeApiStatus').textContent='API: lurek.globe.generateVoronoi'; markDirty(); } if(a==='save'||a==='export-json') vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'campaign_world.globe.json'}); if(a==='export-lua') vscode.postMessage({type:'export',format:'lua',content:lua(),fileName:'campaign_world_globe.lua'}); draw(); }));
  draw();
})();`;
}

function provinceScript(): string {
  return `
(function(){
  const vscode = acquireVsCodeApi();
  const canvas=document.getElementById('provinceCanvas');
  const ctx=canvas.getContext('2d');
  const cols=48, rows=32, cell=16;
  const provinces=[
    {id:'province_001',color:'#4fc1ff',name:'Aster Coast',owner:'player',wealth:72,flags:['coastal']},
    {id:'province_002',color:'#8fd14f',name:'Green March',owner:'neutral',wealth:45,flags:['forest']},
    {id:'province_003',color:'#ffd166',name:'Sun Plains',owner:'neutral',wealth:58,flags:['farmland']},
    {id:'province_004',color:'#ef476f',name:'Red Hills',owner:'enemy',wealth:35,flags:['mountain']},
    {id:'province_005',color:'#c586c0',name:'Violet Pass',owner:'enemy',wealth:64,flags:['fort']}
  ];
  const pixels=Array.from({length:cols*rows},(_,i)=>{ const x=i%cols, y=Math.floor(i/cols); if(y<9) return 0; if(x<15) return 1; if(x<29 && y<21) return 2; if(x>=29 && y<19) return 3; if(x<28) return 4; return 5; });
  let selected=1, tool='brush';
  function province(){ return provinces[selected-1]; }
  function serialize(){ return {kind:'lurek.province', api:document.getElementById('provinceFactory').value, name:document.getElementById('provinceName').value, sourcePng:'content/maps/campaign_provinces.png', colorToId:provinces.map((p,i)=>({color:p.color,id:i+1,key:p.id})), properties:provinces.map(p=>({id:p.id,name:p.name,owner:p.owner,wealth:p.wealth,flags:p.flags})), active:'campaign_provinces'}; }
  function lua(){ const data=serialize(); return '-- Generated by Lurek2D Province Editor\\nlocal map = lurek.province.newFromPng(\"'+data.name+'\", \"'+data.sourcePng+'\")\\nlurek.province.setActive(\"'+data.name+'\")\\n' + provinces.map(p=>'lurek.province.setProperty(\"'+p.id+'\", \"owner\", \"'+p.owner+'\")\\nlurek.province.setProperty(\"'+p.id+'\", \"wealth\", '+p.wealth+')').join('\\n') + '\\nreturn { map = map, data = '+JSON.stringify(data,null,2)+' }\\n'; }
  function markDirty(){ document.getElementById('provinceDirty').textContent='Modified'; vscode.postMessage({type:'stateChanged',dirty:true}); }
  function idx(x,y){ return y*cols+x; }
  function fillAt(start,target,next){ if(target===next) return; const q=[start], seen=new Set(); while(q.length){ const p=q.pop(); const key=p.x+','+p.y; if(seen.has(key)||p.x<0||p.y<0||p.x>=cols||p.y>=rows) continue; if(pixels[idx(p.x,p.y)]!==target) continue; seen.add(key); pixels[idx(p.x,p.y)]=next; q.push({x:p.x+1,y:p.y},{x:p.x-1,y:p.y},{x:p.x,y:p.y+1},{x:p.x,y:p.y-1}); } }
  function colorFor(pid){ if(!pid) return '#1d5f8a'; const p=provinces[pid-1]; const view=document.getElementById('provinceView').value; if(view==='Wealth heatmap'){ const v=Math.round(45+p.wealth*1.8); return 'rgb('+v+','+Math.round(v*.75)+',55)'; } if(view==='Owner overlay') return p.owner==='player'?'#4fc1ff':p.owner==='enemy'?'#ef476f':'#8fd14f'; if(view==='Runtime render') return p.owner==='player'?'#326f93':p.owner==='enemy'?'#8e3440':'#4e7746'; return p.color; }
  function draw(){ canvas.width=cols*cell; canvas.height=rows*cell; ctx.fillStyle='#111'; ctx.fillRect(0,0,canvas.width,canvas.height); for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){ const pid=pixels[idx(x,y)]; ctx.fillStyle=colorFor(pid); ctx.fillRect(x*cell,y*cell,cell,cell); if(document.getElementById('provinceBorders').checked){ const right=x<cols-1?pixels[idx(x+1,y)]:pid, down=y<rows-1?pixels[idx(x,y+1)]:pid; if(right!==pid||down!==pid){ ctx.strokeStyle='rgba(0,0,0,.42)'; ctx.strokeRect(x*cell+.5,y*cell+.5,cell,cell); } } } update(); }
  function update(){ const p=province(); document.getElementById('provinceApiStatus').textContent='API: '+document.getElementById('provinceFactory').value; document.getElementById('provinceMode').textContent='View: '+document.getElementById('provinceView').value; document.getElementById('provinceSelected').textContent='Selected: '+p.id; document.getElementById('provinceInspector').innerHTML='<label class="field">ID<input value="'+p.id+'"></label><label class="field inline">Color<input data-province-field="color" type="color" value="'+p.color+'"></label><label class="field">Name<input data-province-field="name" value="'+p.name+'"></label><label class="field">Owner<input data-province-field="owner" value="'+p.owner+'"></label><label class="field">Wealth<input data-province-field="wealth" type="number" value="'+p.wealth+'"></label><label class="field">Flags<input value="'+p.flags.join(',')+'"></label>'; document.getElementById('provincePalette').innerHTML=provinces.map((p,i)=>'<button class="province-chip'+(i+1===selected?' active':'')+'" data-province="'+(i+1)+'" style="background:'+p.color+'" title="'+p.id+'"></button>').join(''); document.getElementById('provincePreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3600); }
  function point(e){ const r=canvas.getBoundingClientRect(); return {x:Math.floor((e.clientX-r.left)/(r.width/cols)),y:Math.floor((e.clientY-r.top)/(r.height/rows))}; }
  canvas.addEventListener('mousemove', e=>{ const p=point(e); document.getElementById('provinceCoord').textContent=p.x+', '+p.y; });
  canvas.addEventListener('mousedown', e=>{ const p=point(e); if(p.x<0||p.y<0||p.x>=cols||p.y>=rows) return; const at=idx(p.x,p.y); if(tool==='sample'||tool==='metadata') selected=Math.max(1,pixels[at]); else if(tool==='fill') fillAt(p,pixels[at],selected); else if(tool==='erase') pixels[at]=0; else pixels[at]=selected; markDirty(); draw(); });
  document.addEventListener('click', e=>{ const t=e.target; const sw=t.closest?.('[data-province]'); if(sw){ selected=Number(sw.dataset.province); draw(); } const toolButton=t.closest?.('[data-pixel-tool]'); if(toolButton){ tool=toolButton.dataset.pixelTool; document.querySelectorAll('[data-pixel-tool]').forEach(x=>x.classList.toggle('active',x===toolButton)); } });
  document.addEventListener('input', e=>{ const input=e.target.closest?.('[data-province-field]'); if(input){ const p=province(); const f=input.dataset.provinceField; p[f]=f==='wealth'?Number(input.value):input.value; markDirty(); draw(); } if(e.target.id==='provinceFactory'||e.target.id==='provinceName'||e.target.id==='provinceView'||e.target.id==='provinceBorders'){ markDirty(); draw(); } });
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{ const a=button.dataset.action; if(a==='toggle-right') document.querySelector('.pro-editor').classList.toggle('right-collapsed'); if(a==='close-right') document.querySelector('.pro-editor').classList.add('right-collapsed'); if(a==='brush'||a==='fill'||a==='sample') tool=a; if(a==='toggle-render'){ document.getElementById('provinceView').value=document.getElementById('provinceView').value==='Runtime render'?'ID color map':'Runtime render'; } if(a==='sanitize'){ document.getElementById('provinceApiStatus').textContent='API: lurek.province.sanitizeMarkedPng'; } if(a==='save'||a==='export-json') vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'campaign_provinces.json'}); if(a==='export-lua') vscode.postMessage({type:'export',format:'lua',content:lua(),fileName:'campaign_provinces.lua'}); draw(); }));
  draw();
})();`;
}

function aiBehaviorScript(): string {
  return `
(function(){
  const vscode=acquireVsCodeApi();
  const canvas=document.getElementById('aiTreeCanvas'), ctx=canvas.getContext('2d');
  const nodes=[
    {id:'root_selector',type:'Selector',api:'lurek.ai.newSelector',x:460,y:70,w:148,h:54,parent:null,status:'running'},
    {id:'patrol_sequence',type:'Sequence',api:'lurek.ai.newSequence',x:250,y:180,w:150,h:54,parent:'root_selector',status:'success'},
    {id:'enemy_visible',type:'Condition',api:'lurek.ai.newCondition',x:470,y:180,w:150,h:54,parent:'root_selector',status:'failure'},
    {id:'chase_action',type:'Action',api:'lurek.ai.newAction',x:680,y:180,w:150,h:54,parent:'root_selector',status:'idle'},
    {id:'has_route',type:'Guard',api:'lurek.ai.newGuard',x:170,y:300,w:150,h:54,parent:'patrol_sequence',status:'success'},
    {id:'move_waypoint',type:'Action',api:'lurek.ai.newAction',x:350,y:300,w:150,h:54,parent:'patrol_sequence',status:'success'}
  ];
  const blackboard=[['target','entity|nil'],['patrolIndex','number'],['alertLevel','number'],['homePosition','vec2']];
  let selected='root_selector', tool='select', trace=0;
  function children(id){return nodes.filter(n=>n.parent===id);}
  function serialize(){return {kind:'lurek.ai.behaviorTree',api:document.getElementById('aiFactory').value,name:document.getElementById('aiTreeName').value,blackboard:Object.fromEntries(blackboard),nodes:nodes.map(n=>({id:n.id,type:n.type,api:n.api,parent:n.parent,status:n.status,x:Math.round(n.x),y:Math.round(n.y)})),root:'root_selector'};}
  function lua(){const d=serialize();return '-- Generated by Lurek2D AI Behavior Tree Editor\\nlocal tree = lurek.ai.newBehaviorTree()\\nlocal root = lurek.ai.newSelector()\\nlocal patrol = lurek.ai.newSequence()\\nlocal can_see = lurek.ai.newCondition(function(bb) return bb.target ~= nil end)\\nlocal chase = lurek.ai.newAction(function(bb, dt) return \"running\" end)\\n-- Wire children according to exported metadata in data.nodes.\\nreturn { tree = tree, root = root, patrol = patrol, can_see = can_see, chase = chase, data = '+JSON.stringify(d,null,2)+' }\\n';}
  function markDirty(){document.getElementById('aiDirty').textContent='Modified';vscode.postMessage({type:'stateChanged',dirty:true});}
  function resize(){canvas.width=canvas.clientWidth||960;canvas.height=canvas.clientHeight||640;}
  function drawLink(a,b){ctx.strokeStyle='#6ca7d6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x+a.w/2,a.y+a.h);ctx.bezierCurveTo(a.x+a.w/2,a.y+a.h+44,b.x+b.w/2,b.y-44,b.x+b.w/2,b.y);ctx.stroke();}
  function color(n){return n.status==='success'?'#8fd14f':n.status==='failure'?'#ef476f':n.status==='running'?'#ffd166':'#4fc1ff';}
  function draw(){resize();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='rgba(255,255,255,.05)';for(let x=0;x<canvas.width;x+=28){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();}for(let y=0;y<canvas.height;y+=28){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();}nodes.forEach(n=>{if(n.parent)drawLink(nodes.find(p=>p.id===n.parent),n);});nodes.forEach(n=>{ctx.fillStyle=n.id===selected?'#094771':'#1f2d35';ctx.strokeStyle=color(n);ctx.lineWidth=n.id===selected?3:2;ctx.beginPath();ctx.roundRect(n.x,n.y,n.w,n.h,5);ctx.fill();ctx.stroke();ctx.fillStyle='#d4d4d4';ctx.font='12px Segoe UI';ctx.fillText(n.type,n.x+10,n.y+20);ctx.fillStyle='#9aa0a6';ctx.fillText(n.api.replace('lurek.ai.',''),n.x+10,n.y+39);});update();}
  function update(){const n=nodes.find(x=>x.id===selected);document.getElementById('aiApiStatus').textContent='API: '+document.getElementById('aiFactory').value;document.getElementById('aiSummary').textContent=nodes.length+' nodes / '+nodes.filter(n=>n.parent).length+' links';document.getElementById('aiSelected').textContent='Selected: '+n.id;document.getElementById('aiInspector').innerHTML='<label class="field">ID<input data-ai-field="id" value="'+n.id+'"></label><label class="field">Type<input data-ai-field="type" value="'+n.type+'"></label><label class="field">API<input value="'+n.api+'"></label><label class="field">Status<select data-ai-field="status"><option '+(n.status==='idle'?'selected':'')+'>idle</option><option '+(n.status==='running'?'selected':'')+'>running</option><option '+(n.status==='success'?'selected':'')+'>success</option><option '+(n.status==='failure'?'selected':'')+'>failure</option></select></label>';document.getElementById('aiBlackboard').innerHTML=blackboard.map(b=>'<div class="schema-card"><strong>'+b[0]+'</strong><small>'+b[1]+'</small></div>').join('');document.getElementById('aiTrace').innerHTML=nodes.slice(trace,trace+4).map(n=>'<div class="trace-card">'+n.id+'<br><small>'+n.status+'</small></div>').join('');document.getElementById('aiPreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3600);}
  function hit(x,y){return nodes.find(n=>x>=n.x&&x<=n.x+n.w&&y>=n.y&&y<=n.y+n.h);}
  canvas.addEventListener('mousedown',e=>{const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)*(canvas.width/r.width),y=(e.clientY-r.top)*(canvas.height/r.height);const h=hit(x,y);if(h)selected=h.id;else if(tool!=='select'){const id=tool+'_'+(nodes.length+1);nodes.push({id,type:tool==='composite'?'Selector':tool[0].toUpperCase()+tool.slice(1),api:tool==='condition'?'lurek.ai.newCondition':tool==='action'?'lurek.ai.newAction':'lurek.ai.newSelector',x:x-70,y:y-24,w:150,h:54,parent:selected,status:'idle'});selected=id;markDirty();}draw();});
  document.addEventListener('click',e=>{const t=e.target;const tb=t.closest?.('[data-pixel-tool]');if(tb){tool=tb.dataset.pixelTool;document.querySelectorAll('[data-pixel-tool]').forEach(b=>b.classList.toggle('active',b===tb));}});
  document.addEventListener('input',e=>{const input=e.target.closest?.('[data-ai-field]');if(input){const n=nodes.find(x=>x.id===selected);n[input.dataset.aiField]=input.value;markDirty();draw();}if(e.target.id==='aiFactory'||e.target.id==='aiTreeName'){markDirty();update();}});
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{const a=button.dataset.action;if(a==='toggle-right')document.querySelector('.pro-editor').classList.toggle('right-collapsed');if(a==='close-right')document.querySelector('.pro-editor').classList.add('right-collapsed');if(a==='tick'){trace=(trace+1)%nodes.length;nodes.forEach((n,i)=>n.status=i===trace?'running':i<trace?'success':'idle');document.getElementById('aiTraceStatus').textContent='Trace: '+nodes[trace].id;}if(a==='add-selector'||a==='add-sequence'||a==='add-condition'||a==='add-action'){const kind=a.replace('add-','');const id=kind+'_'+(nodes.length+1);nodes.push({id,type:kind==='selector'?'Selector':kind==='sequence'?'Sequence':kind==='condition'?'Condition':'Action',api:kind==='selector'?'lurek.ai.newSelector':kind==='sequence'?'lurek.ai.newSequence':kind==='condition'?'lurek.ai.newCondition':'lurek.ai.newAction',x:120+(nodes.length*110)%650,y:120+(nodes.length*70)%380,w:150,h:54,parent:selected,status:'idle'});selected=id;markDirty();}if(a==='save'||a==='export-json')vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'ai_behavior.json'});if(a==='export-lua')vscode.postMessage({type:'export',format:'lua',content:lua(),fileName:'ai_behavior.lua'});draw();}));
  draw();
})();`;
}

function graphEditorScript(): string {
  return `
(function(){
  const vscode=acquireVsCodeApi();
  const canvas=document.getElementById('flowGraphCanvas'), ctx=canvas.getContext('2d');
  const nodes=[{id:'input_event',type:'Event',x:90,y:230,w:132,h:54,color:'#4fc1ff'},{id:'read_state',type:'Read State',x:300,y:160,w:132,h:54,color:'#9cdcfe'},{id:'branch_hp',type:'Branch',x:500,y:230,w:132,h:54,color:'#ffd166'},{id:'spawn_fx',type:'Process',x:700,y:140,w:132,h:54,color:'#8fd14f'},{id:'deal_damage',type:'Process',x:700,y:310,w:132,h:54,color:'#ef476f'}];
  const links=[['input_event','read_state','exec'],['read_state','branch_hp','value'],['input_event','branch_hp','exec'],['branch_hp','spawn_fx','true'],['branch_hp','deal_damage','false']];
  let selected='input_event', tool='select';
  function serialize(){return {kind:'lurek.graph.flownet',api:'lurek.graph.newGraph',name:document.getElementById('graphName').value,layout:{algorithm:document.getElementById('graphLayout').value,nodeGap:Number(document.getElementById('graphGap').value),snap:document.getElementById('graphSnap').checked},nodes:nodes.map(n=>({id:n.id,type:n.type,x:Math.round(n.x),y:Math.round(n.y)})),links:links.map(l=>({from:l[0],to:l[1],label:l[2]}))};}
  function lua(){const d=serialize();return '-- Generated by Lurek2D FlowNet / Graph Layout Editor\\nlocal graph = lurek.graph.newGraph()\\n-- Node/link data carries editor-calculated layout positions.\\nreturn { graph = graph, data = '+JSON.stringify(d,null,2)+' }\\n';}
  function markDirty(){document.getElementById('graphDirty').textContent='Modified';vscode.postMessage({type:'stateChanged',dirty:true});}
  function resize(){canvas.width=canvas.clientWidth||960;canvas.height=canvas.clientHeight||640;}
  function node(id){return nodes.find(n=>n.id===id);}
  function drawLink(a,b,label){ctx.strokeStyle='#78aee8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x+a.w,a.y+a.h/2);ctx.bezierCurveTo(a.x+a.w+70,a.y+a.h/2,b.x-70,b.y+b.h/2,b.x,b.y+b.h/2);ctx.stroke();ctx.fillStyle='#9aa0a6';ctx.font='11px Segoe UI';ctx.fillText(label,(a.x+b.x)/2+55,(a.y+b.y)/2+24);}
  function draw(){resize();ctx.fillStyle='#10151c';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='rgba(255,255,255,.05)';for(let x=0;x<canvas.width;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();}for(let y=0;y<canvas.height;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();}links.forEach(l=>drawLink(node(l[0]),node(l[1]),l[2]));nodes.forEach(n=>{ctx.fillStyle=n.id===selected?'#094771':'#1e2a32';ctx.strokeStyle=n.color;ctx.lineWidth=n.id===selected?3:2;ctx.beginPath();ctx.roundRect(n.x,n.y,n.w,n.h,5);ctx.fill();ctx.stroke();ctx.fillStyle='#d4d4d4';ctx.font='12px Segoe UI';ctx.fillText(n.type,n.x+10,n.y+22);ctx.fillStyle='#9aa0a6';ctx.fillText(n.id,n.x+10,n.y+40);});update();}
  function autoLayout(kind){const gap=Number(document.getElementById('graphGap').value);if(kind==='force directed'){nodes.forEach((n,i)=>{const a=i/nodes.length*Math.PI*2;n.x=canvas.width/2+Math.cos(a)*gap*2.1-66;n.y=canvas.height/2+Math.sin(a)*gap*1.4-27;});}else if(kind==='radial'){nodes.forEach((n,i)=>{const a=(i-1)/(nodes.length-1)*Math.PI*1.5;n.x=canvas.width/2+Math.cos(a)*gap*2-66;n.y=canvas.height/2+Math.sin(a)*gap*1.5-27;});}else{nodes.forEach((n,i)=>{n.x=80+(i%3)*gap*1.85;n.y=150+Math.floor(i/3)*gap*1.2+(i%2)*30;});}markDirty();draw();}
  function update(){const n=node(selected);document.getElementById('graphApiStatus').textContent='API: lurek.graph.newGraph';document.getElementById('graphLayoutStatus').textContent='Layout: '+document.getElementById('graphLayout').value;document.getElementById('graphSummary').textContent=nodes.length+' nodes / '+links.length+' links';document.getElementById('graphSelected').textContent='Selected: '+n.id;document.getElementById('graphInspector').innerHTML='<label class="field">ID<input data-graph-field="id" value="'+n.id+'"></label><label class="field">Type<input data-graph-field="type" value="'+n.type+'"></label><label class="field">X<input data-graph-field="x" type="number" value="'+Math.round(n.x)+'"></label><label class="field">Y<input data-graph-field="y" type="number" value="'+Math.round(n.y)+'"></label>';document.getElementById('graphMetrics').innerHTML='<div class="metric-card"><strong>Crossings</strong><small>1 estimated</small></div><div class="metric-card"><strong>Depth</strong><small>3 layers</small></div><div class="metric-card"><strong>Spacing</strong><small>'+document.getElementById('graphGap').value+' px</small></div>';document.getElementById('graphPreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3600);}
  function hit(x,y){return nodes.find(n=>x>=n.x&&x<=n.x+n.w&&y>=n.y&&y<=n.y+n.h);}
  canvas.addEventListener('mousedown',e=>{const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)*(canvas.width/r.width),y=(e.clientY-r.top)*(canvas.height/r.height);const h=hit(x,y);if(h)selected=h.id;else if(tool!=='select'){const id=tool+'_'+(nodes.length+1);nodes.push({id,type:tool==='condition'?'Branch':tool==='event'?'Event':'Process',x:x-66,y:y-27,w:132,h:54,color:'#c586c0'});selected=id;markDirty();}draw();});
  document.addEventListener('click',e=>{const tb=e.target.closest?.('[data-pixel-tool]');if(tb){tool=tb.dataset.pixelTool;document.querySelectorAll('[data-pixel-tool]').forEach(b=>b.classList.toggle('active',b===tb));}});
  document.addEventListener('input',e=>{const input=e.target.closest?.('[data-graph-field]');if(input){const n=node(selected);const f=input.dataset.graphField;n[f]=f==='x'||f==='y'?Number(input.value):input.value;markDirty();draw();}if(['graphFactory','graphName','graphLayout','graphGap','graphSnap'].includes(e.target.id)){if(e.target.id==='graphLayout')autoLayout(e.target.value);else{markDirty();update();}}});
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{const a=button.dataset.action;if(a==='toggle-right')document.querySelector('.pro-editor').classList.toggle('right-collapsed');if(a==='close-right')document.querySelector('.pro-editor').classList.add('right-collapsed');if(a==='layout-layered')autoLayout('layered dag');if(a==='layout-force')autoLayout('force directed');if(a==='add-node'){nodes.push({id:'node_'+(nodes.length+1),type:'Process',x:180+(nodes.length*90)%560,y:120+(nodes.length*70)%360,w:132,h:54,color:'#c586c0'});selected=nodes[nodes.length-1].id;markDirty();}if(a==='add-link'){links.push([selected,'deal_damage','exec']);markDirty();}if(a==='save'||a==='export-json')vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'combat_flownet.graph.json'});if(a==='export-lua')vscode.postMessage({type:'export',format:'lua',content:lua(),fileName:'combat_flownet.lua'});draw();}));
  draw();
})();`;
}

function voxelScript(): string {
  return `
(function(){
  const vscode=acquireVsCodeApi();
  const canvas=document.getElementById('voxelCanvas'), ctx=canvas.getContext('2d');
  const size=8, cell=18, palette=['#4fc1ff','#8fd14f','#ffd166','#ef476f','#c586c0','#d7ba7d','#9cdcfe','#ffffff'];
  const voxels=new Map();let color=palette[0],tool='brush',angle=0,lastPng='';
  function key(x,y,z){return x+','+y+','+z;}function set(x,y,z,c){if(c)voxels.set(key(x,y,z),c);else voxels.delete(key(x,y,z));}
  function get(x,y,z){return voxels.get(key(x,y,z));}
  function seed(){for(let z=0;z<5;z++)for(let x=2;x<6;x++)for(let y=2;y<6;y++)if(!(z>2&&x>3&&y>3))set(x,y,z,palette[(x+y+z)%4]);}
  function serialize(){return {kind:'lurek.voxelSpriteBake',runtime:'2D baked PNG sprite, no voxel renderer',output:document.getElementById('voxelOutput').value,name:document.getElementById('voxelName').value,size:{x:size,y:size,z:size},activeLayer:Number(document.getElementById('voxelLayer').value),voxels:Array.from(voxels.entries()).map(([k,c])=>({pos:k.split(',').map(Number),color:c})),spriteSheet:lastPng?'data:image/png;base64,...':'not baked'};}
  function lua(){const d=serialize();return '-- Generated by Lurek2D Voxel Sprite Baker\\n-- Lurek2D renders the baked PNG sprite, not runtime voxels.\\nlocal asset = { image = \"assets/'+d.name+'.png\", frames = { front = 1, right = 2, back = 3, left = 4 }, source = '+JSON.stringify(d,null,2)+' }\\nreturn asset\\n';}
  function markDirty(){document.getElementById('voxelDirty').textContent='Modified';vscode.postMessage({type:'stateChanged',dirty:true});}
  function resize(){canvas.width=canvas.clientWidth||960;canvas.height=canvas.clientHeight||640;}
  function iso(x,y,z){const cx=canvas.width/2,cy=canvas.height*.58;const rx=x-size/2,ry=y-size/2;return {x:cx+(rx-ry)*cell+angle,y:cy+(rx+ry)*cell*.5-z*cell};}
  function shade(hex,amt){const n=parseInt(hex.slice(1),16),r=Math.max(0,Math.min(255,(n>>16)+amt)),g=Math.max(0,Math.min(255,((n>>8)&255)+amt)),b=Math.max(0,Math.min(255,(n&255)+amt));return 'rgb('+r+','+g+','+b+')';}
  function cube(x,y,z,c){const p=iso(x,y,z);ctx.fillStyle=shade(c,18);ctx.beginPath();ctx.moveTo(p.x,p.y-cell);ctx.lineTo(p.x+cell,p.y-cell*.5);ctx.lineTo(p.x,p.y);ctx.lineTo(p.x-cell,p.y-cell*.5);ctx.closePath();ctx.fill();ctx.fillStyle=shade(c,-10);ctx.beginPath();ctx.moveTo(p.x-cell,p.y-cell*.5);ctx.lineTo(p.x,p.y);ctx.lineTo(p.x,p.y+cell);ctx.lineTo(p.x-cell,p.y+cell*.5);ctx.closePath();ctx.fill();ctx.fillStyle=shade(c,-30);ctx.beginPath();ctx.moveTo(p.x+cell,p.y-cell*.5);ctx.lineTo(p.x,p.y);ctx.lineTo(p.x,p.y+cell);ctx.lineTo(p.x+cell,p.y+cell*.5);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.stroke();}
  function draw(){resize();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='rgba(255,255,255,.05)';for(let x=0;x<canvas.width;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();}const entries=Array.from(voxels.entries()).map(([k,c])=>({p:k.split(',').map(Number),c})).sort((a,b)=>(a.p[0]+a.p[1]+a.p[2])-(b.p[0]+b.p[1]+b.p[2]));entries.forEach(v=>cube(v.p[0],v.p[1],v.p[2],v.c));update();}
  function bake(){const w=384,h=128;const off=document.createElement('canvas');off.width=w;off.height=h;const c=off.getContext('2d');const labels=['front','right','back','left'];labels.forEach((label,i)=>{c.fillStyle='#101820';c.fillRect(i*96,0,96,128);Array.from(voxels.entries()).forEach(([k,col])=>{const p=k.split(',').map(Number);const px=i*96+20+p[0]*7+(i%2?p[1]*2:0),py=96-p[2]*8-p[1]*4;c.fillStyle=col;c.fillRect(px,py,7,7);});c.fillStyle='#d4d4d4';c.font='10px Segoe UI';c.fillText(label,i*96+8,118);});lastPng=off.toDataURL('image/png');document.getElementById('voxelBakeStatus').textContent='Bake: PNG ready';return lastPng;}
  function update(){const layer=Number(document.getElementById('voxelLayer').value);document.getElementById('voxelCoord').textContent='x 0 / y 0 / z '+layer;document.getElementById('voxelSelected').textContent='Selected: layer '+layer;document.getElementById('voxelInspector').innerHTML='<label class="field">Asset<input value="'+document.getElementById('voxelName').value+'"></label><label class="field">Output<input value="'+document.getElementById('voxelOutput').value+'"></label><label class="field">Voxel Count<input value="'+voxels.size+'"></label><label class="field">PNG Frames<input value="front, right, back, left"></label>';document.getElementById('voxelPalette').innerHTML=palette.map(p=>'<button class="voxel-swatch'+(p===color?' active':'')+'" data-voxel-color="'+p+'" style="background:'+p+'" title="'+p+'"></button>').join('');document.getElementById('voxelSides').innerHTML=['Front','Right','Back','Left'].map(s=>'<div class="voxel-side">'+s+'</div>').join('');document.getElementById('voxelPreview').textContent=JSON.stringify(serialize(),null,2).slice(0,3600);}
  function point(e){const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(size-1,Math.floor((e.clientX-r.left)/r.width*size))),y:Math.max(0,Math.min(size-1,Math.floor((e.clientY-r.top)/r.height*size))),z:Number(document.getElementById('voxelLayer').value)};}
  canvas.addEventListener('mousedown',e=>{const p=point(e);if(tool==='erase')set(p.x,p.y,p.z,null);else if(tool==='fill')for(let x=0;x<size;x++)for(let y=0;y<size;y++)set(x,y,p.z,color);else set(p.x,p.y,p.z,color);markDirty();draw();});
  canvas.addEventListener('mousemove',e=>{const p=point(e);document.getElementById('voxelCoord').textContent='x '+p.x+' / y '+p.y+' / z '+p.z;});
  document.addEventListener('click',e=>{const sw=e.target.closest?.('[data-voxel-color]');if(sw){color=sw.dataset.voxelColor;document.getElementById('voxelColor').value=color;draw();}const tb=e.target.closest?.('[data-pixel-tool]');if(tb){tool=tb.dataset.pixelTool;document.querySelectorAll('[data-pixel-tool]').forEach(b=>b.classList.toggle('active',b===tb));document.getElementById('voxelMode').textContent='Mode: '+tool;}});
  ['voxelOutput','voxelName','voxelLayer','voxelColor','voxelGrid'].forEach(id=>document.getElementById(id).addEventListener('input',e=>{if(id==='voxelColor')color=e.target.value;markDirty();draw();}));
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{const a=button.dataset.action;if(a==='toggle-right')document.querySelector('.pro-editor').classList.toggle('right-collapsed');if(a==='close-right')document.querySelector('.pro-editor').classList.add('right-collapsed');if(a==='brush'||a==='erase')tool=a;if(a==='fill-layer'){tool='fill';}if(a==='rotate'){angle=(angle+22)%88;}if(a==='bake-png'){const png=bake();vscode.postMessage({type:'export',format:'png',content:png,fileName:document.getElementById('voxelName').value+'.png'});}if(a==='save'||a==='export-json')vscode.postMessage({type:'export',format:'json',content:JSON.stringify(serialize(),null,2),fileName:'voxel_model.json'});if(a==='export-lua')vscode.postMessage({type:'export',format:'lua',content:lua(),fileName:'voxel_sprite.lua'});draw();}));
  seed();draw();
})();`;
}
