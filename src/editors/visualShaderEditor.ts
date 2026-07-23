import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const visualShaderEditorSpec = defineEditorSpec({
  id: "visualShader",
  command: "lurek.editor.visualShader",
  viewType: "lurek.editor.visualShader",
  title: "Visual Shader Editor",
  sidebarLabel: "Visual Shader Editor",
  icon: "circuit-board",
  category: "graph",
  workspace: "node",
  reference: "Godot VisualShader, Unity Shader Graph.",
  useCase: "Creating fragment, vertex, and compute shaders via a visual node interface.",
  apiNamespace: "lurek.pipeline",
  purpose: "Build shader logic with visual math, texture, uniform, and compute nodes that generate WGSL.",
  vision: "Enables technical artists to build complex visual effects (like flowing water or dissolve transitions) without writing mathematical GLSL code.",
  nativeFormat: "visual shader graph plus WGSL",
  exportBaseName: "visual_shader",
  exports: ["json", "wgsl", "lua"],
  featureList: [
    "Infinite node canvas with math, texture, and logic blocks.",
    "Real-time preview sphere/sprite updating with every connection.",
    "Automatic conversion of nodes to optimized shader code.",
    "Uniform variable exposure for the main properties inspector.",
    "Sub-graph creation for reusable shader functions.",
    "Built-in time and screen-UV coordinate nodes.",
    "Vertex displacement logic implementation.",
    "Compute shader dispatch node configuration.",
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
    { id: "node", label: "Add Node", icon: "$(add)", shortcut: "N" },
    { id: "link", label: "Connect", icon: "$(graph-line)", shortcut: "L" },
    { id: "group", label: "Group", icon: "$(symbol-namespace)", shortcut: "G" },
    { id: "comment", label: "Comment", icon: "$(comment)", shortcut: "C" },
  ],
  inspector: [
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "pipeline" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.pipeline" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Execution trace, unreachable nodes, and graph validation output.",
});

export class VisualShaderEditor {
  static readonly spec = visualShaderEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, visualShaderEditorSpec);
  }
}
