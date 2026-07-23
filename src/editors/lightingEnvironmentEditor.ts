import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const lightingEnvironmentEditorSpec = defineEditorSpec({
  id: "lightingEnvironment",
  command: "lurek.editor.lightingEnvironment",
  viewType: "lurek.editor.lightingEnvironment",
  title: "Lighting Environment Editor",
  sidebarLabel: "Lighting Environment Editor",
  icon: "lightbulb",
  category: "asset",
  workspace: "preview",
  reference: "Godot WorldEnvironment, 2D Lights & Shadows.",
  useCase: "Configuring global ambient lighting, 2D shadows, and Global Illumination (GI).",
  apiNamespace: "lurek.light",
  purpose: "Tune ambient light, 2D lights, shadow casters, GI settings, fog, normal maps, and SDF bake options.",
  vision: "Elevates the 2D aesthetic by adding dynamic shadows and ambient occlusion. It shifts Lurek2D from flat pixel art to a modern 2D lit environment.",
  nativeFormat: "lighting environment Lua config",
  exportBaseName: "lighting_environment",
  exports: ["lua", "json", "toml"],
  featureList: [
    "Ambient light color and energy scaling.",
    "2D Point Light and Directional Light placement.",
    "Shadow caster polygon drawing tools.",
    "2D Global Illumination (GI) bounce intensity tuning.",
    "Normal map visualization for 2D sprites.",
    "Signed Distance Field (SDF) baking configuration.",
    "Light culling mask layer assignments.",
    "Volumetric fog/haze density sliders.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "light" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.light" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Preview telemetry, sample output, and performance notes.",
});

export class LightingEnvironmentEditor {
  static readonly spec = lightingEnvironmentEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, lightingEnvironmentEditorSpec);
  }
}
