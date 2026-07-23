import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const inputMapperEditorSpec = defineEditorSpec({
  id: "inputMapper",
  command: "lurek.editor.inputMapper",
  viewType: "lurek.editor.inputMapper",
  title: "Input Mapper",
  sidebarLabel: "Input Mapper",
  icon: "keyboard",
  category: "system",
  workspace: "table",
  reference: "Steam Input Configuration, Godot Input Map.",
  useCase: "Designing unified input mappings bound to virtual actions rather than specific hardware keys.",
  apiNamespace: "lurek.input",
  purpose: "Map virtual actions to keyboard, mouse, gamepad, chords, axes, and deadzone settings.",
  vision: "Completely separates physical hardware from game logic. It ensures that a script checks if a virtual action was triggered in `lurek.input`, while the editor handles whether that action means the Spacebar, a Gamepad 'A' button, or a screen tap.",
  nativeFormat: "input mapping TOML",
  exportBaseName: "input_map",
  exports: ["toml", "json", "lua"],
  featureList: [
    "Virtual action creation list (e.g. 'Jump', 'Shoot').",
    "Keyboard, mouse, and gamepad hardware sniffing and binding.",
    "Analog stick deadzone threshold curves and sensitivity sliders.",
    "Axis mapping converting hardware input to Vector2 math.",
    "Combo and chord definition (e.g., Shift + Space).",
    "Input conflict and overlapping binding warnings.",
    "Live input testing overlay visualizing controller states.",
    "Export to standardized config TOML.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "input" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.input" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Row validation, import summary, and schema errors.",
  tableColumns: ["action", "keyboard", "mouse", "gamepad", "deadzone"],
});

export class InputMapperEditor {
  static readonly spec = inputMapperEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, inputMapperEditorSpec);
  }
}
