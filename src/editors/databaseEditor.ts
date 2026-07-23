import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const databaseEditorSpec = defineEditorSpec({
  id: "database",
  command: "lurek.editor.database",
  viewType: "lurek.editor.database",
  title: "Database Editor",
  sidebarLabel: "Database Editor",
  icon: "database",
  category: "data",
  workspace: "table",
  reference: "CastleDB, RPG Maker Database, Google Sheets.",
  useCase: "Editing and managing pure game mechanics databases (e.g., weapon stats, merchant prices, loot tables) in a spreadsheet layout.",
  apiNamespace: "lurek.dataframe",
  purpose: "Edit structured game balance tables with typed columns, relations, filters, and validation.",
  vision: "Distinctly handles tabular, abstract game balance data. Unlike the EntityEditor, the DatabaseEditor is where systems designers balance numeric values across hundreds of rows without ever looking at visual sprites, heavily utilizing `lurek.dataframe` capabilities.",
  nativeFormat: "dataframe JSON/CSV-friendly table",
  exportBaseName: "game_database",
  exports: ["json", "lua"],
  featureList: [
    "Spreadsheet-style interactive grid view.",
    "Strongly-typed columns (integer, string, boolean, enum, asset reference).",
    "Advanced row sorting, tagging, and filtering capabilities.",
    "Foreign key relational linking between distinct tables.",
    "CSV/JSON structural import and export mapping.",
    "Bulk find/replace and math operations (e.g., +10% to entire column).",
    "Custom Lua formula columns for calculated fields.",
    "Real-time data validation and schema error highlighting.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "dataframe" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.dataframe" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Row validation, import summary, and schema errors.",
  tableColumns: ["id", "name", "type", "value", "tags"],
});

export class DatabaseEditor {
  static readonly spec = databaseEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, databaseEditorSpec);
  }
}
