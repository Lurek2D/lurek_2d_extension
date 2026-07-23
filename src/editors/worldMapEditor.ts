import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const worldMapEditorSpec = defineEditorSpec({
  id: "worldMap",
  command: "lurek.editor.worldMap",
  viewType: "lurek.editor.worldMap",
  title: "World Map Editor",
  sidebarLabel: "World Map Editor",
  icon: "map",
  category: "map",
  workspace: "node",
  reference: "Super Mario World Map Editor (Lunar Magic), CK3 Point Map.",
  useCase: "Mapping macro-geographical overworld navigation structures (e.g., node-based travel).",
  apiNamespace: "lurek.pathfind",
  purpose: "Design high-level overworld travel nodes, routes, danger zones, regions, and fast travel unlocks.",
  vision: "Distinct from the TileMapEditor. This editor focuses on high-level topological graphs for travel logic analyzed by `lurek.pathfind`, rather than pixel-perfect, local-level collision mapping.",
  nativeFormat: "world graph JSON/Lua",
  exportBaseName: "world_map",
  exports: ["json", "lua"],
  featureList: [
    "Node placement for points of interest across the overworld.",
    "Spline path linking with automatic distance calculation.",
    "Region boundary drawing.",
    "Encounter and danger zone definitions overlay.",
    "Fast travel point tagging and unlock condition bindings.",
    "Visual weather zone mapping and ambient sound linking.",
    "Custom icon assignment per individual node.",
    "Export graph structure to JSON pathfinding logic.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "pathfind" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.pathfind" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Execution trace, unreachable nodes, and graph validation output.",
});

export class WorldMapEditor {
  static readonly spec = worldMapEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, worldMapEditorSpec);
  }
}
