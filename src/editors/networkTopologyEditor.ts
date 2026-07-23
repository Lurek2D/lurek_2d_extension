import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const networkTopologyEditorSpec = defineEditorSpec({
  id: "networkTopology",
  command: "lurek.editor.networkTopology",
  viewType: "lurek.editor.networkTopology",
  title: "Network Topology Editor",
  sidebarLabel: "Network Topology Editor",
  icon: "server-environment",
  category: "graph",
  workspace: "node",
  reference: "Godot MultiplayerSynchronizer/Spawner, Photon PUN.",
  useCase: "Defining multiplayer authority, synchronization targets, and RPCs.",
  apiNamespace: "lurek.network",
  purpose: "Define authority, synchronized variables, RPC permissions, interpolation, spawn rules, and bandwidth estimates.",
  vision: "Makes netcode visual. Instead of coding serialization by hand, developers define which entity variables are synchronized over the network and who owns them (Server vs Client).",
  nativeFormat: "network manifest JSON/Lua",
  exportBaseName: "network_topology",
  exports: ["json", "lua"],
  featureList: [
    "Variable synchronization tagging (Position, Health, State).",
    "RPC (Remote Procedure Call) registration and permissions.",
    "Authority delegation (Server authoritative vs Client prediction).",
    "Network interpolation and extrapolation smoothing settings.",
    "Entity spawning/despawning replication rules.",
    "Bandwidth consumption estimator based on sync rate.",
    "Simulated latency and packet-loss testing environment.",
    "Export to optimized network manifest configurations.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "network" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.network" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Execution trace, unreachable nodes, and graph validation output.",
});

export class NetworkTopologyEditor {
  static readonly spec = networkTopologyEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, networkTopologyEditorSpec);
  }
}
