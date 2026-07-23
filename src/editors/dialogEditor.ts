import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const dialogEditorSpec = defineEditorSpec({
  id: "dialog",
  command: "lurek.editor.dialog",
  viewType: "lurek.editor.dialog",
  title: "Dialog Editor",
  sidebarLabel: "Dialog Editor",
  icon: "comment-discussion",
  category: "graph",
  workspace: "node",
  reference: "Twine, Yarn Spinner, Articy: Draft.",
  useCase: "Composing branching and multi-threaded narrative dialogue for RPGs or adventure games.",
  apiNamespace: "lurek.ai",
  purpose: "Author branching NPC/player dialogue with conditions, localization keys, portraits, and Lua triggers.",
  vision: "Uniquely bridges narrative with AI logic. It must not overlap with the QuestTreeEditor: Dialog is strictly for conversational text and dialogue AI choices, while QuestTree tracks game-state progress. It utilizes `LDialogueAI` for topic and branch selection.",
  nativeFormat: "dialogue graph Lua data",
  exportBaseName: "dialogue",
  exports: ["lua", "json"],
  featureList: [
    "Node-based branching narrative and conversation structure layout.",
    "Designated NPC and Player dialogue nodes with distinct styling.",
    "Conditional checks for node execution (e.g. requires specific item in inventory).",
    "Lua script trigger insertion to execute game commands mid-sentence.",
    "Localization key mapping for multi-language translation.",
    "Character portrait and mood assignment per dialogue line.",
    "Voice-over audio track linking and playback preview.",
    "Auto-arrange layout tool for massive, tangled conversation webs.",
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

export class DialogEditor {
  static readonly spec = dialogEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, dialogEditorSpec);
  }
}
