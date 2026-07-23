import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const colorPaletteEditorSpec = defineEditorSpec({
  id: "colorPalette",
  command: "lurek.editor.colorPalette",
  viewType: "lurek.editor.colorPalette",
  title: "Color Palette Editor",
  sidebarLabel: "Color Palette",
  icon: "symbol-color",
  category: "asset",
  workspace: "table",
  reference: "Lospec Palette Viewer, Adobe Color.",
  useCase: "Establishing a global system of predefined colors and gradients for cohesive aesthetics.",
  apiNamespace: "lurek.render",
  purpose: "Manage semantic colors, gradients, accessibility contrast, palette imports, and Lua constants.",
  vision: "Enforces strict art direction. Instead of developers guessing hex codes, this editor ensures they reference semantic names mapped to `lurek.render`, allowing for one-click color blindness mode swaps.",
  nativeFormat: "palette JSON/Lua table",
  exportBaseName: "color_palette",
  exports: ["json", "lua"],
  featureList: [
    "Hex, RGB, and HSL color picker wheels and sliders.",
    "Semantic color swatch saving and naming (e.g. 'Enemy_Blood').",
    "Mathematical gradient interpolation generator.",
    "Color contrast and accessibility ratio checker.",
    "Dynamic theme swapping configurations (Light Mode / Dark Mode).",
    "Auto-generation of complementary, analogous, and triadic colors.",
    "Export palettes to global Lua tables.",
    "Import functionality from standard `.gpl` palette formats.",
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
    { id: "row", label: "Add Row", icon: "$(add)", shortcut: "R" },
    { id: "column", label: "Add Column", icon: "$(list-flat)", shortcut: "C" },
    { id: "validate", label: "Validate", icon: "$(check)", shortcut: "Shift+Enter" },
  ],
  inspector: [
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "render" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.render" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Row validation, import summary, and schema errors.",
  tableColumns: ["name", "hex", "role", "contrast", "notes"],
});

export class ColorPaletteEditor {
  static readonly spec = colorPaletteEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, colorPaletteEditorSpec);
  }
}
