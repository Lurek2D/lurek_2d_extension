import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const timelineEditorSpec = defineEditorSpec({
  id: "timeline",
  command: "lurek.editor.timeline",
  viewType: "lurek.editor.timeline",
  title: "Timeline Cutscene Editor",
  sidebarLabel: "Timeline / Cutscene",
  icon: "history",
  category: "asset",
  workspace: "timeline",
  reference: "Unity Timeline, Adobe Premiere sequence.",
  useCase: "Producing cutscenes, staged shots, and time-controlled cinematic sequences.",
  apiNamespace: "lurek.automation",
  purpose: "Arrange cutscene tracks, camera moves, sound cues, Lua event triggers, and keyframe easing.",
  vision: "Uniquely solves the problem of coordinating multiple independent systems over time. It provides a visual track to align animations, sound effects, and camera pans perfectly using `lurek.automation`.",
  nativeFormat: "automation timeline Lua data",
  exportBaseName: "timeline",
  exports: ["lua", "json"],
  featureList: [
    "Multi-track horizontal timeline (Animation Track, Audio Track, Event Track).",
    "Keyframe insertion, deletion, and manipulation.",
    "Easing curve editor providing Bezier, Linear, and Bounce interpolation.",
    "Playhead scrubbing perfectly synchronized with the game viewport.",
    "Audio waveform visualization overlaid on the timeline track.",
    "Event trigger tracks executing Lua functions at specific milliseconds.",
    "Sub-timeline nesting for modular cutscene architecture.",
    "Real-time cinematic preview at target framerate.",
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
    { id: "keyframe", label: "Keyframe", icon: "$(key)", shortcut: "K" },
    { id: "cut", label: "Cut", icon: "$(split-horizontal)", shortcut: "X" },
    { id: "scrub", label: "Scrub", icon: "$(play)", shortcut: "Space" },
  ],
  inspector: [
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "automation" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.automation" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Track list, keyframe table, and playback events.",
});

export class TimelineEditor {
  static readonly spec = timelineEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, timelineEditorSpec);
  }
}
