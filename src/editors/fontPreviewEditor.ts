import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const fontPreviewEditorSpec = defineEditorSpec({
  id: "fontPreview",
  command: "lurek.editor.fontPreview",
  viewType: "lurek.editor.fontPreview",
  title: "Font Preview",
  sidebarLabel: "Font Preview",
  icon: "text-size",
  category: "asset",
  workspace: "preview",
  reference: "BMFont, FontForge preview.",
  useCase: "Inspecting how vector fonts (TTF) or bitmap fonts render under scaling.",
  apiNamespace: "lurek.render",
  purpose: "Preview font size, kerning, line height, atlas packing, fallbacks, and memory estimates.",
  vision: "Ensures text rendering is performant and visually crisp in `lurek.render`. By previewing exactly how Lurek's rasterizer will pack the glyphs into a texture atlas, developers can tweak kerning visually before committing to UI layouts.",
  nativeFormat: "font render profile JSON",
  exportBaseName: "font_profile",
  exports: ["json", "lua"],
  featureList: [
    "Custom sample text input testing rendering.",
    "Real-time font size and scaling interpolation preview.",
    "Kerning and line-height numeric nudging.",
    "Font atlas texture packing visualization.",
    "Hinting and anti-aliasing rendering toggles.",
    "Missing glyph highlighting and fallback font configuration.",
    "Export configuration to Lua/JSON rendering profiles.",
    "Memory usage estimation based on atlas size.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "render" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.render" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Preview telemetry, sample output, and performance notes.",
});

export class FontPreviewEditor {
  static readonly spec = fontPreviewEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, fontPreviewEditorSpec);
  }
}
