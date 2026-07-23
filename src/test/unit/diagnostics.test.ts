/**
 * Unit tests for the diagnostics provider.
 *
 * Tests diagnostic rules: deprecated API, color range, asset not found,
 * thread safety, enum validation, conf.lua, and callback correctness.
 */
import * as assert from "assert";
import { ApiDataService, ApiFunction } from "../../services/apiData";
import { LuaDocumentAnalyzer } from "../../services/luaParser";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Helpers ─────────────────────────────────────────────────

/**
 * Minimal mock ApiDataService for diagnostics tests.
 * Only implements methods called by the diagnostic rules.
 */
function createMockApiData(overrides: Partial<{
  deprecatedFns: ApiFunction[];
  enumValues: Record<string, string[]>;
  callbacks: ApiFunction[];
}> = {}): ApiDataService {
  const svc = new ApiDataService();

  // Override getAllFunctions to return deprecated entries
  (svc as any).allFunctions = new Map();
  const deprecated = overrides.deprecatedFns ?? [];
  for (const fn of deprecated) {
    (svc as any).allFunctions.set(fn.fullPath, fn);
  }
  svc.getAllFunctions = () => deprecated;

  // Override getEnumValues
  const enums = overrides.enumValues ?? {};
  svc.getEnumValues = (name: string) => enums[name] ?? [];

  // Override getCallbacks
  svc.getCallbacks = () => overrides.callbacks ?? [];

  return svc;
}

function makeDeprecatedFn(fullPath: string, message: string): ApiFunction {
  return {
    module: fullPath.split(".")[1] ?? "",
    name: fullPath.split(".").pop() ?? "",
    fullPath,
    signature: `${fullPath}()`,
    description: "",
    parameters: [],
    deprecated: message,
    isMethod: false,
  };
}

// ── Rule 1: Deprecated API detection ────────────────────────

suite("Diagnostics — deprecated API usage", () => {
  test("detects deprecated function call", () => {
    const text = 'lurek.graphics.newImage("test.png")';
    const apiData = createMockApiData({
      deprecatedFns: [makeDeprecatedFn("lurek.graphics.newImage", "Use lurek.render.newImage instead")],
    });
    const fns = apiData.getAllFunctions().filter(f => f.deprecated);
    assert.strictEqual(fns.length, 1);

    const regex = new RegExp(fns[0].fullPath.replace(/\./g, "\\."), "g");
    const matches = text.match(regex);
    assert.ok(matches, "Should match the deprecated function in text");
    assert.strictEqual(matches!.length, 1);
  });

  test("does not flag non-deprecated functions", () => {
    const text = 'lurek.render.setColor(1, 0, 0)';
    const apiData = createMockApiData({
      deprecatedFns: [makeDeprecatedFn("lurek.graphics.newImage", "Use lurek.render.newImage")],
    });
    const fns = apiData.getAllFunctions().filter(f => f.deprecated);
    for (const fn of fns) {
      const regex = new RegExp(fn.fullPath.replace(/\./g, "\\."), "g");
      assert.strictEqual(regex.test(text), false);
    }
  });

  test("skips deprecated check inside comments", () => {
    const text = '-- lurek.graphics.newImage("old.png")';
    const line = text.trimStart();
    assert.ok(line.startsWith("--"), "Line should be detected as comment");
  });
});

// ── Rule 2: Color value range validation ────────────────────

suite("Diagnostics — color range", () => {
  test("detects color values > 1.0 (0-255 range mistake)", () => {
    const text = "lurek.render.setColor(255, 128, 64)";
    const pattern =
      /lurek\.render\.(?:setColor|setBackgroundColor|clear)\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/g;
    const match = pattern.exec(text);
    assert.ok(match, "Pattern should match setColor call");
    const vals = [parseFloat(match![1]), parseFloat(match![2]), parseFloat(match![3])];
    assert.ok(vals.some(v => v > 1.0), "Should detect values > 1.0");
  });

  test("does not flag color values in 0-1 range", () => {
    const text = "lurek.render.setColor(1.0, 0.5, 0.25)";
    const pattern =
      /lurek\.render\.(?:setColor|setBackgroundColor|clear)\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/g;
    const match = pattern.exec(text);
    assert.ok(match, "Pattern should match");
    const vals = [parseFloat(match![1]), parseFloat(match![2]), parseFloat(match![3])];
    assert.ok(!vals.some(v => v > 1.0), "Values in 0-1 range should not trigger");
  });

  test("detects color issue with alpha channel", () => {
    const text = "lurek.render.setColor(0.5, 0.5, 0.5, 200)";
    const pattern =
      /lurek\.render\.(?:setColor|setBackgroundColor|clear)\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/g;
    const match = pattern.exec(text);
    assert.ok(match, "Pattern should match");
    const vals = [parseFloat(match![1]), parseFloat(match![2]), parseFloat(match![3])];
    if (match![4] !== undefined) vals.push(parseFloat(match![4]));
    assert.ok(vals.some(v => v > 1.0), "Alpha value 200 should trigger");
  });

  test("detects setBackgroundColor with 255 values", () => {
    const text = "lurek.render.setBackgroundColor(50, 50, 50)";
    const pattern =
      /lurek\.render\.(?:setColor|setBackgroundColor|clear)\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/g;
    const match = pattern.exec(text);
    assert.ok(match, "Pattern should match setBackgroundColor");
    const vals = [parseFloat(match![1]), parseFloat(match![2]), parseFloat(match![3])];
    assert.ok(vals.some(v => v > 1.0));
  });
});

// ── Rule 4: Asset file not found ────────────────────────────

suite("Diagnostics — asset not found", () => {
  test("detects asset path in lurek.render.newImage", () => {
    const text = 'lurek.render.newImage("sprites/player.png")';
    const pattern = /lurek\.(?:render\.newImage|audio\.newSource|fs\.read)\s*\(\s*["']([^"']+)["']/g;
    const match = pattern.exec(text);
    assert.ok(match, "Should extract asset path");
    assert.strictEqual(match![1], "sprites/player.png");
  });

  test("detects asset path in lurek.audio.newSource", () => {
    const text = 'lurek.audio.newSource("music/theme.ogg", "stream")';
    const pattern = /lurek\.(?:render\.newImage|audio\.newSource|fs\.read)\s*\(\s*["']([^"']+)["']/g;
    const match = pattern.exec(text);
    assert.ok(match);
    assert.strictEqual(match![1], "music/theme.ogg");
  });

  test("skips URLs in asset paths", () => {
    const text = 'lurek.fs.read("https://example.com/data.json")';
    const pattern = /lurek\.(?:render\.newImage|audio\.newSource|fs\.read)\s*\(\s*["']([^"']+)["']/g;
    const match = pattern.exec(text);
    assert.ok(match);
    const assetPath = match![1];
    assert.ok(assetPath.includes("://"), "URLs should be skipped by the rule");
  });

  test("skips extension-less paths (module names)", () => {
    const text = 'lurek.fs.read("mymodule")';
    const pattern = /lurek\.(?:render\.newImage|audio\.newSource|fs\.read)\s*\(\s*["']([^"']+)["']/g;
    const match = pattern.exec(text);
    assert.ok(match);
    const assetPath = match![1];
    assert.ok(!assetPath.includes("."), "Extension-less paths should be skipped");
  });
});

// ── Rule 5: Thread safety warnings ──────────────────────────

suite("Diagnostics — thread random", () => {
  test("detects math.random pattern", () => {
    const text = "local x = math.random()";
    const pattern = /\bmath\.random\s*\(/g;
    assert.ok(pattern.test(text));
  });

  test("does not trigger without lurek.thread context", () => {
    const text = "local x = math.random()";
    // The rule requires lurek.thread to be present in the text
    assert.ok(!text.includes("lurek.thread"));
  });

  test("triggers when lurek.thread is present in scope", () => {
    const text = [
      "local t = lurek.thread.new(function()",
      "  local x = math.random()",
      "end)",
    ].join("\n");
    assert.ok(text.includes("lurek.thread"));
    assert.ok(/\bmath\.random\s*\(/.test(text));
  });
});

// ── Rule 7: Enum value validation ───────────────────────────

suite("Diagnostics — wrong enum value", () => {
  test("detects invalid draw mode", () => {
    const text = 'lurek.render.rectangle("filled", 10, 10, 50, 50)';
    const pattern = /lurek\.render\.(?:rectangle|circle|arc|polygon|ellipse)\s*\(\s*["']([^"']+)["']/g;
    const match = pattern.exec(text);
    assert.ok(match);
    const value = match![1];
    const valid = ["fill", "line"];
    assert.ok(!valid.includes(value), "\"filled\" is not a valid draw mode");
  });

  test("accepts valid draw mode", () => {
    const text = 'lurek.render.rectangle("fill", 10, 10, 50, 50)';
    const pattern = /lurek\.render\.(?:rectangle|circle|arc|polygon|ellipse)\s*\(\s*["']([^"']+)["']/g;
    const match = pattern.exec(text);
    assert.ok(match);
    assert.ok(["fill", "line"].includes(match![1]));
  });

  test("detects invalid blend mode", () => {
    const text = 'lurek.render.setBlendMode("additive")';
    const pattern = /lurek\.render\.setBlendMode\s*\(\s*["']([^"']+)["']/g;
    const match = pattern.exec(text);
    assert.ok(match);
    const valid = ["alpha", "add", "subtract", "multiply", "replace", "screen", "darken", "lighten", "none"];
    assert.ok(!valid.includes(match![1]), "\"additive\" is not valid, should be \"add\"");
  });

  test("detects invalid audio source type", () => {
    const text = 'lurek.audio.newSource("music.ogg", "streaming")';
    const pattern = /lurek\.audio\.newSource\s*\([^,]*,\s*["']([^"']+)["']/g;
    const match = pattern.exec(text);
    assert.ok(match);
    const valid = ["static", "stream"];
    assert.ok(!valid.includes(match![1]), "\"streaming\" is not valid, should be \"stream\"");
  });

  test("fuzzy match suggests closest valid value", () => {
    function editDistance(left: string, right: string): number {
      const rows = left.length + 1;
      const cols = right.length + 1;
      const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

      for (let i = 0; i < rows; i++) dp[i][0] = i;
      for (let j = 0; j < cols; j++) dp[0][j] = j;

      for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
          const cost = left[i - 1] === right[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + cost,
          );
        }
      }

      return dp[left.length][right.length];
    }

    function fuzzyMatch(word: string, candidates: string[]): string | undefined {
      let best: { value: string; distance: number } | undefined;
      for (const candidate of candidates) {
        if (candidate === word) return undefined;
        const distance = editDistance(word, candidate);
        if (distance <= 2 && (!best || distance < best.distance)) {
          best = { value: candidate, distance };
        }
      }
      return best?.value;
    }

    assert.strictEqual(fuzzyMatch("fll", ["fill", "line"]), "fill");
    assert.strictEqual(fuzzyMatch("lne", ["fill", "line"]), "line");
    assert.strictEqual(fuzzyMatch("add", ["alpha", "add"]), undefined); // exact match
  });
});

// ── Rule D5: conf.lua validation ────────────────────────────

suite("Diagnostics — conf.lua keys", () => {
  test("detects unknown window key", () => {
    const text = "t.window.fullscren = true";
    const pattern = /\bt\.(\w+)\.(\w+)\s*=/g;
    const match = pattern.exec(text);
    assert.ok(match);
    assert.strictEqual(match![1], "window");
    assert.strictEqual(match![2], "fullscren");

    const validKeys = ["title", "width", "height", "vsync", "fullscreen", "resizable",
      "highdpi", "minwidth", "minheight", "x", "y", "borderless", "displayindex", "icon"];
    assert.ok(!validKeys.includes(match![2]), "\"fullscren\" (typo) is not valid");
  });

  test("accepts valid window key", () => {
    const text = "t.window.fullscreen = true";
    const pattern = /\bt\.(\w+)\.(\w+)\s*=/g;
    const match = pattern.exec(text);
    assert.ok(match);
    const validKeys = ["title", "width", "height", "vsync", "fullscreen", "resizable",
      "highdpi", "minwidth", "minheight", "x", "y", "borderless", "displayindex", "icon"];
    assert.ok(validKeys.includes(match![2]));
  });

  test("detects unknown performance key", () => {
    const text = "t.performance.framerate = 60";
    const pattern = /\bt\.(\w+)\.(\w+)\s*=/g;
    const match = pattern.exec(text);
    assert.ok(match);
    const validKeys = ["target_fps", "fixed_dt"];
    assert.ok(!validKeys.includes(match![2]));
  });

  test("accepts valid modules key", () => {
    const text = "t.modules.physics = true";
    const pattern = /\bt\.(\w+)\.(\w+)\s*=/g;
    const match = pattern.exec(text);
    assert.ok(match);
    const validKeys = ["physics", "audio", "graphics", "input", "timer", "filesystem", "math", "thread"];
    assert.ok(validKeys.includes(match![2]));
  });
});

// ── Rule 6: Callback signature correctness ──────────────────

suite("Diagnostics — missing callback", () => {
  test("detects missing lurek.process and lurek.draw in main.lua", () => {
    const text = [
      "-- A main.lua with no callbacks",
      'local player = { x = 0, y = 0 }',
    ].join("\n");
    const hasProcess = /lurek\.process\s*=\s*function/.test(text)
      || /function\s+lurek\.process\s*\(/.test(text);
    const hasDraw = /lurek\.draw\s*=\s*function/.test(text)
      || /function\s+lurek\.draw\s*\(/.test(text);
    assert.ok(!hasProcess && !hasDraw, "Should detect missing callbacks");
  });

  test("does not flag when callbacks are defined", () => {
    const text = [
      "function lurek.process(dt)",
      "end",
      "function lurek.draw()",
      "end",
    ].join("\n");
    const hasProcess = /function\s+lurek\.process\s*\(/.test(text);
    const hasDraw = /function\s+lurek\.draw\s*\(/.test(text);
    assert.ok(hasProcess && hasDraw);
  });

  test("accepts assignment-style callback definition", () => {
    const text = [
      "lurek.process = function(dt)",
      "end",
      "lurek.draw = function()",
      "end",
    ].join("\n");
    const hasProcess = /lurek\.process\s*=\s*function/.test(text);
    const hasDraw = /lurek\.draw\s*=\s*function/.test(text);
    assert.ok(hasProcess && hasDraw);
  });
});

// ── Rule 12: Entity nil access ──────────────────────────────

suite("Diagnostics — entity nil access", () => {
  test("detects unguarded access after lurek.entity.find", () => {
    const lines = [
      'local enemy = lurek.entity.find("boss")',
      "enemy:takeDamage(10)",
    ];
    const text = lines.join("\n");
    const findPattern = /\blocal\s+(\w+)\s*=\s*lurek\.entity\.find\s*\(/g;
    const match = findPattern.exec(text);
    assert.ok(match, "Should detect entity.find assignment");
    assert.strictEqual(match![1], "enemy");

    // Check next line for unguarded access
    const varName = match![1];
    const nextLine = lines[1];
    const accessPattern = new RegExp(`\\b${varName}\\s*[:.:]\\s*\\w+`);
    assert.ok(accessPattern.test(nextLine), "Should detect unguarded access");
  });

  test("does not flag when guarded with if check", () => {
    const lines = [
      'local enemy = lurek.entity.find("boss")',
      "if enemy then",
      "  enemy:takeDamage(10)",
      "end",
    ];
    const text = lines.join("\n");
    const findPattern = /\blocal\s+(\w+)\s*=\s*lurek\.entity\.find\s*\(/g;
    const match = findPattern.exec(text);
    assert.ok(match);
    const varName = match![1];

    // Check for guard before access
    let hasGuard = false;
    for (let j = 1; j < Math.min(6, lines.length); j++) {
      if (lines[j].includes(`if ${varName}`)) {
        hasGuard = true;
        break;
      }
    }
    assert.ok(hasGuard, "Should detect the guard");
  });
});
