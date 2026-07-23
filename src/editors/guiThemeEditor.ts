import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const guiThemeEditorSpec = defineEditorSpec({
  id: "guiTheme",
  command: "lurek.editor.guiTheme",
  viewType: "lurek.editor.guiTheme",
  title: "GUI Theme Editor",
  sidebarLabel: "GUI Theme Editor",
  icon: "symbol-color",
  category: "ui",
  workspace: "document",
  reference: "Godot Theme Editor.",
  useCase: "Establishing global CSS styling constants for all UI widgets.",
  apiNamespace: "lurek.html",
  purpose: "Create global CSS variables, widget states, nine-patch style rules, fonts, and UI gallery previews.",
  vision: "Separates UI layout (GuiWidgetEditor) from UI styling. Ensures that changing the \"Button\" color updates across the entire game immediately, preventing hardcoded styles.",
  nativeFormat: "global CSS theme",
  exportBaseName: "gui_theme",
  exports: ["css", "json", "lua"],
  featureList: [
    "Component-specific styling (Buttons, Sliders, TextBoxes).",
    "State configuration (Normal, Hover, Pressed, Disabled).",
    "Border radius, box-shadow, and stroke editing.",
    "Nine-patch scale configuration for UI panels.",
    "Custom font assignment and baseline shifting.",
    "CSS variable generation and overriding.",
    "Live preview across a sample \"UI Gallery\".",
    "Theme exporting to global `.css` files.",
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
    { id: "insert", label: "Insert", icon: "$(add)", shortcut: "I" },
    { id: "validate", label: "Validate", icon: "$(check)", shortcut: "Shift+Enter" },
    { id: "preview", label: "Preview", icon: "$(preview)", shortcut: "P" },
  ],
  inspector: [
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "html" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.html" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Generated source preview and documentation notes.",
});

export class GuiThemeEditor {
  static readonly spec = guiThemeEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, guiThemeEditorSpec);
  }
}
