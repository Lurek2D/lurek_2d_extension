# Lurek2D VS Code Editor Panels

## Purpose

This document describes the active visual editor panel system used by the Lurek2D VS Code extension. These panels are launched from the Lurek2D sidebar and command palette. They are not file-based VS Code custom editors.

The panels are interactive webviews. They are not static descriptions of the guide: every panel renders eight clickable feature-action cards, one for each recreation-guide feature. Clicking a card changes panel state, redraws the workspace, updates live inspector data, writes a log entry, marks the editor dirty, and refreshes the generated export preview.

## Source of truth

The concrete files in `../src/editors/*Editor.ts` are the source of truth for editor panel metadata. Each file exports a local `<id>EditorSpec = defineEditorSpec({ ... })` that contains guide-derived fields:

- command id,
- panel title,
- sidebar label,
- VS Code icon,
- category,
- workspace type,
- target `lurek.*` namespace,
- reference / inspiration,
- use case,
- vision,
- native export format,
- the exact eight guide feature bullets,
- toolbar actions,
- left tools,
- right inspector fields,
- validation text,
- export formats.

`../src/editors/editorFactory.ts` derives typed `featureActions` from the guide feature list. `../src/editors/panelHost.ts` renders those actions as `data-feature-action` buttons and routes them into workspace-specific behavior handlers.

`../src/editors/catalog.ts` is an aggregator only: it imports the local `*EditorSpec` constants, exports `EDITOR_CATALOG`, and performs uniqueness/required-field validation. Runtime panel creation is handled by `../src/editors/panelHost.ts`. All concrete editor classes are imported by `../src/editors/implementations.ts` for command registration.

## Common layout contract

Every panel follows the same layout:

1. **Top toolbar** — document-level actions such as Save, Import, Export, Reset, Grid, and Zoom.
2. **Left tool rail** — mode/tool picker for select, brush, node, link, row, keyframe, preview, or validation operations.
3. **Central workspace** — canvas, node graph, table, document source, preview, or timeline area.
4. **Right inspector** — selected item properties and runtime binding fields.
5. **Bottom output panel** — validation, traces, row errors, generated source notes, or preview telemetry.
6. **Status bar** — category, workspace mode, active tool, zoom, dirty state, and native output format.

Interactive runtime behavior is shared but stateful:

- **Grid/map panels** support cell painting, brush size, layers, flood/stamp/collision/property modes, and coordinate-aware inspector output.
- **Node/graph panels** support adding, selecting, dragging, connecting, grouping, arranging, validating, and simulating nodes.
- **Table/data panels** support editable rows/cells, derived columns, filters, formulas, metrics, validation markers, and import/export-style actions.
- **Timeline panels** support tracks, keyframes, playhead scrubbing, easing metadata, waveform/event rows, nested sequence markers, and play/pause state.
- **Preview/asset panels** support generated samples, overlays, sliders, seed/intensity controls, metrics, snapshots, and simulation toggles.
- **Document panels** support editable generated source, search/filter/copy/insert/validate/style/export actions, and source-state serialization.

Exports include `featureActions`, `actionHistory`, and serialized `editorState` in addition to editor identity and target `lurek.*` namespace.

The webview HTML must include a Content Security Policy meta tag. Scripts and styles are nonce-scoped. External network loads are forbidden.

## Panel groups

### Map and world panels

| Panel | Command | Namespace | Native output |
|---|---|---|---|
| Tile Map Editor | `lurek.editor.tileMap` | `lurek.tilemap` | `.ltm Lua/TOML tilemap data` |
| Tileset Editor | `lurek.editor.tileset` | `lurek.tilemap` | `tileset JSON metadata` |
| Tilemap Script Editor | `lurek.editor.tilemapScript` | `lurek.event` | `tile trigger Lua script` |
| World Map Editor | `lurek.editor.worldMap` | `lurek.pathfind` | `world graph JSON/Lua` |
| Province Editor | `lurek.editor.province` | `lurek.province` | `province metadata TOML/Lua` |
| Globe Editor | `lurek.editor.globe` | `lurek.globe` | `globe setup Lua data` |
| Procedural Map Generator | `lurek.editor.procMap` | `lurek.procgen` | `procgen rules Lua/TOML` |
| NavMesh Editor | `lurek.editor.navMesh` | `lurek.pathfind` | `navmesh polygon Lua data` |

### Node and graph panels

| Panel | Command | Namespace | Native output |
|---|---|---|---|
| Scene Flow Editor | `lurek.editor.sceneFlow` | `lurek.scene` | `scene flow Lua graph` |
| Dialog Editor | `lurek.editor.dialog` | `lurek.ai` | `dialogue graph Lua data` |
| Quest Tree Editor | `lurek.editor.questTree` | `lurek.save` | `quest graph Lua data` |
| AI Behavior Tree Editor | `lurek.editor.aiBehavior` | `lurek.ai` | `behavior tree Lua graph` |
| Graph Editor | `lurek.editor.graph` | `lurek.graph` | `generic graph Lua data` |
| Sound DSP Panel | `lurek.editor.soundDsp` | `lurek.audio` | `audio DSP chain JSON` |
| Visual Shader Editor | `lurek.editor.visualShader` | `lurek.pipeline` | `visual shader graph plus WGSL` |
| Network Topology Editor | `lurek.editor.networkTopology` | `lurek.network` | `network manifest JSON/Lua` |

### Asset and visual panels

| Panel | Command | Namespace | Native output |
|---|---|---|---|
| Pixel Art Editor | `lurek.editor.pixelArt` | `lurek.image` | `indexed pixel JSON plus Lua loader` |
| Particle Designer | `lurek.editor.particle` | `lurek.particle` | `particle emitter Lua config` |
| Sprite Animation Editor | `lurek.editor.spriteAnim` | `lurek.animation` | `sprite animation Lua data` |
| Shader Preview | `lurek.editor.shaderPreview` | `lurek.compute` | `WGSL shader file` |
| Voxel Editor | `lurek.editor.voxel` | `lurek.raycaster` | `voxel slice JSON/Lua` |
| Skeleton Rigging Editor | `lurek.editor.skeletonRigging` | `lurek.spine` | `spine-compatible rig Lua data` |
| Lighting Environment Editor | `lurek.editor.lightingEnvironment` | `lurek.light` | `lighting environment Lua config` |
| PostFX Overlay Designer | `lurek.editor.postfxOverlay` | `lurek.effect` | `postfx preset Lua data` |
| Color Palette Editor | `lurek.editor.colorPalette` | `lurek.render` | `palette JSON/Lua table` |
| Font Preview Editor | `lurek.editor.fontPreview` | `lurek.render` | `font render profile JSON` |

### UI, data, and system panels

| Panel | Command | Namespace | Native output |
|---|---|---|---|
| GUI Widget Editor | `lurek.editor.guiWidget` | `lurek.ui` | `UI layout data` |
| GUI Theme Editor | `lurek.editor.guiTheme` | `lurek.ui` | `UI theme data` |
| Database Editor | `lurek.editor.database` | `lurek.dataframe` | `dataframe JSON/CSV-friendly table` |
| Input Mapper | `lurek.editor.inputMapper` | `lurek.input` | `input mapping TOML` |
| Localization Editor | `lurek.editor.localization` | `lurek.i18n` | `.locale.json dictionary` |
| Physics Materials Editor | `lurek.editor.physicsMaterials` | `lurek.physics` | `physics materials Lua config` |
| Audio Mixer | `lurek.editor.audioMixer` | `lurek.audio` | `audio mixer Lua config` |
| Global Autoload Editor | `lurek.editor.globalAutoload` | `lurek.scene` | `autoload TOML/Lua config` |
| Asset Manifest Editor | `lurek.editor.assetManifest` | `lurek.filesystem` | `asset manifest TOML/JSON` |
| Performance Profiler | `lurek.editor.performanceProfiler` | `lurek.devtools` | `profiler snapshot JSON` |
| Project Export Editor | `lurek.editor.projectExport` | `lurek.engine` | `project export TOML` |
| Test Runner | `lurek.editor.testRunner` | `lurek.devtools` | `test run manifest JSON` |
| API Reference | `lurek.editor.apiReference` | `lurek.docs` | `documentation browser state` |

## Active implementation files

Each panel has a `src/editors/*Editor.ts` class file. These files own their local spec object, expose the static class `spec`, and call `openEditorSpec(context, <id>EditorSpec)` to use the shared webview host. There is no `src/editors_legacy/` backup directory in the active extension source.

## Verification

Run from `extension/vscode/`:

- `npm run build`
- `npm test`
- `npm run package`

The test suite includes local-spec file, catalog aggregation, manifest, sidebar, webview security, interactive feature-action rendering, runtime handler/export wiring, behavior-profile coverage, and legacy-directory/import checks.
