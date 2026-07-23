import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const apiReferenceEditorSpec = defineEditorSpec({
  id: "apiReference",
  command: "lurek.editor.apiReference",
  viewType: "lurek.editor.apiReference",
  title: "API Reference",
  sidebarLabel: "API Reference",
  icon: "book",
  category: "system",
  workspace: "document",
  reference: "Dash, Zeal, Godot built-in Help.",
  useCase: "Quick, built-in offline access to the full, specific API documentation of the Lurek2D engine.",
  apiNamespace: "lurek.docs",
  purpose: "Browse generated offline Lurek API documentation with search, snippets, signatures, and copy actions.",
  vision: "Acts as the offline heartbeat of the Love2D-style code-first philosophy. By reading directly from `lurek.docs`, it guarantees that the documentation never drifts from the actual installed engine version.",
  nativeFormat: "documentation browser state",
  exportBaseName: "api_reference",
  exports: ["json"],
  featureList: [
    "Full offline markdown-rendered documentation browser.",
    "Fuzzy search across all Lurek API namespaces.",
    "Syntax examples and executable code snippets.",
    "Cross-linking hyperlinks between related functions.",
    "One-click copy-to-clipboard API signatures.",
    "Dark/Light theme readability support.",
    "Detailed parameter and return type definitions.",
    "Direct hyperlink to engine source code files.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "docs" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.docs" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Generated source preview and documentation notes.",
});

export class ApiReferenceEditor {
  static readonly spec = apiReferenceEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, apiReferenceEditorSpec);
  }
}
