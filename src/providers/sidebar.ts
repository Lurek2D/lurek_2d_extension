import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { EDITOR_CATALOG } from "../editors/catalog.js";

/**
 * A single item in the Lurek2D sidebar tree views.
 */

const COMMAND_TOOLTIPS: Record<string, string> = {
  "lurek.scaffold.project": "**New Project from Template**\n\nScaffolds a new Lurek2D game project from a variety of built-in templates. It sets up the directory structure, configuration files, and initial Lua scripts so you can start developing your game immediately without manual setup.",
  "lurek.scaffold.mod": "**New Mod from Template**\n\nGenerates a minimal Lurek2D mod project structure using `tools/mods/mod_init.py`. It creates the necessary directories, metadata, and hook files to start building a modification for an existing Lurek2D game.",
  "lurek.scaffold.file": "**New File from Template**\n\nCreates a new Lua script based on Lurek2D object templates (e.g., Entity, Component, State). It injects the correct boilerplate code, saving you time and ensuring your new objects adhere to the engine's architectural standards.",
  "lurek.ui.snapToGrid": "**Snap TOML to Grid**\n\nSnaps every pixel-coordinate field in the open Lurek2D TOML layout file to a strict grid. It invokes `tools/ui/snap_to_grid.py` to mathematically align your UI elements, ensuring pixel-perfect interfaces across your entire game.",
  "lurek.ui.fixLayouts": "**Fix UI Layouts**\n\nAutomatically fixes errors and formatting issues in the current TOML layout file. By running `tools/ui/fix_layouts.py`, it resolves syntax mistakes, overlapping bounds, and structural inconsistencies so your UI renders without glitches.",
  "lurek.package.zip": "**Package Game (.zip)**\n\nCompiles the game assets and scripts into a distributable archive for release. It compresses all necessary files while excluding developer-only assets, preparing a clean zip file that you can immediately share with players.",
  "lurek.package.windows": "**Package for Windows**\n\nCreates a standalone Windows executable (.exe) bundled with all necessary Lurek2D engine runtime files and your game assets. It builds a ready-to-play package optimized for the Windows platform, avoiding the need for users to install dependencies.",
  "lurek.package.linux": "**Package for Linux**\n\nGenerates a standalone Linux binary bundled with your game data. It statically links the Lurek2D runtime so that Linux users can launch your game out of the box on popular distributions like Ubuntu or Arch.",
  "lurek.package.macos": "**Package for macOS**\n\nConstructs a native macOS `.app` bundle containing the Lurek2D runtime and your game payload. It ensures correct code signing paths and asset embedding so Mac users experience a seamless launch.",
  "lurek.library.add": "**Add Library Module**\n\nDownloads and integrates a community or official Lurek2D library module into your project. It automatically sets up the required require paths and dependencies so you can immediately use the new functionality in your code.",
  "lurek.library.update": "**Update Libraries**\n\nScans your project's integrated libraries and fetches the latest compatible updates from the Lurek2D package repository. It ensures you have the most recent bug fixes and performance improvements without breaking your game.",
  "lurek.jam.quickBuild": "**Quick Jam Build**\n\nExecutes an ultra-fast, unoptimized build sequence designed specifically for Game Jams. It skips heavy asset compression and deep linting to give you a playable binary in seconds, maximizing your iteration speed.",
  "lurek.jam.exportWeb": "**Export Web/HTML5**\n\nCompiles your Lurek2D game into an HTML5/WebAssembly package. It generates an `index.html` file and web-ready assets, allowing you to easily upload your game to platforms like itch.io or share it directly via a web browser.",
  "lurek.runGame": "**Run Game**\n\nLaunches the current project using the debug build. Equivalent to `cargo run`. Use this for day-to-day playtesting with full log output.",
  "lurek.stopGame": "**Stop Game**\n\nTerminates the running Lurek2D process. Sends a kill signal to the active terminal session holding the game.",
  "lurek.runWithArgs": "**Run Game with Arguments**\n\nPrompts for extra command-line flags and passes them to the engine binary. Useful for enabling feature flags, selecting a specific game demo, or overriding config values at launch.",
  "lurek.runExample": "**Run Example**\n\nOpens a Quick Pick of the scripts in `content/examples/` and launches the selected one inside the engine. Good for quickly testing isolated API usage.",
  "lurek.run.debugNoRebuild": "**Run: Debug (no rebuild)**\n\nLaunches the last debug binary directly without recompiling Rust code. Fast path when you have changed only Lua scripts and do not need a fresh `cargo build`.",
  "lurek.run.releaseNoRebuild": "**Run: Release (no rebuild)**\n\nLaunches the last release binary directly without recompiling. Fast path for testing release-mode performance after a Lua-only change.",
  "lurek.run.debugPickDemo": "**Run: Debug — Pick Demo**\n\nOpens a Quick Pick listing all demos in `content/games/` and launches the selected one in the debug binary. Lets you switch between demos without touching the CLI.",
  "lurek.run.releasePickDemo": "**Run: Release — Pick Demo**\n\nSame as Debug Pick Demo but runs the release binary. Useful for verifying a specific demo behaves correctly in the optimized build.",
  "lurek.run.profiler": "**Run with Profiler**\n\nStarts the game with the internal profiler enabled. It records CPU timings, GPU draw calls, and memory allocations per frame, allowing you to identify performance bottlenecks and optimize your critical code paths.",
  "lurek.build.debug": "**Build: Debug**\n\nCompiles the full engine in debug mode via `cargo build`. Includes debug symbols, assertions, and overflow checks. Use this before running tests or debugging.",
  "lurek.build.release": "**Build: Release**\n\nCompiles the engine with full optimizations via `cargo build --release`. Produces a fast binary suitable for distribution benchmarks and packaging.",
  "lurek.build.dist": "**Build: Distribution Package**\n\nBuilds a release binary and bundles it together with game assets and engine libraries into a distributable archive via `tools/dist/dist.ps1`.",
  "lurek.build.check": "**Build: Check (type-check only)**\n\nRuns `cargo check` to verify types and borrow rules without producing a binary. Much faster than a full build — ideal for quick compilation feedback while editing Rust.",
  "lurek.hotReload.force": "**Force Hot Reload**\n\nManually triggers a hot reload of all Lua scripts and visual assets without restarting the game engine. It allows you to instantly see the results of your code changes while preserving the current game state.",
  "lurek.test.rust.all": "**Run Rust Unit Tests**\n\nExecutes the complete suite of Rust unit tests for the Lurek2D engine using `cargo test`. It verifies the integrity of the core runtime, ensuring that no foundational logic has been broken by recent engine modifications.",
  "lurek.test.rust.parallel": "**Run Parallel Cargo Tests**\n\nExecutes Rust tests in parallel across multiple CPU threads using `tools/dev/parallel_cargo.py`. This significantly reduces test execution time for the engine compared to the standard synchronous cargo test command.",
  "lurek.test.lua.all": "**Run Lua Spec Tests**\n\nRuns all Lua-side specification tests to validate your game logic. It spawns a headless Lurek2D instance that executes your test scripts, checking assertions and verifying that your gameplay mechanics behave correctly.",
  "lurek.test.lua.golden": "**Run Golden Image Tests**\n\nExecutes visual regression tests by comparing current rendered frames against known 'golden' reference images. It helps ensure that rendering pipelines, UI layouts, and graphical effects have not subtly broken over time.",
  "lurek.test.all": "**Test: Run All Tests**\n\nRuns the full test suite: all Rust unit tests (`cargo test`) followed by all Lua spec tests under `tests/lua/`. This is the gate to pass before every commit.",
  "lurek.test.runCurrent": "**Test: Run Current Lua Test File**\n\nLaunches a headless engine session that runs only the Lua test file currently open in the editor. Fast feedback loop for active TDD work.",
  "lurek.test.runAll": "**Test: Run All Lua Tests in Project**\n\nRuns every `tests/lua/**/*.lua` test file sequentially through the harness. Use this to validate the full Lua-side contract after a larger change.",
  "lurek.test.coverage": "**Test: Analyze Lua Test Coverage**\n\nRuns `tools/audit/lua_api_test_coverage.py` to compute which `lurek.*` API functions are covered by Lua tests. Surfaces gaps before merging new API additions.",
  "lurek.test.generateForFile": "**Test: Generate Tests for Current File**\n\nScans the current Lua file for exported functions and scaffolds a skeleton test file in `tests/lua/unit/`. You still write the assertions, but the boilerplate is handled.",
  "lurek.test.generateForFunction": "**Test: Generate Tests for Selected Function**\n\nGenerates a single test case for the function selected in the editor. Use it to add coverage for one entry point at a time without generating a whole file.",
  "lurek.test.target.math": "**Test: Run math Module Tests**\n\nRuns only the math module tests (`cargo test math` + `tests/lua/unit/test_math_*.lua`). Fast focused feedback when working on math functions.",
  "lurek.test.target.input": "**Test: Run input Module Tests**\n\nRuns only the input module tests. Validates keyboard, mouse, and gamepad binding logic without running the full suite.",
  "lurek.test.target.core": "**Test: Core Engine**\n\nRuns a targeted subset of tests focusing exclusively on the core Lurek2D systems (e.g., math, memory, basic structures). It allows you to quickly verify low-level functionality without waiting for the entire test suite.",
  "lurek.test.target.physics": "**Test: Physics**\n\nRuns a targeted subset of tests evaluating the physics engine. It checks collision detection, rigid body dynamics, and raycasting logic to guarantee that in-game movement and collisions are perfectly accurate.",
  "lurek.test.target.audio": "**Test: Audio**\n\nRuns a targeted subset of tests for the audio subsystem. It validates sound loading, positional audio math, mixer channels, and DSP effects to ensure high-fidelity sound playback in the engine.",
  "lurek.test.target.graphics": "**Test: Graphics**\n\nRuns a targeted subset of tests for the rendering pipeline. It checks wgpu context creation, shader compilation, and draw call batching, ensuring that the visual engine is stable and performant.",
  "lurek.editor.tilemap": "**Tile Map Editor**\n\nOpens the integrated Lurek2D Tile Map Editor. It provides a visual interface for painting tiles, defining collision layers, and placing entities, seamlessly saving the results into a format the engine can load instantly.",
  "lurek.editor.sprite": "**Sprite Animator**\n\nOpens the Sprite Animator tool. It allows you to slice sprite sheets, define animation frames, set frame durations, and visually preview animations before exporting them for use in your Lua game scripts.",
  "lurek.editor.colorPalette": "**Color Palette**\n\nOpens the Color Palette manager. It lets you define, modify, and preview the core colors used across your game's UI and rendering, ensuring a cohesive and easily adjustable visual style.",
  "lurek.editor.fontPreview": "**Font Preview**\n\nOpens a typography preview tool. It allows you to test various TrueType/OpenType fonts with different sizes, anti-aliasing settings, and text strings to see exactly how they will render in the Lurek2D engine.",
  "lurek.editor.sceneFlow": "**Scene Flow Editor**\n\nOpens the Scene Flow visualizer. It provides a node-based overview of your game's scenes (e.g., Main Menu, Level 1, Game Over) and the transitions between them, helping you design the high-level flow of the application.",
  "lurek.editor.entity": "**Entity Designer**\n\nOpens the Entity Component System (ECS) designer. It allows you to visually construct game objects by attaching components (like Transform, Sprite, PhysicsBody) and configuring their initial properties without writing raw code.",
  "lurek.editor.dialog": "**Dialog Editor**\n\nOpens the interactive Dialog Editor. It gives you a node-based interface to write branching conversations, assign character portraits, and trigger gameplay events during dialogue sequences in your RPG or adventure game.",
  "lurek.editor.questTree": "**Quest Tree Editor**\n\nOpens the Quest logic editor. It lets you design complex, branching questlines with multiple objectives, prerequisites, and rewards, visualizing the player's potential paths through the game's narrative.",
  "lurek.editor.guiWidget": "**GUI Widget Editor**\n\nOpens a WYSIWYG editor for Lurek2D UI widgets. It allows you to drag and drop buttons, panels, and text fields, adjust their layout properties, and immediately see how they will look in-engine.",
  "lurek.editor.timeline": "**Timeline / Cutscene**\n\nOpens the Timeline Editor for creating in-game cinematics. It provides keyframe tracks for animating object positions, triggering sounds, and changing camera angles to author precise, time-based cutscenes.",
  "lurek.editor.inputMapper": "**Input Mapper**\n\nOpens the Input Configuration tool. It lets you define abstract game actions (like 'Jump' or 'Shoot') and map them to specific keyboard, mouse, and gamepad inputs, generating a configuration file the engine uses at runtime.",
  "lurek.editor.localization": "**Localization Editor**\n\nOpens the translation management interface. It presents your game's text strings in a tabular format, making it easy to add new languages, track missing translations, and manage your i18n dictionary files.",
  "lurek.editor.particle": "**Particle Designer**\n\nOpens the visual Particle System editor. It allows you to tweak emission rates, velocities, colors over lifetime, and gravity effects in real-time, helping you create stunning visual effects like fire, smoke, and magic.",
  "lurek.editor.physicsMaterials": "**Physics Materials**\n\nOpens the Physics Material editor. It lets you define properties such as friction, bounciness (restitution), and density for different surface types, which the physics engine uses to resolve collisions realistically.",
  "lurek.editor.aiBehavior": "**AI Behavior Tree**\n\nOpens the Behavior Tree node editor. It provides a visual way to design complex artificial intelligence logic for enemies and NPCs by connecting condition nodes with action sequences and selectors.",
  "lurek.editor.voxel": "**Voxel Editor**\n\nOpens a lightweight 3D voxel editor (adapted for 2D isometric/raycasting usage). It allows you to construct block-based models and export them as 2D sprite sheets or specialized data for pseudo-3D rendering.",
  "lurek.editor.audioMixer": "**Audio Mixer**\n\nOpens the Audio Mixing console. It lets you group sound effects and music into buses, adjust master volumes, apply ducking rules, and visualize audio levels to achieve the perfect sound mix for your game.",
  "lurek.editor.soundDsp": "**Sound DSP Panel**\n\nOpens the Digital Signal Processing (DSP) chain editor. It allows you to apply real-time audio effects like reverb, low-pass filters, and delay to sound channels, creating dynamic atmospheric audio.",
  "lurek.editor.postfxOverlay": "**PostFX & Overlay Designer**\n\nOpens the Post-Processing visualizer. It lets you stack and configure fullscreen shader effects such as bloom, chromatic aberration, scanlines, and color grading to establish your game's final visual aesthetic.",
  "lurek.editor.database": "**Database Browser**\n\nOpens the Game Database viewer. It provides a tabular interface to inspect and modify structured game data (like item stats, enemy health, or crafting recipes) stored in JSON, CSV, or SQLite formats.",
  "lurek.editor.graph": "**Graph Editor**\n\nOpens a generic node-graph editor. This tool can be used to visualize and edit any mathematical or logical graph structures utilized by your custom game systems.",
  "lurek.debug.hotReload": "**Debug: Hot Reload Active Lua File**\n\nPushes the currently open Lua file to the running engine for live evaluation. The engine re-executes the module without restarting, letting you iterate on game behavior in real time.",
  "lurek.debug.showStats": "**Debug: Show Engine Stats**\n\nPrints a snapshot of current engine statistics to the output panel: active entities, loaded assets, Lua memory in use, last frame time, and audio buffers. Quick health check without opening a full profiler.",
  "lurek.debug.inspect": "**Debug: Inspect Lua Object**\n\nPrompts you to enter a Lua variable path and displays its full value from the live engine session. Useful for inspecting nested tables or userdata without pausing execution.",
  "lurek.debug.callStack": "**Debug: Show Lua Call Stack**\n\nFetches the current Lua call stack from the engine and shows it in a Quick Pick. Selecting a frame opens the corresponding source file at the right line.",
  "lurek.debug.printHistory": "**Debug: Show Output History**\n\nDisplays a scrollable log of all `lurek.log.*` output from the current session. Useful when the terminal is cluttered or when you need to search back through earlier output.",
  "lurek.debug.addWatch": "**Debug: Add Selection to Watchers**\n\nAdds the currently selected text as a watch expression in the Watchers Panel. The engine will poll the expression each frame and stream its value back to the panel.",
  "lurek.debug.runAndConnect": "**Debug Run + Connect**\n\nLaunches the game in a suspended state and automatically attaches the VS Code debugger. It allows you to set breakpoints, step through Lua code, and inspect variables right from the moment the game boots.",
  "lurek.debug.connect": "**Connect Debugger**\n\nAttaches the VS Code debugger to an already running instance of Lurek2D. It establishes a socket connection to the engine, enabling real-time breakpoints and variable inspection without restarting the game.",
  "lurek.debug.disconnect": "**Disconnect Debugger**\n\nDetaches the VS Code debugger from the running Lurek2D instance. The game will continue running normally, but you will no longer hit breakpoints or receive debug telemetry in the IDE.",
  "lurek.debug.evaluate": "**Evaluate Lua**\n\nOpens an interactive REPL (Read-Eval-Print Loop) prompt. It allows you to execute arbitrary Lua code snippets on the fly within the context of the running game, perfect for cheating, testing functions, or changing state.",
  "lurek.debug.openWatchers": "**Watchers Panel**\n\nOpens the variable Watchers view. It lets you monitor the real-time values of specific Lua variables or memory addresses while the game runs, helping you track down state-related bugs.",
  "lurek.debug.openInspector": "**Variable Inspector**\n\nOpens the deep Variable Inspector. It allows you to drill down into complex Lua tables, userdata, and engine objects to examine their internal structure and properties during a debugging session.",
  "lurek.debug.openCallStack": "**Call Stack**\n\nOpens the execution Call Stack view. When execution is paused at a breakpoint, this shows the exact chain of Lua function calls that led to the current line, providing crucial context for how an error occurred.",
  "lurek.debug.performance": "**Performance View**\n\nOpens a live performance dashboard. It displays real-time metrics such as Frames Per Second (FPS), frame time graphs, CPU/GPU utilization, and memory usage to help you monitor engine health.",
  "lurek.debug.screenshot": "**Screenshot**\n\nTriggers the engine to capture the current frame and save it as an image file. It is useful for capturing visual bugs, generating promotional material, or creating golden images for regression testing.",
  "lurek.debug.status": "**Engine Status**\n\nDisplays a high-level summary of the engine's current operational state. It shows the active Lurek2D version, graphics backend in use, loaded modules, and overall system health.",
  "lurek.browseApi": "**Browse API**\n\nOpens a searchable Quick Pick menu listing all available functions, classes, and constants in the Lurek2D Lua API. It allows you to quickly find and navigate to the documentation for any specific feature.",
  "lurek.openApiDocs": "**Open API Docs**\n\nOpens the full generated Lua API documentation file (`lurek.lua` or `lurek.md`) in the editor. It provides a comprehensive reference of all engine capabilities and type definitions.",
  "lurek.openWiki": "**Open Wiki**\n\nOpens the official Lurek2D GitHub Wiki in your default web browser. It grants you immediate access to tutorials, architectural guides, frequently asked questions, and community knowledge.",
  "lurek.depGraph": "**Dependency Graph**\n\nGenerates and displays an interactive node graph showing the import relationships between internal Lurek2D Rust modules. It helps engine contributors understand the architectural coupling and data flow.",
  "lurek.depList": "**Dependency List**\n\nOutputs a hierarchical list of the engine's external Rust crate dependencies by executing `cargo tree`. It is useful for auditing third-party libraries and resolving version conflicts.",
  "lurek.apiCoverage": "**Check API Example Coverage**\n\nRuns `tools/audit/integration_coverage.py` and shows which `lurek.*` API symbols have working examples in `content/examples/`. Highlights functions with no coverage so documentation gaps are visible at a glance.",
  "lurek.api.quickInsert": "**Quick Insert lurek.* API Snippet**\n\nOpens a searchable Quick Pick of all `lurek.*` functions. Selecting one inserts a ready-to-use call snippet at the current cursor position, with correct parameter names from the type stubs.",
  "lurek.assets.refresh": "**Refresh Assets**\n\nForces the engine's GameFS (File System) to rescan the project directory. It detects newly added, modified, or deleted files (like images or sounds) without requiring a full engine restart.",
  "lurek.assets.openPanel": "**Open Asset Explorer**\n\nOpens the visual Asset Explorer panel. It provides a thumbnail gallery of your game's sprites, audio files, and scripts, making it easier to manage and preview resources than a standard file browser.",
  "lurek.assets.findMissing": "**Find Missing Assets**\n\nScans your Lua scripts and layout files for references to assets that do not exist on disk. It helps you catch broken paths and missing files before they cause a crash at runtime.",
  "lurek.deps.findCircular": "**Find Circular Deps**\n\nAnalyzes the engine's module imports to detect circular dependencies (e.g., Module A imports B, which imports A). It warns developers of architectural flaws that violate the engine's strict one-way dependency rule.",
  "lurek.deps.findOrphans": "**Show Orphan Modules**\n\nScans the codebase for files or modules that are defined but never actually imported or used by the rest of the application. It helps keep the project clean by identifying dead code.",
  "lurek.perf.openDashboard": "**Open Performance Dashboard**\n\nOpens a comprehensive historical performance view. It aggregates profiling data over time, allowing you to analyze long-term trends in frame times, memory growth, and GC (Garbage Collection) pauses.",
  "lurek.runtime.openMonitor": "**System Monitor**\n\nOpens a system-level resource monitor. It tracks the overall CPU, RAM, and VRAM usage of the Lurek2D process relative to the host operating system, helping diagnose severe resource leaks.",
  "lurek.api.usageReport": "**API Usage Report**\n\nGenerates a statistical report detailing how frequently specific Lua API functions are called during a play session. It highlights hot paths where optimizations or caching might be necessary.",
  "lurek.perf.openHotReload": "**Open Hot Reload History**\n\nDisplays a log of recent hot-reload events. It shows which files were modified and successfully reloaded, helping you track changes and debug issues if a hot-reload causes unexpected behavior.",
  "lurek.perf.clearHistory": "**Clear History**\n\nErases all accumulated performance profiling data, logs, and hot-reload history. It gives you a clean slate for capturing new, isolated metrics during your next testing session.",
  "lurek.quality.gate": "**Quality: Full Gate (pre-push)**\n\nRuns the complete pre-push quality gate: `cargo test`, `cargo clippy -- -D warnings`, `python tools/validate/cag_validate.py`, and doc validation. All must pass before the result is green.",
  "lurek.quality.clippy": "**Quality: Clippy (strict)**\n\nRuns `cargo clippy -- -D warnings` and streams the output to a terminal. Treats every Clippy lint as a hard error, matching the CI gate requirement.",
  "lurek.quality.fmtApply": "**Quality: Apply Rust Formatting**\n\nRuns `cargo fmt` on all Rust source files. Applies the project's rustfmt configuration in place. Run this before every commit to keep diffs clean.",
  "lurek.quality.fmtCheck": "**Quality: Check Rust Formatting**\n\nRuns `cargo fmt -- --check` without modifying files. Reports which files deviate from the project style. Used in CI to enforce consistent formatting.",
  "lurek.docs.fullPipeline": "**Docs: Run Full Pipeline**\n\nExecutes `python tools/gen_all_docs.py` which regenerates `docs/api/lurek.lua`, `build/completions.json`, `build/hover.json`, and `build/signatures.json` from the Rust source. Run this after any `src/lua_api/*_api.rs` change.",
  "lurek.docs.luaBrowser": "**Docs: Build Lua API Browser**\n\nRuns `tools/docs/gen_docs_lua_html.py`, writes an independent static site to `build/doc/lua-api/`, and opens `index.html` in your browser. This is separate from `cargo doc` and keeps Lua docs independent from Rust docs.",
  "lurek.docs.rustBrowser": "**Docs: Open Rust Docs in Browser**\n\nRuns `cargo doc --open` to build and open the HTML Rust documentation. Useful for browsing internal engine API docs and cross-referencing struct/trait definitions.",
  "lurek.docs.libraryApi": "**Docs: Generate Library API**\n\nRuns `tools/docs/gen_lib_docs.py` to regenerate API documentation for all modules under `library/`. Run this after changing any `library/*/init.lua` public interface.",
  "lurek.docs.validateLuaStubs": "**Docs: Validate Generated Lua Stubs**\n\nRuns `tools/validate/validate_generated_lua_stubs.py` to verify that the generated `docs/api/lurek.lua` stubs are syntactically valid LuaCATS and that all type names resolve. Catches regressions in the doc generator.",
  "lurek.dist.repackage": "**Dist: Repackage (skip build)**\n\nReruns the packaging step of `tools/dist/dist.ps1` without triggering a new Rust build. Use this when you only changed game assets or Lua scripts and need a fresh archive quickly.",
  "lurek.dist.installWindows": "**Dist: Install to Windows**\n\nRuns `tools/dist/install.ps1` to copy the built distribution package into the local Windows install directory. Useful for testing the installed experience on your dev machine.",
  "lurek.audit.cagLinkCheck": "**Audit: Validate CAG File Links (strict)**\n\nRuns `python tools/audit/cag_link_check.py --strict` to verify that all file paths referenced inside `.github/agents/`, `.github/skills/`, and `.github/prompts/` resolve to real files. Required after any CAG rename or move.",
  "lurek.validate.luaApi": "**Validate: Lua API Stubs**\n\nRuns `tools/validate/validate_lua_api.py` to check that every `src/lua_api/*_api.rs` binding has correct `@param` and `@return` doc comments and that the generated stubs match the actual Rust implementation.",
  "lurek.validate.library": "**Validate: Library Modules**\n\nRuns `tools/validate/validate_library.py` to verify that every module under `library/` has a valid `init.lua`, a corresponding `example.lua`, and is registered in the harness. Flags missing or broken library entries.",
  "lurek.validate.changelog": "**Validate: CHANGELOG Format**\n\nRuns `tools/validate/validate_changelog.py` to ensure `docs/CHANGELOG.md` follows the required format: correct version headers, ISO dates, and non-empty entry bodies.",
  "lurek.validate.callbacks": "**Validate: Lua Callbacks**\n\nRuns `tools/validate/check_callbacks.py` to verify that all `lurek.on*` callback names registered in Rust exactly match their usage in `tests/lua/` and `content/`. Catches typos in callback names before they become runtime silences.",
  "lurek.validate.cag": "**Validate: CAG Files**\n\nRuns `python tools/validate/cag_validate.py` to check all `.github/agents/`, `.github/skills/`, and `.github/prompts/` files for required front-matter fields, valid YAML, and structural integrity.",
  "lurek.library.browse": "**Browse Pattern Library**\n\nOpens a Quick Pick listing all Lua library modules under `library/`. Selecting one opens the module's `init.lua` in the editor. Good for discovering available reusable systems like `inventory`, `tween_chain`, or `dialog`.",
  "lurek.library.insertSnippet": "**Insert Pattern Library Snippet**\n\nBrowses the pattern library and inserts a ready-to-use `require` + initialization snippet for the selected module at the current cursor. Saves time wiring up common library patterns.",
  "lurek.library.newPattern": "**Save Selection as New Pattern**\n\nTakes the current editor selection and saves it as a named snippet in the pattern library. The snippet is available for future insertion via `Insert Pattern Library Snippet`.",
  "lurek.cag.deploy": "**AI: Deploy GameDev CAG Pack**\n\nCopies the full set of GameDev CAG agents, skills, and prompts into `.github/` of the current workspace. Use this to bootstrap AI guidance in a fresh project.",
  "lurek.cag.scaffold": "**AI: Scaffold GameDev CAG Templates**\n\nGenerates skeleton agent, skill, and prompt files from the official templates. Useful when adding new domain-specific guidance without starting from scratch.",
  "lurek.cag.updateGameDev": "**AI: Update GameDev CAG Pack**\n\nFetches the latest version of the GameDev CAG files and applies them over the local copies, preserving any local-only customizations that are not in the upstream templates.",
  "lurek.gameJam.quickStart": "**Game Jam: Quick Start Project**\n\nScaffolds a minimal but complete Lurek2D project tuned for jam constraints: compact directory structure, a working `main.lua`, and a `conf.toml` with jam-friendly defaults. Gets you coding in under a minute.",
  "lurek.gameJam.addModule": "**Game Jam: Add Module**\n\nAdds a library module from `library/` to the current jam project with a single selection. Handles the `require` path and wires the module into the project structure.",
  "lurek.gameJam.timer": "**Game Jam: Open Countdown Timer**\n\nOpens a webview panel showing a countdown timer to your jam deadline. Set the end date/time once and the panel keeps you aware of remaining time throughout the session.",
  "lurek.jam.checklist": "**Game Jam: Open Submission Checklist**\n\nOpens an interactive checklist panel covering common jam submission requirements: working build, screenshots, description text, license, and itch.io upload. Check items off as you complete them.",
  "lurek.extractToModuleFile": "**Extract Selection to Lua Module**\n\nTakes the selected Lua code, creates a new file under `content/` or the current directory, moves the code into it, and replaces the selection with a correctly formatted `require` call.",
  "lurek.assets.insertPath": "**Assets: Insert Path at Cursor**\n\nOpens the Asset Explorer and inserts the relative path of the chosen file at the current cursor position. Saves you from typing or copy-pasting asset paths manually.",
  "lurek.deps.showGraph": "**Deps: Open Module Graph**\n\nSame as Dependency Graph but scoped to Lua module imports. Opens an interactive graph showing which Lua files `require` which other files, helping you spot unnecessary coupling.",
  "lurek2d.scanAllGames": "**Scan Lua Workspace for Errors**\n\nRuns the Lua language server over every `.lua` file in the workspace and collects all diagnostics into the Problems panel. Useful for a full project-wide error sweep.",
  "lurek2d.showRagPanel": "**Search Knowledge Base (RAG)**\n\nOpens a search panel backed by the local knowledge index. Enter a natural-language query to retrieve relevant engine documentation, spec snippets, or example code without leaving VS Code.",
  "lurek.cag.install": "**Install AI Config**\n\nInstalls or initializes the Context Augmented Guidance (CAG) configuration files in your project. It sets up the AI agents and rules required for Lurek2D's intelligent Copilot features.",
  "lurek.cag.selectAgent": "**Select Agent**\n\nOpens a prompt to select an active AI Agent persona (e.g., Developer, Content Maker, Verifier). It adjusts the AI's behavior and constraints to match the specific role you need help with.",
  "lurek.cag.selectSkill": "**Select Skill**\n\nOpens a prompt to load a specific CAG Skill (e.g., UI Layout, GPU Programming, Lua Bridging). It injects specialized domain knowledge into the AI's context so it can better assist with complex technical tasks.",
  "lurek.cag.selectPrompt": "**Select Prompt**\n\nProvides a list of predefined workflow prompts for the AI. It allows you to quickly trigger standard procedures like 'Code Review', 'Write Tests', or 'Audit Architecture' without typing them manually.",
  "lurek.cag.update": "**Update CAG Files**\n\nSynchronizes your local CAG configuration with the latest official rules from the Lurek2D repository. It ensures your AI assistant is operating with the most up-to-date engine guidelines and constraints.",
  "lurek.mcp.install": "**Install MCP Server**\n\nInstalls the Model Context Protocol (MCP) server. This component enables advanced, standardized communication between the VS Code extension, the Lurek2D engine, and external AI models.",
  "lurek.mcp.status": "**MCP Status**\n\nDisplays the current connection status and health of the Model Context Protocol server. It helps you verify that the AI integration bridge is running correctly and ready to receive commands.",
  "lurek.audit.qualityReport": "**Quality Report**\n\nGenerates a comprehensive quality audit of your project. It checks code formatting, documentation coverage, test results, and architectural compliance, summarizing the overall health of your codebase.",
  "lurek.audit.testCoverage": "**Test Coverage**\n\nRuns a Rust code coverage analysis tool (like `tarpaulin`) and displays the results. It highlights which lines of engine code are executed by tests and which areas are missing verification.",
  "lurek.audit.docCoverage": "**Doc Coverage**\n\nScans the engine source code to calculate documentation coverage. It identifies public functions, structs, and modules that lack proper docstrings, ensuring the API remains well-documented.",
  "lurek.audit.exampleCoverage": "**Example Coverage**\n\nAnalyzes the `content/examples` directory to ensure that all core Lua APIs are demonstrated in at least one working example. It guarantees that users have practical references for engine features.",
  "lurek.audit.luaTestCoverage": "**Lua API Test Coverage**\n\nRuns `tools/audit/lua_api_test_coverage.py`. It checks whether every registered Lua function (bound from Rust) has a corresponding unit test in the Lua test suite.",
  "lurek.audit.luaSpecCoverage": "**Lua Spec Coverage**\n\nRuns `tools/audit/lua_spec_coverage.py`. It verifies that the written documentation specifications match the actual Lua API surface exposed by the engine, flagging any undocumented or removed functions.",
  "lurek.validate.moduleCoverage": "**Validate Module Coverage**\n\nRuns `tools/validate/validate_module_coverage.py`. It ensures that every architectural module defined in the engine has a corresponding, up-to-date specification document in the `docs/specs` directory.",
  "lurek.editor.province": "**Province Editor**\n\nOpens the Province Map Editor. It allows you to load a province color map (PNG), sample colors, assign them to province metadata (TOML), and export the configuration for grand strategy games.",
  "lurek.editor.globe": "**Globe Editor**\n\nOpens the Globe/Geoscape Editor. It provides a 3D preview of the globe, enabling you to place markers, trace arcs, and define atmospheric or grid visuals, generating Lua setup code."
};

const EDITOR_COMMAND_TOOLTIPS: Record<string, string> = {
  "lurek.editor.tileMap": "**Tile Map Editor**\n\nBuild and paint tile-based levels with collision layers and map metadata. This editor helps you create playable map files quickly and keeps tile indices consistent across your project.",
  "lurek.editor.tileset": "**Tileset Editor**\n\nManage source tileset images and tile definitions in one place. Use it to review tile IDs, tune spacing and margins, and keep tile metadata synchronized for map tooling.",
  "lurek.editor.tilemapScript": "**Tilemap Script Editor**\n\nEdit generated or hand-written Lua logic that works with tilemaps. It is useful for spawn rules, tile triggers, map events, and gameplay behaviors tied to map cells.",
  "lurek.editor.worldMap": "**World Map Editor**\n\nDesign larger world-scale map layouts and links between regions. This is intended for high-level navigation structure, travel flow, and region organization.",
  "lurek.editor.procMap": "**Procedural Map Generator**\n\nConfigure procedural map generation presets and preview outcomes. Use it to iterate on generation parameters, then export settings for runtime use in your game.",
  "lurek.editor.province": "**Province Editor**\n\nAssign province metadata from color maps and export structured region definitions. This tool is useful for strategy-style maps and territory authoring workflows.",
  "lurek.editor.globe": "**Globe Editor**\n\nAuthor globe markers, arcs, and geoscape overlays with visual feedback. It helps with world-level presentation and exporting structured setup data.",
  "lurek.editor.pixelArt": "**Pixel Art Editor**\n\nCreate and refine pixel-art sprites directly in the extension. Use layers and palette controls to produce clean assets without leaving your coding workflow.",
  "lurek.editor.spriteAnim": "**Sprite Animation Editor**\n\nDefine animation clips, frame timing, and looping behavior for spritesheets. It helps you preview motion and export animation data used by runtime systems.",
  "lurek.editor.shaderPreview": "**Shader Preview**\n\nPreview shader effect behavior interactively before integrating it. This is useful for validating uniforms, tuning effect intensity, and checking visual quality.",
  "lurek.editor.colorPalette": "**Color Palette Editor**\n\nOrganize game color palettes and quickly compare palette variants. It helps maintain a coherent visual style across UI, sprites, and effects.",
  "lurek.editor.fontPreview": "**Font Preview**\n\nPreview in-game typography with different sizes and sample text. Use it to verify readability and choose the right font settings for UI and dialogue.",
  "lurek.editor.sceneFlow": "**Scene Flow Editor**\n\nModel scene transitions and high-level game flow in a visual graph. This helps you validate entry and exit paths between menus, levels, and cutscenes.",
  "lurek.editor.entity": "**Entity Designer**\n\nCompose entities and component-style definitions with structured forms. It helps prepare repeatable entity setups without manual boilerplate.",
  "lurek.editor.dialog": "**Dialog Editor**\n\nAuthor branching dialogues and conversation nodes with clear structure. Use it to manage narrative flow, response branches, and event triggers.",
  "lurek.editor.questTree": "**Quest Tree Editor**\n\nBuild quest dependency graphs with prerequisites and outcomes. It helps keep quest logic understandable and avoids broken progression paths.",
  "lurek.editor.guiWidget": "**GUI Widget Editor**\n\nDesign HUD and menu widgets visually with position and style controls. This tool speeds up iteration for common interface layouts.",
  "lurek.editor.timeline": "**Timeline Cutscene Editor**\n\nArrange time-based events for cutscenes and scripted sequences. Use it to line up animations, camera changes, and event timing.",
  "lurek.editor.inputMapper": "**Input Mapper**\n\nMap game actions to keyboard, mouse, and gamepad controls in one place. It helps keep input bindings clear and easier to test.",
  "lurek.editor.localization": "**Localization Editor**\n\nManage translated text resources and language-specific entries. Use it to track missing strings and keep localized content complete.",
  "lurek.editor.particle": "**Particle Designer**\n\nTune emission behavior, movement, and lifetime parameters for particle effects. This makes it easier to iterate on visual feedback like smoke, sparks, and magic.",
  "lurek.editor.physicsMaterials": "**Physics Materials Editor**\n\nConfigure friction, restitution, and other surface material settings. It helps you standardize how bodies interact across your physics scenes.",
  "lurek.editor.aiBehavior": "**AI Behavior Tree Editor**\n\nCreate and inspect AI behavior trees with node-level structure. Use it to design reusable decision logic for enemies and NPC systems.",
  "lurek.editor.voxel": "**Voxel Editor**\n\nDraft voxel-like content and export data for supported pipelines. This can be used for blocky assets and prototype geometry workflows.",
  "lurek.editor.audioMixer": "**Audio Mixer**\n\nAdjust channel and bus levels to shape your game audio mix. It helps balance music, ambience, and SFX with a practical editor workflow.",
  "lurek.editor.soundDsp": "**Sound DSP Panel**\n\nConfigure DSP chains and effect processing settings for audio. Use it to test filters and processing combinations before runtime integration.",
  "lurek.editor.postfxOverlay": "**PostFX Overlay Designer**\n\nDesign post-processing stacks and screen overlays visually. It helps tune final-frame look and consistency for your project style.",
  "lurek.editor.database": "**Database Browser**\n\nInspect and edit structured gameplay data tables with a practical UI. This is useful for balancing values and validating row-level content.",
  "lurek.editor.graph": "**Graph Editor**\n\nEdit and review general graph-style data structures used by gameplay tools. It is useful for relationships, node networks, and custom graph workflows."
};

function buildEditorItems(): SidebarItem[] {
  return EDITOR_CATALOG.map((editor) =>
    new SidebarItem(
      editor.sidebarLabel,
      vscode.TreeItemCollapsibleState.None,
      editor.command,
      editor.icon,
    ),
  );
}


export class SidebarItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly commandId?: string,
    public readonly icon?: string,
    public readonly statusDescription?: string,
  ) {
    super(label, collapsibleState);
    if (commandId) {
      this.command = {
        command: commandId,
        title: label,
      };
    }
    if (icon) {
      this.iconPath = new vscode.ThemeIcon(icon);
    }
    if (statusDescription) {
      this.description = statusDescription;
    }
    if (commandId) {
      const editorSpec = EDITOR_CATALOG.find((editor) => editor.command === commandId);
      const catalogTooltip = editorSpec
        ? `**${editorSpec.title}**\n\n${editorSpec.purpose}\n\nNative output: \`${editorSpec.nativeFormat}\`.`
        : undefined;
      const tooltipText = COMMAND_TOOLTIPS[commandId] ?? EDITOR_COMMAND_TOOLTIPS[commandId] ?? catalogTooltip;
      if (tooltipText) {
        const markdown = new vscode.MarkdownString(tooltipText, true);
        markdown.supportThemeIcons = true;
        this.tooltip = markdown;
      }
    }
  }
}

// ─── Project Tools ───────────────────────────────────────────

export class ProjectToolsProvider
  implements vscode.TreeDataProvider<SidebarItem>
{
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<SidebarItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SidebarItem): SidebarItem {
    return element;
  }

  getChildren(element?: SidebarItem): SidebarItem[] {
    if (!element) {
      return [
        new SidebarItem(
          "Project Health",
          vscode.TreeItemCollapsibleState.Expanded,
          undefined,
          "heart"
        ),
        new SidebarItem(
          "Create",
          vscode.TreeItemCollapsibleState.Expanded,
          undefined,
          "new-folder"
        ),
        new SidebarItem(
          "Package",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "package"
        ),
        new SidebarItem(
          "Libraries",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "library"
        ),
      ];
    }

    switch (element.label) {
      case "Project Health":
        return this.getProjectHealthItems();
      case "Create":
        return [
          new SidebarItem(
            "New Project from Template",
            vscode.TreeItemCollapsibleState.None,
            "lurek.scaffold.project",
            "file-add"
          ),
          new SidebarItem(
            "New File from Template",
            vscode.TreeItemCollapsibleState.None,
            "lurek.scaffold.file",
            "new-file"
          ),
        ];
      case "Package":
        return [
          new SidebarItem(
            "Package .zip",
            vscode.TreeItemCollapsibleState.None,
            "lurek.package.zip",
            "file-zip"
          ),
          new SidebarItem(
            "Package for Windows",
            vscode.TreeItemCollapsibleState.None,
            "lurek.package.windows",
            "desktop-download"
          ),
          new SidebarItem(
            "Package for Linux",
            vscode.TreeItemCollapsibleState.None,
            "lurek.package.linux",
            "terminal-linux"
          ),
          new SidebarItem(
            "Repackage (skip build)",
            vscode.TreeItemCollapsibleState.None,
            "lurek.dist.repackage",
            "file-zip"
          ),
          new SidebarItem(
            "Install Windows",
            vscode.TreeItemCollapsibleState.None,
            "lurek.dist.installWindows",
            "desktop-download"
          ),
        ];
      case "Libraries":
        return [
          new SidebarItem(
            "Browse Pattern Library",
            vscode.TreeItemCollapsibleState.None,
            "lurek.library.browse",
            "search"
          ),
          new SidebarItem(
            "Insert Code Snippet",
            vscode.TreeItemCollapsibleState.None,
            "lurek.library.insertSnippet",
            "code"
          ),
          new SidebarItem(
            "Save Selection as Pattern",
            vscode.TreeItemCollapsibleState.None,
            "lurek.library.newPattern",
            "save"
          ),
        ];
      default:
        return [];
    }
  }

  /** Scans the workspace for key project files and returns health indicators. */
  private getProjectHealthItems(): SidebarItem[] {
    const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wsRoot) {
      return [
        new SidebarItem("No workspace open", vscode.TreeItemCollapsibleState.None, undefined, "warning"),
      ];
    }

    const items: SidebarItem[] = [];

    // Check main.lua
    const hasMainLua = fs.existsSync(path.join(wsRoot, "main.lua"));
    items.push(new SidebarItem(
      "main.lua",
      vscode.TreeItemCollapsibleState.None,
      hasMainLua ? undefined : "lurek.scaffold.file",
      hasMainLua ? "pass" : "error",
      hasMainLua ? "found" : "missing"
    ));

    // Check conf.lua
    const hasConfLua = fs.existsSync(path.join(wsRoot, "conf.lua"));
    items.push(new SidebarItem(
      "conf.lua",
      vscode.TreeItemCollapsibleState.None,
      undefined,
      hasConfLua ? "pass" : "warning",
      hasConfLua ? "found" : "optional"
    ));

    // Count Lua files
    let luaFileCount = 0;
    try {
      const countLuaFiles = (dir: string): void => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith(".") || entry.name === "node_modules") { continue; }
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            countLuaFiles(fullPath);
          } else if (entry.name.endsWith(".lua")) {
            luaFileCount++;
          }
        }
      };
      countLuaFiles(wsRoot);
    } catch { /* ignore fs errors */ }
    items.push(new SidebarItem(
      "Lua files",
      vscode.TreeItemCollapsibleState.None,
      undefined,
      "file-code",
      `${luaFileCount}`
    ));

    // Check if tests exist
    const hasTests = fs.existsSync(path.join(wsRoot, "tests")) ||
                     fs.existsSync(path.join(wsRoot, "test")) ||
                     fs.existsSync(path.join(wsRoot, "tests.lua"));
    items.push(new SidebarItem(
      "Tests",
      vscode.TreeItemCollapsibleState.None,
      undefined,
      hasTests ? "pass" : "warning",
      hasTests ? "detected" : "none found"
    ));

    return items;
  }
}

// ─── Dev Tools ───────────────────────────────────────────────

export class DevToolsProvider
  implements vscode.TreeDataProvider<SidebarItem>
{
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<SidebarItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private _gameStatus: "stopped" | "running" | "crashed" = "stopped";
  private _lastTestResult: string | undefined;

  /** Update the game running status and refresh the tree. */
  setGameStatus(status: "stopped" | "running" | "crashed"): void {
    this._gameStatus = status;
    this._onDidChangeTreeData.fire(undefined);
  }

  /** Update the last test result summary and refresh the tree. */
  setTestResult(summary: string): void {
    this._lastTestResult = summary;
    this._onDidChangeTreeData.fire(undefined);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SidebarItem): SidebarItem {
    return element;
  }

  getChildren(element?: SidebarItem): SidebarItem[] {
    if (!element) {
      return [
        new SidebarItem(
          "Build",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "tools"
        ),
        new SidebarItem(
          "Run",
          vscode.TreeItemCollapsibleState.Expanded,
          undefined,
          "play"
        ),
        new SidebarItem(
          "Testing",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "beaker"
        ),
        new SidebarItem(
          "Quality",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "pass"
        ),
        new SidebarItem(
          "Docs",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "book"
        ),
        new SidebarItem(
          "Audit",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "graph"
        ),
        new SidebarItem(
          "Validate",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "check-all"
        ),
        new SidebarItem(
          "Debug",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "bug"
        ),
        new SidebarItem(
          "Reference",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "book"
        ),
        new SidebarItem(
          "Assets",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "file-media"
        ),
        new SidebarItem(
          "Dependencies",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "list-tree"
        ),
        new SidebarItem(
          "Performance",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "dashboard"
        ),
      ];
    }

    switch (element.label) {
      case "Build":
        return [
          new SidebarItem("Build: Debug", vscode.TreeItemCollapsibleState.None, "lurek.build.debug", "tools"),
          new SidebarItem("Build: Release", vscode.TreeItemCollapsibleState.None, "lurek.build.release", "tools"),
          new SidebarItem("Build: Dist", vscode.TreeItemCollapsibleState.None, "lurek.build.dist", "package"),
          new SidebarItem("Build: Check (type only)", vscode.TreeItemCollapsibleState.None, "lurek.build.check", "checklist"),
        ];
      case "Run":
        return [
          new SidebarItem(
            "Game Status",
            vscode.TreeItemCollapsibleState.None,
            undefined,
            this._gameStatus === "running" ? "debug-start" :
            this._gameStatus === "crashed" ? "error" : "debug-stop",
            this._gameStatus
          ),
          new SidebarItem("Run Game", vscode.TreeItemCollapsibleState.None, "lurek.runGame", "play"),
          new SidebarItem("Stop Game", vscode.TreeItemCollapsibleState.None, "lurek.stopGame", "debug-stop"),
          new SidebarItem("Run with Arguments", vscode.TreeItemCollapsibleState.None, "lurek.runWithArgs", "terminal"),
          new SidebarItem("Run Example", vscode.TreeItemCollapsibleState.None, "lurek.runExample", "file-code"),
          new SidebarItem("Run Debug — pick demo", vscode.TreeItemCollapsibleState.None, "lurek.run.debugPickDemo", "list-selection"),
          new SidebarItem("Run Release — pick demo", vscode.TreeItemCollapsibleState.None, "lurek.run.releasePickDemo", "list-selection"),
          new SidebarItem("Run Debug (no rebuild)", vscode.TreeItemCollapsibleState.None, "lurek.run.debugNoRebuild", "play"),
          new SidebarItem("Run Release (no rebuild)", vscode.TreeItemCollapsibleState.None, "lurek.run.releaseNoRebuild", "play"),
        ];
      case "Testing":
        return [
          ...(this._lastTestResult ? [
            new SidebarItem(
              "Last Result",
              vscode.TreeItemCollapsibleState.None,
              undefined,
              this._lastTestResult.includes("fail") ? "error" : "pass",
              this._lastTestResult
            ),
          ] : []),
          new SidebarItem("Open Test Runner", vscode.TreeItemCollapsibleState.None, "lurek.editor.testRunner", "beaker"),
          new SidebarItem("Run All Tests", vscode.TreeItemCollapsibleState.None, "lurek.test.all", "testing-run-all-icon"),
          new SidebarItem("Run Rust Tests", vscode.TreeItemCollapsibleState.None, "lurek.test.rust.all", "testing-run-icon"),
          new SidebarItem("Run Lua Tests", vscode.TreeItemCollapsibleState.None, "lurek.test.lua.all", "test-view-icon"),
          new SidebarItem("Run Golden Tests", vscode.TreeItemCollapsibleState.None, "lurek.test.lua.golden", "file-media"),
          new SidebarItem("Test: Math", vscode.TreeItemCollapsibleState.None, "lurek.test.target.math", "symbol-numeric"),
          new SidebarItem("Test: Physics", vscode.TreeItemCollapsibleState.None, "lurek.test.target.physics", "settings-gear"),
          new SidebarItem("Test: Graphics", vscode.TreeItemCollapsibleState.None, "lurek.test.target.graphics", "symbol-color"),
          new SidebarItem("Test: Audio", vscode.TreeItemCollapsibleState.None, "lurek.test.target.audio", "unmute"),
          new SidebarItem("Test: Input", vscode.TreeItemCollapsibleState.None, "lurek.test.target.input", "keyboard"),
          new SidebarItem("Generate Tests for File", vscode.TreeItemCollapsibleState.None, "lurek.test.generateForFile", "wand"),
        ];
      case "Quality":
        return [
          new SidebarItem("Quality Gate (full pre-push)", vscode.TreeItemCollapsibleState.None, "lurek.quality.gate", "pass"),
          new SidebarItem("Clippy (strict)", vscode.TreeItemCollapsibleState.None, "lurek.quality.clippy", "search"),
          new SidebarItem("Format Apply", vscode.TreeItemCollapsibleState.None, "lurek.quality.fmtApply", "symbol-ruler"),
          new SidebarItem("Format Check", vscode.TreeItemCollapsibleState.None, "lurek.quality.fmtCheck", "symbol-ruler"),
        ];
      case "Docs":
        return [
          new SidebarItem("Full Pipeline", vscode.TreeItemCollapsibleState.None, "lurek.docs.fullPipeline", "book"),
          new SidebarItem("Lua Docs Browser", vscode.TreeItemCollapsibleState.None, "lurek.docs.luaBrowser", "globe"),
          new SidebarItem("Rust Docs (browser)", vscode.TreeItemCollapsibleState.None, "lurek.docs.rustBrowser", "browser"),
          new SidebarItem("Library API", vscode.TreeItemCollapsibleState.None, "lurek.docs.libraryApi", "library"),
          new SidebarItem("Validate Lua Stubs", vscode.TreeItemCollapsibleState.None, "lurek.docs.validateLuaStubs", "verified"),
        ];
      case "Audit":
        return [
          new SidebarItem("Quality Report", vscode.TreeItemCollapsibleState.None, "lurek.audit.qualityReport", "graph"),
          new SidebarItem("Test Coverage", vscode.TreeItemCollapsibleState.None, "lurek.audit.testCoverage", "graph-line"),
          new SidebarItem("Doc Coverage", vscode.TreeItemCollapsibleState.None, "lurek.audit.docCoverage", "book"),
          new SidebarItem("Example Coverage", vscode.TreeItemCollapsibleState.None, "lurek.audit.exampleCoverage", "file-code"),
          new SidebarItem("Lua API Test Coverage", vscode.TreeItemCollapsibleState.None, "lurek.audit.luaTestCoverage", "beaker"),
          new SidebarItem("Lua Spec Coverage", vscode.TreeItemCollapsibleState.None, "lurek.audit.luaSpecCoverage", "file-text"),
          new SidebarItem("CAG Link Check (strict)", vscode.TreeItemCollapsibleState.None, "lurek.audit.cagLinkCheck", "link"),
        ];
      case "Validate":
        return [
          new SidebarItem("Validate Lua API", vscode.TreeItemCollapsibleState.None, "lurek.validate.luaApi", "check-all"),
          new SidebarItem("Validate Library", vscode.TreeItemCollapsibleState.None, "lurek.validate.library", "library"),
          new SidebarItem("Validate Changelog", vscode.TreeItemCollapsibleState.None, "lurek.validate.changelog", "file-text"),
          new SidebarItem("Validate Module Coverage", vscode.TreeItemCollapsibleState.None, "lurek.validate.moduleCoverage", "graph"),
          new SidebarItem("Check Callbacks", vscode.TreeItemCollapsibleState.None, "lurek.validate.callbacks", "symbol-event"),
          new SidebarItem("Validate CAG Files", vscode.TreeItemCollapsibleState.None, "lurek.validate.cag", "hubot"),
        ];
      case "Debug":
        return [
          new SidebarItem("Debug Run + Connect", vscode.TreeItemCollapsibleState.None, "lurek.debug.runAndConnect", "debug-start"),
          new SidebarItem("Connect", vscode.TreeItemCollapsibleState.None, "lurek.debug.connect", "plug"),
          new SidebarItem("Disconnect", vscode.TreeItemCollapsibleState.None, "lurek.debug.disconnect", "debug-disconnect"),
          new SidebarItem("Evaluate Lua", vscode.TreeItemCollapsibleState.None, "lurek.debug.evaluate", "terminal"),
          new SidebarItem("Watchers Panel", vscode.TreeItemCollapsibleState.None, "lurek.debug.openWatchers", "eye"),
          new SidebarItem("Variable Inspector", vscode.TreeItemCollapsibleState.None, "lurek.debug.openInspector", "symbol-variable"),
          new SidebarItem("Call Stack", vscode.TreeItemCollapsibleState.None, "lurek.debug.openCallStack", "list-tree"),
          new SidebarItem("Performance", vscode.TreeItemCollapsibleState.None, "lurek.debug.performance", "dashboard"),
          new SidebarItem("Screenshot", vscode.TreeItemCollapsibleState.None, "lurek.debug.screenshot", "device-camera"),
          new SidebarItem("Status", vscode.TreeItemCollapsibleState.None, "lurek.debug.status", "info"),
        ];
      case "Reference":
        return [
          new SidebarItem("Browse API", vscode.TreeItemCollapsibleState.None, "lurek.browseApi", "search"),
          new SidebarItem("Open API Docs", vscode.TreeItemCollapsibleState.None, "lurek.openApiDocs", "book"),
          new SidebarItem("Open Wiki", vscode.TreeItemCollapsibleState.None, "lurek.openWiki", "globe"),
          new SidebarItem("Dependency Graph", vscode.TreeItemCollapsibleState.None, "lurek.depGraph", "graph"),
          new SidebarItem("Dependency List", vscode.TreeItemCollapsibleState.None, "lurek.depList", "list-tree"),
          new SidebarItem("API Coverage", vscode.TreeItemCollapsibleState.None, "lurek.apiCoverage", "graph-line"),
        ];
      case "Assets":
        return [
          new SidebarItem("Refresh Assets", vscode.TreeItemCollapsibleState.None, "lurek.assets.refresh", "refresh"),
          new SidebarItem("Open Asset Explorer", vscode.TreeItemCollapsibleState.None, "lurek.assets.openPanel", "file-media"),
          new SidebarItem("Find Missing Assets", vscode.TreeItemCollapsibleState.None, "lurek.assets.findMissing", "warning"),
        ];
      case "Dependencies":
        return [
          new SidebarItem("Find Circular Deps", vscode.TreeItemCollapsibleState.None, "lurek.deps.findCircular", "warning"),
          new SidebarItem("Show Orphan Modules", vscode.TreeItemCollapsibleState.None, "lurek.deps.findOrphans", "question"),
        ];
      case "Performance":
        return [
          new SidebarItem("Open Performance Dashboard", vscode.TreeItemCollapsibleState.None, "lurek.perf.openDashboard", "dashboard"),
          new SidebarItem("System Monitor", vscode.TreeItemCollapsibleState.None, "lurek.runtime.openMonitor", "pulse"),
          new SidebarItem("API Usage Report", vscode.TreeItemCollapsibleState.None, "lurek.api.usageReport", "graph"),
          new SidebarItem("Open Hot Reload History", vscode.TreeItemCollapsibleState.None, "lurek.perf.openHotReload", "history"),
          new SidebarItem("Clear History", vscode.TreeItemCollapsibleState.None, "lurek.perf.clearHistory", "clear-all"),
        ];
      default:
        return [];
    }
  }
}

// ─── Editors ───────────────────────────────────────────────

export class EditorsProvider
  implements vscode.TreeDataProvider<SidebarItem>
{
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<SidebarItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SidebarItem): SidebarItem {
    return element;
  }

  getChildren(element?: SidebarItem): SidebarItem[] {
    if (!element) {
      return buildEditorItems();
    }
    return [];
  }
}

// ─── AI & Copilot ────────────────────────────────────────────

export class AiToolsProvider
  implements vscode.TreeDataProvider<SidebarItem>
{
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<SidebarItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SidebarItem): SidebarItem {
    return element;
  }

  getChildren(element?: SidebarItem): SidebarItem[] {
    if (!element) {
      return [
        new SidebarItem(
          "CAG (AI Config)",
          vscode.TreeItemCollapsibleState.Expanded,
          undefined,
          "hubot"
        ),
        new SidebarItem(
          "MCP Server",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "server"
        ),
        new SidebarItem(
          "Game Jam",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "flame"
        ),
      ];
    }

    switch (element.label) {
      case "CAG (AI Config)":
        return [
          new SidebarItem("Install AI Config", vscode.TreeItemCollapsibleState.None, "lurek.cag.install", "cloud-download"),
          new SidebarItem("Select Agent", vscode.TreeItemCollapsibleState.None, "lurek.cag.selectAgent", "person"),
          new SidebarItem("Select Skill", vscode.TreeItemCollapsibleState.None, "lurek.cag.selectSkill", "mortar-board"),
          new SidebarItem("Select Prompt", vscode.TreeItemCollapsibleState.None, "lurek.cag.selectPrompt", "comment"),
          new SidebarItem("Update CAG Files", vscode.TreeItemCollapsibleState.None, "lurek.cag.update", "sync"),
        ];
      case "MCP Server":
        return [
          new SidebarItem("Install MCP Server", vscode.TreeItemCollapsibleState.None, "lurek.mcp.install", "cloud-download"),
          new SidebarItem("MCP Status", vscode.TreeItemCollapsibleState.None, "lurek.mcp.status", "info"),
        ];
      case "Game Jam":
        return [
          new SidebarItem("Game Jam Quick Start", vscode.TreeItemCollapsibleState.None, "lurek.gameJam.quickStart", "rocket"),
          new SidebarItem("Add Game Module", vscode.TreeItemCollapsibleState.None, "lurek.gameJam.addModule", "add"),
          new SidebarItem("Game Jam Timer", vscode.TreeItemCollapsibleState.None, "lurek.gameJam.timer", "watch"),
          new SidebarItem("Quick Build", vscode.TreeItemCollapsibleState.None, "lurek.jam.quickBuild", "zap"),
          new SidebarItem("Submission Checklist", vscode.TreeItemCollapsibleState.None, "lurek.jam.checklist", "checklist"),
        ];
      default:
        return [];
    }
  }
}
