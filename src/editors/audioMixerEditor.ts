import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const audioMixerEditorSpec = defineEditorSpec({
  id: "audioMixer",
  command: "lurek.editor.audioMixer",
  viewType: "lurek.editor.audioMixer",
  title: "Audio Mixer",
  sidebarLabel: "Audio Mixer",
  icon: "unmute",
  category: "asset",
  workspace: "preview",
  reference: "FL Studio Mixer, Unity Audio Mixer.",
  useCase: "A classic virtual audio console to balance channel levels between BGM, SFX, and Master.",
  apiNamespace: "lurek.audio",
  purpose: "Balance audio buses, faders, mute/solo state, ducking rules, and peak metering.",
  vision: "Prevents developers from hardcoding volume calls throughout scripts. It establishes a Godot-like centralized audio routing system inside `lurek.audio`, where logic scripts merely play a sound, and the Mixer dictates its final output volume.",
  nativeFormat: "audio mixer Lua config",
  exportBaseName: "audio_mixer",
  exports: ["lua", "json"],
  featureList: [
    "Multi-track vertical fader interface (Master, BGM, SFX, UI).",
    "Real-time volume peak metering in decibels (dB).",
    "Mute and solo isolation toggles per audio bus.",
    "Audio ducking and sidechain compression rules (e.g., lower BGM when Dialogue plays).",
    "Panning and 2D spatialization balance settings.",
    "Clipping indicators and redline warnings.",
    "Snapshot saving for transitioning between different scene mixes.",
    "Sub-mix grouping and auxiliary sends.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "audio" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.audio" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Preview telemetry, sample output, and performance notes.",
});

export class AudioMixerEditor {
  static readonly spec = audioMixerEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, audioMixerEditorSpec);
  }
}
