import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const tileMapEditorSpec = defineEditorSpec({
  id: "tileMap",
  command: "lurek.editor.tileMap",
  viewType: "lurek.editor.tileMap",
  title: "Tile Map Editor",
  sidebarLabel: "Tile Map Editor",
  icon: "symbol-misc",
  category: "map",
  workspace: "grid",
  reference: "Tiled Map Editor, Godot TileMap Node.",
  useCase: "Designing and building 2D grid-based maps, levels, and environments manually.",
  apiNamespace: "lurek.tilemap",
  purpose: "Design deterministic hand-authored tile maps with layers, brushes, collision masks, and tile metadata.",
  vision: "This editor must strictly focus on deterministic, hand-crafted level design to distinguish itself from the ProcMapEditor. It should output an optimized spatial grid format (`.ltm`) that the `lurek.tilemap` namespace can immediately consume for culling and collision generation without extra parsing logic.",
  nativeFormat: ".ltm Lua/TOML tilemap data",
  exportBaseName: "tilemap",
  exports: ["lua", "toml", "json"],
  featureList: [
    "Layer management (add, delete, reorder) for parallax and depth sorting.",
    "Interactive tile palette selector fetching from defined Tilesets.",
    "Brush drawing tool with dynamic sizing.",
    "Flood fill algorithm for rapid area coloring.",
    "Stamp tool for saving and pasting multi-tile patterns (e.g., entire houses).",
    "Collision mask painting mode overlay.",
    "Auto-tiling support for seamless terrain generation on the fly.",
    "Custom property injection per tile for logical triggers.",
  ],
  toolbar: [
    { id: "save", label: "Save", kind: "primary", shortcut: "Ctrl+S" },
    { id: "import", label: "Import", kind: "secondary" },
    { id: "export", label: "Export", kind: "primary" },
    { id: "reset", label: "Reset", kind: "secondary" },
    { id: "grid", label: "Grid", kind: "toggle", shortcut: "G" },
    { id: "zoomIn", label: "Zoom In", kind: "secondary", shortcut: "+" },
    { id: "zoomOut", label: "Zoom Out", kind: "secondary", shortcut: "-" },
  ],
  tools: [
    { id: "select", label: "Select", icon: "$(cursor)", shortcut: "V" },
    { id: "brush", label: "Brush", icon: "$(edit)", shortcut: "B" },
    { id: "erase", label: "Erase", icon: "$(trash)", shortcut: "E" },
    { id: "fill", label: "Fill", icon: "$(paintcan)", shortcut: "F" },
    { id: "metadata", label: "Metadata", icon: "$(symbol-property)", shortcut: "M" },
  ],
  inspector: [
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "tilemap" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.tilemap" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Layers, coordinates, collision masks, and validation messages.",
});

export class TileMapEditor {
  static readonly spec = tileMapEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, tileMapEditorSpec);
  }
}
