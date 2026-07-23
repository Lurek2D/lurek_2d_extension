import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const voxelEditorSpec = defineEditorSpec({
  id: "voxel",
  command: "lurek.editor.voxel",
  viewType: "lurek.editor.voxel",
  title: "Voxel Editor",
  sidebarLabel: "Voxel Editor",
  icon: "layers",
  category: "asset",
  workspace: "grid",
  reference: "MagicaVoxel, Blockbench.",
  useCase: "Constructing 3D models using volumetric blocks (voxels).",
  apiNamespace: "lurek.raycaster",
  purpose: "Build voxel-like block models and export slice data for pseudo-3D/isometric sprite workflows.",
  vision: "Since Lurek is primarily a 2D engine, this editor provides a unique workflow to create the illusion of 3D. It allows artists to build voxel models and automatically projects them into 2.5D representations for `lurek.raycaster` and `lurek.sprite`.",
  nativeFormat: "voxel slice JSON/Lua",
  exportBaseName: "voxel_model",
  exports: ["json", "lua"],
  featureList: [
    "Full 3D grid voxel painting viewport.",
    "Layer-by-layer slicing view for interior detailing.",
    "Isometric rendering projection preview.",
    "Voxel color palette manager with hex inputs.",
    "Hollow and fill bucket tools for mass placement.",
    "Extrusion and carving operators.",
    "Export tools for generating optimized 2D isometric sprite sheets.",
    "Lighting and shading parameter adjustments for baked shadows.",
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
    { id: "brush", label: "Brush", icon: "$(edit)", shortcut: "B" },
    { id: "erase", label: "Erase", icon: "$(trash)", shortcut: "E" },
    { id: "fill", label: "Fill", icon: "$(paintcan)", shortcut: "F" },
    { id: "metadata", label: "Metadata", icon: "$(symbol-property)", shortcut: "M" },
  ],
  inspector: [
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "raycaster" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.raycaster" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Layers, coordinates, collision masks, and validation messages.",
});

export class VoxelEditor {
  static readonly spec = voxelEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, voxelEditorSpec);
  }
}
