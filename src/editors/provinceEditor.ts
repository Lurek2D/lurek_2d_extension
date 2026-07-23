import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const provinceEditorSpec = defineEditorSpec({
  id: "province",
  command: "lurek.editor.province",
  viewType: "lurek.editor.province",
  title: "Province Editor",
  sidebarLabel: "Province Editor",
  icon: "map-filled",
  category: "map",
  workspace: "grid",
  reference: "Hearts of Iron IV Nudge Tool, Europa Universalis IV Mapper.",
  useCase: "Designing territorial map divisions for macro-management or grand-strategy games.",
  apiNamespace: "lurek.province",
  purpose: "Assign territorial metadata, province ownership, resources, adjacency, and heatmap overlays.",
  vision: "Distinct from the WorldMapEditor. Instead of points connected by lines, this uses polygon-based territory claiming integrated directly with the `lurek.province` system to handle wealth and population data visually.",
  nativeFormat: "province metadata TOML/Lua",
  exportBaseName: "province_map",
  exports: ["toml", "lua", "json"],
  featureList: [
    "Polygon border drawing tools and vertex snapping.",
    "Territory ownership color mapping.",
    "Resource and demographic metadata inputs (Population, Wealth).",
    "Automatic neighbor adjacency and border length calculation.",
    "Heatmap visualization toggles (e.g. viewing wealth distribution).",
    "Quick-select and bulk edit lasso tools.",
    "Export map data to indexed arrays for strategy calculation.",
    "Sea versus Land province boolean toggles.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "province" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.province" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Layers, coordinates, collision masks, and validation messages.",
});

export class ProvinceEditor {
  static readonly spec = provinceEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, provinceEditorSpec);
  }
}
