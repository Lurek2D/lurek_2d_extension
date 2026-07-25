# VS Code Contract

## Mission & Scope
- Own the VS Code extension: commands, sidebars, providers, editors, and webviews.
- Keep manifest wiring, generated data, and webview messaging consistent.

## Files
- `src/commands/`, `src/providers/`: Commands, language tools, sidebars, and trees.
- `src/editors/`, `src/panels/`, `src/tilemap/`: Webviews and custom editors.
- `src/services/`, `src/mcp/`: Engine, RAG, debug, and MCP connections.
- `data/`, `src/generated/`: Generated API and snippet data.

## Rules
- Declare every user-facing action, setting, activation hook, and menu in `package.json`.
- Enforce strict CSP on every webview.
- Do not handwrite JSON schemas; use data from `tools/docs/gen_extension_api.py`.
- Move heavy work to the engine or background scripts.

## Workflow
- Run `npm run build` after TypeScript, webview, or manifest edits.
- Test UI and commands in the Extension Development Host when behavior changes.
- Package with `npx @vscode/vsce package --no-dependencies --allow-missing-repository` only for VSIX/release work.
