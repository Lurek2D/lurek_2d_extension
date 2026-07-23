# vscode-extension

## TL;DR

- The VS Code extension ("Lurek2D Toolkit") is the official developer-experience layer for the Lurek2D engine, providing language intelligence, visual editors, build/debug tooling, and AI-powered game-dev agents â€” all optional and external to the engine binary.

## General Info

- Module group: `Edge/Integration`
- Source path: `extension/vscode/`
- Lua API path(s): None direct (consumes generated `data/lurek-api.json` and `docs/api/lurek.lua`)
- Primary Lua namespace: None (tooling layer; not part of the runtime)
- Test path(s): `extension/vscode/src/test/unit/`, `extension/vscode/src/test/suite/`
- Package manifest: `extension/vscode/package.json`
- Build output: `extension/vscode/dist/extension.js` (esbuild), `extension/vscode/lurek2d-toolkit-<version>.vsix`

## Summary

The Lurek2D Toolkit is a VS Code extension that complements the sumneko.lua language server with Lurek-specific intelligence and tooling. It activates when it detects a `main.lua` or `Cargo.toml` in the workspace and provides:

- **Language providers** that add Lurek-aware diagnostics, definition jumping, inlay hints, code actions, semantic token highlighting, asset path resolution, type inference for factory objects, CodeLens markers, and LuaJIT-specific hints â€” layered on top of (not duplicating) sumneko.lua.
- **41 visual editor panels** implemented as webview panels with CSP: tilemap, particle, dialog, pixel art, scene flow, entity, AI behavior tree, animation state machine, audio mixer, colour palette, shader preview, font preview, and many more.
- **140+ commands** spanning run/stop, scaffold, test, package, debug, refactor, reference, CAG agent management, and editor launching.
- **9 shared services** (ApiData, ApiDocs, DebugBridge, LuaParser, LurekProcess, ParallelCargo, RAG, StatusBar, SymbolIndex) that back the commands and providers.
- **Debug adapter (DAP)** for Lua step-debugging with breakpoints, call-stack inspection, variable inspection, and expression evaluation.
- **MCP server** exposing tools for AI agents: query API, run tests, list examples, run example.
- **12 game-dev CAG agents, 26 skills, 15 prompts** bundled under `extension/vscode/cag/game-dev/` for AI-assisted game development workflows.

The extension is an opt-in developer layer (constraint A-01) â€” the engine binary has no dependency on it.

## Files

### Root

- `package.json`: Extension manifest â€” commands, activation events, views, configuration, debug adapter contribution.
- `tsconfig.json`: TypeScript configuration.
- `esbuild.config.mjs`: Bundle configuration producing `dist/extension.js`.
- `language-configuration.json`: Lua bracket, comment, and folding markers.

### `src/`

- `extension.ts`: Activation entry-point. Instantiates services, registers providers and commands, starts MCP server.

### `src/services/`

| File               | Purpose                                                                     |
| ------------------ | --------------------------------------------------------------------------- |
| `apiData.ts`       | Loads and caches `data/lurek-api.json` for provider consumption.            |
| `apiDocs.ts`       | Provides rich API documentation lookups.                                    |
| `debugBridge.ts`   | TCP client to the engine's JSON debug bridge (`127.0.0.1`).                 |
| `luaParser.ts`     | Lightweight Lua parser for structural analysis (AST, requires, scopes).     |
| `lurekProcess.ts`  | Manages the engine child process lifecycle (run/stop/status).               |
| `parallelCargo.ts` | Wraps `tools/dev/parallel_cargo.py` for build/check/clippy/test/doc tasks.  |
| `rag.ts`           | RAG (Retrieval Augmented Generation) service for AI agent context.          |
| `statusBar.ts`     | Status bar item showing engine run state.                                   |
| `symbolIndex.ts`   | Workspace-wide Lua symbol index for cross-file navigation.                  |

### `src/providers/`

26 language provider modules registered against the `lua` language selector:

| Provider            | VS Code capability                                       |
| ------------------- | -------------------------------------------------------- |
| `completion.ts`     | (Deferred to sumneko.lua â€” not registered)               |
| `hover.ts`          | (Deferred to sumneko.lua â€” not registered)               |
| `definition.ts`     | Go-to-definition for `lurek.*` symbols                   |
| `references.ts`     | (Deferred to sumneko.lua)                                |
| `rename.ts`         | (Deferred to sumneko.lua)                                |
| `diagnostics.ts`    | 13 Lurek-specific diagnostic rules                       |
| `color.ts`          | Colour swatches for `lurek.color.*` calls                |
| `assetPath.ts`      | Path completion and validation for asset references      |
| `inlayHints.ts`     | Parameter name hints for `lurek.*` calls                 |
| `codeActions.ts`    | Quick-fixes for diagnostics                              |
| `semanticTokens.ts` | Lurek-specific token types (callbacks, namespaces)       |
| `codeLens.ts`       | Callback/test/library/demo markers above functions       |
| `typeInference.ts`  | Infers types for lurek factory return values             |
| `luajitHints.ts`    | LuaJIT-specific performance and compatibility hints      |
| `luacatsProvider.ts`| (Deferred to sumneko.lua)                                |
| `requireGraph.ts`   | Visual require-dependency graph                          |
| `folding.ts`        | (Deferred to sumneko.lua)                                |
| `formatting.ts`     | (Deferred to sumneko.lua/stylua)                         |
| `signature.ts`      | (File present; registration delegated to sumneko.lua)    |
| `symbols.ts`        | (File present; registration delegated to sumneko.lua)    |
| `debugWatchers.ts`  | Live expression watch panel during debug sessions        |
| `perfDashboard.ts`  | Performance profiler webview                             |
| `systemMonitor.ts`  | Engine runtime stats panel                               |
| `apiUsage.ts`       | API usage report and quick-insert picker                 |
| `assetExplorer.ts`  | TreeDataProvider for sidebar asset browser               |
| `sidebar.ts`        | Sidebar tree-view providers (Project, Dev Tools, Editors, AI) |

### `src/editors/`

41 webview-based visual editor panels plus shared infrastructure:

- `editorFactory.ts`: Factory for creating editor panels with shared CSP and messaging.
- `panelHost.ts`: Panel lifecycle manager (retain, dispose, restore).
- `catalog.ts`: Editor metadata catalog for sidebar and command palette.
- `types.ts`: Shared TypeScript types for editor data.
- `implementations.ts`: Unified registration of all editor panels.
- `content/`: Static HTML/CSS/JS assets for editor webviews.
- 41 individual editor files (e.g. `tileMapEditor.ts`, `particleEditor.ts`, `dialogEditor.ts`, `pixelArtEditor.ts`, etc.).

### `src/commands/`

12 command modules grouping the 140+ contributed commands:

| File               | Domain                                         |
| ------------------ | ---------------------------------------------- |
| `run.ts`           | Run/stop game, run example, run with args      |
| `scaffold.ts`      | Project and file scaffolding                   |
| `test.ts`          | Rust/Lua test runners                          |
| `testGenerator.ts` | AI-assisted test generation                    |
| `packaging.ts`     | ZIP, Windows, Linux packaging                  |
| `editors.ts`       | Open visual editor panels                      |
| `reference.ts`     | API browser, wiki, dep graph                   |
| `cag.ts`           | Install/select CAG agents, skills, prompts     |
| `gameDevCag.ts`    | Game-dev CAG workflow commands                 |
| `gameJam.ts`       | Game jam kickstart wizard                      |
| `library.ts`       | Library module management commands             |
| `debugBridge.ts`   | Debug bridge connect/disconnect/evaluate       |

### `src/debug/`

- `luaDebugAdapter.ts`: DAP registration and factory.
- `luaDebugSession.ts`: Debug session implementation (breakpoints, stepping, evaluation).

### `src/mcp/`

- `server.ts`: MCP server startup and lifecycle.
- `tools.ts`: Tool definitions (query API, run tests, list examples, run example).

### `data/`

Generated data files consumed by providers at runtime:

- `lurek-api.json`: Full API catalog (modules, functions, classes, methods, params, returns).
- `lurek.luacats`: LuaCATS annotations for sumneko.lua.
- `snippets.json`: VS Code snippet definitions generated from `content/snippets/`.

### `cag/game-dev/`

Bundled CAG layer for AI-assisted game development:

- `agents/` â€” 12 game-dev agents (animator, audio-designer, game-architect, game-tester, gameplay-designer, level-designer, lua-scripter, narrative-writer, optimizer, ui-designer, visual-artist, plus README).
- `skills/` â€” 26 domain skills (animation-state-machine, audio-manager, camera-system, combat-system, crafting-system, dialogue-system, etc.).
- `prompts/` â€” 15 task prompts (add-animation, add-audio, add-enemy, new-game, game-jam-kickstart, optimize-performance, etc.).

## Architecture

### Activation

The extension activates lazily on:
- `workspaceContains:**/main.lua`
- `workspaceContains:Cargo.toml`

### Lifecycle

1. `activate()` instantiates services (`LurekProcessService`, `StatusBarService`, `ApiDataService`, `DebugBridge`).
2. `ApiDataService.load()` asynchronously reads `data/lurek-api.json`; providers operate with partial data until loading completes.
3. Language providers and commands are registered synchronously.
4. MCP server is started as a side process.
5. On deactivation, child processes (engine, MCP) are killed.

### Design Principles

- **Complement, not compete**: sumneko.lua owns general Lua intelligence (completion, hover, formatting, folding, rename, symbols). This extension registers only Lurek-specific providers.
- **CSP-secured webviews**: All editor panels use `Content-Security-Policy` headers restricting scripts and styles to inline or extension-local sources.
- **Deferred render**: Visual editors use `postMessage` for VS Code â†” webview communication; no direct DOM access from the extension host.
- **No engine dependency**: The extension never imports engine Rust code. It consumes generated JSON data and communicates with a running engine only via the TCP debug bridge.

## Dependencies

| Dependency             | Role                                                        |
| ---------------------- | ----------------------------------------------------------- |
| VS Code `^1.90.0`     | Host API                                                    |
| `data/lurek-api.json`  | Generated by `tools/gen_all_docs.py`; API metadata          |
| `docs/api/lurek.lua`   | Generated LuaCATS stubs for sumneko.lua                     |
| `data/snippets.json`   | Generated by `tools/snippets/gen_vscode_snippets.py`        |
| Engine binary          | Required at runtime for run/debug commands (not at build)   |
| sumneko.lua extension  | Provides base Lua language intelligence                     |
| Node.js + esbuild      | Build toolchain                                             |

## Configuration

The extension contributes settings under `lurek2d.*` (defined in `package.json` `contributes.configuration`):

- Engine binary path
- Debug bridge port
- Diagnostic rule toggles
- Editor panel preferences

## Invariants

1. **A-01 compliance**: The engine binary never imports or links against extension code. Communication is via generated files (offline) and TCP debug bridge (online).
2. **Activation guards**: The extension does nothing unless a Lurek2D project marker (`main.lua` or `Cargo.toml`) is present.
3. **No provider conflicts**: Capabilities already provided by sumneko.lua (completion, hover, formatting, folding, rename, outline) are explicitly not registered to avoid duplicate results.
4. **CSP enforcement**: Every `createWebviewPanel` call includes a `Content-Security-Policy` meta tag. No remote script loading.
5. **Generated data freshness**: `data/lurek-api.json` and `data/snippets.json` must be regenerated when `src/lua_api/` or `content/snippets/` change; providers may show stale data otherwise.

## Testing

### Existing tests (`extension/vscode/src/test/unit/`)

- `commandRegistration.test.ts` â€” verifies all contributed commands are registered.
- `editorCatalog.test.ts` â€” verifies editor catalog integrity.
- `luaParser.test.ts` â€” parser correctness.
- `typeInference.test.ts` â€” factory type inference rules.

### Coverage gaps

- No integration tests exercising provider responses against real `.lua` files.
- No webview rendering tests (CSP validation, message passing).
- No MCP server tool invocation tests.
- Debug adapter session tests are absent.

## Notes

- Build the extension with: `cd extension/vscode && npm install && npm run package` â†’ produces `.vsix`.
- The extension does not ship inside the engine binary; it is distributed as a separate `.vsix` artifact alongside the portable ZIP and installer.
- The game-dev CAG agents in `cag/game-dev/` are installed into the user's workspace via the `lurek.cag.install` command.
- `tools/gen_all_docs.py` must be run after any `src/lua_api/` change to keep `data/lurek-api.json` fresh.

## References

- [extension/vscode/README.md](../README.md)
- [extension/vscode/package.json](../package.json)
- [docs/architecture/philosophy.md](../../../docs/architecture/philosophy.md) â€” constraint A-01 (no embedded editor)
- [docs/specs/debugbridge.md](../../../docs/specs/debugbridge.md) â€” engine-side TCP bridge spec
- [tools/snippets/gen_vscode_snippets.py](../../../tools/snippets/gen_vscode_snippets.py) â€” snippet generator
- [tools/gen_all_docs.py](../../../tools/gen_all_docs.py) â€” API data generator

