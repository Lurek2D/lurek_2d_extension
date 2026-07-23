import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const assetManifestEditorSpec = defineEditorSpec({
  id: "assetManifest",
  command: "lurek.editor.assetManifest",
  viewType: "lurek.editor.assetManifest",
  title: "Asset Manifest Editor",
  sidebarLabel: "Asset Manifest Editor",
  icon: "file-media",
  category: "system",
  workspace: "table",
  reference: "Godot ResourcePreloader, Unity Addressables.",
  useCase: "Grouping and managing asynchronous asset loading packages.",
  apiNamespace: "lurek.filesystem",
  purpose: "Group preload buckets, async priorities, dependency checks, memory estimates, and package hooks.",
  vision: "Prevents mid-game stutter by explicitly defining what needs to be in RAM for Level 1 vs Level 2. Essential for memory management on lower-end devices.",
  nativeFormat: "asset manifest TOML/JSON",
  exportBaseName: "asset_manifest",
  exports: ["toml", "json", "lua"],
  featureList: [
    "Grouping assets into named \"Loading Buckets\".",
    "RAM consumption estimation per bucket.",
    "Priority queuing for asynchronous background loading.",
    "Missing asset dependency detection.",
    "Unused asset highlighting and purging.",
    "Automatic packing into encrypted `.pak` files.",
    "Live VRAM memory visualization per group.",
    "Loading screen progress bar integration hooks.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "filesystem" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.filesystem" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Row validation, import summary, and schema errors.",
  tableColumns: ["bucket", "asset", "priority", "ram_mb", "required"],
});

export class AssetManifestEditor {
  static readonly spec = assetManifestEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, assetManifestEditorSpec);
  }
}
