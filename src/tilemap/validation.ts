import type { TileMapDocument, TileMapValidationIssue } from "./types.js";

const SUPPORTED_VERSIONS: readonly string[] = ["1.0.0"];

/**
 * Pure validation function — no VS Code API dependency.
 * Can be reused in CI or CLI tooling.
 */
export function validateTileMap(doc: TileMapDocument): TileMapValidationIssue[] {
    const issues: TileMapValidationIssue[] = [];

    if (!SUPPORTED_VERSIONS.includes(doc.version)) {
        issues.push({ severity: "error", message: `Unsupported version: ${doc.version}`, source: "core" });
    }
    if (doc.width <= 0 || doc.height <= 0) {
        issues.push({ severity: "error", message: `Map dimensions must be > 0. Got: ${doc.width}x${doc.height}`, source: "core" });
    }
    if (doc.tileSize <= 0) {
        issues.push({ severity: "error", message: `tileSize must be > 0.`, source: "core" });
    }

    const expectedDataLength = doc.width * doc.height;
    const layerNames = new Set<string>();

    for (const layer of doc.layers) {
        if (layerNames.has(layer.name)) {
            issues.push({ severity: "error", message: `Duplicate layer name: "${layer.name}"`, source: `layer:${layer.id}` });
        }
        layerNames.add(layer.name);

        if (layer.data.length !== expectedDataLength) {
            issues.push({
                severity: "error",
                message: `Layer data length is invalid. Expected ${expectedDataLength}, got ${layer.data.length}.`,
                source: `layer:${layer.id}`,
            });
        }
    }

    return issues;
}
