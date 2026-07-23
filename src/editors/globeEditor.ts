import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const globeEditorSpec = defineEditorSpec({
  id: "globe",
  command: "lurek.editor.globe",
  viewType: "lurek.editor.globe",
  title: "Globe Editor",
  sidebarLabel: "Globe Editor",
  icon: "globe",
  category: "map",
  workspace: "preview",
  reference: "Google Earth Engine, Kerbal Space Program MapView.",
  useCase: "Topography editing and viewing for environments depicting game worlds directly on a convex sphere.",
  apiNamespace: "lurek.globe",
  purpose: "Place spherical coordinates, arcs, waypoints, projection overlays, and day/night preview data.",
  vision: "A completely unique topological mapping tool. Since 2D flat maps fail at representing planetary scales, this editor provides genuine spherical coordinate systems (Lat/Lon) tailored exactly for the specialized `lurek.globe` API.",
  nativeFormat: "globe setup Lua data",
  exportBaseName: "globe",
  exports: ["lua", "json"],
  featureList: [
    "3D interactive convex sphere viewport preview.",
    "Precise latitude and longitude coordinate plotting tools.",
    "Equirectangular texture projection wrapping and preview.",
    "Camera rotation and altitude zoom controls.",
    "Waypoint placement mapped directly onto the sphere surface.",
    "Day/Night cycle terminator line simulation.",
    "Export coordinates directly to Lua vector representations.",
    "Pole distortion severity warning visualization.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "globe" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.globe" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Preview telemetry, sample output, and performance notes.",
});

export class GlobeEditor {
  static readonly spec = globeEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, globeEditorSpec);
  }
}
