export type EditorCategory =
  | "map"
  | "graph"
  | "asset"
  | "ui"
  | "data"
  | "system";

export type EditorWorkspace =
  | "grid"
  | "node"
  | "timeline"
  | "table"
  | "preview"
  | "document";

export type EditorExportFormat = "lua" | "toml" | "json" | "css" | "wgsl";

export type EditorFeatureActionKind =
  | "gridPaint"
  | "nodeGraph"
  | "tableData"
  | "timelineEdit"
  | "previewSim"
  | "documentEdit";

export interface EditorFeatureActionPayload {
  readonly index: number;
  readonly workspace: EditorWorkspace;
  readonly mode: string;
  readonly sourceFeature: string;
}

export interface EditorFeatureActionSpec {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly kind: EditorFeatureActionKind;
  readonly payload: EditorFeatureActionPayload;
}

export interface EditorToolSpec {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly shortcut?: string;
}

export interface EditorFieldSpec {
  readonly id: string;
  readonly label: string;
  readonly type: "text" | "number" | "checkbox" | "select" | "range" | "textarea";
  readonly value: string | number | boolean;
  readonly options?: readonly string[];
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
}

export interface EditorInspectorSectionSpec {
  readonly title: string;
  readonly fields: readonly EditorFieldSpec[];
}

export interface EditorActionSpec {
  readonly id: string;
  readonly label: string;
  readonly kind: "primary" | "secondary" | "toggle";
  readonly shortcut?: string;
}

export interface EditorSampleNode {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly x: number;
  readonly y: number;
}

export interface EditorSampleLink {
  readonly from: string;
  readonly to: string;
  readonly label?: string;
}

export interface EditorSpec {
  readonly id: string;
  readonly command: string;
  readonly viewType: string;
  readonly title: string;
  readonly sidebarLabel: string;
  readonly icon: string;
  readonly category: EditorCategory;
  readonly workspace: EditorWorkspace;
  readonly reference: string;
  readonly useCase: string;
  readonly apiNamespace: string;
  readonly purpose: string;
  readonly vision: string;
  readonly nativeFormat: string;
  readonly exportBaseName: string;
  readonly exports: readonly EditorExportFormat[];
  readonly featureList: readonly string[];
  readonly toolbar: readonly EditorActionSpec[];
  readonly tools: readonly EditorToolSpec[];
  readonly inspector: readonly EditorInspectorSectionSpec[];
  readonly bottomPanel: string;
  readonly validations: readonly string[];
  readonly featureActions: readonly EditorFeatureActionSpec[];
  readonly nodes?: readonly EditorSampleNode[];
  readonly links?: readonly EditorSampleLink[];
  readonly tableColumns?: readonly string[];
}

export interface EditorRuntimeState {
  dirty: boolean;
  zoom: number;
  selectedTool: string;
  selectedItem: string;
  gridEnabled: boolean;
  payload: Record<string, unknown>;
}
