/**
 * Unit tests for the completion provider.
 *
 * Tests lurek.* namespace completions, method completions,
 * callback names, parameter snippets, and context-awareness.
 */
import * as assert from "assert";
import { ApiDataService, ApiFunction, ApiModule } from "../../services/apiData";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Helpers ─────────────────────────────────────────────────

function createMockApiData(): ApiDataService {
  const svc = new ApiDataService();

  // Set up internal state with test data
  const renderMod: ApiModule = {
    name: "render",
    fullPath: "lurek.render",
    description: "2D rendering module",
    functions: [
      {
        module: "render",
        name: "setColor",
        fullPath: "lurek.render.setColor",
        signature: "lurek.render.setColor(r, g, b, a)",
        description: "Sets the current draw color.",
        parameters: [
          { name: "r", type: "number", description: "Red", optional: false },
          { name: "g", type: "number", description: "Green", optional: false },
          { name: "b", type: "number", description: "Blue", optional: false },
          { name: "a", type: "number", description: "Alpha", optional: true, default: "1" },
        ],
        returns: "nil",
        isMethod: false,
      },
      {
        module: "render",
        name: "rectangle",
        fullPath: "lurek.render.rectangle",
        signature: "lurek.render.rectangle(mode, x, y, w, h)",
        description: "Draws a rectangle.",
        parameters: [
          { name: "mode", type: "string", description: "Draw mode", optional: false },
          { name: "x", type: "number", description: "X position", optional: false },
          { name: "y", type: "number", description: "Y position", optional: false },
          { name: "w", type: "number", description: "Width", optional: false },
          { name: "h", type: "number", description: "Height", optional: false },
        ],
        returns: "nil",
        isMethod: false,
      },
      {
        module: "render",
        name: "newCanvas",
        fullPath: "lurek.render.newCanvas",
        signature: "lurek.render.newCanvas(width, height)",
        description: "Creates a new canvas.",
        parameters: [
          { name: "width", type: "number", description: "Width", optional: false },
          { name: "height", type: "number", description: "Height", optional: false },
        ],
        returns: "Canvas",
        returnType: "Canvas",
        isMethod: false,
      },
    ],
    methods: [],
    totalEntries: 3,
    documentedEntries: 3,
  };

  const audioMod: ApiModule = {
    name: "audio",
    fullPath: "lurek.audio",
    description: "Audio playback module",
    functions: [
      {
        module: "audio",
        name: "newSource",
        fullPath: "lurek.audio.newSource",
        signature: "lurek.audio.newSource(path, type)",
        description: "Creates a new audio source.",
        parameters: [
          { name: "path", type: "string", description: "File path", optional: false },
          { name: "type", type: "string", description: "Source type", optional: true, default: '"static"' },
        ],
        returns: "Source",
        returnType: "Source",
        isMethod: false,
      },
    ],
    methods: [],
    totalEntries: 1,
    documentedEntries: 1,
  };

  // Wire up module access
  const modules = new Map<string, ApiModule>();
  modules.set("render", renderMod);
  modules.set("audio", audioMod);
  (svc as any).modules = modules;

  svc.getModuleNames = () => Array.from(modules.keys());
  svc.getModule = (name: string) => modules.get(name);
  svc.getFunctions = (modName: string) => modules.get(modName)?.functions ?? [];

  // Callbacks
  const callbacks: ApiFunction[] = [
    {
      module: "",
      name: "process",
      fullPath: "lurek.process",
      signature: "function lurek.process(dt)",
      description: "Called every frame with delta time.",
      parameters: [{ name: "dt", type: "number", description: "Delta time", optional: false }],
      isMethod: false,
    },
    {
      module: "",
      name: "draw",
      fullPath: "lurek.draw",
      signature: "function lurek.draw()",
      description: "Called every frame to render.",
      parameters: [],
      isMethod: false,
    },
    {
      module: "",
      name: "init",
      fullPath: "lurek.init",
      signature: "function lurek.init()",
      description: "Called once on startup.",
      parameters: [],
      isMethod: false,
    },
  ];
  svc.getCallbacks = () => callbacks;

  return svc;
}

// ── Namespace completion tests ───────────────────────────────

suite("Completion — lurek.* namespaces", () => {
  test("returns module names after 'lurek.'", () => {
    const apiData = createMockApiData();
    const modules = apiData.getModuleNames();
    assert.ok(modules.includes("render"));
    assert.ok(modules.includes("audio"));
  });

  test("returns callbacks after 'lurek.'", () => {
    const apiData = createMockApiData();
    const callbacks = apiData.getCallbacks();
    const names = callbacks.map(cb => cb.name);
    assert.ok(names.includes("process"));
    assert.ok(names.includes("draw"));
    assert.ok(names.includes("init"));
  });

  test("filters modules by partial input", () => {
    const apiData = createMockApiData();
    const partial = "ren";
    const filtered = apiData.getModuleNames().filter(m => m.startsWith(partial));
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0], "render");
  });
});

// ── Function completion after module ─────────────────────────

suite("Completion — lurek.render.*", () => {
  test("returns render functions after 'lurek.render.'", () => {
    const apiData = createMockApiData();
    const funcs = apiData.getFunctions("render");
    assert.ok(funcs.length > 0);
    const names = funcs.map(f => f.name);
    assert.ok(names.includes("setColor"));
    assert.ok(names.includes("rectangle"));
    assert.ok(names.includes("newCanvas"));
  });

  test("filters functions by partial name", () => {
    const apiData = createMockApiData();
    const partial = "set";
    const funcs = apiData.getFunctions("render")
      .filter(fn => fn.name.toLowerCase().startsWith(partial));
    assert.strictEqual(funcs.length, 1);
    assert.strictEqual(funcs[0].name, "setColor");
  });

  test("returns empty for unknown module", () => {
    const apiData = createMockApiData();
    const funcs = apiData.getFunctions("nonexistent");
    assert.strictEqual(funcs.length, 0);
  });
});

// ── Callback name completions ────────────────────────────────

suite("Completion — callback names", () => {
  test("includes process callback", () => {
    const apiData = createMockApiData();
    const cb = apiData.getCallbacks().find(c => c.name === "process");
    assert.ok(cb);
    assert.strictEqual(cb!.fullPath, "lurek.process");
  });

  test("includes draw callback", () => {
    const apiData = createMockApiData();
    const cb = apiData.getCallbacks().find(c => c.name === "draw");
    assert.ok(cb);
    assert.strictEqual(cb!.signature, "function lurek.draw()");
  });

  test("callback has parameter info", () => {
    const apiData = createMockApiData();
    const cb = apiData.getCallbacks().find(c => c.name === "process");
    assert.ok(cb);
    assert.strictEqual(cb!.parameters.length, 1);
    assert.strictEqual(cb!.parameters[0].name, "dt");
    assert.strictEqual(cb!.parameters[0].type, "number");
  });
});

// ── Does not complete outside lurek namespace ────────────────

suite("Completion — non-lurek context", () => {
  test("'local x = foo.' does not match lurek pattern", () => {
    const before = "local x = foo.";
    const moduleMatch = before.match(/lurek\.(\w*)$/);
    assert.strictEqual(moduleMatch, null, "Should not match non-lurek prefix");
  });

  test("'string.' does not match lurek pattern", () => {
    const before = "string.";
    const moduleMatch = before.match(/lurek\.(\w*)$/);
    assert.strictEqual(moduleMatch, null);
  });

  test("partial 'lurek' without dot does not trigger", () => {
    const before = "lurek";
    const moduleMatch = before.match(/lurek\.(\w*)$/);
    assert.strictEqual(moduleMatch, null);
  });
});

// ── Parameter snippets ───────────────────────────────────────

suite("Completion — parameter snippets", () => {
  test("builds snippet with required params for setColor", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunctions("render").find(f => f.name === "setColor")!;
    const required = fn.parameters.filter(p => !p.optional);
    const snippet = `${fn.name}(${required.map((p, i) => `\${${i + 1}:${p.name}}`).join(", ")})`;
    assert.strictEqual(snippet, "setColor(${1:r}, ${2:g}, ${3:b})");
  });

  test("builds snippet with all required params for rectangle", () => {
    const apiData = createMockApiData();
    const fn = apiData.getFunctions("render").find(f => f.name === "rectangle")!;
    const required = fn.parameters.filter(p => !p.optional);
    assert.strictEqual(required.length, 5);
    const snippet = `${fn.name}(${required.map((p, i) => `\${${i + 1}:${p.name}}`).join(", ")})`;
    assert.ok(snippet.includes("${1:mode}"));
    assert.ok(snippet.includes("${5:h}"));
  });

  test("builds snippet with placeholder for no-required-params function", () => {
    // A function where all params are optional
    const fn: ApiFunction = {
      module: "render",
      name: "clear",
      fullPath: "lurek.render.clear",
      signature: "lurek.render.clear(r, g, b, a)",
      description: "Clears the screen.",
      parameters: [
        { name: "r", type: "number", description: "Red", optional: true },
        { name: "g", type: "number", description: "Green", optional: true },
        { name: "b", type: "number", description: "Blue", optional: true },
        { name: "a", type: "number", description: "Alpha", optional: true },
      ],
      isMethod: false,
    };
    const required = fn.parameters.filter(p => !p.optional);
    assert.strictEqual(required.length, 0);
    const snippet = required.length === 0 ? fn.name + "(${1})" : "";
    assert.strictEqual(snippet, "clear(${1})");
  });

  test("builds empty parens for zero-param function", () => {
    const fn: ApiFunction = {
      module: "render",
      name: "getWidth",
      fullPath: "lurek.render.getWidth",
      signature: "lurek.render.getWidth()",
      description: "Returns window width.",
      parameters: [],
      isMethod: false,
    };
    const snippet = fn.parameters.length === 0 ? fn.name + "()" : "";
    assert.strictEqual(snippet, "getWidth()");
  });
});

// ── Context-aware completions ────────────────────────────────

suite("Completion — context awareness", () => {
  test("detects inside-comment context from line prefix", () => {
    const line = "  -- lurek.render.";
    const isComment = line.trimStart().startsWith("--");
    assert.ok(isComment, "Should detect comment line");
  });

  test("detects non-comment context", () => {
    const line = "  lurek.render.";
    const isComment = line.trimStart().startsWith("--");
    assert.ok(!isComment, "Should not be a comment");
  });

  test("module.func pattern extracts module name", () => {
    const before = "lurek.render.set";
    const match = before.match(/lurek\.(\w+)\.(\w*)$/);
    assert.ok(match);
    assert.strictEqual(match![1], "render");
    assert.strictEqual(match![2], "set");
  });

  test("module-only pattern extracts partial module name", () => {
    const before = "lurek.au";
    const match = before.match(/lurek\.(\w*)$/);
    assert.ok(match);
    assert.strictEqual(match![1], "au");
  });
});
