import type { EditorContent } from "./types.js";
import { localizationContent, inputMapperContent, testRunnerContent, globalAutoloadContent, assetManifestContent } from "./tableContent.js";
import { navMeshContent, tilesetContent } from "./gridContent.js";
import { questTreeContent, visualShaderContent, soundDspContent, worldMapContent, networkTopologyContent } from "./nodeContent.js";
import { timelineContent, spriteAnimContent } from "./timelineContent.js";
import { postfxContent, shaderPreviewContent, fontPreviewContent, audioMixerContent, colorPaletteContent, physicsMaterialsContent, lightingContent, profilerContent } from "./previewContent.js";
import { entityContent, guiWidgetContent, guiThemeContent, tilemapScriptContent, apiReferenceContent, projectExportContent } from "./documentContent.js";
import { aiBehaviorContent, databaseContent, dialogContent, globeContent, graphContent, particleContent, pixelArtContent, procMapContent, provinceContent, sceneFlowContent, skeletonRiggingContent, tileMapContent, voxelContent } from "./professionalContent.js";

function fallbackContent(editorId: string): EditorContent {
  return {
    workspaceHtml: `<main class="workspace preview-workspace"><div class="canvas-header"><p class="workspace-purpose">Editor "${editorId}" — custom content not yet available.</p></div><canvas id="editorCanvas" width="960" height="540"></canvas></main>`,
    styles: "",
    script: `console.log("Fallback editor loaded for: ${editorId}");`,
  };
}

export function getEditorContent(editorId: string): EditorContent {
  switch (editorId) {
    // Table editors
    case "database": return databaseContent();
    case "localization": return localizationContent();
    case "inputMapper": return inputMapperContent();
    case "testRunner": return testRunnerContent();
    case "globalAutoload": return globalAutoloadContent();
    case "assetManifest": return assetManifestContent();

    // Grid editors
    case "tileMap": return tileMapContent();
    case "pixelArt": return pixelArtContent();
    case "voxel": return voxelContent();
    case "province": return provinceContent();
    case "navMesh": return navMeshContent();
    case "tileset": return tilesetContent();

    // Node editors
    case "graph": return graphContent();
    case "dialog": return dialogContent();
    case "questTree": return questTreeContent();
    case "sceneFlow": return sceneFlowContent();
    case "aiBehavior": return aiBehaviorContent();
    case "visualShader": return visualShaderContent();
    case "soundDsp": return soundDspContent();
    case "worldMap": return worldMapContent();
    case "networkTopology": return networkTopologyContent();

    // Timeline editors
    case "timeline": return timelineContent();
    case "spriteAnim": return spriteAnimContent();
    case "skeletonRigging": return skeletonRiggingContent();

    // Preview editors
    case "particle": return particleContent();
    case "postfxOverlay": return postfxContent();
    case "procMap": return procMapContent();
    case "shaderPreview": return shaderPreviewContent();
    case "fontPreview": return fontPreviewContent();
    case "audioMixer": return audioMixerContent();
    case "colorPalette": return colorPaletteContent();
    case "physicsMaterials": return physicsMaterialsContent();
    case "lightingEnvironment": return lightingContent();
    case "performanceProfiler": return profilerContent();
    case "globe": return globeContent();

    // Document editors
    case "entity": return entityContent();
    case "guiWidget": return guiWidgetContent();
    case "guiTheme": return guiThemeContent();
    case "tilemapScript": return tilemapScriptContent();
    case "apiReference": return apiReferenceContent();
    case "projectExport": return projectExportContent();

    default: return fallbackContent(editorId);
  }
}
