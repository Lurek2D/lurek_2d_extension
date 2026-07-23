import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const questTreeEditorSpec = defineEditorSpec({
  id: "questTree",
  command: "lurek.editor.questTree",
  viewType: "lurek.editor.questTree",
  title: "Quest Tree Editor",
  sidebarLabel: "Quest Tree Editor",
  icon: "git-merge",
  category: "graph",
  workspace: "node",
  reference: "Obsidian Canvas, Articy: Draft (Quest Flows).",
  useCase: "Defining main story arcs and side quests as branching objective trees.",
  apiNamespace: "lurek.save",
  purpose: "Define quest stages, prerequisites, exclusions, rewards, and progress simulation logic.",
  vision: "Acts as the macro-orchestrator of game states. It allows developers to visualize the entire logical flow of the game's campaign without hardcoding progression flags, tracking states directly through `lurek.save` events.",
  nativeFormat: "quest graph Lua data",
  exportBaseName: "quest_tree",
  exports: ["lua", "json"],
  featureList: [
    "Visual flowchart mapping of quest progression stages.",
    "Prerequisite and mutual exclusion link routing between nodes.",
    "Objective tracking configuration (e.g., kill 5 X, fetch Y).",
    "Reward dispensing triggers upon successful node completion.",
    "Interactive quest stage simulation mimicking player progress.",
    "Automatic layout generation for complex branching story arcs.",
    "Note and documentation attachments for writers.",
    "Quest state tracking and live debugging overlay.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "save" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.save" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Execution trace, unreachable nodes, and graph validation output.",
});

export class QuestTreeEditor {
  static readonly spec = questTreeEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, questTreeEditorSpec);
  }
}
