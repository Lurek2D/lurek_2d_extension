# Lurek2D Toolkit - VS Code Extension

Full-featured IDE support for the [Lurek2D](https://github.com/lurek2d/lurek2d) 2D game engine.

## Overview

Lurek2D is a 2D game engine written in Rust that loads and executes Lua game scripts. This extension turns VS Code into the primary development environment for Lurek2D games with **140 commands**, covering Lurek-specific diagnostics, type inference, CodeLens markers, debugging, testing, build/run, **41 interactive visual editor panels**, and AI-assisted development.

> **Works alongside sumneko.lua (Lua Language Server)** — this extension adds only Lurek-unique features (engine API diagnostics, factory-type inference, callback markers, asset path completion). General Lua features (completion, hover, signature help, symbol outline, find references, rename, formatting, folding, LuaCATS) are handled by sumneko.lua to avoid duplication.

Detailed extension architecture and file inventory: [docs/vscode-extension.md](docs/vscode-extension.md).

## Features

### Lurek-Specific IntelliSense (what this extension adds)

- **4000+ lurek.* API items** — 1201 module functions and 2960 class methods across 50 modules and 223 types (e.g. `Body`, `Image`, `World`, `Card`, `Entity`)
- **Type inference** — Tracks `local img = lurek.graphics.newImage(...)` and suggests `Image` methods on `img:` — works even for module aliases (`local gfx = lurek.graphics`)
- **Go to definition** — Navigate to `lurek.*` virtual API definitions
- **Semantic highlighting** — Color-codes `lurek.*` calls, callbacks (⚡), deprecated functions distinctly from generic Lua
- **Inlay hints** — Inline type annotations for `lurek.*` return values
- **13 Lurek diagnostic rules** — Warns about deprecated APIs, wrong enum values, per-frame allocations, missing `lurek.load` callback, incorrect conf.lua fields, thread RNG misuse, and more
- **Code actions** — Quick fixes for Lurek-specific issues: missing scaffold, color picker integration
- **CodeLens markers** — ⚡ callbacks, ▶ test functions, 📦 library files, 🎮 demo files, 📖 examples, 🧪 test files
- **LuaJIT hints** — Warns about LuaJIT pitfalls (64-bit integers, goto scoping, bitwise ops)
- **Asset path completion** — Autocompletes file paths in `lurek.graphics.newImage()` and similar

> **Note:** General Lua features (completion, hover, signature help, symbol outline, find references, rename, formatting, folding, LuaCATS `---@class`/`---@param`) are provided by **sumneko.lua / Lua Language Server**. This extension deliberately does not duplicate those to avoid double completions and conflicting hover popups.

### Debugging (16 commands)

- **Debug adapter (DAP)** - Launch or attach to a running Lurek2D game with breakpoints
- **Debug bridge** - Connect/disconnect to engine debug socket for live inspection
- **Hot reload** - Push code changes to a running game without restarting
- **Evaluate expressions** - Run Lua expressions in the engine context
- **Variable inspector** - Inspect Lua variables and tables in a live game
- **Call stack** - View the current Lua call stack
- **Performance dashboard** - Live engine stats (FPS, draw calls, memory) in a webview
- **Screenshot capture** - Save a screenshot from the running engine

### Build, Run and Package (10 commands)

- **Run game** - Launch the current project with the Lurek2D engine
- **Run with arguments** - Launch with custom CLI arguments
- **Stop game** - Kill the running engine process
- **Run example** - Pick and run any content/examples/ or content/demos/ project
- **Quick build** - cargo build from the command palette
- **Build check** - cargo check with diagnostics
- **Package** - Build release binaries and distribution archives

### Testing (30 commands)

- **Run all tests** - cargo test from the command palette
- **Run Lua tests** - Execute individual .lua test files
- **Generate tests** - Auto-generate test scaffolding from `lurek.*` API usage
- **Test coverage** - API coverage report showing tested vs untested functions
- **Test runner editor** - Webview panel for browsing and running test suites

### Visual Editors (41 editor panels)

The editor sidebar opens interactive webview panels aggregated by `src/editors/catalog.ts`. Every panel uses the same VS Code-like shell: top action toolbar, left tool picker, central workspace, right inspector, optional output panel, and status bar.

Each panel exposes eight clickable feature actions derived from its recreation-guide requirements. Clicking an action mutates live editor state, updates the canvas/table/timeline/document workspace, refreshes the inspector/log/export preview, and marks the panel dirty. Exports include the edited state, action history, and the feature-action manifest so generated Lua/TOML/JSON/CSS/WGSL data can be saved or inserted into source files.

Editor groups:

- **Map and world tools** — Tile Map, Tileset, Tilemap Script, World Map, Province, Globe, Procedural Map, and NavMesh.
- **Node and graph tools** — Scene Flow, Dialog, Quest Tree, AI Behavior Tree, Graph, Sound DSP, Visual Shader, and Network Topology.
- **Asset and visual tools** — Pixel Art, Particle, Sprite Animation, Shader Preview, Voxel, Skeleton Rigging, Lighting Environment, PostFX Overlay, Color Palette, and Font Preview.
- **UI, data, and system tools** — GUI Widget, GUI Theme, Database, Input Mapper, Localization, Physics Materials, Audio Mixer, Global Autoload, Asset Manifest, Performance Profiler, Project Export, Test Runner, and API Reference.

Each editor has its own active implementation file in `src/editors/*Editor.ts` and is registered through `src/editors/implementations.ts`. Guide-derived metadata lives locally in those concrete files (`reference`, `useCase`, `vision`, the exact eight `featureList` bullets, toolbar, tools, inspector, bottom panel, and export settings). `src/editors/editorFactory.ts` derives typed `featureActions` from those requirements, `src/editors/catalog.ts` aggregates the local specs, and `src/editors/panelHost.ts` implements the reusable interactive runtime for grid, graph, table, timeline, preview, and document workspaces.

### AI-Assisted Development

- **MCP Server** - Exposes 6 tools to GitHub Copilot agents (run example, API lookup, build check, test runner, log viewer, example listing)
- **CAG bundling** - Ships .instructions.md, .skill.md, .prompt.md, and .agent.md files for Copilot context
- **Pattern library** - Browse and insert common `lurek.*` code patterns
- **Game jam starter** - Scaffold a new game project from genre templates

### Other

- **Asset explorer** - Tree view of project assets (images, sounds, scripts)
- **Dependency graph** - Visualize module dependencies
- **System monitor** - Live CPU/RAM monitoring of the engine process
- **API coverage** - Report which `lurek.*` functions your project uses
- **Scaffold** - Generate main.lua + conf.lua project templates

## Installation

### From VSIX

```bash
cd extension/vscode
npm install
node esbuild.config.mjs --production
npx @vscode/vsce package --no-dependencies
code --install-extension lurek2d-toolkit-1.0.0.vsix
```

### From Source (Development)

```bash
cd extension/vscode
npm install
node esbuild.config.mjs --watch
# Then press F5 in VS Code to launch Extension Development Host
```

## Activation

The extension activates when a workspace contains main.lua, conf.lua, or Cargo.toml, or when you open any .lua file.

## Settings

| Setting | Default | Description |
|---|---|---|
| `lurek.enginePath` | `""` | Path to the lurek2d binary (auto-detected if on PATH) |
| `lurek.luaVersion` | `"luajit"` | Lua runtime: luajit or lua54 |

## Requirements

- VS Code 1.90.0+
- For game development: lurek2d binary (built from engine source or installed)
- For engine development: Rust toolchain + Cargo

## License

MIT - same as the Lurek2D engine.
