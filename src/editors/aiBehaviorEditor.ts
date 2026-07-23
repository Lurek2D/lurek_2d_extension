import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const aiBehaviorEditorSpec = defineEditorSpec({
  id: "aiBehavior",
  command: "lurek.editor.aiBehavior",
  viewType: "lurek.editor.aiBehavior",
  title: "AI Behavior Tree Editor",
  sidebarLabel: "AI Behavior Tree",
  icon: "hubot",
  category: "graph",
  workspace: "node",
  reference: "Unreal Engine Behavior Tree Editor, NodeCanvas.",
  useCase: "Constructing artificial intelligence logic for characters using Behavior Trees.",
  apiNamespace: "lurek.ai",
  purpose: "Build behavior trees with selectors, sequences, decorators, conditions, actions, and live debug traces.",
  vision: "Distinct from the general GraphEditor. This is strictly designed around the strict paradigm of Behavior Trees (Selectors, Sequences, Decorators) for decision-making agents. It outputs tree data that `lurek.ai` processes efficiently per tick.",
  nativeFormat: "behavior tree Lua graph",
  exportBaseName: "ai_behavior",
  exports: ["lua", "json"],
  featureList: [
    "Top-down tree execution topology visualization.",
    "Composite node insertion (Sequence, Selector, Parallel).",
    "Decorator wrapping (Inverter, Limiter, Cooldown, Repeater).",
    "Custom condition and action nodes with Lua bindings.",
    "Direct compilation of node logic to raw Lua code.",
    "Real-time visual execution pinging during live game debug.",
    "Sub-tree referencing to modularize AI behaviors.",
    "Node copy/paste and duplication across multiple enemy types.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "ai" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.ai" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Execution trace, unreachable nodes, and graph validation output.",
});

export class AiBehaviorEditor {
  static readonly spec = aiBehaviorEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, aiBehaviorEditorSpec);
  }
}
