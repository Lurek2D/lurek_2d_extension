import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const graphEditorSpec = defineEditorSpec({
  id: "graph",
  command: "lurek.editor.graph",
  viewType: "lurek.editor.graph",
  title: "Graph Editor",
  sidebarLabel: "Graph Editor",
  icon: "graph",
  category: "graph",
  workspace: "node",
  reference: "Unreal Engine Blueprints, Godot VisualScript.",
  useCase: "A generic directed-graph editor used for visual scripting and generic logical flows.",
  apiNamespace: "lurek.graph",
  purpose: "Edit generic directed graphs for visual scripting, data flow, and gameplay logic networks.",
  vision: "Functions as the \"Blueprint\" equivalent for Lurek2D. It empowers game designers who do not want to type raw Lua code to build custom gameplay logic by connecting functional nodes parsed by `lurek.graph`.",
  nativeFormat: "generic graph Lua data",
  exportBaseName: "graph",
  exports: ["lua", "json"],
  featureList: [
    "Infinite panning and zooming visual scripting canvas.",
    "Custom input and output execution/data pins.",
    "Typed connection cables enforcing logic (float, string, vector).",
    "Live data flow visualization and value inspection during runtime.",
    "Grouping and commenting blocks for organized logic.",
    "Automatic node arrangement algorithms.",
    "Graph diffing capabilities for Git version control.",
    "Mini-map navigation for massively complex scripts.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "graph" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.graph" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Execution trace, unreachable nodes, and graph validation output.",
});

export class GraphEditor {
  static readonly spec = graphEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, graphEditorSpec);
  }
}
