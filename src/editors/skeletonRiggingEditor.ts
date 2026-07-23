import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const skeletonRiggingEditorSpec = defineEditorSpec({
  id: "skeletonRigging",
  command: "lurek.editor.skeletonRigging",
  viewType: "lurek.editor.skeletonRigging",
  title: "Skeleton Rigging Editor",
  sidebarLabel: "Skeleton Rigging Editor",
  icon: "symbol-method",
  category: "asset",
  workspace: "timeline",
  reference: "Spine 2D, Godot 2D Skeleton/Polygon2D.",
  useCase: "Rigging 2D sprites with bones for procedural deformation animation.",
  apiNamespace: "lurek.spine",
  purpose: "Rig 2D sprites with bones, IK chains, mesh weights, skins, and animation keyframes.",
  vision: "Avoids reliance on external software (Spine) for basic 2D rigging. Allows creating fluid boss animations using vertex weights and Inverse Kinematics (IK) instead of drawing 50 individual sprite frames.",
  nativeFormat: "spine-compatible rig Lua data",
  exportBaseName: "skeleton_rig",
  exports: ["lua", "json"],
  featureList: [
    "Bone placement and hierarchical parent/child linking.",
    "Inverse Kinematics (IK) chain creation for limbs.",
    "Polygon mesh generation over 2D sprites.",
    "Vertex weight painting assigned to specific bones.",
    "Animation timeline for keyframing bone rotations and IK targets.",
    "Skin switching (swapping texture while keeping the rig).",
    "Real-time physics ragdoll testing sandbox.",
    "Export to `lurek.spine` native data format.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "spine" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.spine" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Track list, keyframe table, and playback events.",
});

export class SkeletonRiggingEditor {
  static readonly spec = skeletonRiggingEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, skeletonRiggingEditorSpec);
  }
}
