import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const testRunnerEditorSpec = defineEditorSpec({
  id: "testRunner",
  command: "lurek.editor.testRunner",
  viewType: "lurek.editor.testRunner",
  title: "Test Runner",
  sidebarLabel: "Test Runner",
  icon: "beaker",
  category: "system",
  workspace: "table",
  reference: "Jest VS Code Extension, IntelliJ Test Runner.",
  useCase: "Managing, invoking, and monitoring engine unit tests without relying solely on the console.",
  apiNamespace: "lurek.devtools",
  purpose: "Browse, filter, run, and inspect Lurek2D Rust/Lua test suites from a visual panel.",
  vision: "Uniquely bridges the gap between CI/CD pipelines and the developer's immediate VS Code environment. It ensures that writing and running game logic tests through `lurek.devtools` feels native and visual.",
  nativeFormat: "test run manifest JSON",
  exportBaseName: "test_run",
  exports: ["json"],
  featureList: [
    "Categorized hierarchical test list (Pass/Fail/Skip/Running).",
    "Test tagging and regex filtering capabilities.",
    "Run/Debug execution buttons per individual test or suite.",
    "Inline error stack trace expansion mapping back to code lines.",
    "Code coverage visualization and heatmaps.",
    "Performance execution timers per test.",
    "Output log capture segregated per test instance.",
    "Automatic re-run on save (Watch mode).",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "devtools" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.devtools" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Row validation, import summary, and schema errors.",
  tableColumns: ["suite", "test", "status", "time_ms", "message"],
});

export class TestRunnerEditor {
  static readonly spec = testRunnerEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, testRunnerEditorSpec);
  }
}
