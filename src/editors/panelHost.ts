import * as vscode from "vscode";
import type { EditorExportFormat, EditorFieldSpec, EditorInspectorSectionSpec, EditorSpec, EditorToolSpec } from "./types.js";
import { getEditorContent } from "./content/index.js";

interface WebviewMessage {
  readonly type: string;
  readonly format?: EditorExportFormat;
  readonly content?: string;
  readonly fileName?: string;
  readonly text?: string;
  readonly dirty?: boolean;
  readonly state?: Record<string, unknown>;
  readonly message?: string;
}

const FORMAT_LABELS: Record<EditorExportFormat, string> = {
  lua: "Lua",
  toml: "TOML",
  json: "JSON",
  css: "CSS",
  wgsl: "WGSL",
};

export interface EditorBehaviorProfile {
  readonly workspaceHint: string;
  readonly accent: string;
  readonly primaryMutation: string;
  readonly sampleAssets: readonly string[];
}

export const EDITOR_BEHAVIOR_PROFILES: Record<string, EditorBehaviorProfile> = {
  aiBehavior: { workspaceHint: "behavior tree nodes", accent: "#c586c0", primaryMutation: "adds selectors, decorators, action leaves, and live execution pings", sampleAssets: ["Selector", "Sequence", "Cooldown", "LuaAction"] },
  apiReference: { workspaceHint: "offline API document", accent: "#4fc1ff", primaryMutation: "filters API pages, inserts examples, and copies signatures", sampleAssets: ["lurek.render", "LTimer", "lurek.physics", "LDataFrame"] },
  assetManifest: { workspaceHint: "asset loading table", accent: "#dcdcaa", primaryMutation: "adds buckets, priorities, memory estimates, and dependency warnings", sampleAssets: ["level_01", "shared_ui", "audio_core", "cutscene_intro"] },
  audioMixer: { workspaceHint: "virtual mixer preview", accent: "#ce9178", primaryMutation: "adjusts faders, meters, mute/solo states, snapshots, and ducking", sampleAssets: ["Master", "BGM", "SFX", "UI"] },
  colorPalette: { workspaceHint: "palette table", accent: "#f44747", primaryMutation: "creates swatches, gradients, contrast markers, and theme variants", sampleAssets: ["Enemy_Blood", "Sky_Dawn", "Accent_UI", "Shadow"] },
  database: { workspaceHint: "spreadsheet data grid", accent: "#b5cea8", primaryMutation: "edits rows, columns, filters, formulas, and validation markers", sampleAssets: ["weapon", "loot", "merchant", "balance"] },
  dialog: { workspaceHint: "branching dialogue graph", accent: "#ce9178", primaryMutation: "adds dialogue nodes, conditional links, portraits, voice markers, and auto-arranged branches", sampleAssets: ["NPC", "Player", "Condition", "Voice"] },
  entity: { workspaceHint: "editable prefab document", accent: "#9cdcfe", primaryMutation: "inserts ECS components, live bounds data, child hierarchy, and prefab overrides", sampleAssets: ["Transform", "Sprite", "Collider", "Script"] },
  fontPreview: { workspaceHint: "font atlas preview", accent: "#d7ba7d", primaryMutation: "updates atlas packing, kerning, sample text, missing glyphs, and memory estimates", sampleAssets: ["UIFont", "Bitmap8", "TitleFont", "Fallback"] },
  globalAutoload: { workspaceHint: "autoload singleton table", accent: "#569cd6", primaryMutation: "adds singleton rows, load order, hot reload, dependencies, and sandbox flags", sampleAssets: ["Inventory", "SaveGame", "AudioBus", "Network"] },
  globe: { workspaceHint: "spherical preview canvas", accent: "#4ec9b0", primaryMutation: "plots waypoints, latitude/longitude metadata, projection overlays, and day/night previews", sampleAssets: ["Equator", "Pole", "Waypoint", "Terminator"] },
  graph: { workspaceHint: "generic visual graph", accent: "#c586c0", primaryMutation: "adds visual script nodes, typed cables, comments, groups, diffs, and minimap data", sampleAssets: ["Input", "Branch", "Math", "Output"] },
  guiTheme: { workspaceHint: "theme source document", accent: "#dcdcaa", primaryMutation: "edits CSS variables, component states, preview gallery, and theme exports", sampleAssets: ["Button", "Slider", "Panel", "Textbox"] },
  guiWidget: { workspaceHint: "HTML/CSS document", accent: "#4fc1ff", primaryMutation: "inserts widgets, anchors, flex settings, CSS, layers, and responsive samples", sampleAssets: ["HUD", "Button", "Inventory", "Dialog"] },
  inputMapper: { workspaceHint: "input binding table", accent: "#b5cea8", primaryMutation: "adds actions, hardware bindings, deadzones, chords, conflicts, and live input test rows", sampleAssets: ["Jump", "Shoot", "Dash", "Pause"] },
  lightingEnvironment: { workspaceHint: "2D lighting preview", accent: "#ffd700", primaryMutation: "places lights, shadow casters, fog, SDF bake metadata, and overlay toggles", sampleAssets: ["Ambient", "PointLight", "SDF", "Fog"] },
  localization: { workspaceHint: "translation matrix", accent: "#ce9178", primaryMutation: "adds locale columns, filters missing keys, validates duplicates, and exports dictionaries", sampleAssets: ["en", "pl", "de", "jp"] },
  navMesh: { workspaceHint: "walkable polygon grid", accent: "#4ec9b0", primaryMutation: "paints walkable cells, obstacles, agent radius, costs, and baked mesh overlays", sampleAssets: ["Walk", "Obstacle", "Water", "Swamp"] },
  networkTopology: { workspaceHint: "network authority graph", accent: "#569cd6", primaryMutation: "adds sync variables, RPC links, authority nodes, latency simulation, and bandwidth export", sampleAssets: ["Server", "Client", "RPC", "Snapshot"] },
  particle: { workspaceHint: "particle preview", accent: "#f44747", primaryMutation: "spawns particles, curves, bursts, texture samples, and live physics overlays", sampleAssets: ["Emitter", "Burst", "Gradient", "Wind"] },
  performanceProfiler: { workspaceHint: "performance graph preview", accent: "#b5cea8", primaryMutation: "samples frame-time, GC, VRAM, draw calls, flame graph rows, and regression snapshots", sampleAssets: ["CPU", "GPU", "GC", "DrawCalls"] },
  physicsMaterials: { workspaceHint: "physics sandbox preview", accent: "#9cdcfe", primaryMutation: "adjusts density, friction, bounce, collision matrix, and sandbox results", sampleAssets: ["Ice", "Rubber", "Metal", "Mud"] },
  pixelArt: { workspaceHint: "pixel painting grid", accent: "#f44747", primaryMutation: "paints pixels, layers, palette colors, symmetry, onion skin frames, and grid overlays", sampleAssets: ["Pencil", "Eraser", "Layer", "Frame"] },
  postfxOverlay: { workspaceHint: "post effect preview", accent: "#c586c0", primaryMutation: "toggles overlays, bloom sliders, CRT, LUTs, split-screen, and GPU cost markers", sampleAssets: ["Bloom", "CRT", "LUT", "BeforeAfter"] },
  procMap: { workspaceHint: "procedural heatmap preview", accent: "#4ec9b0", primaryMutation: "generates noise heatmaps, seed controls, biome overlays, masks, smoothing, and heightmap export data", sampleAssets: ["Elevation", "Moisture", "Biome", "Falloff"] },
  projectExport: { workspaceHint: "build manifest document", accent: "#dcdcaa", primaryMutation: "edits targets, icon entries, window flags, feature flags, exclusions, and build output", sampleAssets: ["Windows", "Linux", "macOS", "Dist"] },
  province: { workspaceHint: "province cell map", accent: "#ce9178", primaryMutation: "paints territories, ownership, resources, adjacency, heatmaps, and sea/land flags", sampleAssets: ["Capital", "Border", "Wealth", "Sea"] },
  questTree: { workspaceHint: "quest objective graph", accent: "#d7ba7d", primaryMutation: "adds quest stages, prerequisites, rewards, simulation pings, notes, and state flags", sampleAssets: ["Start", "Objective", "Reward", "Blocked"] },
  sceneFlow: { workspaceHint: "scene state machine", accent: "#569cd6", primaryMutation: "adds scenes, transition links, debug paths, validation, globals, and nested flow exports", sampleAssets: ["Splash", "Menu", "Gameplay", "Pause"] },
  shaderPreview: { workspaceHint: "shader source document", accent: "#c586c0", primaryMutation: "edits WGSL snippets, uniforms, compile diagnostics, preview metadata, and performance notes", sampleAssets: ["Fragment", "Uniform", "Texture", "Time"] },
  skeletonRigging: { workspaceHint: "rigging timeline", accent: "#d7ba7d", primaryMutation: "adds bones, IK, mesh weights, keyframes, skins, ragdoll tests, and spine export data", sampleAssets: ["Root", "ArmIK", "Mesh", "Skin"] },
  soundDsp: { workspaceHint: "DSP node graph", accent: "#ce9178", primaryMutation: "adds EQ, reverb, compressor, spectrum, looping, bypass, and DSP chain export", sampleAssets: ["Input", "EQ", "Reverb", "Output"] },
  spriteAnim: { workspaceHint: "sprite animation timeline", accent: "#f44747", primaryMutation: "adds frames, keyframes, events, hitboxes, playback modes, onion skins, and slicing data", sampleAssets: ["Idle", "Run", "Hitbox", "Footstep"] },
  testRunner: { workspaceHint: "test result table", accent: "#b5cea8", primaryMutation: "adds test rows, run states, tags, coverage markers, timers, and output logs", sampleAssets: ["Pass", "Fail", "Skip", "Watch"] },
  tileMap: { workspaceHint: "tile painting grid", accent: "#4ec9b0", primaryMutation: "paints layers, brushes, flood fill, stamps, collision, autotile, and tile properties", sampleAssets: ["Grass", "Stone", "Water", "Trigger"] },
  tilemapScript: { workspaceHint: "tile script document", accent: "#dcdcaa", primaryMutation: "inserts Lua callbacks, tile coordinates, triggers, snippets, validation, and debug prints", sampleAssets: ["OnStep", "OnInteract", "Teleport", "Print"] },
  tileset: { workspaceHint: "tileset slicing grid", accent: "#4ec9b0", primaryMutation: "marks tile bounds, collision polygons, masks, animations, tags, zoom, and bulk edits", sampleAssets: ["Tile00", "Collision", "Terrain", "WaterAnim"] },
  timeline: { workspaceHint: "cinematic timeline", accent: "#d7ba7d", primaryMutation: "adds tracks, keyframes, playhead scrub, easing, waveform, events, nesting, and previews", sampleAssets: ["Camera", "Audio", "Event", "Tween"] },
  visualShader: { workspaceHint: "visual shader graph", accent: "#c586c0", primaryMutation: "adds shader nodes, preview links, code generation, uniforms, subgraphs, and dispatch data", sampleAssets: ["UV", "Noise", "Color", "Output"] },
  voxel: { workspaceHint: "voxel slice grid", accent: "#9cdcfe", primaryMutation: "paints voxels, slices, isometric previews, palettes, fill, extrusion, export, and lighting", sampleAssets: ["Voxel", "Slice", "Iso", "Light"] },
  worldMap: { workspaceHint: "overworld graph", accent: "#4ec9b0", primaryMutation: "adds POI nodes, spline paths, regions, weather overlays, fast travel tags, and pathfinding export", sampleAssets: ["Town", "Road", "Danger", "Weather"] },
};

export class CatalogEditorPanel {
  private readonly panel: vscode.WebviewPanel;
  private readonly stateKey: string;
  private readonly disposables: vscode.Disposable[] = [];
  private dirty = false;

  static open(context: vscode.ExtensionContext, spec: EditorSpec): CatalogEditorPanel {
    return new CatalogEditorPanel(context, spec);
  }

  private constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly spec: EditorSpec,
  ) {
    this.stateKey = `lurek.editorState.${spec.id}`;
    this.panel = vscode.window.createWebviewPanel(
      spec.viewType,
      spec.title,
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true },
    );

    this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, "media", "icon.png");
    this.panel.webview.html = renderEditorHtml(spec, this.readPersistedState());

    this.panel.webview.onDidReceiveMessage(
      (message: WebviewMessage) => this.onMessage(message),
      undefined,
      this.disposables,
    );

    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
  }

  private readPersistedState(): Record<string, unknown> | undefined {
    return this.context.workspaceState.get<Record<string, unknown>>(this.stateKey);
  }

  private async onMessage(message: WebviewMessage): Promise<void> {
    switch (message.type) {
      case "stateChanged":
        this.dirty = Boolean(message.dirty);
        break;
      case "persistState":
        await this.context.workspaceState.update(this.stateKey, message.state ?? {});
        break;
      case "export":
        await this.exportContent(
          message.format ?? this.spec.exports[0],
          message.content ?? "",
          message.fileName ?? `${this.spec.exportBaseName}.${message.format ?? this.spec.exports[0]}`,
        );
        break;
      case "copy":
        await vscode.env.clipboard.writeText(message.text ?? "");
        vscode.window.showInformationMessage(`${this.spec.title}: copied generated content.`);
        break;
      case "insert": {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage(`${this.spec.title}: no active text editor to insert into.`);
          return;
        }
        await editor.edit((edit) => edit.insert(editor.selection.active, message.text ?? ""));
        break;
      }
      case "info":
        vscode.window.showInformationMessage(message.message ?? this.spec.title);
        break;
    }
  }

  private async exportContent(format: EditorExportFormat, content: string, fileName: string): Promise<void> {
    const defaultFolder = vscode.workspace.workspaceFolders?.[0]?.uri;
    const defaultUri = defaultFolder
      ? vscode.Uri.joinPath(defaultFolder, fileName)
      : vscode.Uri.file(fileName);

    const target = await vscode.window.showSaveDialog({
      defaultUri,
      filters: { [FORMAT_LABELS[format]]: [format] },
    });

    if (!target) return;
    await vscode.workspace.fs.writeFile(target, Buffer.from(content, "utf-8"));
    this.dirty = false;
    await this.panel.webview.postMessage({ type: "markClean" });
    vscode.window.showInformationMessage(`${this.spec.title}: exported ${vscode.workspace.asRelativePath(target)}.`);
  }

  private dispose(): void {
    if (this.dirty) {
      void this.panel.webview.postMessage({ type: "requestState" });
    }
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }
}

export function openEditorPanel(context: vscode.ExtensionContext, spec: EditorSpec): void {
  CatalogEditorPanel.open(context, spec);
}

export function renderEditorHtml(spec: EditorSpec, persistedState?: Record<string, unknown>): string {
  const nonce = getNonce();
  const specJson = escapeScriptJson(JSON.stringify(spec));
  const stateJson = escapeScriptJson(JSON.stringify(persistedState ?? {}));
  const behaviorJson = escapeScriptJson(JSON.stringify(EDITOR_BEHAVIOR_PROFILES));
  const content = getEditorContent(spec.id);
  const isProfessionalPanel = spec.id === "pixelArt" || spec.id === "database" || spec.id === "dialog" || spec.id === "procMap" || spec.id === "tileMap" || spec.id === "sceneFlow" || spec.id === "particle" || spec.id === "skeletonRigging" || spec.id === "globe" || spec.id === "province" || spec.id === "aiBehavior" || spec.id === "graph" || spec.id === "voxel";

  if (isProfessionalPanel) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(spec.title)}</title>
  <style nonce="${nonce}">${content.styles}</style>
</head>
<body>
  ${content.workspaceHtml}
  <script nonce="${nonce}">
    const SPEC = JSON.parse(${JSON.stringify(specJson)});
    const PERSISTED_STATE = JSON.parse(${JSON.stringify(stateJson)});
    const EDITOR_BEHAVIORS = JSON.parse(${JSON.stringify(behaviorJson)});
    ${content.script}
  </script>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(spec.title)}</title>
  <style nonce="${nonce}">${sharedStyles()}${content.styles}</style>
</head>
<body>
  <div class="editor-shell" data-editor-id="${escapeAttr(spec.id)}">
    ${renderToolbar(spec)}
    ${renderToolRail(spec.tools)}
    <main class="workspace ${spec.workspace}-workspace">${content.workspaceHtml}</main>
    ${renderInspector(spec.inspector, spec)}
    ${renderBottomPanel(spec)}
    ${renderStatusBar(spec)}
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const SPEC = JSON.parse(${JSON.stringify(specJson)});
    const PERSISTED_STATE = JSON.parse(${JSON.stringify(stateJson)});
    const EDITOR_BEHAVIORS = JSON.parse(${JSON.stringify(behaviorJson)});
    ${content.script}
  </script>
</body>
</html>`;
}

function renderToolbar(spec: EditorSpec): string {
  const buttons = spec.toolbar.map((action) => {
    const cls = action.kind === "primary" ? "primary" : action.kind === "toggle" ? "toggle" : "secondary";
    const shortcut = action.shortcut ? ` <span class="shortcut">${escapeHtml(action.shortcut)}</span>` : "";
    return `<button type="button" class="toolbar-button ${cls}" data-action="${escapeAttr(action.id)}" title="${escapeAttr(action.label)}">${escapeHtml(action.label)}${shortcut}</button>`;
  }).join("");

  const exportButtons = spec.exports.map((format) =>
    `<button type="button" class="toolbar-button secondary export-chip" data-export-format="${format}">${format.toUpperCase()}</button>`,
  ).join("");

  return `<header class="toolbar">
    <div class="toolbar-title"><span class="codicon">$(window)</span><strong>${escapeHtml(spec.title)}</strong><span>${escapeHtml(spec.apiNamespace)}</span></div>
    <div class="toolbar-group">${buttons}</div>
    <div class="toolbar-group export-group">${exportButtons}</div>
  </header>`;
}

function renderToolRail(tools: readonly EditorToolSpec[]): string {
  const buttons = tools.map((tool, index) => {
    const active = index === 0 ? " active" : "";
    const shortcut = tool.shortcut ? `<span class="tool-shortcut">${escapeHtml(tool.shortcut)}</span>` : "";
    return `<button type="button" class="tool-button${active}" data-tool="${escapeAttr(tool.id)}" title="${escapeAttr(tool.label)}"><span class="tool-icon">${escapeHtml(tool.icon)}</span><span>${escapeHtml(tool.label)}</span>${shortcut}</button>`;
  }).join("");
  return `<aside class="tool-rail"><h2>Tools</h2>${buttons}<section class="rail-section"><h2>Layers / Tracks</h2><div id="layerList" class="mini-list"></div></section><section class="rail-section"><h2>Runtime</h2><div id="runtimeSummary" class="runtime-summary">Waiting for interaction.</div></section></aside>`;
}

function renderWorkspace(spec: EditorSpec): string {
  const purpose = `<p class="workspace-purpose">${escapeHtml(spec.purpose)}</p>`;
  const controls = renderWorkspaceControls(spec);
  switch (spec.workspace) {
    case "grid":
      return `<main class="workspace grid-workspace"><div class="canvas-header">${purpose}<span id="workspaceMeta">32 × 18 grid</span></div>${controls}<canvas id="editorCanvas" width="960" height="540"></canvas></main>`;
    case "node":
      return `<main class="workspace node-workspace"><div class="canvas-header">${purpose}<span id="workspaceMeta">${spec.nodes?.length ?? 0} nodes</span></div>${controls}<canvas id="editorCanvas" width="960" height="540"></canvas></main>`;
    case "timeline":
      return `<main class="workspace timeline-workspace"><div class="canvas-header">${purpose}<span id="workspaceMeta">00:00.000</span></div>${controls}<canvas id="editorCanvas" width="960" height="360"></canvas><div id="timelineRows" class="timeline-rows"></div></main>`;
    case "table":
      return `<main class="workspace table-workspace"><div class="canvas-header">${purpose}<span id="workspaceMeta">sample rows</span></div>${controls}${renderTable(spec)}</main>`;
    case "preview":
      return `<main class="workspace preview-workspace"><div class="canvas-header">${purpose}<span id="workspaceMeta">preview ready</span></div>${controls}<canvas id="editorCanvas" width="960" height="540"></canvas></main>`;
    case "document":
      return `<main class="workspace document-workspace"><div class="canvas-header">${purpose}<span id="workspaceMeta">generated source</span></div>${controls}<textarea id="documentSource" spellcheck="false"></textarea></main>`;
  }
}

function renderWorkspaceControls(spec: EditorSpec): string {
  if (spec.workspace === "grid") {
    return `<div class="workspace-controls"><label>Brush <input id="brushSize" type="range" min="1" max="5" value="1"></label><label>Mode <select id="modeSelect"><option>paint</option><option>collision</option><option>property</option><option>autotile</option></select></label><span id="coordinateReadout">Cell: none</span></div>`;
  }
  if (spec.workspace === "node") {
    return `<div class="workspace-controls"><button type="button" data-panel-op="addNode">Add node</button><button type="button" data-panel-op="connect">Connect</button><button type="button" data-panel-op="arrange">Auto arrange</button><span id="coordinateReadout">Node: none</span></div>`;
  }
  if (spec.workspace === "timeline") {
    return `<div class="workspace-controls"><button type="button" data-panel-op="play">Play/Pause</button><label>Playhead <input id="playheadSlider" type="range" min="0" max="8000" value="0" step="50"></label><label>Easing <select id="easingSelect"><option>linear</option><option>bezier</option><option>bounce</option></select></label></div>`;
  }
  if (spec.workspace === "table") {
    return `<div class="workspace-controls"><button type="button" data-panel-op="addRow">Add row</button><button type="button" data-panel-op="addColumn">Add column</button><input id="tableFilter" placeholder="Filter rows" aria-label="Filter rows"></div>`;
  }
  if (spec.workspace === "preview") {
    return `<div class="workspace-controls"><label>Intensity <input id="previewIntensity" type="range" min="0" max="100" value="55"></label><label>Seed <input id="previewSeed" type="number" value="7" min="0" max="999"></label><label><input id="previewOverlay" type="checkbox" checked> Overlay</label></div>`;
  }
  return `<div class="workspace-controls"><input id="documentSearch" placeholder="Search generated document" aria-label="Search generated document"><button type="button" data-panel-op="insert">Insert sample</button><button type="button" data-panel-op="validate">Validate</button></div>`;
}

function renderTable(spec: EditorSpec): string {
  const columns = spec.tableColumns ?? ["id", "name", "type", "value", "notes"];
  const header = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
  const rows = [0, 1, 2].map((row) => `<tr>${columns.map((column, idx) => `<td contenteditable="true">${escapeHtml(sampleCell(spec, column, row, idx))}</td>`).join("")}</tr>`).join("");
  return `<table id="dataGrid"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table>`;
}

function sampleCell(spec: EditorSpec, column: string, row: number, idx: number): string {
  if (idx === 0) return `${spec.id}_${row + 1}`;
  if (column.toLowerCase().includes("status")) return row === 0 ? "pass" : "draft";
  if (column.toLowerCase().includes("value") || column.toLowerCase().includes("priority") || column.toLowerCase().includes("order")) return String((row + 1) * 10);
  return `${column}_${row + 1}`;
}

function renderInspector(sections: readonly EditorInspectorSectionSpec[], spec: EditorSpec): string {
  const html = sections.map((section) => `<section class="inspector-section"><h2>${escapeHtml(section.title)}</h2>${section.fields.map(renderField).join("")}</section>`).join("");
  const validation = spec.validations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<aside class="inspector"><h1>Inspector</h1>${renderFeatureActionPanel(spec)}${renderGuidePanel(spec)}<section class="inspector-section live-selection"><h2>Selected state</h2><dl id="liveInspector" class="live-inspector"><dt>Selection</dt><dd>None yet</dd></dl></section>${html}<section class="inspector-section"><h2>Validation</h2><ul>${validation}</ul></section></aside>`;
}

function renderFeatureActionPanel(spec: EditorSpec): string {
  const actions = spec.featureActions.map((action, index) => `<button type="button" class="feature-action-card" data-feature-action="${escapeAttr(action.id)}" title="${escapeAttr(action.description)}"><span class="feature-index">${index + 1}</span><span class="feature-label">${escapeHtml(action.label)}</span><span class="feature-kind">${escapeHtml(action.kind)} / ${escapeHtml(action.payload.mode)}</span><span class="feature-desc">${escapeHtml(action.description)}</span></button>`).join("");
  return `<section class="inspector-section feature-action-section"><h2>Interactive feature actions</h2><p>Click any guide feature to mutate the ${escapeHtml(spec.workspace)} workspace, update selection, log validation, and include the result in exports.</p><div class="feature-action-grid">${actions}</div></section>`;
}

function renderGuidePanel(spec: EditorSpec): string {
  const features = spec.featureList
    .map((item) => `<li><span aria-hidden="true">✓</span>${escapeHtml(item)}</li>`)
    .join("");

  return `<section class="inspector-section guide-section">
    <h2>Guide brief</h2>
    <dl class="guide-meta">
      <dt>Reference / Inspiration</dt><dd>${escapeHtml(spec.reference)}</dd>
      <dt>Use case</dt><dd>${escapeHtml(spec.useCase)}</dd>
      <dt>Vision</dt><dd>${escapeHtml(spec.vision)}</dd>
    </dl>
    <h2>Guide feature source</h2>
    <ul class="guide-feature-list">${features}</ul>
  </section>`;
}

function renderField(field: EditorFieldSpec): string {
  const id = `field-${field.id}`;
  const label = `<label for="${escapeAttr(id)}">${escapeHtml(field.label)}</label>`;
  if (field.type === "select") {
    const options = (field.options ?? [String(field.value)]).map((option) => `<option${option === field.value ? " selected" : ""}>${escapeHtml(option)}</option>`).join("");
    return `<div class="field">${label}<select id="${escapeAttr(id)}" data-field="${escapeAttr(field.id)}">${options}</select></div>`;
  }
  if (field.type === "textarea") {
    return `<div class="field">${label}<textarea id="${escapeAttr(id)}" data-field="${escapeAttr(field.id)}">${escapeHtml(String(field.value))}</textarea></div>`;
  }
  if (field.type === "checkbox") {
    const checked = field.value === true ? " checked" : "";
    return `<div class="field checkbox-field"><input id="${escapeAttr(id)}" type="checkbox" data-field="${escapeAttr(field.id)}"${checked}>${label}</div>`;
  }
  const min = field.min === undefined ? "" : ` min="${field.min}"`;
  const max = field.max === undefined ? "" : ` max="${field.max}"`;
  const step = field.step === undefined ? "" : ` step="${field.step}"`;
  return `<div class="field">${label}<input id="${escapeAttr(id)}" type="${field.type}" value="${escapeAttr(String(field.value))}" data-field="${escapeAttr(field.id)}"${min}${max}${step}></div>`;
}

function renderBottomPanel(spec: EditorSpec): string {
  return `<section class="bottom-panel"><div><strong>Output</strong><p>${escapeHtml(spec.bottomPanel)}</p><pre id="validationLog">Ready. Click a feature action to change ${escapeHtml(spec.workspace)} state.</pre></div><div><strong>Generated export preview</strong><pre id="exportPreview">Pending first render.</pre></div></section>`;
}

function renderStatusBar(spec: EditorSpec): string {
  return `<footer class="status-bar"><span>${escapeHtml(spec.category)}</span><span>${escapeHtml(spec.workspace)}</span><span id="statusTool">Tool: ${escapeHtml(spec.tools[0]?.label ?? "Select")}</span><span id="statusZoom">Zoom: 100%</span><span id="statusDirty">Clean</span><span id="statusAction">Action: none</span><span class="status-spacer"></span><span>${escapeHtml(spec.nativeFormat)}</span></footer>`;
}

function sharedStyles(): string {
  return `
    :root {
      --bg: var(--vscode-editor-background);
      --fg: var(--vscode-editor-foreground);
      --muted: var(--vscode-descriptionForeground);
      --panel: var(--vscode-sideBar-background);
      --panel-2: var(--vscode-editorWidget-background);
      --border: var(--vscode-panel-border);
      --accent: var(--vscode-focusBorder);
      --button: var(--vscode-button-background);
      --button-fg: var(--vscode-button-foreground);
      --hover: var(--vscode-list-hoverBackground);
      --selection: var(--vscode-list-activeSelectionBackground);
      --input: var(--vscode-input-background);
      --input-fg: var(--vscode-input-foreground);
      --font: var(--vscode-font-family);
      --mono: var(--vscode-editor-font-family, Consolas, monospace);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; overflow: hidden; background: var(--bg); color: var(--fg); font-family: var(--font); font-size: 13px; }
    .editor-shell { height: 100vh; display: grid; grid-template-columns: 190px minmax(360px, 1fr) 300px; grid-template-rows: 38px minmax(0, 1fr) 112px 24px; }
    .toolbar { grid-column: 1 / -1; display: flex; align-items: center; gap: 12px; padding: 4px 8px; border-bottom: 1px solid var(--border); background: var(--panel-2); min-width: 0; }
    .toolbar-title { display: flex; align-items: center; gap: 8px; min-width: 240px; overflow: hidden; white-space: nowrap; }
    .toolbar-title span:last-child { color: var(--muted); font-size: 12px; }
    .toolbar-group { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .toolbar-button { border: 1px solid var(--border); background: transparent; color: var(--fg); border-radius: 3px; padding: 4px 8px; cursor: pointer; font: inherit; }
    .toolbar-button:hover, .tool-button:hover { background: var(--hover); }
    .toolbar-button.primary { background: var(--button); color: var(--button-fg); border-color: var(--button); }
    .toolbar-button.toggle.active, .tool-button.active { background: var(--selection); color: var(--fg); }
    .shortcut, .tool-shortcut { color: var(--muted); font-size: 11px; margin-left: 4px; }
    .tool-rail { grid-column: 1; grid-row: 2 / 4; overflow: auto; border-right: 1px solid var(--border); background: var(--panel); padding: 8px; }
    .tool-rail h2, .inspector h1, .inspector-section h2 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
    .tool-button { width: 100%; display: grid; grid-template-columns: 24px 1fr auto; gap: 6px; align-items: center; margin-bottom: 4px; border: 1px solid transparent; background: transparent; color: var(--fg); text-align: left; border-radius: 4px; padding: 6px; cursor: pointer; font: inherit; }
    .tool-icon { color: var(--muted); }
    .rail-section { border-top: 1px solid var(--border); margin-top: 10px; padding-top: 10px; }
    .mini-list { display: grid; gap: 4px; }
    .mini-item { padding: 5px 6px; border: 1px solid var(--border); border-radius: 4px; background: var(--panel-2); color: var(--muted); }
    .runtime-summary { color: var(--muted); line-height: 1.35; }
    .workspace { grid-column: 2; grid-row: 2; min-width: 0; min-height: 0; overflow: hidden; background: var(--bg); display: flex; flex-direction: column; }
    .canvas-header { min-height: 48px; padding: 8px 10px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; justify-content: space-between; }
    .workspace-purpose { margin: 0; color: var(--muted); line-height: 1.35; }
    #workspaceMeta { white-space: nowrap; color: var(--muted); }
    .workspace-controls { min-height: 36px; border-bottom: 1px solid var(--border); padding: 6px 10px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; background: color-mix(in srgb, var(--panel-2) 72%, transparent); }
    .workspace-controls label { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); }
    .workspace-controls button { border: 1px solid var(--border); background: transparent; color: var(--fg); border-radius: 4px; padding: 3px 8px; cursor: pointer; font: inherit; }
    .workspace-controls button:hover { background: var(--hover); }
    canvas { width: 100%; height: 100%; display: block; background: radial-gradient(circle at center, rgba(127,127,127,.08), transparent 55%); }
    .document-workspace textarea { flex: 1; width: 100%; border: 0; resize: none; padding: 12px; background: var(--bg); color: var(--fg); font-family: var(--mono); font-size: 12px; outline: none; }
    table { width: 100%; border-collapse: collapse; font-family: var(--mono); font-size: 12px; }
    th, td { border: 1px solid var(--border); padding: 6px 8px; text-align: left; }
    th { background: var(--panel-2); color: var(--muted); position: sticky; top: 0; }
    td:focus { outline: 1px solid var(--accent); outline-offset: -1px; }
    tr.hidden-row { display: none; }
    tr.validation-warning td:first-child::before { content: '⚠ '; color: #cca700; }
    .timeline-rows { border-top: 1px solid var(--border); padding: 8px; display: grid; gap: 6px; }
    .timeline-row { min-height: 22px; background: linear-gradient(90deg, var(--panel-2), transparent); border: 1px solid var(--border); border-radius: 4px; padding-left: 8px; color: var(--muted); position: relative; }
    .timeline-dot { position: absolute; top: 5px; width: 9px; height: 9px; border-radius: 50%; background: var(--accent); }
    .inspector { grid-column: 3; grid-row: 2 / 4; overflow: auto; border-left: 1px solid var(--border); background: var(--panel); padding: 10px; }
    .inspector-section { border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 10px; }
    .guide-section { background: color-mix(in srgb, var(--panel-2) 72%, transparent); border: 1px solid var(--border); border-radius: 6px; padding: 10px; }
    .feature-action-section { background: color-mix(in srgb, var(--panel-2) 72%, transparent); border: 1px solid var(--border); border-radius: 6px; padding: 10px; }
    .feature-action-section p { margin: 0 0 8px; color: var(--muted); line-height: 1.35; }
    .feature-action-grid { display: grid; gap: 6px; }
    .feature-action-card { display: grid; grid-template-columns: 24px 1fr; gap: 3px 8px; text-align: left; padding: 7px; border: 1px solid var(--border); background: transparent; color: var(--fg); border-radius: 4px; cursor: pointer; font: inherit; }
    .feature-action-card:hover { background: var(--hover); }
    .feature-action-card.active { background: var(--selection); border-color: var(--accent); }
    .feature-index { grid-row: 1 / span 3; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--accent); color: var(--bg); font-weight: 700; }
    .feature-label { font-weight: 600; line-height: 1.25; }
    .feature-kind, .feature-desc { color: var(--muted); font-size: 11px; line-height: 1.25; }
    .guide-meta { display: grid; gap: 6px; margin: 0 0 10px; }
    .guide-meta dt, .live-inspector dt { color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    .guide-meta dd, .live-inspector dd { margin: 0; line-height: 1.35; }
    .live-inspector { display: grid; gap: 5px; margin: 0; }
    .guide-feature-list { display: grid; gap: 5px; margin: 0; padding-left: 0; list-style: none; }
    .guide-feature-list li { display: grid; grid-template-columns: 16px 1fr; gap: 5px; line-height: 1.3; }
    .guide-feature-list span { color: var(--accent); }
    .field { display: grid; gap: 4px; margin-bottom: 8px; }
    .field label { color: var(--muted); font-size: 12px; }
    .checkbox-field { grid-template-columns: auto 1fr; align-items: center; }
    input, textarea, select { background: var(--input); color: var(--input-fg); border: 1px solid var(--border); border-radius: 3px; padding: 4px 6px; font: inherit; }
    .bottom-panel { grid-column: 2; grid-row: 3; border-top: 1px solid var(--border); background: var(--panel-2); display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 8px 10px; overflow: hidden; }
    .bottom-panel p { margin: 4px 0 0; color: var(--muted); }
    .bottom-panel pre { margin: 0; max-height: 92px; overflow: auto; color: var(--muted); font-family: var(--mono); white-space: pre-wrap; }
    .status-bar { grid-column: 1 / -1; grid-row: 4; display: flex; gap: 12px; align-items: center; padding: 0 10px; color: var(--vscode-statusBar-foreground); background: var(--vscode-statusBar-background); font-size: 12px; }
    .status-spacer { flex: 1; }
    @media (max-width: 980px) { .editor-shell { grid-template-columns: 150px 1fr; } .inspector { display: none; } .bottom-panel { grid-column: 2; } }
  `;
}

function interactiveClientScript(): string {
  return `
    const behavior = EDITOR_BEHAVIORS[SPEC.id] || { workspaceHint: SPEC.workspace, accent: '#4ec9b0', primaryMutation: 'mutates shared editor state', sampleAssets: ['SampleA', 'SampleB', 'SampleC', 'SampleD'] };
    const initialTableRows = readDomTable();
    const state = createInitialState();
    let dragNodeId = '';
    let dragOffset = { x: 0, y: 0 };

    function createInitialState() {
      const saved = PERSISTED_STATE || {};
      return {
        dirty: Boolean(saved.dirty),
        zoom: Number(saved.zoom || 1),
        selectedTool: saved.selectedTool || (SPEC.tools[0] && SPEC.tools[0].id) || 'select',
        selectedItem: saved.selectedItem || '',
        gridEnabled: saved.gridEnabled !== false,
        fields: Object.assign({}, saved.fields || {}),
        activeActionId: saved.activeActionId || '',
        actionHistory: Array.isArray(saved.actionHistory) ? saved.actionHistory.slice(0, 80) : [],
        log: Array.isArray(saved.log) ? saved.log.slice(0, 80) : ['Ready: ' + SPEC.title + ' interactive runtime loaded.'],
        grid: saved.grid || createGridState(),
        nodes: Array.isArray(saved.nodes) ? saved.nodes : createNodeState(),
        links: Array.isArray(saved.links) ? saved.links : createLinkState(),
        tableColumns: Array.isArray(saved.tableColumns) ? saved.tableColumns : readDomHeaders(),
        tableRows: Array.isArray(saved.tableRows) ? saved.tableRows : initialTableRows,
        timeline: saved.timeline || createTimelineState(),
        preview: saved.preview || createPreviewState(),
        document: saved.document || createDocumentState(),
      };
    }

    function createGridState() {
      const cells = [];
      for (let y = 0; y < 18; y += 1) {
        for (let x = 0; x < 32; x += 1) {
          if ((x + y + SPEC.id.length) % 11 === 0) cells.push({ x: x, y: y, value: behavior.sampleAssets[(x + y) % behavior.sampleAssets.length], color: colorForIndex(x + y), layer: 'Base', collision: false, property: '' });
        }
      }
      return { cols: 32, rows: 18, brushSize: 1, selectedCell: null, selectedLayer: 'Base', layers: ['Base', 'Collision', 'Metadata'], cells: cells, mode: 'paint' };
    }

    function createNodeState() {
      const source = SPEC.nodes && SPEC.nodes.length ? SPEC.nodes : [
        { id: 'input', label: 'Input', type: 'Entry', x: 80, y: 118 },
        { id: 'authoring', label: SPEC.sidebarLabel, type: 'Guide', x: 330, y: 96 },
        { id: 'export', label: SPEC.nativeFormat, type: 'Output', x: 610, y: 132 },
      ];
      return source.map(function(node, index) { return Object.assign({ status: 'ready', data: behavior.sampleAssets[index % behavior.sampleAssets.length] }, node); });
    }

    function createLinkState() {
      if (SPEC.links && SPEC.links.length) return SPEC.links.map(function(link) { return Object.assign({ status: 'ready' }, link); });
      return [{ from: 'input', to: 'authoring', label: 'configure' }, { from: 'authoring', to: 'export', label: 'generate' }];
    }

    function createTimelineState() {
      const trackNames = behavior.sampleAssets.slice(0, 4);
      return { playhead: 0, playing: false, easing: 'linear', tracks: trackNames.map(function(name, index) { return { id: 'track_' + index, name: name, muted: false }; }), keyframes: trackNames.map(function(name, index) { return { track: 'track_' + index, time: 600 + index * 700, value: name, easing: 'linear', event: index === 2 }; }) };
    }

    function createPreviewState() {
      return { intensity: 55, seed: 7, overlay: true, mode: behavior.sampleAssets[0] || 'Preview', particles: [], metrics: [{ name: 'cpu', value: 16 }, { name: 'gpu', value: 11 }], samples: behavior.sampleAssets.slice() };
    }

    function createDocumentState() {
      return { source: '', cursor: 0, search: '', markers: [], snippets: behavior.sampleAssets.slice() };
    }

    function readDomHeaders() {
      return Array.from(document.querySelectorAll('#dataGrid thead th')).map(function(cell) { return cell.textContent || 'column'; });
    }

    function readDomTable() {
      return Array.from(document.querySelectorAll('#dataGrid tbody tr')).map(function(row) { return { values: Array.from(row.children).map(function(cell) { return cell.textContent || ''; }), warning: false, hidden: false }; });
    }

    function markDirty() {
      state.dirty = true;
      document.getElementById('statusDirty').textContent = 'Dirty';
      vscode.postMessage({ type: 'stateChanged', dirty: true });
    }

    function markClean() {
      state.dirty = false;
      document.getElementById('statusDirty').textContent = 'Clean';
      vscode.postMessage({ type: 'stateChanged', dirty: false });
    }

    function persistState() {
      vscode.postMessage({ type: 'persistState', state: serializeState() });
    }

    function serializeState() {
      readFields();
      if (SPEC.workspace === 'table') syncTableFromDom();
      if (SPEC.workspace === 'document') syncDocumentFromDom();
      return {
        dirty: state.dirty,
        zoom: state.zoom,
        selectedTool: state.selectedTool,
        selectedItem: state.selectedItem,
        gridEnabled: state.gridEnabled,
        fields: state.fields,
        activeActionId: state.activeActionId,
        actionHistory: state.actionHistory.slice(-80),
        log: state.log.slice(-80),
        grid: state.grid,
        nodes: state.nodes,
        links: state.links,
        tableColumns: state.tableColumns,
        tableRows: state.tableRows,
        timeline: state.timeline,
        preview: state.preview,
        document: state.document,
      };
    }

    function setTool(toolId) {
      state.selectedTool = toolId;
      document.querySelectorAll('[data-tool]').forEach(function(button) { button.classList.toggle('active', button.dataset.tool === toolId); });
      const tool = SPEC.tools.find(function(entry) { return entry.id === toolId; });
      document.getElementById('statusTool').textContent = 'Tool: ' + (tool ? tool.label : toolId);
      persistState();
    }

    function updateZoom(delta) {
      state.zoom = Math.max(0.25, Math.min(4, state.zoom + delta));
      document.getElementById('statusZoom').textContent = 'Zoom: ' + Math.round(state.zoom * 100) + '%';
      drawEditorState();
      persistState();
    }

    function readFields() {
      const values = {};
      document.querySelectorAll('[data-field]').forEach(function(field) {
        if (field.type === 'checkbox') values[field.dataset.field] = field.checked;
        else values[field.dataset.field] = field.value;
      });
      state.fields = values;
      return values;
    }

    function handleFeatureAction(actionId) {
      const action = SPEC.featureActions.find(function(entry) { return entry.id === actionId; });
      if (!action) return;
      state.activeActionId = action.id;
      document.querySelectorAll('[data-feature-action]').forEach(function(button) { button.classList.toggle('active', button.dataset.featureAction === action.id); });
      const result = applyFeatureAction(action);
      const history = { id: action.id, label: action.label, mode: action.payload.mode, workspace: SPEC.workspace, result: result.message, at: new Date().toISOString() };
      state.actionHistory.push(history);
      if (state.actionHistory.length > 80) state.actionHistory.shift();
      addLog('Feature: ' + action.label + ' -> ' + result.message);
      updateSelection(result.selection || action.label, result.details || {});
      document.getElementById('statusAction').textContent = 'Action: ' + action.label;
      markDirty();
      drawEditorState();
      persistState();
    }

    function applyFeatureAction(action) {
      if (SPEC.workspace === 'grid') return applyGridFeatureAction(action);
      if (SPEC.workspace === 'node') return applyNodeFeatureAction(action);
      if (SPEC.workspace === 'table') return applyTableFeatureAction(action);
      if (SPEC.workspace === 'timeline') return applyTimelineFeatureAction(action);
      if (SPEC.workspace === 'preview') return applyPreviewFeatureAction(action);
      return applyDocumentFeatureAction(action);
    }

    function applyGridFeatureAction(action) {
      const mode = action.payload.mode;
      state.grid.mode = mode;
      const x = (action.payload.index * 3 + state.actionHistory.length) % state.grid.cols;
      const y = (action.payload.index * 2 + SPEC.id.length) % state.grid.rows;
      state.grid.selectedCell = { x: x, y: y };
      if (mode === 'layer') {
        const layer = 'Layer ' + (state.grid.layers.length + 1);
        state.grid.layers.push(layer);
        state.grid.selectedLayer = layer;
      } else if (mode === 'fill') {
        for (let yy = Math.max(0, y - 2); yy <= Math.min(state.grid.rows - 1, y + 2); yy += 1) {
          for (let xx = Math.max(0, x - 2); xx <= Math.min(state.grid.cols - 1, x + 2); xx += 1) upsertCell(xx, yy, action, mode);
        }
      } else if (mode === 'stamp') {
        [[0,0],[1,0],[0,1],[1,1]].forEach(function(offset) { upsertCell(x + offset[0], y + offset[1], action, mode); });
      } else {
        const size = state.grid.brushSize || 1;
        for (let yy = y; yy < Math.min(state.grid.rows, y + size); yy += 1) {
          for (let xx = x; xx < Math.min(state.grid.cols, x + size); xx += 1) upsertCell(xx, yy, action, mode);
        }
      }
      return { message: 'grid ' + mode + ' at (' + x + ', ' + y + ') on ' + state.grid.selectedLayer, selection: 'Cell ' + x + ',' + y, details: { mode: mode, layer: state.grid.selectedLayer, brushSize: state.grid.brushSize } };
    }

    function upsertCell(x, y, action, mode) {
      if (x < 0 || y < 0 || x >= state.grid.cols || y >= state.grid.rows) return;
      let cell = state.grid.cells.find(function(entry) { return entry.x === x && entry.y === y && entry.layer === state.grid.selectedLayer; });
      if (!cell) {
        cell = { x: x, y: y, value: '', color: colorForIndex(action.payload.index + x + y), layer: state.grid.selectedLayer, collision: false, property: '' };
        state.grid.cells.push(cell);
      }
      cell.value = behavior.sampleAssets[action.payload.index % behavior.sampleAssets.length] || action.label;
      cell.color = colorForIndex(action.payload.index + x + y);
      cell.collision = mode === 'collision' || cell.collision;
      cell.property = mode === 'property' ? action.label : cell.property;
      cell.autotile = mode === 'autotile';
    }

    function applyNodeFeatureAction(action) {
      const mode = action.payload.mode;
      if (mode === 'addNode' || mode === 'selectNode') {
        const node = createRuntimeNode(action);
        state.nodes.push(node);
        state.selectedItem = node.id;
        return { message: 'added node ' + node.label, selection: node.label, details: node };
      }
      if (mode === 'connect') {
        if (state.nodes.length < 2) state.nodes.push(createRuntimeNode(action));
        const from = state.nodes[Math.max(0, state.nodes.length - 2)];
        const to = state.nodes[state.nodes.length - 1];
        state.links.push({ from: from.id, to: to.id, label: action.label, status: 'live' });
        state.selectedItem = to.id;
        return { message: 'connected ' + from.label + ' -> ' + to.label, selection: to.label, details: { from: from.id, to: to.id } };
      }
      if (mode === 'arrange') {
        arrangeNodes();
        return { message: 'auto-arranged ' + state.nodes.length + ' nodes', selection: 'Layout', details: { nodes: state.nodes.length } };
      }
      if (mode === 'group') {
        state.nodes.forEach(function(node, index) { if (index % 2 === 0) node.group = action.label; });
        return { message: 'group/comment applied to selected nodes', selection: action.label, details: { group: action.label } };
      }
      if (mode === 'validate') {
        const orphanCount = state.nodes.filter(function(node) { return !state.links.some(function(link) { return link.from === node.id || link.to === node.id; }); }).length;
        return { message: 'validation complete: ' + orphanCount + ' orphan nodes', selection: 'Validation', details: { orphanCount: orphanCount } };
      }
      if (mode === 'simulate') {
        state.nodes.forEach(function(node, index) { node.status = index % 2 === 0 ? 'active' : 'waiting'; });
        return { message: 'runtime flow highlighted', selection: 'Simulation', details: { active: state.nodes.filter(function(node) { return node.status === 'active'; }).length } };
      }
      if (mode === 'bind') {
        const selected = getSelectedNode() || state.nodes[0];
        selected.binding = action.label;
        return { message: 'binding added to ' + selected.label, selection: selected.label, details: selected };
      }
      const generated = createRuntimeNode(action);
      generated.type = 'Generated';
      state.nodes.push(generated);
      return { message: 'generated node data for export', selection: generated.label, details: generated };
    }

    function createRuntimeNode(action) {
      const index = state.nodes.length + 1;
      return { id: 'node_' + index + '_' + action.payload.index, label: action.label, type: behavior.sampleAssets[action.payload.index % behavior.sampleAssets.length] || 'Action', x: 80 + (index % 5) * 150, y: 70 + Math.floor(index / 5) * 92, status: 'ready', data: action.description };
    }

    function getSelectedNode() {
      return state.nodes.find(function(node) { return node.id === state.selectedItem; });
    }

    function arrangeNodes() {
      state.nodes.forEach(function(node, index) {
        node.x = 70 + (index % 4) * 190;
        node.y = 70 + Math.floor(index / 4) * 105;
      });
    }

    function applyTableFeatureAction(action) {
      const mode = action.payload.mode;
      syncTableFromDom();
      if (mode === 'addColumn') addTableColumn(action.label);
      else if (mode === 'filter') filterTable(action.label.split(' ')[0] || behavior.sampleAssets[0]);
      else if (mode === 'validate') markTableValidation(action.label);
      else if (mode === 'formula') applyTableFormula(action.payload.index);
      else if (mode === 'metrics') addMetricRow(action);
      else if (mode === 'importExport') addTableRow(action, 'export-ready');
      else addTableRow(action, mode);
      renderDataTable();
      const visibleRows = state.tableRows.filter(function(row) { return !row.hidden; }).length;
      return { message: 'table ' + mode + ': ' + visibleRows + ' visible rows, ' + state.tableColumns.length + ' columns', selection: 'Table ' + mode, details: { rows: state.tableRows.length, columns: state.tableColumns.length } };
    }

    function addTableRow(action, marker) {
      const row = state.tableColumns.map(function(column, index) {
        if (index === 0) return SPEC.id + '_' + (state.tableRows.length + 1);
        if (column.toLowerCase().includes('status')) return marker || 'draft';
        if (column.toLowerCase().includes('value') || column.toLowerCase().includes('priority') || column.toLowerCase().includes('order')) return String((action.payload.index + 1) * 13);
        return (behavior.sampleAssets[action.payload.index % behavior.sampleAssets.length] || action.label) + '_' + index;
      });
      state.tableRows.push({ values: row, warning: false, hidden: false });
    }

    function addMetricRow(action) {
      addTableRow(action, 'metric');
      const row = state.tableRows[state.tableRows.length - 1];
      row.values[row.values.length - 1] = 'metric=' + (16 + action.payload.index * 3) + 'ms';
    }

    function addTableColumn(label) {
      const name = slug(label).slice(0, 18) || 'column_' + state.tableColumns.length;
      state.tableColumns.push(name);
      state.tableRows.forEach(function(row, index) { row.values.push(index === 0 ? label : behavior.sampleAssets[index % behavior.sampleAssets.length]); });
    }

    function filterTable(query) {
      const needle = String(query || '').toLowerCase();
      state.tableRows.forEach(function(row) { row.hidden = needle.length > 0 && row.values.join(' ').toLowerCase().indexOf(needle) === -1; });
    }

    function markTableValidation(label) {
      state.tableRows.forEach(function(row, index) { row.warning = index % 3 === 0; });
      addLog('Validation marker added: ' + label);
    }

    function applyTableFormula(index) {
      state.tableRows.forEach(function(row) {
        row.values = row.values.map(function(value) {
          const numeric = Number(value);
          return Number.isFinite(numeric) ? String(numeric + (index + 1) * 5) : value;
        });
      });
    }

    function syncTableFromDom() {
      const table = document.getElementById('dataGrid');
      if (!table) return;
      state.tableColumns = readDomHeaders();
      state.tableRows = Array.from(table.querySelectorAll('tbody tr')).map(function(row) {
        return { values: Array.from(row.children).map(function(cell) { return cell.textContent || ''; }), warning: row.classList.contains('validation-warning'), hidden: row.classList.contains('hidden-row') };
      });
    }

    function renderDataTable() {
      const table = document.getElementById('dataGrid');
      if (!table) return;
      table.querySelector('thead').innerHTML = '<tr>' + state.tableColumns.map(function(column) { return '<th>' + escapeText(column) + '</th>'; }).join('') + '</tr>';
      table.querySelector('tbody').innerHTML = state.tableRows.map(function(row) {
        const cls = (row.warning ? ' validation-warning' : '') + (row.hidden ? ' hidden-row' : '');
        return '<tr class="' + cls.trim() + '">' + row.values.map(function(value) { return '<td contenteditable="true">' + escapeText(value) + '</td>'; }).join('') + '</tr>';
      }).join('');
      wireTableCells();
    }

    function applyTimelineFeatureAction(action) {
      const mode = action.payload.mode;
      if (mode === 'addTrack') state.timeline.tracks.push({ id: 'track_' + state.timeline.tracks.length, name: action.label, muted: false });
      else if (mode === 'scrub') state.timeline.playhead = (action.payload.index + 1) * 750;
      else if (mode === 'play') state.timeline.playing = !state.timeline.playing;
      else if (mode === 'easing') state.timeline.easing = action.label.toLowerCase().indexOf('bounce') >= 0 ? 'bounce' : 'bezier';
      else if (mode === 'waveform') state.timeline.waveform = action.label;
      else if (mode === 'event') state.timeline.keyframes.push({ track: ensureTimelineTrack(), time: state.timeline.playhead + 350, value: action.label, easing: state.timeline.easing, event: true });
      else if (mode === 'nest') state.timeline.tracks.push({ id: 'nested_' + state.timeline.tracks.length, name: 'Nested ' + action.label, muted: false });
      else state.timeline.keyframes.push({ track: ensureTimelineTrack(), time: state.timeline.playhead + 500 + action.payload.index * 120, value: action.label, easing: state.timeline.easing, event: false });
      return { message: 'timeline ' + mode + ' at ' + state.timeline.playhead + 'ms', selection: 'Playhead ' + state.timeline.playhead + 'ms', details: { tracks: state.timeline.tracks.length, keyframes: state.timeline.keyframes.length, easing: state.timeline.easing, playing: state.timeline.playing } };
    }

    function ensureTimelineTrack() {
      if (!state.timeline.tracks.length) state.timeline.tracks.push({ id: 'track_0', name: 'Main', muted: false });
      return state.timeline.tracks[0].id;
    }

    function applyPreviewFeatureAction(action) {
      const mode = action.payload.mode;
      state.preview.mode = mode + ': ' + action.label;
      if (mode === 'slider') state.preview.intensity = Math.min(100, state.preview.intensity + 10 + action.payload.index);
      else if (mode === 'overlay') state.preview.overlay = !state.preview.overlay;
      else if (mode === 'generate') generatePreviewSamples(action);
      else if (mode === 'metrics') state.preview.metrics.push({ name: action.label, value: 10 + action.payload.index * 7 });
      else if (mode === 'sample') state.preview.samples.push(action.label);
      else if (mode === 'snapshot') state.preview.snapshot = { label: action.label, at: new Date().toISOString(), particles: state.preview.particles.length };
      else generatePreviewSamples(action);
      return { message: 'preview ' + mode + ' -> intensity ' + state.preview.intensity + ', samples ' + state.preview.samples.length, selection: 'Preview ' + mode, details: { intensity: state.preview.intensity, overlay: state.preview.overlay, samples: state.preview.samples.length, metrics: state.preview.metrics.length } };
    }

    function generatePreviewSamples(action) {
      const count = 8 + action.payload.index * 3;
      for (let i = 0; i < count; i += 1) {
        state.preview.particles.push({ x: seededNoise(i + state.preview.seed, action.payload.index) * 960, y: seededNoise(i + 33, SPEC.id.length) * 540, radius: 3 + (i % 7), color: colorForIndex(i + action.payload.index) });
      }
      if (state.preview.particles.length > 180) state.preview.particles = state.preview.particles.slice(-180);
      state.preview.samples.push(action.label);
    }

    function applyDocumentFeatureAction(action) {
      syncDocumentFromDom();
      const mode = action.payload.mode;
      if (!state.document.source) state.document.source = buildExport(SPEC.exports.includes('lua') ? 'lua' : (SPEC.exports[0] || 'json'));
      if (mode === 'search') state.document.search = action.label.split(' ')[0] || SPEC.id;
      else if (mode === 'copy') vscode.postMessage({ type: 'copy', text: state.document.source });
      else if (mode === 'insert') state.document.source += '\n-- inserted feature: ' + action.label + '\n' + sampleDocumentSnippet(action) + '\n';
      else if (mode === 'validate') state.document.markers.push({ line: state.document.source.split('\n').length, message: 'Validated ' + action.label });
      else if (mode === 'style') state.document.source += '\n:root { --' + slug(SPEC.id) + '-accent: ' + behavior.accent + '; }\n';
      else if (mode === 'exportDoc') state.document.source += '\n-- export manifest target: ' + SPEC.nativeFormat + '\n';
      else if (mode === 'docs') state.document.source += '\n-- docs link: ' + SPEC.apiNamespace + ' / ' + action.label + '\n';
      else state.document.source += '\n-- edited: ' + action.label + '\n';
      renderDocumentSource();
      return { message: 'document ' + mode + ' updated (' + state.document.source.length + ' chars)', selection: 'Document ' + mode, details: { chars: state.document.source.length, markers: state.document.markers.length, search: state.document.search } };
    }

    function sampleDocumentSnippet(action) {
      if (SPEC.exports.includes('wgsl')) return '@compute @workgroup_size(8, 8) fn feature_' + action.payload.index + '() {}';
      if (SPEC.exports.includes('css')) return '.' + slug(SPEC.id) + '-' + action.payload.index + ' { color: ' + behavior.accent + '; }';
      return 'local feature_' + action.payload.index + ' = "' + action.label.replace(/"/g, '\\"') + '"';
    }

    function syncDocumentFromDom() {
      const source = document.getElementById('documentSource');
      if (source) state.document.source = source.value;
    }

    function renderDocumentSource() {
      const source = document.getElementById('documentSource');
      if (source) source.value = state.document.source;
    }

    function updateSelection(selection, details) {
      state.selectedItem = selection;
      const inspector = document.getElementById('liveInspector');
      if (inspector) {
        const entries = Object.entries(details || {}).slice(0, 8);
        inspector.innerHTML = '<dt>Selection</dt><dd>' + escapeText(selection) + '</dd>' + entries.map(function(entry) { return '<dt>' + escapeText(entry[0]) + '</dt><dd>' + escapeText(JSON.stringify(entry[1])) + '</dd>'; }).join('');
      }
      const coordinate = document.getElementById('coordinateReadout');
      if (coordinate) coordinate.textContent = selection;
    }

    function addLog(message) {
      state.log.push(new Date().toLocaleTimeString() + ' ' + message);
      if (state.log.length > 80) state.log.shift();
      const log = document.getElementById('validationLog');
      if (log) log.textContent = state.log.slice(-10).join('\n');
    }

    function generatedPayload() {
      syncTableFromDom();
      syncDocumentFromDom();
      readFields();
      return {
        id: SPEC.id,
        title: SPEC.title,
        namespace: SPEC.apiNamespace,
        format: SPEC.nativeFormat,
        featureActions: SPEC.featureActions || [],
        behaviorProfile: behavior,
        fields: state.fields,
        workspace: SPEC.workspace,
        actionHistory: state.actionHistory.slice(),
        validationLog: state.log.slice(),
        editorState: serializeState(),
      };
    }

    function buildExport(format) {
      const payload = generatedPayload();
      if (format === 'json') return JSON.stringify(payload, null, 2) + '\n';
      if (format === 'toml') {
        return '# Generated by Lurek2D ' + SPEC.title + '\n'
          + 'id = "' + SPEC.id + '"\n'
          + 'namespace = "' + SPEC.apiNamespace + '"\n'
          + 'workspace = "' + SPEC.workspace + '"\n'
          + 'action_count = ' + payload.actionHistory.length + '\n'
          + 'feature_actions = ' + tomlArray(payload.featureActions.map(function(action) { return action.id; })) + '\n'
          + 'selected_item = ' + tomlValue(state.selectedItem) + '\n';
      }
      if (format === 'css') return ':root {\n  --lurek-editor-id: "' + SPEC.id + '";\n  --lurek-accent: ' + behavior.accent + ';\n}\n.lurek-' + slug(SPEC.id) + '::after { content: "' + state.actionHistory.length + ' actions"; }\n';
      if (format === 'wgsl') return '// Generated by Lurek2D ' + SPEC.title + '\n// Feature actions: ' + payload.featureActions.map(function(action) { return action.id; }).join(', ') + '\n@fragment\nfn fs_main() -> @location(0) vec4<f32> {\n  return vec4<f32>(0.30, 0.78, 0.69, 1.0);\n}\n';
      return '-- Generated by Lurek2D ' + SPEC.title + '\nreturn {\n'
        + '  id = "' + SPEC.id + '",\n'
        + '  namespace = "' + SPEC.apiNamespace + '",\n'
        + '  feature_actions = ' + luaArray(payload.featureActions.map(function(action) { return { id: action.id, label: action.label, mode: action.payload.mode }; }), 2) + ',\n'
        + '  action_history = ' + luaArray(payload.actionHistory, 2) + ',\n'
        + '  editor_state = ' + luaTable(payload.editorState, 2) + ',\n'
        + '}\n';
    }

    function tomlValue(value) {
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'number' || /^-?[0-9]+(\\.[0-9]+)?$/.test(String(value))) return String(value);
      return '"' + String(value).replace(/"/g, '\\"') + '"';
    }

    function tomlArray(values) { return '[' + (values || []).map(function(value) { return tomlValue(value); }).join(', ') + ']'; }
    function luaValue(value, indent) { if (value === null || value === undefined) return 'nil'; if (typeof value === 'boolean') return value ? 'true' : 'false'; if (typeof value === 'number') return String(value); if (Array.isArray(value)) return luaArray(value, indent); if (typeof value === 'object') return luaTable(value, indent); return '"' + String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }
    function luaTable(value, indent) { const pad = ' '.repeat(indent); const next = ' '.repeat(indent + 2); const entries = Object.entries(value || {}); if (!entries.length) return '{}'; return '{\n' + entries.map(function(entry) { return next + safeLuaKey(entry[0]) + ' = ' + luaValue(entry[1], indent + 2); }).join(',\n') + '\n' + pad + '}'; }
    function luaArray(value, indent) { const pad = ' '.repeat(indent); const next = ' '.repeat(indent + 2); if (!value || !value.length) return '{}'; return '{\n' + value.map(function(entry) { return next + luaValue(entry, indent + 2); }).join(',\n') + '\n' + pad + '}'; }
    function safeLuaKey(key) { return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : '["' + String(key).replace(/"/g, '\\"') + '"]'; }
    function exportFormat(format) { const content = buildExport(format); vscode.postMessage({ type: 'export', format: format, content: content, fileName: SPEC.exportBaseName + '.' + format }); markClean(); }
    function copyDefault() { const format = SPEC.exports[0] || 'json'; vscode.postMessage({ type: 'copy', text: buildExport(format) }); }
    function insertDefault() { const format = SPEC.exports.includes('lua') ? 'lua' : (SPEC.exports[0] || 'json'); vscode.postMessage({ type: 'insert', text: buildExport(format) }); }

    function resetPanel() {
      Object.assign(state, createInitialState(), { zoom: 1 });
      addLog('Panel reset with interactive defaults.');
      markDirty();
      drawEditorState();
      persistState();
    }

    function drawEditorState() {
      renderLayerList();
      renderRuntimeSummary();
      updateWorkspaceMeta();
      updateExportPreview();
      if (SPEC.workspace === 'table') { renderDataTable(); return; }
      if (SPEC.workspace === 'document') { renderDocumentSource(); return; }
      if (SPEC.workspace === 'timeline') renderTimelineRows();
      const canvas = document.getElementById('editorCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(state.zoom, state.zoom);
      if (state.gridEnabled) drawGrid(ctx, width / state.zoom, height / state.zoom);
      if (SPEC.workspace === 'node') drawNodes(ctx);
      else if (SPEC.workspace === 'timeline') drawTimeline(ctx, width / state.zoom, height / state.zoom);
      else if (SPEC.workspace === 'preview') drawPreview(ctx, width / state.zoom, height / state.zoom);
      else drawCells(ctx, width / state.zoom, height / state.zoom);
      ctx.restore();
    }

    function updateExportPreview() {
      const preview = document.getElementById('exportPreview');
      if (!preview) return;
      const payload = { id: SPEC.id, workspace: SPEC.workspace, featureActions: (SPEC.featureActions || []).length, actionHistory: state.actionHistory.length, selected: state.selectedItem, stateKeys: Object.keys(state).filter(function(key) { return ['grid', 'nodes', 'tableRows', 'timeline', 'preview', 'document'].indexOf(key) >= 0; }) };
      preview.textContent = JSON.stringify(payload, null, 2);
    }

    function updateWorkspaceMeta() {
      const meta = document.getElementById('workspaceMeta');
      if (!meta) return;
      if (SPEC.workspace === 'grid') meta.textContent = state.grid.cols + ' × ' + state.grid.rows + ' grid, ' + state.grid.cells.length + ' edited cells';
      else if (SPEC.workspace === 'node') meta.textContent = state.nodes.length + ' nodes, ' + state.links.length + ' links';
      else if (SPEC.workspace === 'timeline') meta.textContent = state.timeline.playhead + 'ms, ' + state.timeline.keyframes.length + ' keyframes';
      else if (SPEC.workspace === 'table') meta.textContent = state.tableRows.length + ' rows, ' + state.tableColumns.length + ' columns';
      else if (SPEC.workspace === 'preview') meta.textContent = state.preview.mode + ', ' + state.preview.particles.length + ' samples';
      else meta.textContent = (state.document.source || '').length + ' chars, ' + state.document.markers.length + ' markers';
    }

    function renderLayerList() {
      const list = document.getElementById('layerList');
      if (!list) return;
      let items = [];
      if (SPEC.workspace === 'grid') items = state.grid.layers.map(function(layer) { return layer + (layer === state.grid.selectedLayer ? ' •' : ''); });
      else if (SPEC.workspace === 'timeline') items = state.timeline.tracks.map(function(track) { return track.name; });
      else if (SPEC.workspace === 'node') items = state.nodes.slice(0, 8).map(function(node) { return node.label; });
      else if (SPEC.workspace === 'table') items = state.tableColumns;
      else items = behavior.sampleAssets;
      list.innerHTML = items.slice(0, 10).map(function(item) { return '<div class="mini-item">' + escapeText(item) + '</div>'; }).join('');
    }

    function renderRuntimeSummary() {
      const summary = document.getElementById('runtimeSummary');
      if (summary) summary.textContent = behavior.workspaceHint + ': ' + behavior.primaryMutation + '. Actions used: ' + state.actionHistory.length + '.';
    }

    function drawGrid(ctx, width, height) {
      ctx.strokeStyle = 'rgba(127,127,127,.16)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for (let y = 0; y < height; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    }

    function drawCells(ctx, width, height) {
      const cell = Math.min(width / state.grid.cols, height / state.grid.rows);
      state.grid.cells.forEach(function(cellData) { ctx.fillStyle = cellData.collision ? 'rgba(244,71,71,.72)' : cellData.color; ctx.fillRect(cellData.x * cell, cellData.y * cell, Math.max(1, cell - 2), Math.max(1, cell - 2)); if (cellData.autotile) { ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.strokeRect(cellData.x * cell + 4, cellData.y * cell + 4, Math.max(1, cell - 10), Math.max(1, cell - 10)); } });
      if (state.grid.selectedCell) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(state.grid.selectedCell.x * cell, state.grid.selectedCell.y * cell, cell, cell); }
      drawCenteredText(ctx, SPEC.title + ' — ' + state.grid.mode, width / 2, height - 28);
    }

    function drawNodes(ctx) {
      ctx.lineWidth = 2;
      state.links.forEach(function(link) { const from = state.nodes.find(function(node) { return node.id === link.from; }); const to = state.nodes.find(function(node) { return node.id === link.to; }); if (!from || !to) return; ctx.strokeStyle = link.status === 'live' ? behavior.accent : 'rgba(78,201,176,.55)'; ctx.beginPath(); ctx.moveTo(from.x + 140, from.y + 34); ctx.bezierCurveTo(from.x + 205, from.y + 34, to.x - 70, to.y + 34, to.x, to.y + 34); ctx.stroke(); });
      state.nodes.forEach(function(node) { ctx.fillStyle = node.status === 'active' ? 'rgba(60,80,60,.95)' : 'rgba(45,45,45,.96)'; ctx.strokeStyle = node.id === state.selectedItem ? behavior.accent : 'rgba(255,255,255,.20)'; ctx.lineWidth = node.id === state.selectedItem ? 3 : 1; roundRect(ctx, node.x, node.y, 150, 68, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#dcdcaa'; ctx.font = '13px sans-serif'; ctx.fillText(String(node.label).slice(0, 20), node.x + 12, node.y + 24); ctx.fillStyle = '#999'; ctx.font = '11px sans-serif'; ctx.fillText(String(node.type || 'Node'), node.x + 12, node.y + 45); });
    }

    function drawTimeline(ctx, width, height) {
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(90, 24, width - 130, height - 48);
      state.timeline.tracks.forEach(function(track, idx) { const y = 54 + idx * 50; ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(90, y, width - 130, 28); ctx.fillStyle = '#c5c5c5'; ctx.fillText(track.name, 18, y + 18); });
      state.timeline.keyframes.forEach(function(keyframe) { const trackIndex = Math.max(0, state.timeline.tracks.findIndex(function(track) { return track.id === keyframe.track; })); const x = 90 + ((keyframe.time % 8000) / 8000) * (width - 130); const y = 59 + trackIndex * 50; ctx.fillStyle = keyframe.event ? '#f44747' : behavior.accent; ctx.fillRect(x, y, 10, 18); });
      const playX = 90 + ((state.timeline.playhead % 8000) / 8000) * (width - 130); ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(playX, 30); ctx.lineTo(playX, height - 20); ctx.stroke();
    }

    function renderTimelineRows() {
      const rows = document.getElementById('timelineRows');
      if (!rows) return;
      rows.innerHTML = state.timeline.tracks.map(function(track) { const dots = state.timeline.keyframes.filter(function(key) { return key.track === track.id; }).map(function(key) { return '<span class="timeline-dot" style="left:' + Math.min(95, (key.time % 8000) / 80) + '%"></span>'; }).join(''); return '<div class="timeline-row">' + escapeText(track.name) + dots + '</div>'; }).join('');
    }

    function drawPreview(ctx, width, height) {
      const cx = width / 2; const cy = height / 2; const radius = Math.min(width, height) * (0.18 + state.preview.intensity / 420); const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 1.9); gradient.addColorStop(0, hexToRgba(behavior.accent, 0.86)); gradient.addColorStop(1, hexToRgba(behavior.accent, 0)); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
      state.preview.particles.forEach(function(particle) { ctx.fillStyle = particle.color; ctx.beginPath(); ctx.arc(particle.x % width, particle.y % height, particle.radius, 0, Math.PI * 2); ctx.fill(); });
      if (state.preview.overlay) { ctx.strokeStyle = 'rgba(255,255,255,.32)'; ctx.strokeRect(60, 50, width - 120, height - 100); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#c5c5c5'; ctx.font = '16px sans-serif'; ctx.fillText(SPEC.title + ' — ' + state.preview.mode, 24, 30);
      state.preview.metrics.slice(-5).forEach(function(metric, index) { ctx.fillStyle = colorForIndex(index + 3); ctx.fillRect(24 + index * 78, height - 36, Math.max(8, metric.value * 2), 12); });
    }

    function drawCenteredText(ctx, text, x, y) { ctx.fillStyle = '#c5c5c5'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, x, y); ctx.textAlign = 'left'; }
    function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    function handleCanvasPointerDown(event) {
      const canvas = event.currentTarget;
      const point = canvasPoint(canvas, event);
      if (SPEC.workspace === 'grid') {
        const cellSize = Math.min(canvas.width / state.grid.cols, canvas.height / state.grid.rows) * state.zoom;
        const x = Math.max(0, Math.min(state.grid.cols - 1, Math.floor(point.x / cellSize)));
        const y = Math.max(0, Math.min(state.grid.rows - 1, Math.floor(point.y / cellSize)));
        state.grid.selectedCell = { x: x, y: y };
        upsertCell(x, y, { payload: { index: state.actionHistory.length % 8 }, label: state.selectedTool, description: state.selectedTool }, state.selectedTool === 'erase' ? 'property' : state.grid.mode);
        updateSelection('Cell ' + x + ',' + y, { x: x, y: y, layer: state.grid.selectedLayer, mode: state.grid.mode });
        addLog('Canvas cell edit at ' + x + ',' + y + ' with ' + state.selectedTool);
        markDirty(); drawEditorState(); persistState();
      } else if (SPEC.workspace === 'node') {
        const node = hitNode(point.x / state.zoom, point.y / state.zoom);
        if (node) { dragNodeId = node.id; dragOffset = { x: point.x / state.zoom - node.x, y: point.y / state.zoom - node.y }; state.selectedItem = node.id; updateSelection(node.label, node); drawEditorState(); }
      } else if (SPEC.workspace === 'timeline') { state.timeline.playhead = Math.round((point.x / canvas.clientWidth) * 8000); addLog('Timeline scrubbed to ' + state.timeline.playhead + 'ms'); markDirty(); drawEditorState(); persistState(); }
      else if (SPEC.workspace === 'preview') { state.preview.overlay = !state.preview.overlay; generatePreviewSamples(SPEC.featureActions[state.actionHistory.length % SPEC.featureActions.length]); addLog('Preview canvas toggled overlay and generated samples.'); markDirty(); drawEditorState(); persistState(); }
    }

    function handleCanvasPointerMove(event) { if (!dragNodeId) return; const canvas = event.currentTarget; const point = canvasPoint(canvas, event); const node = state.nodes.find(function(entry) { return entry.id === dragNodeId; }); if (!node) return; node.x = point.x / state.zoom - dragOffset.x; node.y = point.y / state.zoom - dragOffset.y; updateSelection(node.label, node); markDirty(); drawEditorState(); }
    function handleCanvasPointerUp() { if (dragNodeId) { addLog('Node dragged: ' + dragNodeId); dragNodeId = ''; persistState(); } }
    function hitNode(x, y) { for (let i = state.nodes.length - 1; i >= 0; i -= 1) { const node = state.nodes[i]; if (x >= node.x && x <= node.x + 150 && y >= node.y && y <= node.y + 68) return node; } return undefined; }
    function canvasPoint(canvas, event) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) }; }

    function wireTableCells() { document.querySelectorAll('#dataGrid td').forEach(function(cell) { cell.addEventListener('input', function() { syncTableFromDom(); markDirty(); updateExportPreview(); persistState(); }); cell.addEventListener('focus', function() { updateSelection('Cell edit', { value: cell.textContent || '' }); }); }); }
    function slug(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'; }
    function escapeText(value) { return String(value === undefined ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function colorForIndex(index) { const colors = ['rgba(78,201,176,.70)', 'rgba(86,156,214,.70)', 'rgba(197,134,192,.70)', 'rgba(244,71,71,.70)', 'rgba(220,220,170,.70)', 'rgba(181,206,168,.70)', 'rgba(206,145,120,.70)', 'rgba(215,186,125,.70)']; return colors[Math.abs(index) % colors.length]; }
    function hexToRgba(hex, alpha) { const clean = String(hex || '#4ec9b0').replace('#', ''); const r = parseInt(clean.slice(0, 2), 16) || 78; const g = parseInt(clean.slice(2, 4), 16) || 201; const b = parseInt(clean.slice(4, 6), 16) || 176; return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'; }
    function seededNoise(a, b) { const x = Math.sin(a * 12.9898 + b * 78.233 + SPEC.id.length) * 43758.5453; return x - Math.floor(x); }

    document.querySelectorAll('[data-tool]').forEach(function(button) { button.addEventListener('click', function() { setTool(button.dataset.tool); markDirty(); }); });
    document.querySelectorAll('[data-field]').forEach(function(field) { field.addEventListener('input', function() { readFields(); markDirty(); persistState(); updateExportPreview(); }); });
    document.querySelectorAll('[data-export-format]').forEach(function(button) { button.addEventListener('click', function() { exportFormat(button.dataset.exportFormat); }); });
    document.querySelectorAll('[data-feature-action]').forEach(function(button) { button.addEventListener('click', function() { handleFeatureAction(button.dataset.featureAction); }); });
    document.querySelectorAll('[data-action]').forEach(function(button) { button.addEventListener('click', function() { const action = button.dataset.action; if (action === 'save' || action === 'export') exportFormat(SPEC.exports[0] || 'json'); else if (action === 'import') { handleFeatureAction(SPEC.featureActions[0].id); vscode.postMessage({ type: 'info', message: SPEC.title + ': sample import applied to interactive state.' }); } else if (action === 'reset') resetPanel(); else if (action === 'grid') { state.gridEnabled = !state.gridEnabled; button.classList.toggle('active', state.gridEnabled); drawEditorState(); persistState(); markDirty(); } else if (action === 'zoomIn') updateZoom(0.1); else if (action === 'zoomOut') updateZoom(-0.1); }); });
    document.querySelectorAll('[data-panel-op]').forEach(function(button) { button.addEventListener('click', function() { const op = String(button.dataset.panelOp || '').toLowerCase(); const action = SPEC.featureActions.find(function(entry) { return entry.payload.mode.toLowerCase().indexOf(op) >= 0; }) || SPEC.featureActions[state.actionHistory.length % SPEC.featureActions.length]; handleFeatureAction(action.id); }); });

    const brushSize = document.getElementById('brushSize'); if (brushSize) brushSize.addEventListener('input', function() { state.grid.brushSize = Number(brushSize.value); markDirty(); drawEditorState(); persistState(); });
    const modeSelect = document.getElementById('modeSelect'); if (modeSelect) modeSelect.addEventListener('change', function() { state.grid.mode = modeSelect.value; markDirty(); drawEditorState(); persistState(); });
    const playheadSlider = document.getElementById('playheadSlider'); if (playheadSlider) playheadSlider.addEventListener('input', function() { state.timeline.playhead = Number(playheadSlider.value); markDirty(); drawEditorState(); persistState(); });
    const easingSelect = document.getElementById('easingSelect'); if (easingSelect) easingSelect.addEventListener('change', function() { state.timeline.easing = easingSelect.value; markDirty(); drawEditorState(); persistState(); });
    const tableFilter = document.getElementById('tableFilter'); if (tableFilter) tableFilter.addEventListener('input', function() { filterTable(tableFilter.value); renderDataTable(); markDirty(); updateExportPreview(); persistState(); });
    const previewIntensity = document.getElementById('previewIntensity'); if (previewIntensity) previewIntensity.addEventListener('input', function() { state.preview.intensity = Number(previewIntensity.value); markDirty(); drawEditorState(); persistState(); });
    const previewSeed = document.getElementById('previewSeed'); if (previewSeed) previewSeed.addEventListener('input', function() { state.preview.seed = Number(previewSeed.value); markDirty(); drawEditorState(); persistState(); });
    const previewOverlay = document.getElementById('previewOverlay'); if (previewOverlay) previewOverlay.addEventListener('change', function() { state.preview.overlay = previewOverlay.checked; markDirty(); drawEditorState(); persistState(); });
    const documentSearch = document.getElementById('documentSearch'); if (documentSearch) documentSearch.addEventListener('input', function() { state.document.search = documentSearch.value; addLog('Document search: ' + state.document.search); updateSelection('Search', { query: state.document.search }); updateExportPreview(); });
    const canvas = document.getElementById('editorCanvas'); if (canvas) { canvas.addEventListener('pointerdown', handleCanvasPointerDown); canvas.addEventListener('pointermove', handleCanvasPointerMove); window.addEventListener('pointerup', handleCanvasPointerUp); }
    const source = document.getElementById('documentSource'); if (source) { state.document.source = state.document.source || buildExport(SPEC.exports.includes('lua') ? 'lua' : (SPEC.exports[0] || 'json')); source.value = state.document.source; source.addEventListener('input', function() { syncDocumentFromDom(); markDirty(); updateExportPreview(); persistState(); }); }
    wireTableCells();

    document.addEventListener('keydown', function(event) { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); exportFormat(SPEC.exports[0] || 'json'); } if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && event.shiftKey) { event.preventDefault(); copyDefault(); } if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') { event.preventDefault(); insertDefault(); } if (event.key === '+') updateZoom(0.1); if (event.key === '-') updateZoom(-0.1); const targetName = String(event.target.tagName || ''); if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(targetName) >= 0) return; const match = SPEC.tools.find(function(tool) { return tool.shortcut && tool.shortcut.toLowerCase() === event.key.toLowerCase(); }); if (match) setTool(match.id); const number = Number(event.key); if (number >= 1 && number <= 8 && SPEC.featureActions[number - 1]) handleFeatureAction(SPEC.featureActions[number - 1].id); });
    window.addEventListener('message', function(event) { if (event.data && event.data.type === 'markClean') markClean(); if (event.data && event.data.type === 'requestState') persistState(); });

    setTool(state.selectedTool);
    updateZoom(0);
    drawEditorState();
    addLog('Interactive feature actions ready: ' + SPEC.featureActions.length + ' clickable actions.');
  `;
}

function clientScript(): string {
  return `
    const state = {
      dirty: false,
      zoom: Number(PERSISTED_STATE.zoom || 1),
      selectedTool: PERSISTED_STATE.selectedTool || (SPEC.tools[0] && SPEC.tools[0].id) || 'select',
      selectedItem: PERSISTED_STATE.selectedItem || '',
      gridEnabled: PERSISTED_STATE.gridEnabled !== false,
      fields: Object.assign({}, PERSISTED_STATE.fields || {}),
    };

    function markDirty() {
      state.dirty = true;
      document.getElementById('statusDirty').textContent = 'Dirty';
      vscode.postMessage({ type: 'stateChanged', dirty: true });
    }

    function markClean() {
      state.dirty = false;
      document.getElementById('statusDirty').textContent = 'Clean';
      vscode.postMessage({ type: 'stateChanged', dirty: false });
    }

    function persistState() {
      vscode.postMessage({ type: 'persistState', state });
    }

    function setTool(toolId) {
      state.selectedTool = toolId;
      document.querySelectorAll('[data-tool]').forEach((button) => button.classList.toggle('active', button.dataset.tool === toolId));
      const tool = SPEC.tools.find((entry) => entry.id === toolId);
      document.getElementById('statusTool').textContent = 'Tool: ' + (tool ? tool.label : toolId);
      persistState();
    }

    function updateZoom(delta) {
      state.zoom = Math.max(0.25, Math.min(4, state.zoom + delta));
      document.getElementById('statusZoom').textContent = 'Zoom: ' + Math.round(state.zoom * 100) + '%';
      drawCanvas();
      persistState();
    }

    function readFields() {
      const values = {};
      document.querySelectorAll('[data-field]').forEach((field) => {
        if (field.type === 'checkbox') values[field.dataset.field] = field.checked;
        else values[field.dataset.field] = field.value;
      });
      state.fields = values;
      return values;
    }

    function generatedPayload() {
      const fields = readFields();
      const table = Array.from(document.querySelectorAll('#dataGrid tbody tr')).map((row) => Array.from(row.children).map((cell) => cell.textContent || ''));
      return {
        id: SPEC.id,
        title: SPEC.title,
        namespace: SPEC.apiNamespace,
        format: SPEC.nativeFormat,
        reference: SPEC.reference,
        useCase: SPEC.useCase,
        vision: SPEC.vision,
        featureList: SPEC.featureList || [],
        fields,
        tool: state.selectedTool,
        workspace: SPEC.workspace,
        nodes: SPEC.nodes || [],
        links: SPEC.links || [],
        table,
      };
    }

    function buildExport(format) {
      const payload = generatedPayload();
      if (format === 'json') return JSON.stringify(payload, null, 2) + '\\n';
      if (format === 'toml') {
        return '# Generated by Lurek2D ' + SPEC.title + '\\n'
          + 'id = "' + SPEC.id + '"\\n'
          + 'namespace = "' + SPEC.apiNamespace + '"\\n'
          + 'native_format = "' + SPEC.nativeFormat.replace(/"/g, '\\\"') + '"\\n'
          + 'reference = ' + tomlValue(payload.reference) + '\\n'
          + 'use_case = ' + tomlValue(payload.useCase) + '\\n'
          + 'vision = ' + tomlValue(payload.vision) + '\\n'
          + 'feature_list = ' + tomlArray(payload.featureList) + '\\n'
          + 'selected_tool = "' + state.selectedTool + '"\\n\\n'
          + '[fields]\\n'
          + Object.entries(payload.fields).map(([key, value]) => key + ' = ' + tomlValue(value)).join('\\n')
          + '\\n';
      }
      if (format === 'css') {
        return ':root {\\n'
          + '  --lurek-editor-id: "' + SPEC.id + '";\\n'
          + '  --lurek-accent: #4ec9b0;\\n'
          + '}\\n\\n'
          + '.lurek-' + SPEC.id.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ' {\\n'
          + '  color: var(--lurek-accent);\\n'
          + '}\\n';
      }
      if (format === 'wgsl') {
        return '// Generated by Lurek2D ' + SPEC.title + '\\n'
          + '// Reference: ' + SPEC.reference + '\\n'
          + '// Use case: ' + SPEC.useCase + '\\n'
          + '@fragment\\nfn fs_main() -> @location(0) vec4<f32> {\\n'
          + '  return vec4<f32>(0.30, 0.78, 0.69, 1.0);\\n}\\n';
      }
      return '-- Generated by Lurek2D ' + SPEC.title + '\\n'
        + '-- Compatible namespace: ' + SPEC.apiNamespace + '\\n'
        + 'return {\\n'
        + '  id = "' + SPEC.id + '",\\n'
        + '  namespace = "' + SPEC.apiNamespace + '",\\n'
        + '  native_format = "' + SPEC.nativeFormat.replace(/"/g, '\\\"') + '",\\n'
        + '  reference = ' + luaValue(payload.reference, 2) + ',\\n'
        + '  use_case = ' + luaValue(payload.useCase, 2) + ',\\n'
        + '  vision = ' + luaValue(payload.vision, 2) + ',\\n'
        + '  feature_list = ' + luaArray(payload.featureList, 2) + ',\\n'
        + '  selected_tool = "' + state.selectedTool + '",\\n'
        + '  fields = ' + luaTable(payload.fields, 2) + ',\\n'
        + '  nodes = ' + luaArray(payload.nodes, 2) + ',\\n'
        + '  links = ' + luaArray(payload.links, 2) + ',\\n'
        + '}\\n';
      }

    function tomlValue(value) {
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'number' || /^-?\\d+(\\.\\d+)?$/.test(String(value))) return String(value);
      return '"' + String(value).replace(/"/g, '\\\"') + '"';
    }

    function tomlArray(values) {
      return '[' + (values || []).map((value) => tomlValue(value)).join(', ') + ']';
    }

    function luaValue(value, indent) {
      if (value === null || value === undefined) return 'nil';
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'number') return String(value);
      if (Array.isArray(value)) return luaArray(value, indent);
      if (typeof value === 'object') return luaTable(value, indent);
      return '"' + String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\\"') + '"';
    }

    function luaTable(value, indent) {
      const pad = ' '.repeat(indent);
      const next = ' '.repeat(indent + 2);
      const entries = Object.entries(value || {});
      if (!entries.length) return '{}';
      return '{\\n' + entries.map(([key, val]) => next + key + ' = ' + luaValue(val, indent + 2)).join(',\\n') + '\\n' + pad + '}';
    }

    function luaArray(value, indent) {
      const pad = ' '.repeat(indent);
      const next = ' '.repeat(indent + 2);
      if (!value || !value.length) return '{}';
      return '{\\n' + value.map((entry) => next + luaValue(entry, indent + 2)).join(',\\n') + '\\n' + pad + '}';
    }

    function exportFormat(format) {
      const content = buildExport(format);
      vscode.postMessage({ type: 'export', format, content, fileName: SPEC.exportBaseName + '.' + format });
      markClean();
    }

    function copyDefault() {
      const format = SPEC.exports[0] || 'json';
      vscode.postMessage({ type: 'copy', text: buildExport(format) });
    }

    function insertDefault() {
      const format = SPEC.exports.includes('lua') ? 'lua' : (SPEC.exports[0] || 'json');
      vscode.postMessage({ type: 'insert', text: buildExport(format) });
    }

    function resetPanel() {
      document.querySelectorAll('[data-field]').forEach((field) => {
        if (field.type === 'checkbox') field.checked = true;
      });
      state.selectedTool = (SPEC.tools[0] && SPEC.tools[0].id) || 'select';
      state.zoom = 1;
      setTool(state.selectedTool);
      drawCanvas();
      markDirty();
    }

    function drawCanvas() {
      const canvas = document.getElementById('editorCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(state.zoom, state.zoom);
      drawGrid(ctx, width / state.zoom, height / state.zoom);
      if (SPEC.workspace === 'node') drawNodes(ctx);
      else if (SPEC.workspace === 'timeline') drawTimeline(ctx, width / state.zoom, height / state.zoom);
      else if (SPEC.workspace === 'preview') drawPreview(ctx, width / state.zoom, height / state.zoom);
      else drawCells(ctx, width / state.zoom, height / state.zoom);
      ctx.restore();
    }

    function drawGrid(ctx, width, height) {
      if (!state.gridEnabled) return;
      ctx.strokeStyle = 'rgba(127,127,127,.16)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for (let y = 0; y < height; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    }

    function drawCells(ctx, width, height) {
      const cols = 10;
      const rows = 6;
      const cell = Math.min(width / (cols + 2), height / (rows + 2));
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(78,201,176,.55)' : 'rgba(86,156,214,.45)';
          ctx.fillRect(cell + x * cell, cell + y * cell, cell - 3, cell - 3);
        }
      }
      drawCenteredText(ctx, SPEC.title, width / 2, height - 36);
    }

    function drawNodes(ctx) {
      const nodes = SPEC.nodes || [];
      const links = SPEC.links || [];
      ctx.lineWidth = 2;
      links.forEach((link) => {
        const from = nodes.find((node) => node.id === link.from);
        const to = nodes.find((node) => node.id === link.to);
        if (!from || !to) return;
        ctx.strokeStyle = 'rgba(78,201,176,.7)';
        ctx.beginPath();
        ctx.moveTo(from.x + 120, from.y + 32);
        ctx.bezierCurveTo(from.x + 190, from.y + 32, to.x - 70, to.y + 32, to.x, to.y + 32);
        ctx.stroke();
      });
      nodes.forEach((node) => {
        ctx.fillStyle = 'rgba(45,45,45,.95)';
        ctx.strokeStyle = node.id === state.selectedItem ? '#4ec9b0' : 'rgba(255,255,255,.18)';
        ctx.lineWidth = node.id === state.selectedItem ? 3 : 1;
        roundRect(ctx, node.x, node.y, 140, 64, 8);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#dcdcaa';
        ctx.font = '13px sans-serif';
        ctx.fillText(node.label, node.x + 12, node.y + 24);
        ctx.fillStyle = '#999';
        ctx.font = '11px sans-serif';
        ctx.fillText(node.type, node.x + 12, node.y + 45);
      });
    }

    function drawTimeline(ctx, width, height) {
      const tracks = ['Animation', 'Audio', 'Events', 'Camera'];
      tracks.forEach((track, idx) => {
        const y = 54 + idx * 58;
        ctx.fillStyle = 'rgba(255,255,255,.06)';
        ctx.fillRect(90, y, width - 130, 28);
        ctx.fillStyle = '#c5c5c5';
        ctx.fillText(track, 18, y + 18);
        ctx.fillStyle = '#4ec9b0';
        [0.18, 0.42, 0.73].forEach((pos) => ctx.fillRect(90 + (width - 130) * pos, y + 5, 10, 18));
      });
    }

    function drawPreview(ctx, width, height) {
      const cx = width / 2;
      const cy = height / 2;
      const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.min(width, height) * 0.38);
      gradient.addColorStop(0, 'rgba(78,201,176,.8)');
      gradient.addColorStop(1, 'rgba(78,201,176,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255,255,255,.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(width, height) * 0.23, 0, Math.PI * 2);
      ctx.stroke();
      drawCenteredText(ctx, SPEC.title + ' Preview', cx, cy);
    }

    function drawCenteredText(ctx, text, x, y) {
      ctx.fillStyle = '#c5c5c5';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, x, y);
      ctx.textAlign = 'left';
    }

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    document.querySelectorAll('[data-tool]').forEach((button) => button.addEventListener('click', () => { setTool(button.dataset.tool); markDirty(); }));
    document.querySelectorAll('[data-field]').forEach((field) => field.addEventListener('input', () => { readFields(); markDirty(); persistState(); }));
    document.querySelectorAll('[data-export-format]').forEach((button) => button.addEventListener('click', () => exportFormat(button.dataset.exportFormat)));
    document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'save' || action === 'export') exportFormat(SPEC.exports[0] || 'json');
      else if (action === 'import') vscode.postMessage({ type: 'info', message: SPEC.title + ': import is ready for project data.' });
      else if (action === 'reset') resetPanel();
      else if (action === 'grid') { state.gridEnabled = !state.gridEnabled; button.classList.toggle('active', state.gridEnabled); drawCanvas(); persistState(); }
      else if (action === 'zoomIn') updateZoom(0.1);
      else if (action === 'zoomOut') updateZoom(-0.1);
    }));

    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); exportFormat(SPEC.exports[0] || 'json'); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && event.shiftKey) { event.preventDefault(); copyDefault(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') { event.preventDefault(); insertDefault(); }
      if (event.key === '+') updateZoom(0.1);
      if (event.key === '-') updateZoom(-0.1);
      const match = SPEC.tools.find((tool) => tool.shortcut && tool.shortcut.toLowerCase() === event.key.toLowerCase());
      if (match && !['INPUT', 'TEXTAREA', 'SELECT'].includes(String(event.target.tagName))) setTool(match.id);
    });

    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'markClean') markClean();
      if (event.data && event.data.type === 'requestState') persistState();
    });

    const source = document.getElementById('documentSource');
    if (source) source.value = buildExport(SPEC.exports.includes('lua') ? 'lua' : SPEC.exports[0]);
    document.querySelectorAll('#dataGrid td').forEach((cell) => cell.addEventListener('input', markDirty));
    const timelineRows = document.getElementById('timelineRows');
    if (timelineRows) timelineRows.innerHTML = ['Animation', 'Audio', 'Events', 'Camera'].map((name) => '<div class="timeline-row" title="' + name + '"></div>').join('');
    setTool(state.selectedTool);
    updateZoom(0);
    drawCanvas();
  `;
}

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function escapeScriptJson(value: string): string {
  return value.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
