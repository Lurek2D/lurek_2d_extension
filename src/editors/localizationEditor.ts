import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const localizationEditorSpec = defineEditorSpec({
  id: "localization",
  command: "lurek.editor.localization",
  viewType: "lurek.editor.localization",
  title: "Localization Editor",
  sidebarLabel: "Localization Editor",
  icon: "book",
  category: "data",
  workspace: "table",
  reference: "POEditor, Crowdin.",
  useCase: "Organizing multi-language translated text strings used across the game.",
  apiNamespace: "lurek.i18n",
  purpose: "Edit multi-language string matrices, missing translation reports, pluralization, and interpolation keys.",
  vision: "Completely separates hardcoded strings from logic. It provides a dedicated matrix specifically tailored for translators, ensuring the game is internationalization-ready through `lurek.i18n` from day one.",
  nativeFormat: ".locale.json dictionary",
  exportBaseName: "localization",
  exports: ["json", "lua"],
  featureList: [
    "Side-by-side multi-language column view grid.",
    "Missing translation warnings and progress percentage trackers.",
    "Regex search and filtering by localization key or text content.",
    "Pluralization and variable interpolation syntax support (e.g. \"{count} apples\").",
    "Export/Import to JSON/CSV for external localization agencies.",
    "Integration with machine translation APIs (optional capability).",
    "Context note attachments guiding translators on meaning.",
    "Duplicate key detection and strict validation.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "i18n" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.i18n" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Row validation, import summary, and schema errors.",
  tableColumns: ["key", "en", "pl", "context", "status"],
});

export class LocalizationEditor {
  static readonly spec = localizationEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, localizationEditorSpec);
  }
}
