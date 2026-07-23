import * as vscode from "vscode";
import { defineEditorSpec, openEditorSpec } from "./editorFactory.js";

export const pixelArtEditorSpec = defineEditorSpec({
  id: "pixelArt",
  command: "lurek.editor.pixelArt",
  viewType: "lurek.editor.pixelArt",
  title: "Pixel Art Editor",
  sidebarLabel: "Pixel Art Editor",
  icon: "paintcan",
  category: "asset",
  workspace: "grid",
  reference: "Aseprite, Piskel.",
  useCase: "Built-in painting tool allowing editing, drawing from scratch, and tweaking pixel-art textures directly in the IDE.",
  apiNamespace: "lurek.image",
  purpose: "Create and tweak pixel art frames with palette, layer, grid, and frame controls.",
  vision: "Must integrate flawlessly with Lurek's live-reload functionality. If an artist tweaks a single pixel in this editor, it must instantly reflect on the moving character in the running Lurek2D game window via `lurek.image` hot-reloading.",
  nativeFormat: "indexed pixel JSON plus Lua loader",
  exportBaseName: "pixel_art",
  exports: ["json", "lua"],
  featureList: [
    "Pixel-perfect pencil and eraser tools optimized for low resolutions.",
    "Bucket fill and magic wand with tolerance settings.",
    "Multi-layer management with opacity and blend mode controls.",
    "Custom color palette selection locked to specific hexadecimal ranges.",
    "Symmetry and mirror drawing axes for character faces.",
    "Frame-by-frame animation timeline integrated into the painting view.",
    "Onion skinning for visualizing previous and next frames.",
    "Real-time zoom and customizable grid overlays.",
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
    { title: "Selection", fields: [{ id: "name", label: "Asset name", type: "text", value: "image" }, { id: "enabled", label: "Enabled", type: "checkbox", value: true }, { id: "priority", label: "Priority", type: "number", value: 0, min: 0, max: 999 }] },
    { title: "Runtime Binding", fields: [{ id: "namespace", label: "Lurek namespace", type: "text", value: "lurek.image" }, { id: "hotReload", label: "Hot reload", type: "checkbox", value: true }] },
  ],
  bottomPanel: "Layers, coordinates, collision masks, and validation messages.",
});

export class PixelArtEditor {
  static readonly spec = pixelArtEditorSpec;

  static open(context: vscode.ExtensionContext): void {
    openEditorSpec(context, pixelArtEditorSpec);
  }
}
