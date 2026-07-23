import * as vscode from "vscode";
import type { EditorSpec } from "./types.js";
import { TileMapEditor } from "./tileMapEditor.js";
import { SceneFlowEditor } from "./sceneFlowEditor.js";
import { EntityEditor } from "./entityEditor.js";
import { PixelArtEditor } from "./pixelArtEditor.js";
import { ParticleEditor } from "./particleEditor.js";
import { DialogEditor } from "./dialogEditor.js";
import { DatabaseEditor } from "./databaseEditor.js";
import { ProcMapEditor } from "./procMapEditor.js";
import { QuestTreeEditor } from "./questTreeEditor.js";
import { GuiWidgetEditor } from "./guiWidgetEditor.js";
import { AiBehaviorEditor } from "./aiBehaviorEditor.js";
import { GraphEditor } from "./graphEditor.js";
import { TilemapScriptEditor } from "./tilemapScriptEditor.js";
import { VoxelEditor } from "./voxelEditor.js";
import { TestRunnerEditor } from "./testRunnerEditor.js";
import { ApiReferenceEditor } from "./apiReferenceEditor.js";
import { PostFxOverlayEditor } from "./postfxOverlayEditor.js";
import { SoundDspEditor } from "./soundDspEditor.js";
import { SpriteAnimEditor } from "./spriteAnimEditor.js";
import { TilesetEditor } from "./tilesetEditor.js";
import { AudioMixerEditor } from "./audioMixerEditor.js";
import { ColorPaletteEditor } from "./colorPaletteEditor.js";
import { InputMapperEditor } from "./inputMapperEditor.js";
import { TimelineEditor } from "./timelineEditor.js";
import { ShaderPreviewEditor } from "./shaderPreviewEditor.js";
import { FontPreviewEditor } from "./fontPreviewEditor.js";
import { LocalizationEditor } from "./localizationEditor.js";
import { PhysicsMaterialsEditor } from "./physicsMaterialsEditor.js";
import { WorldMapEditor } from "./worldMapEditor.js";
import { ProvinceEditor } from "./provinceEditor.js";
import { GlobeEditor } from "./globeEditor.js";
import { NavMeshEditor } from "./navMeshEditor.js";
import { SkeletonRiggingEditor } from "./skeletonRiggingEditor.js";
import { VisualShaderEditor } from "./visualShaderEditor.js";
import { LightingEnvironmentEditor } from "./lightingEnvironmentEditor.js";
import { GuiThemeEditor } from "./guiThemeEditor.js";
import { NetworkTopologyEditor } from "./networkTopologyEditor.js";
import { GlobalAutoloadEditor } from "./globalAutoloadEditor.js";
import { AssetManifestEditor } from "./assetManifestEditor.js";
import { PerformanceProfilerEditor } from "./performanceProfilerEditor.js";
import { ProjectExportEditor } from "./projectExportEditor.js";

export interface EditorImplementation {
  readonly spec: EditorSpec;
  open(context: vscode.ExtensionContext): void;
}

export const EDITOR_IMPLEMENTATIONS = [
  TileMapEditor,
  SceneFlowEditor,
  EntityEditor,
  PixelArtEditor,
  ParticleEditor,
  DialogEditor,
  DatabaseEditor,
  ProcMapEditor,
  QuestTreeEditor,
  GuiWidgetEditor,
  AiBehaviorEditor,
  GraphEditor,
  TilemapScriptEditor,
  VoxelEditor,
  TestRunnerEditor,
  ApiReferenceEditor,
  PostFxOverlayEditor,
  SoundDspEditor,
  SpriteAnimEditor,
  TilesetEditor,
  AudioMixerEditor,
  ColorPaletteEditor,
  InputMapperEditor,
  TimelineEditor,
  ShaderPreviewEditor,
  FontPreviewEditor,
  LocalizationEditor,
  PhysicsMaterialsEditor,
  WorldMapEditor,
  ProvinceEditor,
  GlobeEditor,
  NavMeshEditor,
  SkeletonRiggingEditor,
  VisualShaderEditor,
  LightingEnvironmentEditor,
  GuiThemeEditor,
  NetworkTopologyEditor,
  GlobalAutoloadEditor,
  AssetManifestEditor,
  PerformanceProfilerEditor,
  ProjectExportEditor,
] satisfies readonly EditorImplementation[];
