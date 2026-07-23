import type { EditorSpec } from "./types.js";
import { tileMapEditorSpec } from "./tileMapEditor.js";
import { sceneFlowEditorSpec } from "./sceneFlowEditor.js";
import { entityEditorSpec } from "./entityEditor.js";
import { pixelArtEditorSpec } from "./pixelArtEditor.js";
import { particleEditorSpec } from "./particleEditor.js";
import { dialogEditorSpec } from "./dialogEditor.js";
import { databaseEditorSpec } from "./databaseEditor.js";
import { procMapEditorSpec } from "./procMapEditor.js";
import { questTreeEditorSpec } from "./questTreeEditor.js";
import { guiWidgetEditorSpec } from "./guiWidgetEditor.js";
import { aiBehaviorEditorSpec } from "./aiBehaviorEditor.js";
import { graphEditorSpec } from "./graphEditor.js";
import { tilemapScriptEditorSpec } from "./tilemapScriptEditor.js";
import { voxelEditorSpec } from "./voxelEditor.js";
import { testRunnerEditorSpec } from "./testRunnerEditor.js";
import { apiReferenceEditorSpec } from "./apiReferenceEditor.js";
import { postfxOverlayEditorSpec } from "./postfxOverlayEditor.js";
import { soundDspEditorSpec } from "./soundDspEditor.js";
import { spriteAnimEditorSpec } from "./spriteAnimEditor.js";
import { tilesetEditorSpec } from "./tilesetEditor.js";
import { audioMixerEditorSpec } from "./audioMixerEditor.js";
import { colorPaletteEditorSpec } from "./colorPaletteEditor.js";
import { inputMapperEditorSpec } from "./inputMapperEditor.js";
import { timelineEditorSpec } from "./timelineEditor.js";
import { shaderPreviewEditorSpec } from "./shaderPreviewEditor.js";
import { fontPreviewEditorSpec } from "./fontPreviewEditor.js";
import { localizationEditorSpec } from "./localizationEditor.js";
import { physicsMaterialsEditorSpec } from "./physicsMaterialsEditor.js";
import { worldMapEditorSpec } from "./worldMapEditor.js";
import { provinceEditorSpec } from "./provinceEditor.js";
import { globeEditorSpec } from "./globeEditor.js";
import { navMeshEditorSpec } from "./navMeshEditor.js";
import { skeletonRiggingEditorSpec } from "./skeletonRiggingEditor.js";
import { visualShaderEditorSpec } from "./visualShaderEditor.js";
import { lightingEnvironmentEditorSpec } from "./lightingEnvironmentEditor.js";
import { guiThemeEditorSpec } from "./guiThemeEditor.js";
import { networkTopologyEditorSpec } from "./networkTopologyEditor.js";
import { globalAutoloadEditorSpec } from "./globalAutoloadEditor.js";
import { assetManifestEditorSpec } from "./assetManifestEditor.js";
import { performanceProfilerEditorSpec } from "./performanceProfilerEditor.js";
import { projectExportEditorSpec } from "./projectExportEditor.js";

export const EDITOR_CATALOG: readonly EditorSpec[] = [
  tileMapEditorSpec,
  sceneFlowEditorSpec,
  entityEditorSpec,
  pixelArtEditorSpec,
  particleEditorSpec,
  dialogEditorSpec,
  databaseEditorSpec,
  procMapEditorSpec,
  questTreeEditorSpec,
  guiWidgetEditorSpec,
  aiBehaviorEditorSpec,
  graphEditorSpec,
  tilemapScriptEditorSpec,
  voxelEditorSpec,
  testRunnerEditorSpec,
  apiReferenceEditorSpec,
  postfxOverlayEditorSpec,
  soundDspEditorSpec,
  spriteAnimEditorSpec,
  tilesetEditorSpec,
  audioMixerEditorSpec,
  colorPaletteEditorSpec,
  inputMapperEditorSpec,
  timelineEditorSpec,
  shaderPreviewEditorSpec,
  fontPreviewEditorSpec,
  localizationEditorSpec,
  physicsMaterialsEditorSpec,
  worldMapEditorSpec,
  provinceEditorSpec,
  globeEditorSpec,
  navMeshEditorSpec,
  skeletonRiggingEditorSpec,
  visualShaderEditorSpec,
  lightingEnvironmentEditorSpec,
  guiThemeEditorSpec,
  networkTopologyEditorSpec,
  globalAutoloadEditorSpec,
  assetManifestEditorSpec,
  performanceProfilerEditorSpec,
  projectExportEditorSpec,
];

export const EDITOR_COUNT = EDITOR_CATALOG.length;

export function getEditorSpec(id: string): EditorSpec | undefined {
  return EDITOR_CATALOG.find((entry) => entry.id === id || entry.command === id);
}

export function getEditorCommandIds(): string[] {
  return EDITOR_CATALOG.map((entry) => entry.command);
}

export function validateEditorCatalog(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const commands = new Set<string>();
  const viewTypes = new Set<string>();

  for (const entry of EDITOR_CATALOG) {
    if (ids.has(entry.id)) errors.push(`Duplicate editor id: ${entry.id}`);
    if (commands.has(entry.command)) errors.push(`Duplicate editor command: ${entry.command}`);
    if (viewTypes.has(entry.viewType)) errors.push(`Duplicate editor view type: ${entry.viewType}`);
    ids.add(entry.id);
    commands.add(entry.command);
    viewTypes.add(entry.viewType);

    if (entry.command !== `lurek.editor.${entry.id}`) errors.push(`Unexpected command for ${entry.id}: ${entry.command}`);
    if (entry.viewType !== entry.command) errors.push(`Unexpected view type for ${entry.id}: ${entry.viewType}`);
    if (!entry.title.trim()) errors.push(`Missing title for ${entry.id}`);
    if (!entry.sidebarLabel.trim()) errors.push(`Missing sidebar label for ${entry.id}`);
    if (!entry.icon.trim()) errors.push(`Missing icon for ${entry.id}`);
    if (!entry.reference.trim()) errors.push(`Missing reference for ${entry.id}`);
    if (!entry.useCase.trim()) errors.push(`Missing use case for ${entry.id}`);
    if (!entry.vision.trim()) errors.push(`Missing vision for ${entry.id}`);
    if (entry.featureList.length !== 8) errors.push(`Expected 8 guide features for ${entry.id}`);
    if (entry.featureActions.length !== 8) errors.push(`Expected 8 interactive feature actions for ${entry.id}`);
    for (const action of entry.featureActions) {
      if (!action.id.trim()) errors.push(`Missing feature action id for ${entry.id}`);
      if (!action.label.trim()) errors.push(`Missing feature action label for ${entry.id}`);
      if (!action.description.trim()) errors.push(`Missing feature action description for ${entry.id}`);
      if (action.payload.workspace !== entry.workspace) errors.push(`Feature action ${action.id} workspace mismatch for ${entry.id}`);
    }
    if (!entry.exports.length) errors.push(`Missing exports for ${entry.id}`);
    if (!entry.tools.length) errors.push(`Missing tools for ${entry.id}`);
    if (!entry.toolbar.length) errors.push(`Missing toolbar actions for ${entry.id}`);
    if (!entry.inspector.length) errors.push(`Missing inspector sections for ${entry.id}`);
    if (!entry.bottomPanel.trim()) errors.push(`Missing bottom panel description for ${entry.id}`);
  }

  return errors;
}
