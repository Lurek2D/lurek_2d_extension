import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const soundDspEditorSpec = defineEditorSpec({
  id: "soundDsp",
  command: "lurek.editor.soundDsp",
  viewType: "lurek.editor.soundDsp",
  title: "Sound DSP Panel",
  sidebarLabel: "Sound DSP Panel",
  icon: "radio-tower",
  category: "graph",
  workspace: "node",
  reference: "Pure Data, FL Studio Patcher, Max/MSP.",
  useCase: "Creating Digital Signal Processing (DSP) chains for audio modification.",
  apiNamespace: "lurek.audio",
  purpose: "Configure DSP node chains for reverb, EQ, compression, routing, and live spectrum preview.",
  vision: "Distinct from the AudioMixer. While the mixer balances volumes, the DSP editor physically alters the sound waves (adding reverb, EQ, compression) using a node graph tied to `lurek.audio` effects.",
  nativeFormat: "audio DSP chain JSON",
  exportBaseName: "sound_dsp",
  exports: ["json", "lua"],
  featureList: [
    "Node-based audio routing graph architecture.",
    "Parametric EQ node configuration with graphical curves.",
    "Reverb room size, delay, and damping control dials.",
    "Compressor threshold, ratio, and attack/release dials.",
    "Live visual audio spectrum analyzer.",
    "Audio playback scrubbing and looping tools.",
    "Channel muting, soloing, and bypass toggles.",
    "Export functionality for saving DSP chains to JSON.",
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
    { id: "node", label: "Add Node", icon: "$(add)", shortcut: "N" },
    { id: "link", label: "Connect", icon: "$(graph-line)", shortcut: "L" },
    { id: "group", label: "Group", icon: "$(symbol-namespace)", shortcut: "G" },
    { id: "comment", label: "Comment", icon: "$(comment)", shortcut: "C" },
  ],
  inspector: [
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "audio" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.audio" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Execution trace, unreachable nodes, and graph validation output.",
});

export class SoundDspEditor {
  static readonly spec = soundDspEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, soundDspEditorSpec);
  }
}
