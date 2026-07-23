import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const spriteAnimEditorSpec = defineEditorSpec({
  id: "spriteAnim",
  command: "lurek.editor.spriteAnim",
  viewType: "lurek.editor.spriteAnim",
  title: "Sprite Animation Editor",
  sidebarLabel: "Sprite Animation Editor",
  icon: "play-circle",
  category: "asset",
  workspace: "timeline",
  reference: "Spine 2D (basic timeline), Godot AnimationPlayer.",
  useCase: "Assembling motion clips from Sprite Sheet files by defining frames and animation states.",
  apiNamespace: "lurek.animation",
  purpose: "Slice spritesheets, order frames, set durations, hitboxes, events, and playback modes.",
  vision: "Bridges the gap between static PNG images and active game entities. By allowing developers to visually define frame durations, hitboxes, and hurtboxes per frame, it outputs data `lurek.animation` can instantly consume.",
  nativeFormat: "sprite animation Lua data",
  exportBaseName: "sprite_animation",
  exports: ["lua", "json"],
  featureList: [
    "Frame sequence horizontal timeline view.",
    "Keyframe duration tweaking and easing adjustments.",
    "Playback modes: Looping, Ping-pong, Once.",
    "Hitbox and hurtbox rectangular drawing synchronized per frame.",
    "Real-time animation playback preview at target framerates.",
    "Onion skinning displaying adjacent animation frames.",
    "Custom event triggers bound to specific frames (e.g., 'footstep').",
    "Sprite sheet slicing grid generation.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "animation" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.animation" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Track list, keyframe table, and playback events.",
});

export class SpriteAnimEditor {
  static readonly spec = spriteAnimEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, spriteAnimEditorSpec);
  }
}
