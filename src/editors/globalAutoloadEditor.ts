import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const globalAutoloadEditorSpec = defineEditorSpec({
  id: "globalAutoload",
  command: "lurek.editor.globalAutoload",
  viewType: "lurek.editor.globalAutoload",
  title: "Global Autoload Editor",
  sidebarLabel: "Global Autoload Editor",
  icon: "references",
  category: "system",
  workspace: "table",
  reference: "Godot Autoloads / Project Settings.",
  useCase: "Managing persistent global singletons and services that survive scene loads.",
  apiNamespace: "lurek.scene",
  purpose: "Register persistent singletons, boot order, dependencies, hot reload flags, and scene-surviving services.",
  vision: "Solves the problem of \"where do I put the player's inventory across levels?\". Provides a clean registry for persistent Lua scripts.",
  nativeFormat: "autoload TOML/Lua config",
  exportBaseName: "global_autoload",
  exports: ["toml", "lua", "json"],
  featureList: [
    "Singleton script registration table.",
    "Load order prioritization (who boots first).",
    "Scene-agnostic persistent data viewing.",
    "Hot-reloading toggles for specific singletons.",
    "Dependency injection mapping.",
    "Boot initialization timing (Pre-engine vs Post-engine ready).",
    "Export to core boot configuration files.",
    "Isolation sandbox configuration for secure modules.",
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
    { id: "row", label: "Add Row", icon: "$(add)", shortcut: "R" },
    { id: "column", label: "Add Column", icon: "$(list-flat)", shortcut: "C" },
    { id: "validate", label: "Validate", icon: "$(check)", shortcut: "Shift+Enter" },
  ],
  inspector: [
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "scene" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.scene" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Row validation, import summary, and schema errors.",
  tableColumns: ["singleton", "script", "order", "hot_reload", "dependencies"],
});

export class GlobalAutoloadEditor {
  static readonly spec = globalAutoloadEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, globalAutoloadEditorSpec);
  }
}
