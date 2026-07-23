import * as vscode from "vscode";
import { openEditorPanel } from "./panelHost.js";
import type { EditorFeatureActionKind, EditorFeatureActionSpec, EditorSampleLink, EditorSampleNode, EditorSpec, EditorWorkspace } from "./types.js";

type RuntimeFilledSpecFields = "command" | "viewType" | "validations" | "featureActions" | "nodes" | "links";

export type EditorSpecSeed = Omit<EditorSpec, RuntimeFilledSpecFields> &
  Partial<Pick<EditorSpec, RuntimeFilledSpecFields>>;

/**
 * Defines one concrete editor spec from a local implementation file.
 *
 * This helper deliberately does not import the catalog. The catalog aggregates
 * local specs; it is not the owner of editor-specific guide data.
 */
export function defineEditorSpec(seed: EditorSpecSeed): EditorSpec {
  validateSeed(seed);

  const command = seed.command ?? `lurek.editor.${seed.id}`;
  const viewType = seed.viewType ?? command;
  const featureActions = seed.featureActions ?? deriveFeatureActions(seed);

  validateFeatureActions(seed.id, featureActions);

  return {
    ...seed,
    command,
    viewType,
    validations: seed.validations ?? defaultValidations(seed),
    featureActions,
    nodes: seed.nodes ?? defaultNodes(seed),
    links: seed.links ?? defaultLinks(seed),
  };
}

/** Opens a concrete local editor spec through the shared VS Code webview host. */
export function openEditorSpec(context: vscode.ExtensionContext, spec: EditorSpec): void {
  openEditorPanel(context, spec);
}

function validateSeed(seed: EditorSpecSeed): void {
  const requiredStrings: Array<keyof Pick<EditorSpecSeed,
    "id" | "title" | "sidebarLabel" | "icon" | "reference" | "useCase" |
    "apiNamespace" | "purpose" | "vision" | "nativeFormat" | "exportBaseName" | "bottomPanel"
  >> = [
    "id",
    "title",
    "sidebarLabel",
    "icon",
    "reference",
    "useCase",
    "apiNamespace",
    "purpose",
    "vision",
    "nativeFormat",
    "exportBaseName",
    "bottomPanel",
  ];

  for (const key of requiredStrings) {
    const value = seed[key];
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Editor spec ${seed.id || "<unknown>"} is missing ${key}.`);
    }
  }

  if (!Array.isArray(seed.featureList) || seed.featureList.length !== 8 || seed.featureList.some((item) => !item.trim())) {
    throw new Error(`Editor spec ${seed.id} must include the 8 guide features.`);
  }
  if (seed.featureActions !== undefined) {
    validateFeatureActions(seed.id, seed.featureActions);
  }
  if (!Array.isArray(seed.toolbar) || !seed.toolbar.length) {
    throw new Error(`Editor spec ${seed.id} must define local toolbar actions.`);
  }
  if (!Array.isArray(seed.tools) || !seed.tools.length) {
    throw new Error(`Editor spec ${seed.id} must define local palette tools.`);
  }
  if (!Array.isArray(seed.inspector) || !seed.inspector.length) {
    throw new Error(`Editor spec ${seed.id} must define local inspector sections.`);
  }
  if (!Array.isArray(seed.exports) || !seed.exports.length) {
    throw new Error(`Editor spec ${seed.id} must define export formats.`);
  }
}

function defaultValidations(seed: EditorSpecSeed): readonly string[] {
  return [
    "All guide-derived feature actions must stay clickable and mutate panel state.",
    `Exports must remain natively compatible with ${seed.apiNamespace}.`,
    `Generated ${seed.nativeFormat} data must stay deterministic for source control.`,
  ];
}

function deriveFeatureActions(seed: EditorSpecSeed): readonly EditorFeatureActionSpec[] {
  const usedIds = new Set<string>();
  return seed.featureList.map((feature, index) => {
    const label = summarizeFeatureLabel(feature, index);
    const baseId = `feature${index + 1}-${slugify(label)}`;
    const id = makeUniqueActionId(baseId, usedIds);
    return {
      id,
      label,
      description: feature,
      kind: featureKindForWorkspace(seed.workspace),
      payload: {
        index,
        workspace: seed.workspace,
        mode: inferFeatureMode(seed.workspace, feature),
        sourceFeature: feature,
      },
    };
  });
}

function validateFeatureActions(editorId: string, actions: readonly EditorFeatureActionSpec[]): void {
  if (!Array.isArray(actions) || actions.length !== 8) {
    throw new Error(`Editor spec ${editorId} must expose 8 interactive feature actions.`);
  }

  const ids = new Set<string>();
  for (const action of actions) {
    if (!action.id.trim()) throw new Error(`Editor spec ${editorId} has a feature action without an id.`);
    if (ids.has(action.id)) throw new Error(`Editor spec ${editorId} has duplicate feature action id ${action.id}.`);
    ids.add(action.id);
    if (!action.label.trim()) throw new Error(`Editor spec ${editorId} has a feature action without a label.`);
    if (!action.description.trim()) throw new Error(`Editor spec ${editorId} has a feature action without a description.`);
    if (!action.payload || action.payload.index < 0 || action.payload.index > 7) {
      throw new Error(`Editor spec ${editorId} feature action ${action.id} has an invalid payload index.`);
    }
  }
}

function featureKindForWorkspace(workspace: EditorWorkspace): EditorFeatureActionKind {
  switch (workspace) {
    case "grid": return "gridPaint";
    case "node": return "nodeGraph";
    case "table": return "tableData";
    case "timeline": return "timelineEdit";
    case "preview": return "previewSim";
    case "document": return "documentEdit";
  }
}

function inferFeatureMode(workspace: EditorWorkspace, feature: string): string {
  const text = feature.toLowerCase();

  if (workspace === "grid") {
    if (/(layer|slice|slicing)/.test(text)) return "layer";
    if (/(brush|pencil|draw|paint|placement|plot)/.test(text)) return "paint";
    if (/(flood|bucket|fill|hollow)/.test(text)) return "fill";
    if (/(stamp|paste|pattern|extrusion|carving)/.test(text)) return "stamp";
    if (/(collision|mask|solid|walkable|obstacle|cost|vertex|polygon|border)/.test(text)) return "collision";
    if (/(auto|terrain|bitmask|snap|neighbor)/.test(text)) return "autotile";
    if (/(property|metadata|tag|resource|ownership|boolean)/.test(text)) return "property";
    return "selectCell";
  }

  if (workspace === "node") {
    if (/(drag|drop|creation|insertion|node placement|node-based|canvas)/.test(text)) return "addNode";
    if (/(transition|link|connection|routing|cable|path)/.test(text)) return "connect";
    if (/(debug|live|runtime|simulation|ping|highlight)/.test(text)) return "simulate";
    if (/(validation|unreachable|checking|diff)/.test(text)) return "validate";
    if (/(variable|binding|condition|parameter|permission|authority)/.test(text)) return "bind";
    if (/(export|compile|code|shader|manifest)/.test(text)) return "generate";
    if (/(nested|group|comment|sub-|sub tree|module)/.test(text)) return "group";
    if (/(arrange|layout|auto)/.test(text)) return "arrange";
    return "selectNode";
  }

  if (workspace === "table") {
    if (/(row|list|grid|table|singleton|bucket|action)/.test(text)) return "addRow";
    if (/(column|language|typed|schema|hardware|platform)/.test(text)) return "addColumn";
    if (/(sort|filter|search|tag|regex|missing|unused)/.test(text)) return "filter";
    if (/(validation|warning|conflict|dependency|duplicate|strict)/.test(text)) return "validate";
    if (/(import|export|csv|json|toml|pak|package)/.test(text)) return "importExport";
    if (/(formula|math|bulk|replace|priority|order|curve)/.test(text)) return "formula";
    if (/(progress|timer|coverage|memory|ram|vram|meter)/.test(text)) return "metrics";
    return "editCell";
  }

  if (workspace === "timeline") {
    if (/(track|sequence|hierarchical)/.test(text)) return "addTrack";
    if (/(keyframe|frame|duration|rotation|target)/.test(text)) return "keyframe";
    if (/(scrub|playhead|synchronized)/.test(text)) return "scrub";
    if (/(playback|preview|animation|ragdoll|physics)/.test(text)) return "play";
    if (/(easing|curve|bezier|linear|bounce|spline)/.test(text)) return "easing";
    if (/(audio|waveform|voice|skin|texture)/.test(text)) return "waveform";
    if (/(event|trigger|lua|footstep)/.test(text)) return "event";
    if (/(nest|modular|parent|child|ik)/.test(text)) return "nest";
    return "keyframe";
  }

  if (workspace === "preview") {
    if (/(slider|control|intensity|threshold|frequency|size|color|energy|density)/.test(text)) return "slider";
    if (/(overlay|visualization|heatmap|normal|split|before|after|grid)/.test(text)) return "overlay";
    if (/(particle|emission|burst|noise|procedural|generation|terrain|sample|atlas)/.test(text)) return "generate";
    if (/(performance|timer|memory|gpu|cost|draw|batch|profile|meter)/.test(text)) return "metrics";
    if (/(texture|sprite|font|globe|light|shadow|sphere|waypoint|material)/.test(text)) return "sample";
    if (/(play|simulate|preview|live|sandbox|testing)/.test(text)) return "simulate";
    if (/(export|snapshot|preset|saving)/.test(text)) return "snapshot";
    return "simulate";
  }

  if (/(search|fuzzy|filter|hyperlink|cross-link)/.test(text)) return "search";
  if (/(copy|signature|clipboard)/.test(text)) return "copy";
  if (/(insert|snippet|code|lua|callback|source)/.test(text)) return "insert";
  if (/(validate|error|compile|intellisense|syntax)/.test(text)) return "validate";
  if (/(theme|dark|light|style|css|widget|component)/.test(text)) return "style";
  if (/(export|manifest|build|platform|configuration|files)/.test(text)) return "exportDoc";
  if (/(docs|markdown|api|parameter|return)/.test(text)) return "docs";
  return "editDocument";
}

function summarizeFeatureLabel(feature: string, index: number): string {
  const normalized = feature.replace(/[.`*_]/g, "").replace(/\s+/g, " ").trim();
  const sentence = normalized.split(/[.;:]/)[0]?.trim() || `Feature ${index + 1}`;
  return sentence.length > 54 ? `${sentence.slice(0, 51).trim()}…` : sentence;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "action";
}

function makeUniqueActionId(baseId: string, usedIds: Set<string>): string {
  let id = baseId;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);
  return id;
}

function defaultNodes(seed: EditorSpecSeed): readonly EditorSampleNode[] | undefined {
  if (seed.workspace !== "node") {
    return undefined;
  }
  return [
    { id: "input", label: "Input", type: "Entry", x: 80, y: 118 },
    { id: "authoring", label: seed.sidebarLabel, type: "Guide", x: 330, y: 96 },
    { id: "export", label: seed.nativeFormat, type: "Output", x: 610, y: 132 },
  ];
}

function defaultLinks(seed: EditorSpecSeed): readonly EditorSampleLink[] | undefined {
  if (seed.workspace !== "node") {
    return undefined;
  }
  return [
    { from: "input", to: "authoring", label: "configure" },
    { from: "authoring", to: "export", label: "generate" },
  ];
}
