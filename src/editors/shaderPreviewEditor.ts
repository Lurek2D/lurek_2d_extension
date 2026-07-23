import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const shaderPreviewEditorSpec = defineEditorSpec({
  id: "shaderPreview",
  command: "lurek.editor.shaderPreview",
  viewType: "lurek.editor.shaderPreview",
  title: "Shader Preview",
  sidebarLabel: "Shader Preview",
  icon: "wand",
  category: "asset",
  workspace: "document",
  reference: "ShaderToy, The Book of Shaders Editor.",
  useCase: "Writing, testing, and visualizing raw compute and rendering shaders from scratch.",
  apiNamespace: "lurek.compute",
  purpose: "Write and preview WGSL shader snippets with uniforms, mock textures, errors, and preview controls.",
  vision: "A low-level graphics programming environment for raw `lurek.compute` shaders. It provides immediate visual feedback for math-heavy shader coding, mimicking tools like ShaderToy directly inside the IDE.",
  nativeFormat: "WGSL shader file",
  exportBaseName: "shader_preview",
  exports: ["wgsl", "json"],
  featureList: [
    "Split-screen code editor paired with a live preview canvas.",
    "Syntax highlighting for shader-specific languages (GLSL/WGSL).",
    "Live compilation error reporting with line-number mapping.",
    "Uniform variable injection exposing sliders and color pickers to the editor.",
    "Time and resolution variable auto-mocking for testing animations.",
    "Custom texture binding for previewing displacement maps.",
    "Vertex and fragment shader separation tabs.",
    "Performance metric overlay showing GPU instruction counts.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "compute" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.compute" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Generated source preview and documentation notes.",
});

export class ShaderPreviewEditor {
  static readonly spec = shaderPreviewEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, shaderPreviewEditorSpec);
  }
}
