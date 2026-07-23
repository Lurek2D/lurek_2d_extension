/**
 * Unit tests for the ApiDataService.
 *
 * Tests loading, module lookup, function retrieval, enum access,
 * and callback completeness.
 */
import * as assert from "assert";
import { ApiDataService } from "../../services/apiData";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Helpers ─────────────────────────────────────────────────

function createServiceWithJson(data: unknown): ApiDataService {
  const svc = new ApiDataService();
  // Call private loadFromJson directly
  (svc as any).loadFromJson(data);
  (svc as any).loaded = true;
  return svc;
}

const SAMPLE_API_JSON = {
  modules: [
    {
      name: "render",
      description: "2D rendering module",
      functions: [
        {
          name: "setColor",
          fullPath: "lurek.render.setColor",
          signature: "lurek.render.setColor(r, g, b, a)",
          description: "Sets the draw color.",
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
    },
    {
      name: "audio",
      description: "Audio module",
      functions: [
        {
          name: "newSource",
          fullPath: "lurek.audio.newSource",
          signature: "lurek.audio.newSource(path, type)",
          description: "Creates an audio source.",
          parameters: [
            { name: "path", type: "string", description: "File path", optional: false },
            { name: "type", type: "string", description: "Source type", optional: true },
          ],
          returns: "Source",
          returnType: "Source",
          isMethod: false,
        },
      ],
    },
    {
      name: "physics",
      description: "Physics simulation",
      functions: [],
    },
  ],
  enums: {
    DrawMode: ["fill", "line"],
    BlendMode: ["alpha", "add", "subtract", "multiply", "replace", "screen"],
    FilterMode: ["nearest", "linear"],
    BodyType: ["dynamic", "static", "kinematic"],
  },
  callbacks: [
    {
      name: "process",
      signature: "function lurek.process(dt)",
      description: "Called every frame.",
      parameters: [{ name: "dt", type: "number", description: "Delta time", optional: false }],
    },
    {
      name: "draw",
      signature: "function lurek.draw()",
      description: "Called every frame for rendering.",
      parameters: [],
    },
    {
      name: "init",
      signature: "function lurek.init()",
      description: "Called once at startup.",
      parameters: [],
    },
    {
      name: "ready",
      signature: "function lurek.ready()",
      description: "Called after all assets are loaded.",
      parameters: [],
    },
  ],
  keyNames: ["space", "return", "escape", "a", "b", "c", "up", "down", "left", "right"],
  gamepadButtons: ["a", "b", "x", "y", "start", "back"],
  gamepadAxes: ["leftx", "lefty", "rightx", "righty"],
};

// ── Loads API data without errors ────────────────────────────

suite("ApiData — loading", () => {
  test("loads from valid JSON without throwing", () => {
    assert.doesNotThrow(() => {
      createServiceWithJson(SAMPLE_API_JSON);
    });
  });

  test("handles null input gracefully", () => {
    assert.doesNotThrow(() => {
      createServiceWithJson(null);
    });
  });

  test("handles undefined input gracefully", () => {
    assert.doesNotThrow(() => {
      createServiceWithJson(undefined);
    });
  });

  test("handles empty object gracefully", () => {
    const svc = createServiceWithJson({});
    assert.strictEqual(svc.getModuleNames().length, 0);
  });

  test("handles malformed modules array", () => {
    assert.doesNotThrow(() => {
      createServiceWithJson({ modules: "not_an_array" });
    });
  });
});

// ── Returns functions for valid module names ─────────────────

suite("ApiData — module functions", () => {
  test("returns render module functions", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const funcs = svc.getFunctions("render");
    assert.strictEqual(funcs.length, 2);
  });

  test("returns audio module functions", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const funcs = svc.getFunctions("audio");
    assert.strictEqual(funcs.length, 1);
    assert.strictEqual(funcs[0].name, "newSource");
  });

  test("returns function by full path", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const fn = svc.getFunction("lurek.render.setColor");
    assert.ok(fn);
    assert.strictEqual(fn!.name, "setColor");
    assert.strictEqual(fn!.module, "render");
  });

  test("function has correct parameter count", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const fn = svc.getFunction("lurek.render.setColor")!;
    assert.strictEqual(fn.parameters.length, 4);
  });

  test("function parameter has type info", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const fn = svc.getFunction("lurek.render.setColor")!;
    assert.strictEqual(fn.parameters[0].type, "number");
    assert.strictEqual(fn.parameters[0].name, "r");
  });

  test("getAllFunctions returns all functions across modules", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const all = svc.getAllFunctions();
    assert.ok(all.length >= 3, `Expected >= 3 functions, got ${all.length}`);
  });
});

// ── Returns empty for invalid module names ───────────────────

suite("ApiData — invalid modules", () => {
  test("returns empty for non-existent module", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const funcs = svc.getFunctions("nonexistent");
    assert.strictEqual(funcs.length, 0);
  });

  test("returns undefined for non-existent function path", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const fn = svc.getFunction("lurek.fake.missing");
    assert.strictEqual(fn, undefined);
  });

  test("returns empty functions for module with no functions", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const funcs = svc.getFunctions("physics");
    assert.strictEqual(funcs.length, 0);
  });

  test("getModule returns undefined for invalid name", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const mod = svc.getModule("doesNotExist");
    assert.strictEqual(mod, undefined);
  });
});

// ── Enum values are non-empty ────────────────────────────────

suite("ApiData — enums", () => {
  test("DrawMode enum has values", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const values = svc.getEnumValues("DrawMode");
    assert.ok(values.length > 0);
    assert.ok(values.includes("fill"));
    assert.ok(values.includes("line"));
  });

  test("BlendMode enum has values", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const values = svc.getEnumValues("BlendMode");
    assert.ok(values.length > 0);
    assert.ok(values.includes("alpha"));
    assert.ok(values.includes("add"));
  });

  test("FilterMode enum has values", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const values = svc.getEnumValues("FilterMode");
    assert.strictEqual(values.length, 2);
    assert.ok(values.includes("nearest"));
    assert.ok(values.includes("linear"));
  });

  test("BodyType enum has values", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const values = svc.getEnumValues("BodyType");
    assert.strictEqual(values.length, 3);
    assert.ok(values.includes("dynamic"));
    assert.ok(values.includes("static"));
    assert.ok(values.includes("kinematic"));
  });

  test("returns empty array for unknown enum", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const values = svc.getEnumValues("UnknownEnum");
    assert.strictEqual(values.length, 0);
  });
});

// ── Callback signatures are complete ─────────────────────────

suite("ApiData — callbacks", () => {
  test("returns all callbacks", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const cbs = svc.getCallbacks();
    assert.strictEqual(cbs.length, 4);
  });

  test("process callback has dt parameter", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const cbs = svc.getCallbacks();
    const process = cbs.find(cb => cb.name === "process");
    assert.ok(process);
    assert.strictEqual(process!.parameters.length, 1);
    assert.strictEqual(process!.parameters[0].name, "dt");
    assert.strictEqual(process!.parameters[0].type, "number");
  });

  test("draw callback has no parameters", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const cbs = svc.getCallbacks();
    const draw = cbs.find(cb => cb.name === "draw");
    assert.ok(draw);
    assert.strictEqual(draw!.parameters.length, 0);
  });

  test("callback has signature string", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const cbs = svc.getCallbacks();
    const init = cbs.find(cb => cb.name === "init");
    assert.ok(init);
    assert.strictEqual(init!.signature, "function lurek.init()");
  });

  test("callback has description", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const cbs = svc.getCallbacks();
    const ready = cbs.find(cb => cb.name === "ready");
    assert.ok(ready);
    assert.ok(ready!.description.length > 0);
  });

  test("callback fullPath follows lurek.name pattern", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const cbs = svc.getCallbacks();
    for (const cb of cbs) {
      assert.ok(cb.fullPath.startsWith("lurek."), `${cb.name} fullPath should start with lurek.`);
    }
  });
});

// ── Key names and gamepad data ───────────────────────────────

suite("ApiData — input data", () => {
  test("key names are loaded", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const keys = svc.getKeyNames();
    assert.ok(keys.length > 0);
    assert.ok(keys.includes("space"));
    assert.ok(keys.includes("escape"));
  });

  test("gamepad buttons are loaded", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const buttons = svc.getGamepadButtons();
    assert.ok(buttons.length > 0);
    assert.ok(buttons.includes("a"));
    assert.ok(buttons.includes("start"));
  });

  test("gamepad axes are loaded", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const axes = svc.getGamepadAxes();
    assert.ok(axes.length > 0);
    assert.ok(axes.includes("leftx"));
    assert.ok(axes.includes("righty"));
  });
});

// ── Module metadata ──────────────────────────────────────────

suite("ApiData — module metadata", () => {
  test("getModuleNames returns all modules", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const names = svc.getModuleNames();
    assert.ok(names.includes("render"));
    assert.ok(names.includes("audio"));
    assert.ok(names.includes("physics"));
  });

  test("module has description", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const mod = svc.getModule("render");
    assert.ok(mod);
    assert.strictEqual(mod!.description, "2D rendering module");
  });

  test("module tracks total and documented entries", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const mod = svc.getModule("render");
    assert.ok(mod);
    assert.strictEqual(mod!.totalEntries, 2);
    assert.strictEqual(mod!.documentedEntries, 2);
  });

  test("getStats returns aggregate counts", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const stats = svc.getStats();
    assert.strictEqual(stats.modules, 3);
    assert.ok(stats.functions >= 3);
    assert.ok(stats.documented >= 3);
  });
});

// ── Lua standard library ─────────────────────────────────────

suite("ApiData — Lua stdlib", () => {
  test("getLuaStdlib returns entries for luajit", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const stdlib = svc.getLuaStdlib("luajit");
    assert.ok(stdlib.length > 0, "Should have stdlib entries");
  });

  test("stdlib includes string functions", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const stdlib = svc.getLuaStdlib("luajit");
    const stringFuncs = stdlib.filter(fn => fn.module === "string");
    assert.ok(stringFuncs.length > 0);
    const names = stringFuncs.map(f => f.name);
    assert.ok(names.includes("format"));
    assert.ok(names.includes("len"));
  });

  test("stdlib includes math functions", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const stdlib = svc.getLuaStdlib("luajit");
    const mathFuncs = stdlib.filter(fn => fn.module === "math");
    assert.ok(mathFuncs.length > 0);
    const names = mathFuncs.map(f => f.name);
    assert.ok(names.includes("sin"));
    assert.ok(names.includes("random"));
  });

  test("luajit stdlib includes bit library", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const stdlib = svc.getLuaStdlib("luajit");
    const bitFuncs = stdlib.filter(fn => fn.module === "bit");
    assert.ok(bitFuncs.length > 0, "LuaJIT should include bit library");
  });

  test("5.4 stdlib does not include bit library", () => {
    const svc = createServiceWithJson(SAMPLE_API_JSON);
    const stdlib = svc.getLuaStdlib("5.4");
    const bitFuncs = stdlib.filter(fn => fn.module === "bit");
    assert.strictEqual(bitFuncs.length, 0, "Lua 5.4 should not include bit library");
  });
});
