import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const projectExportEditorSpec = defineEditorSpec({
  id: "projectExport",
  command: "lurek.editor.projectExport",
  viewType: "lurek.editor.projectExport",
  title: "Project Export Editor",
  sidebarLabel: "Project Export Editor",
  icon: "package",
  category: "system",
  workspace: "document",
  reference: "Godot Export Profiles, Unity Build Settings.",
  useCase: "Configuring platform-specific build settings and compiling the game.",
  apiNamespace: "lurek.engine",
  purpose: "Configure target platform, window flags, icons, feature flags, archive rules, and build profile metadata.",
  vision: "The final step. Replaces writing manual Cargo build scripts with a visual UI to set app icons, window sizing, and platform targeting.",
  nativeFormat: "project export TOML",
  exportBaseName: "project_export",
  exports: ["toml", "json", "lua"],
  featureList: [
    "Target platform selection (Windows, Linux, macOS).",
    "Application icon assignment per platform resolution.",
    "Window configuration (Resizable, Borderless, Fullscreen, V-Sync).",
    "Feature flag toggles (e.g., Disable Console in Release build).",
    "Security and permission configurations.",
    "File exclusion filters (e.g., ignore `.psd` files on build).",
    "Archive encryption setting configuration.",
    "One-click build triggering and progress monitoring.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "engine" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.engine" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Generated source preview and documentation notes.",
});

export class ProjectExportEditor {
  static readonly spec = projectExportEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, projectExportEditorSpec);
  }
}
