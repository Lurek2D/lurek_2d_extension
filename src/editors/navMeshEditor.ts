import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const navMeshEditorSpec = defineEditorSpec({
  id: "navMesh",
  command: "lurek.editor.navMesh",
  viewType: "lurek.editor.navMesh",
  title: "NavMesh Editor",
  sidebarLabel: "NavMesh Editor",
  icon: "route",
  category: "map",
  workspace: "grid",
  reference: "Godot NavigationPolygon, Unity NavMesh (2D adapted).",
  useCase: "Drawing walkable and obstacle polygons for free-form 2D navigation.",
  apiNamespace: "lurek.pathfind",
  purpose: "Draw walkable polygons, holes, navigation layers, dynamic obstacles, and pathfinding cost modifiers.",
  vision: "Essential for point-and-click or aRPG games where agents navigate off-grid. Completely distinct from TileMap or WorldMap; this provides actual vector-based movement areas.",
  nativeFormat: "navmesh polygon Lua data",
  exportBaseName: "navmesh",
  exports: ["lua", "json"],
  featureList: [
    "Polygon drawing and vertex snapping tools over the game map.",
    "Subtraction tools for cutting holes (obstacles) in walkable areas.",
    "Bake configuration for agent radius offsets.",
    "Multi-layer navigation linking (e.g. ground vs water).",
    "Visualization overlay of the final baked navigation mesh.",
    "Dynamic obstacle insertion rules.",
    "Cost modifiers assigned to specific polygons (e.g. swamp is slower).",
    "Export to optimized 2D vertex arrays for fast pathfinding.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "pathfind" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.pathfind" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Layers, coordinates, collision masks, and validation messages.",
});

export class NavMeshEditor {
  static readonly spec = navMeshEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, navMeshEditorSpec);
  }
}
