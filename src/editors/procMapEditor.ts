import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const procMapEditorSpec = defineEditorSpec({
  id: "procMap",
  command: "lurek.editor.procMap",
  viewType: "lurek.editor.procMap",
  title: "Procedural Map Generator",
  sidebarLabel: "Procedural Map Generator",
  icon: "globe",
  category: "map",
  workspace: "preview",
  reference: "World Machine (2D adaptation), Blender Geometry Nodes.",
  useCase: "Tuning procedural generation algorithms for maps, dungeons, and caves by manipulating seeds and mathematical noise grids.",
  apiNamespace: "lurek.procgen",
  purpose: "Tune procedural map rules, seeds, noise layers, biome thresholds, and runtime generation settings.",
  vision: "Outputs the *rules* of generation for `lurek.procgen` rather than baking static maps. It gives technical artists a playground to visually tweak Perlin noise octaves in `lurek.math`, outputting a configuration file for runtime generation.",
  nativeFormat: "procgen rules Lua/TOML",
  exportBaseName: "proc_map",
  exports: ["lua", "toml", "json"],
  featureList: [
    "Visual noise generation and heatmap preview.",
    "Configurable seed and frequency numeric inputs.",
    "Multi-octave Perlin/Simplex noise node mixing.",
    "Rule-based biome assignment based on moisture/elevation data.",
    "Density thresholds and radial falloff map masking.",
    "Real-time procedural map generation visualization overlay.",
    "Export generated heightmaps to PNG assets.",
    "Terrain smoothing and cellular automata configuration controls.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "procgen" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.procgen" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Preview telemetry, sample output, and performance notes.",
});

export class ProcMapEditor {
  static readonly spec = procMapEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, procMapEditorSpec);
  }
}
