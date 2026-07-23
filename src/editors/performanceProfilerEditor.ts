import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const performanceProfilerEditorSpec = defineEditorSpec({
  id: "performanceProfiler",
  command: "lurek.editor.performanceProfiler",
  viewType: "lurek.editor.performanceProfiler",
  title: "Performance Profiler",
  sidebarLabel: "Performance Profiler",
  icon: "dashboard",
  category: "system",
  workspace: "preview",
  reference: "Godot Debugger Monitors, Unity Profiler.",
  useCase: "Visualizing real-time game performance and bottlenecks.",
  apiNamespace: "lurek.devtools",
  purpose: "Visualize frame time, Lua GC, draw calls, memory, physics timing, snapshots, and regression notes.",
  vision: "The command center for optimization. Ensures 2D games run at a locked 60FPS by exposing Lua GC pauses and draw-call spikes.",
  nativeFormat: "profiler snapshot JSON",
  exportBaseName: "performance_profile",
  exports: ["json"],
  featureList: [
    "Real-time frame-time line graphs (CPU vs GPU).",
    "Lua Garbage Collection pause monitoring.",
    "VRAM and RAM consumption tracking.",
    "Draw call and batch count tracking.",
    "Heavy function execution time highlighting (Flame graphs).",
    "Physics step simulation timing.",
    "Remote profiling of built executables over network.",
    "Snapshot saving for performance regression comparison.",
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
    { id: "sample", label: "Sample", icon: "$(eye)", shortcut: "S" },
    { id: "play", label: "Preview", icon: "$(play)", shortcut: "Space" },
    { id: "tune", label: "Tune", icon: "$(settings-gear)", shortcut: "T" },
  ],
  inspector: [
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "devtools" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.devtools" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Preview telemetry, sample output, and performance notes.",
});

export class PerformanceProfilerEditor {
  static readonly spec = performanceProfilerEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, performanceProfilerEditorSpec);
  }
}
