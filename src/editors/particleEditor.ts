import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const particleEditorSpec = defineEditorSpec({
  id: "particle",
  command: "lurek.editor.particle",
  viewType: "lurek.editor.particle",
  title: "Particle Designer",
  sidebarLabel: "Particle Designer",
  icon: "sparkle",
  category: "asset",
  workspace: "preview",
  reference: "Unity Shuriken Particle System, Godot Particles2D.",
  useCase: "Authoring 2D particle systems—creating visual special effects like smoke, explosions, or sparks.",
  apiNamespace: "lurek.particle",
  purpose: "Tune emitters, bursts, velocity, gravity, color-over-life, and preview deterministic particle behavior.",
  vision: "Must remain completely distinct from the PostFxOverlayEditor. The ParticleEditor deals with localized, spawned spatial entities in the `lurek.particle` system, whereas PostFx handles global screen space.",
  nativeFormat: "particle emitter Lua config",
  exportBaseName: "particle_emitter",
  exports: ["lua", "json"],
  featureList: [
    "Emitter shape configuration (cone, circle, edge, box area).",
    "Lifetime, emission rate, and max particle count controls.",
    "Color over lifetime complex gradient curve editor.",
    "Size and scale over time spline interpolations.",
    "Gravity, wind vector, and tangential velocity modifiers.",
    "Live interactive preview canvas running local physics simulations.",
    "Burst emission triggers for explosion effects.",
    "Custom texture/sprite assignment per individual particle.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "particle" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.particle" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Preview telemetry, sample output, and performance notes.",
});

export class ParticleEditor {
  static readonly spec = particleEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, particleEditorSpec);
  }
}
