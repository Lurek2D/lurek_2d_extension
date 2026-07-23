import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const entityEditorSpec = defineEditorSpec({
  id: "entity",
  command: "lurek.editor.entity",
  viewType: "lurek.editor.entity",
  title: "Entity Designer",
  sidebarLabel: "Entity Designer",
  icon: "symbol-class",
  category: "data",
  workspace: "document",
  reference: "Godot Node Inspector, Unity GameObject Inspector.",
  useCase: "Visual configuration of \"prefabs\" or in-game spatial objects by setting their attributes and components.",
  apiNamespace: "lurek.ecs",
  purpose: "Assemble component-based entity prefabs with transform, sprite, physics, and custom metadata.",
  vision: "Completely distinct from the DatabaseEditor. This editor focuses exclusively on spatial, component-based actors in the world. It provides the Godot-like \"Inspector\" experience where developers assemble an entity from a Sprite and a Collider without writing boilerplate ECS registration code.",
  nativeFormat: "ECS prefab Lua table",
  exportBaseName: "entity_prefab",
  exports: ["lua", "json"],
  featureList: [
    "Component attachment library (Transform, Sprite, Rigidbody, Custom Scripts).",
    "Real-time component property inspector with slider and text inputs.",
    "Visual bounds, hitbox, and offset relative child preview.",
    "Default instantiation value overriding directly in the inspector.",
    "Nested child entity grouping (Parent/Child transform hierarchy).",
    "Quick-search component filtering.",
    "Copy/paste entire component configurations between different entities.",
    "Live stat and variable monitoring while the game is running.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "ecs" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.ecs" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Generated source preview and documentation notes.",
});

export class EntityEditor {
  static readonly spec = entityEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, entityEditorSpec);
  }
}
