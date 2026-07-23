import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const sceneFlowEditorSpec = defineEditorSpec({
  id: "sceneFlow",
  command: "lurek.editor.sceneFlow",
  viewType: "lurek.editor.sceneFlow",
  title: "Scene Flow Editor",
  sidebarLabel: "Scene Flow Editor",
  icon: "type-hierarchy",
  category: "graph",
  workspace: "node",
  reference: "Unity Animator (State Machine View), Unreal Engine Blueprints.",
  useCase: "Designing the global state machine structure defining transitions between scenes (e.g., Splash -> Main Menu -> Gameplay).",
  apiNamespace: "lurek.scene",
  purpose: "Create visual scene state machines and event-driven transitions between screens and gameplay states.",
  vision: "Must act as the absolute top-level entry point router. It should completely eliminate the need for hardcoded state-switching logic by letting developers visually connect which Scene loads when an event is fired.",
  nativeFormat: "scene flow Lua graph",
  exportBaseName: "scene_flow",
  exports: ["lua", "json"],
  featureList: [
    "Visual node-based state machine editor mapping entire game states.",
    "Drag-and-drop state creation for UI screens and gameplay segments.",
    "Event-driven transition linking lines with conditional parameters.",
    "Real-time path highlighting during live gameplay debugging.",
    "State validation and unreachable code/node checking.",
    "Global variable bindings persistent across specific state transitions.",
    "Export flow data structurally to JSON/Lua definitions.",
    "Nested sub-scenes visualization for complex, deep UI menus.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "scene" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.scene" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Execution trace, unreachable nodes, and graph validation output.",
});

export class SceneFlowEditor {
  static readonly spec = sceneFlowEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, sceneFlowEditorSpec);
  }
}
