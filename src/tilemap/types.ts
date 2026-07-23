/** Single tile layer within a TileMapDocument. */
export interface TileLayer {
    id: string;
    name: string;
    visible: boolean;
    /** Flat row-major array of tile indices, length must equal width * height. */
    data: number[];
}

/** Root document format for *.ltm.json files. */
export interface TileMapDocument {
    version: "1.0.0";
    width: number;
    height: number;
    tileSize: number;
    name: string;
    layers: TileLayer[];
}

/** A single validation finding returned by validateTileMap. */
export interface TileMapValidationIssue {
    severity: "error" | "warning";
    message: string;
    /** e.g. 'core' or 'layer:bg' */
    source: string;
}
