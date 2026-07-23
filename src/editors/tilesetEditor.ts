import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const tilesetEditorSpec = defineEditorSpec({
  id: "tileset",
  command: "lurek.editor.tileset",
  viewType: "lurek.editor.tileset",
  title: "Tileset Editor",
  sidebarLabel: "Tileset Editor",
  icon: "layers",
  category: "map",
  workspace: "grid",
  reference: "Tiled Tileset Editor, RPG Maker Tileset Manager.",
  useCase: "Preparing graphic sheets and marking individual tiles before actual usage in the TileMapEditor.",
  apiNamespace: "lurek.tilemap",
  purpose: "Prepare source tilesets with grid slicing, collision polygons, terrain masks, animation, and tags.",
  vision: "Strictly decoupled from map painting. This editor exists purely to define the \"source material\" for `lurek.tilemap`. By defining collision polygons and terrain tags here, the TileMapEditor can remain focused solely on painting grids.",
  nativeFormat: "tileset JSON metadata",
  exportBaseName: "tileset",
  exports: ["json", "lua"],
  featureList: [
    "Grid dimension definition and offset spacing controls.",
    "Solid and one-way collision polygon drawing per specific tile.",
    "Terrain mask and bitmask rule configuration for auto-tiling logic.",
    "Animation sequence linking for defining animated tiles (e.g., water).",
    "Custom tag assignment (e.g. 'water_type', 'slippery_ice').",
    "Precision zoom and pan tools for pixel-perfect slicing.",
    "Bulk tile property editing via marquee selection.",
    "Export to structured tileset JSON referencing the source image.",
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

export class TilesetEditor {
  static readonly spec = tilesetEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, tilesetEditorSpec);
  }
}
