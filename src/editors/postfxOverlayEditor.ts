import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const postfxOverlayEditorSpec = defineEditorSpec({
  id: "postfxOverlay",
  command: "lurek.editor.postfxOverlay",
  viewType: "lurek.editor.postfxOverlay",
  title: "PostFX Overlay Designer",
  sidebarLabel: "PostFX & Overlay Designer",
  icon: "color-mode",
  category: "asset",
  workspace: "preview",
  reference: "Unity Post Processing Stack v2, ReShade.",
  useCase: "Live testing and refining of post-processing filters applied globally to game screens.",
  apiNamespace: "lurek.effect",
  purpose: "Tune fullscreen post-processing presets, overlay stacks, before/after preview, and GPU cost notes.",
  vision: "This editor is for designers tweaking global visual parameters (like bloom or blur intensity) over an existing game scene in `lurek.pipeline`, distinct from engineers writing raw compute shaders.",
  nativeFormat: "postfx preset Lua data",
  exportBaseName: "postfx_overlay",
  exports: ["lua", "json"],
  featureList: [
    "Full-screen interactive game viewport preview.",
    "Bloom threshold, intensity, and knee curve sliders.",
    "Chromatic aberration shifting inputs.",
    "CRT distortion, curvature, and scanline toggles.",
    "Color grading LUT injection and interpolation.",
    "Real-time performance profiling (GPU cost).",
    "Preset saving, loading, and cross-fading.",
    "Split-screen before/after comparison view.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "effect" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.effect" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Preview telemetry, sample output, and performance notes.",
});

export class PostFxOverlayEditor {
  static readonly spec = postfxOverlayEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, postfxOverlayEditorSpec);
  }
}
