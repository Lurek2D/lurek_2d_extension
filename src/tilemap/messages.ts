import type { TileMapDocument, TileMapValidationIssue } from "./types.js";

/** Messages sent from the Webview to the Extension Host. */
export type WebviewToHostMessage =
    | { type: "ready" }
    | { type: "updateDocument"; document: TileMapDocument }
    | { type: "requestExport" }
    | { type: "requestValidate" };

/** Messages sent from the Extension Host to the Webview. */
export type HostToWebviewMessage =
    | { type: "initialize"; document: TileMapDocument }
    | { type: "documentUpdated"; document: TileMapDocument }
    | { type: "validationResults"; issues: TileMapValidationIssue[] };
