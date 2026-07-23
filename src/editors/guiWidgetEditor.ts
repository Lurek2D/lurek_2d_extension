import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const guiWidgetEditorSpec = defineEditorSpec({
  id: "guiWidget",
  command: "lurek.editor.guiWidget",
  viewType: "lurek.editor.guiWidget",
  title: "GUI Widget Editor",
  sidebarLabel: "GUI Widget Editor",
  icon: "symbol-interface",
  category: "ui",
  workspace: "document",
  reference: "Figma, Godot Control Nodes, Unity UI Builder.",
  useCase: "Visually designing and composing user interfaces (UI/HUD, inventory windows, health bars, menus).",
  apiNamespace: "lurek.html",
  purpose: "Design HUD and menu structures using HTML/CSS-friendly layout controls and inspector properties.",
  vision: "Focuses purely on screen-space anchors and relative positioning using standard web technologies. It provides a visual builder so developers don't have to guess X/Y pixel coordinates in code, letting `lurek.html` natively render the resulting layouts.",
  nativeFormat: "HTML/CSS UI layout",
  exportBaseName: "gui_widget",
  exports: ["lua", "json", "css"],
  featureList: [
    "Drag-and-drop UI component canvas (Divs, Text, Buttons).",
    "Screen anchor and alignment snapping features.",
    "Margin, padding, and Flexbox properties inspector.",
    "Font and text styling CSS overrides.",
    "TOML to CSS translation property panel.",
    "Z-index layer management for overlapping HUD elements.",
    "Hover and click active state simulation previews.",
    "Responsive scaling simulation across various aspect ratios.",
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

export class GuiWidgetEditor {
  static readonly spec = guiWidgetEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, guiWidgetEditorSpec);
  }
}
