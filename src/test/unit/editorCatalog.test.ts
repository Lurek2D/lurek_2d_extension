import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { EDITOR_CATALOG, validateEditorCatalog } from "../../editors/catalog";
import { EDITOR_IMPLEMENTATIONS } from "../../editors/implementations";
import { EDITOR_BEHAVIOR_PROFILES, renderEditorHtml } from "../../editors/panelHost";
import { EditorsProvider } from "../../providers/sidebar";

type ExtensionManifest = {
  contributes?: {
    commands?: Array<{ command: string; title?: string; category?: string }>;
  };
};

function findExtensionRoot(): string {
  const candidates = [
    path.resolve(__dirname, "../../.."),
    path.resolve(__dirname, "../.."),
    process.cwd(),
    path.join(process.cwd(), "extension", "vscode"),
  ];

  for (const candidate of candidates) {
    const packagePath = path.join(candidate, "package.json");
    if (!fs.existsSync(packagePath)) continue;
    const manifest = JSON.parse(fs.readFileSync(packagePath, "utf-8")) as { name?: string };
    if (manifest.name === "lurek2d-toolkit") return candidate;
  }

  throw new Error(`Unable to locate extension/vscode from ${process.cwd()}.`);
}

const EXTENSION_ROOT = findExtensionRoot();
const SRC_ROOT = path.join(EXTENSION_ROOT, "src");
const EDITORS_ROOT = path.join(SRC_ROOT, "editors");
const PROFESSIONAL_EDITOR_IDS = new Set(["pixelArt", "database", "dialog", "procMap", "tileMap", "sceneFlow", "particle", "skeletonRigging", "globe", "province", "aiBehavior", "graph", "voxel"]);

function readManifest(): ExtensionManifest {
  const packagePath = path.join(EXTENSION_ROOT, "package.json");
  return JSON.parse(fs.readFileSync(packagePath, "utf-8")) as ExtensionManifest;
}

function readSourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "editors_legacy" || entry.name === "test") continue;
      files.push(...readSourceFiles(fullPath));
    } else if (entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

suite("Editor catalog", () => {
  test("contains the full 41 panel set", () => {
    assert.strictEqual(EDITOR_CATALOG.length, 41);
    assert.deepStrictEqual(validateEditorCatalog(), []);
  });

  test("every editor exposes eight typed clickable feature actions", () => {
    for (const editor of EDITOR_CATALOG) {
      assert.strictEqual(editor.featureActions.length, 8, `${editor.id} should expose 8 feature actions.`);
      const ids = new Set(editor.featureActions.map((action) => action.id));
      assert.strictEqual(ids.size, 8, `${editor.id} feature action ids should be unique.`);

      editor.featureActions.forEach((action, index) => {
        assert.ok(action.id.startsWith(`feature${index + 1}-`), `${editor.id} action ${index + 1} should have a stable derived id.`);
        assert.ok(action.label.trim(), `${editor.id} action ${index + 1} should have a label.`);
        assert.strictEqual(action.description, editor.featureList[index], `${editor.id} action ${index + 1} should preserve the guide feature text.`);
        assert.strictEqual(action.payload.index, index, `${editor.id} action ${index + 1} should store its source index.`);
        assert.strictEqual(action.payload.workspace, editor.workspace, `${editor.id} action ${index + 1} should target the editor workspace.`);
        assert.ok(action.payload.mode.trim(), `${editor.id} action ${index + 1} should carry an interaction mode.`);
      });
    }
  });

  test("interactive behavior profile map covers every editor id", () => {
    assert.deepStrictEqual(Object.keys(EDITOR_BEHAVIOR_PROFILES).sort(), EDITOR_CATALOG.map((editor) => editor.id).sort());
  });

  test("has one active implementation file per editor", () => {
    const editorFiles = fs.readdirSync(EDITORS_ROOT).filter((name) => name.endsWith("Editor.ts")).sort();
    const expectedFiles = EDITOR_CATALOG.map((editor) => `${editor.id}Editor.ts`).sort();

    assert.strictEqual(editorFiles.length, 41);
    assert.deepStrictEqual(editorFiles, expectedFiles);

    for (const editor of EDITOR_CATALOG) {
      const filePath = path.join(EDITORS_ROOT, `${editor.id}Editor.ts`);
      assert.ok(fs.existsSync(filePath), `Expected active editor implementation file ${filePath}.`);
      const content = fs.readFileSync(filePath, "utf-8");
      assert.ok(content.includes("export class"), `${filePath} should export an editor class.`);
      assert.ok(content.includes("defineEditorSpec("), `${filePath} should define its local spec.`);
      assert.ok(content.includes("featureList:"), `${filePath} should include guide features locally.`);
      assert.ok(content.includes("openEditorSpec(context"), `${filePath} should open its concrete local spec.`);
      assert.ok(!/\beditorSpec\s*\(/.test(content), `${filePath} should not use the old editorSpec wrapper.`);
      assert.ok(!content.includes("openCatalogEditor"), `${filePath} should not use the old catalog opener.`);
      assert.ok(!content.includes("./catalog"), `${filePath} should not import the catalog.`);
    }
  });

  test("has no active editors_legacy backup directory", () => {
    assert.ok(!fs.existsSync(path.join(SRC_ROOT, "editors_legacy")), "src/editors_legacy should not exist.");
  });

  test("catalog only aggregates local specs", () => {
    const catalogSource = fs.readFileSync(path.join(EDITORS_ROOT, "catalog.ts"), "utf-8");
    assert.ok(!catalogSource.includes("spec({"), "catalog.ts should not contain central spec seed data.");
    assert.ok(!catalogSource.includes("BASE_TOOLBAR"), "catalog.ts should not own toolbar defaults.");
    assert.ok(catalogSource.includes("tileMapEditorSpec"), "catalog.ts should import local spec constants.");
  });

  test("active implementations match the catalog", () => {
    assert.strictEqual(EDITOR_IMPLEMENTATIONS.length, EDITOR_CATALOG.length);
    const catalogCommands = EDITOR_CATALOG.map((entry) => entry.command).sort();
    const implementationCommands = EDITOR_IMPLEMENTATIONS.map((entry) => entry.spec.command).sort();
    assert.deepStrictEqual(implementationCommands, catalogCommands);
  });

  test("manifest contributes every editor command", () => {
    const manifest = readManifest();
    const contributed = new Set((manifest.contributes?.commands ?? []).map((entry) => entry.command));

    for (const editor of EDITOR_CATALOG) {
      assert.ok(contributed.has(editor.command), `Expected ${editor.command} in package.json contributes.commands.`);
    }
  });

  test("editor command contributions all have catalog entries", () => {
    const manifest = readManifest();
    const catalogCommands = new Set(EDITOR_CATALOG.map((entry) => entry.command));
    const contributedEditorCommands = (manifest.contributes?.commands ?? [])
      .map((entry) => entry.command)
      .filter((command) => command.startsWith("lurek.editor."));

    assert.strictEqual(contributedEditorCommands.length, new Set(contributedEditorCommands).size, "package.json should not duplicate editor commands.");
    assert.deepStrictEqual([...new Set(contributedEditorCommands)].sort(), [...catalogCommands].sort());

    for (const command of contributedEditorCommands) {
      assert.ok(catalogCommands.has(command), `Expected ${command} to exist in editor catalog.`);
    }
  });

  test("sidebar exposes every catalog editor", () => {
    const provider = new EditorsProvider();
    const items = provider.getChildren();
    const sidebarCommands = new Set(items.map((item) => item.command?.command));

    for (const editor of EDITOR_CATALOG) {
      assert.ok(sidebarCommands.has(editor.command), `Expected sidebar item for ${editor.command}.`);
    }
  });

  test("webview HTML has required secure panel regions", () => {
    for (const editor of EDITOR_CATALOG) {
      const html = renderEditorHtml(editor);
      assert.ok(html.includes("Content-Security-Policy"), `${editor.id} is missing CSP.`);
      if (PROFESSIONAL_EDITOR_IDS.has(editor.id)) {
        assert.ok(html.includes("class=\"pro-editor"), `${editor.id} is missing professional editor shell.`);
        assert.ok(html.includes("class=\"pro-topbar\""), `${editor.id} is missing professional top action bar.`);
        assert.ok(html.includes("class=\"side-panel left-panel\""), `${editor.id} is missing professional left parameter panel.`);
        assert.ok(html.includes("class=\"side-panel right-panel\""), `${editor.id} is missing professional right properties panel.`);
        assert.ok(html.includes("class=\"icon-button"), `${editor.id} is missing professional icon buttons.`);
        assert.ok(html.includes("class=\"tooltip\""), `${editor.id} is missing icon button tooltips.`);
        assert.ok(html.includes("Generated Output"), `${editor.id} is missing generated output panel.`);
        assert.ok(html.includes("postMessage"), `${editor.id} is missing backend webview messaging.`);
        assert.ok(!html.includes("http://") && !html.includes("https://"), `${editor.id} should not load external resources.`);
        continue;
      }
      assert.ok(html.includes("class=\"toolbar\""), `${editor.id} is missing top toolbar.`);
      assert.ok(html.includes("class=\"tool-rail\""), `${editor.id} is missing left tool rail.`);
      assert.ok(html.includes("class=\"workspace"), `${editor.id} is missing central workspace.`);
      assert.ok(html.includes("class=\"inspector\""), `${editor.id} is missing right inspector.`);
      assert.ok(html.includes("Interactive feature actions"), `${editor.id} is missing the interactive feature action panel.`);
      assert.ok(html.includes("Guide brief"), `${editor.id} is missing guide metadata.`);
      assert.ok(html.includes("Guide feature source"), `${editor.id} is missing the guide feature source list.`);
      assert.ok(html.includes("class=\"status-bar\""), `${editor.id} is missing status bar.`);
      assert.ok(html.includes("id=\"exportPreview\""), `${editor.id} is missing export preview output.`);
      assert.ok(html.includes("id=\"liveInspector\""), `${editor.id} is missing live inspector state.`);
      const featureActionButtons = html.match(/data-feature-action=/g) ?? [];
      assert.strictEqual(featureActionButtons.length, 8, `${editor.id} should render 8 clickable feature action buttons.`);
      assert.ok(!html.includes("http://") && !html.includes("https://"), `${editor.id} should not load external resources.`);
    }
  });

  test("panel runtime has real action handlers and export state wiring", () => {
    const source = fs.readFileSync(path.join(EDITORS_ROOT, "panelHost.ts"), "utf-8");
    const requiredRuntimeSymbols = [
      "function handleFeatureAction(actionId)",
      "function applyFeatureAction(action)",
      "function drawEditorState()",
      "function applyGridFeatureAction(action)",
      "function applyNodeFeatureAction(action)",
      "function applyTableFeatureAction(action)",
      "function applyTimelineFeatureAction(action)",
      "function applyPreviewFeatureAction(action)",
      "function applyDocumentFeatureAction(action)",
    ];

    for (const symbol of requiredRuntimeSymbols) {
      assert.ok(source.includes(symbol), `panelHost.ts should include ${symbol}.`);
    }

    assert.ok(source.includes("featureActions: SPEC.featureActions"), "generated exports should include featureActions.");
    assert.ok(source.includes("actionHistory: state.actionHistory"), "generated exports should include action history.");
    assert.ok(source.includes("editorState: serializeState()"), "generated exports should include serialized editor state.");
  });

  test("active source does not import legacy editor backup", () => {
    const activeFiles = readSourceFiles(SRC_ROOT);
    const offenders = activeFiles.filter((file) => fs.readFileSync(file, "utf-8").includes("editors_legacy"));
    assert.deepStrictEqual(offenders, []);
  });
});
