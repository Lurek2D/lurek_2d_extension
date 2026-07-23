import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const tilemapScriptEditorSpec = defineEditorSpec({
  id: "tilemapScript",
  command: "lurek.editor.tilemapScript",
  viewType: "lurek.editor.tilemapScript",
  title: "Tilemap Script Editor",
  sidebarLabel: "Tilemap Script Editor",
  icon: "code",
  category: "map",
  workspace: "document",
  reference: "Warcraft III World Editor (Region triggers), RPG Maker Event Map.",
  useCase: "Attaching specific triggers and Lua mechanics directly to specific cells on a tilemap.",
  apiNamespace: "lurek.event",
  purpose: "Attach Lua triggers and event callbacks to exact tile coordinates and map regions.",
  vision: "A text-based editor strongly bound to physical grid coordinates. It solves the problem of local tile logic by allowing script injection directly onto `lurek.tilemap` data structures.",
  nativeFormat: "tile trigger Lua script",
  exportBaseName: "tilemap_script",
  exports: ["lua", "json"],
  featureList: [
    "Inline Lua code editor attached to grid coordinates.",
    "Syntax highlighting and Lurek API IntelliSense.",
    "Exact tile coordinate binding and visualization.",
    "Event trigger dropdown selection (OnStep, OnInteract).",
    "Debug print console integration within the panel.",
    "Parameter exposure allowing designers to tweak variables.",
    "Real-time syntax validation before saving.",
    "Snippet injection for common logic patterns (e.g., teleporting).",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "event" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.event" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Generated source preview and documentation notes.",
});

export class TilemapScriptEditor {
  static readonly spec = tilemapScriptEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, tilemapScriptEditorSpec);
  }
}
