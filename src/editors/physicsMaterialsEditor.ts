import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const physicsMaterialsEditorSpec = defineEditorSpec({
  id: "physicsMaterials",
  command: "lurek.editor.physicsMaterials",
  viewType: "lurek.editor.physicsMaterials",
  title: "Physics Materials Editor",
  sidebarLabel: "Physics Materials",
  icon: "settings-gear",
  category: "data",
  workspace: "preview",
  reference: "Unity Physics Material 2D, Godot PhysicsMaterial.",
  useCase: "Managing physical parameters (friction, bounce) for environmental substances.",
  apiNamespace: "lurek.physics",
  purpose: "Configure density, friction, restitution, collision layers, and bounce simulation presets.",
  vision: "Separates physical collision logic from individual objects. Rather than an entity defining its own friction, it assigns itself an \"Ice\" material defined here, ensuring consistent `lurek.physics` behavior across the world.",
  nativeFormat: "physics materials Lua config",
  exportBaseName: "physics_materials",
  exports: ["lua", "json", "toml"],
  featureList: [
    "Density and mass configuration baseline sliders.",
    "Friction coefficient settings (static and dynamic separation).",
    "Restitution (bounciness) tuning and energy retention.",
    "Preset templates creation (e.g. Ice, Rubber, Metal).",
    "Visual bounce simulation sandbox.",
    "Layer collision matrix configuration (defining who collides with whom).",
    "Export material constants to global Lua tables.",
    "Continuous vs Discrete collision detection toggles.",
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
    { id: "sample", label: "Sample", icon: "$(eye)", shortcut: "S" },
    { id: "play", label: "Preview", icon: "$(play)", shortcut: "Space" },
    { id: "tune", label: "Tune", icon: "$(settings-gear)", shortcut: "T" },
  ],
  inspector: [
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "physics" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.physics" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Preview telemetry, sample output, and performance notes.",
});

export class PhysicsMaterialsEditor {
  static readonly spec = physicsMaterialsEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, physicsMaterialsEditorSpec);
  }
}
