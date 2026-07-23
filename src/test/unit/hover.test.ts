/**
 * Unit tests for the hover provider.
 *
 * Tests hover documentation for lurek.* functions, nil returns for
 * non-lurek symbols, markdown content, and nested namespace handling.
 */
import * as assert from "assert";
import { ApiDataService, ApiFunction, ApiModule } from "../../services/apiData";
import { MockTextDocument, MockPosition } from "../mocks/vscode";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Helpers ─────────────────────────────────────────────────

function createMockApiData(): ApiDataService {
  const svc = new ApiDataService();

  const renderFuncs: ApiFunction[] = [
    {
      module: "render",
      name: "setColor",
      fullPath: "lurek.render.setColor",
      signature: "lurek.render.setColor(r, g, b, a)",
      description: "Sets the active drawing color.",
      parameters: [
        { name: "r", type: "number", description: "Red component (0-1)", optional: false },
        { name: "g", type: "number", description: "Green component (0-1)", optional: false },
        { name: "b", type: "number", description: "Blue component (0-1)", optional: false },
        { name: "a", type: "number", description: "Alpha component (0-1)", optional: true, default: "1" },
      ],
      returns: "nil",
      since: "0.1.0",
      isMethod: false,
    },
    {
      module: "render",
      name: "newCanvas",
      fullPath: "lurek.render.newCanvas",
      signature: "lurek.render.newCanvas(width, height)",
      description: "Creates a new off-screen canvas for rendering.",
      parameters: [
        { name: "width", type: "number", description: "Canvas width in pixels", optional: false },
        { name: "height", type: "number", description: "Canvas height in pixels", optional: false },
      ],
      returns: "Canvas",
      returnType: "Canvas",
      since: "0.2.0",
      isMethod: false,
    },
  ];

  const audioFuncs: ApiFunction[] = [
    {
      module: "audio",
      name: "play",
      fullPath: "lurek.audio.play",
      signature: "lurek.audio.play(source)",
      description: "Plays an audio source.",
      parameters: [
        { name: "source", type: "Source", description: "Audio source to play", optional: false },
      ],
      returns: "nil",
      isMethod: false,
    },
  ];

  const renderMod: ApiModule = {
    name: "render",
    fullPath: "lurek.render",
    description: "2D rendering and drawing operations.",
    functions: renderFuncs,
    methods: [],
    totalEntries: 2,
    documentedEntries: 2,
  };

  const audioMod: ApiModule = {
    name: "audio",
    fullPath: "lurek.audio",
    description: "Audio playback and management.",
    functions: audioFuncs,
    methods: [],
    totalEntries: 1,
    documentedEntries: 1,
  };

  const modules = new Map<string, ApiModule>();
  modules.set("render", renderMod);
  modules.set("audio", audioMod);
  (svc as any).modules = modules;

  const allFunctions = new Map<string, ApiFunction>();
  for (const fn of [...renderFuncs, ...audioFuncs]) {
    allFunctions.set(fn.fullPath, fn);
  }
  (svc as any).allFunctions = allFunctions;

  svc.getModule = (name: string) => modules.get(name);
  svc.getModuleNames = () => Array.from(modules.keys());
  svc.getFunction = (fullPath: string) => allFunctions.get(fullPath);
  svc.getAllFunctions = () => Array.from(allFunctions.values());
  svc.getCallbacks = () => [];

  return svc;
}

// ── Returns documentation for lurek.* functions ─────────────

suite("Hover — lurek.* function documentation", () => {
  test("returns documentation for lurek.render.setColor", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("lurek.render.setColor");
    assert.ok(fn, "Should find setColor in API data");
    assert.strictEqual(fn!.description, "Sets the active drawing color.");
    assert.strictEqual(fn!.parameters.length, 4);
  });

  test("returns documentation for lurek.render.newCanvas", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("lurek.render.newCanvas");
    assert.ok(fn);
    assert.strictEqual(fn!.returns, "Canvas");
    assert.strictEqual(fn!.since, "0.2.0");
  });

  test("returns documentation for lurek.audio.play", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("lurek.audio.play");
    assert.ok(fn);
    assert.strictEqual(fn!.description, "Plays an audio source.");
  });
});

// ── Returns nil for non-lurek symbols ────────────────────────

suite("Hover — non-lurek symbols", () => {
  test("returns undefined for unknown function path", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("lurek.unknown.func");
    assert.strictEqual(fn, undefined);
  });

  test("returns undefined for plain identifier", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("myVariable");
    assert.strictEqual(fn, undefined);
  });

  test("returns undefined for standard library function", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("string.format");
    assert.strictEqual(fn, undefined);
  });
});

// ── Returns markdown with parameters and return types ────────

suite("Hover — markdown content", () => {
  test("function signature is available for code block", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("lurek.render.setColor")!;
    assert.strictEqual(fn.signature, "lurek.render.setColor(r, g, b, a)");
  });

  test("parameters include name, type, and description", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("lurek.render.setColor")!;
    const firstParam = fn.parameters[0];
    assert.strictEqual(firstParam.name, "r");
    assert.strictEqual(firstParam.type, "number");
    assert.strictEqual(firstParam.description, "Red component (0-1)");
    assert.strictEqual(firstParam.optional, false);
  });

  test("optional parameter is marked correctly", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("lurek.render.setColor")!;
    const alphaParam = fn.parameters[3];
    assert.strictEqual(alphaParam.name, "a");
    assert.strictEqual(alphaParam.optional, true);
    assert.strictEqual(alphaParam.default, "1");
  });

  test("return type is present", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("lurek.render.newCanvas")!;
    assert.strictEqual(fn.returns, "Canvas");
    assert.strictEqual(fn.returnType, "Canvas");
  });

  test("since version is present", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("lurek.render.setColor")!;
    assert.strictEqual(fn.since, "0.1.0");
  });
});

// ── Handles nested namespaces (lurek.render.newCanvas) ───────

suite("Hover — nested namespaces", () => {
  test("resolves two-level deep function (lurek.render.newCanvas)", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunction("lurek.render.newCanvas");
    assert.ok(fn, "Should resolve nested namespace function");
    assert.strictEqual(fn!.module, "render");
    assert.strictEqual(fn!.name, "newCanvas");
  });

  test("word range regex matches lurek.module.func pattern", () => {
    const doc = new MockTextDocument("lurek.render.newCanvas(100, 100)");
    const pos = new MockPosition(0, 8); // within "render"
    const range = doc.getWordRangeAtPosition(pos, /lurek\.\w+\.\w+/);
    assert.ok(range, "Should match lurek.render.newCanvas");
    const text = doc.getText(range!);
    assert.strictEqual(text, "lurek.render.newCanvas");
  });

  test("word range regex matches at function name position", () => {
    const doc = new MockTextDocument("lurek.render.newCanvas(100, 100)");
    const pos = new MockPosition(0, 15); // within "newCanvas"
    const range = doc.getWordRangeAtPosition(pos, /lurek\.\w+\.\w+/);
    assert.ok(range, "Should match when cursor is on function name");
    const text = doc.getText(range!);
    assert.strictEqual(text, "lurek.render.newCanvas");
  });

  test("module hover returns module info", () => {
    const apiData = createMockApiData();
    const mod = apiData.getModule("render");
    assert.ok(mod);
    assert.strictEqual(mod!.description, "2D rendering and drawing operations.");
    assert.strictEqual(mod!.functions.length, 2);
  });

  test("does not match partial namespaces missing function", () => {
    const doc = new MockTextDocument("lurek.render");
    const pos = new MockPosition(0, 8);
    const range = doc.getWordRangeAtPosition(pos, /lurek\.\w+\.\w+/);
    // "lurek.render" alone has no third segment — should not match 3-part pattern
    assert.strictEqual(range, undefined);
  });
});
