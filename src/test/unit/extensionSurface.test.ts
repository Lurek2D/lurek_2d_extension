import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  AiToolsProvider,
  DevToolsProvider,
  ProjectToolsProvider,
  SidebarItem,
} from "../../providers/sidebar";

const EXTENSION_ID = "lurek2d.lurek2d-toolkit";

type ExtensionManifest = {
  activationEvents?: string[];
  contributes?: {
    commands?: Array<{ command: string; title?: string; category?: string }>;
    configuration?: { properties?: Record<string, unknown> };
    debuggers?: Array<Record<string, unknown>>;
    keybindings?: Array<{ command: string }>;
    menus?: Record<string, Array<{ command: string }>>;
    snippets?: Array<{ language: string; path: string }>;
    views?: Record<string, Array<{ id: string; name: string }>>;
    viewsContainers?: Record<string, Array<{ id: string; title: string }>>;
  };
  name?: string;
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
    const manifest = JSON.parse(fs.readFileSync(packagePath, "utf-8")) as ExtensionManifest;
    if (manifest.name === "lurek2d-toolkit") return candidate;
  }

  throw new Error(`Unable to locate extension/vscode from ${process.cwd()}.`);
}

function readManifest(): ExtensionManifest {
  const packagePath = path.join(findExtensionRoot(), "package.json");
  return JSON.parse(fs.readFileSync(packagePath, "utf-8")) as ExtensionManifest;
}

async function activateExtension(): Promise<vscode.Extension<unknown>> {
  const extension = vscode.extensions.getExtension(EXTENSION_ID);
  assert.ok(extension, `Expected extension ${EXTENSION_ID} to be available in the test host.`);

  if (!extension.isActive) {
    await extension.activate();
  }

  return extension;
}

function contributedCommands(manifest: ExtensionManifest): Set<string> {
  return new Set((manifest.contributes?.commands ?? []).map((entry) => entry.command));
}

function nonEditorContributedCommands(manifest: ExtensionManifest): string[] {
  return (manifest.contributes?.commands ?? [])
    .map((entry) => entry.command)
    .filter((command) => !command.startsWith("lurek.editor."))
    .sort();
}

function collectSidebarCommands(provider: { getChildren(element?: SidebarItem): SidebarItem[] }): string[] {
  const seen = new Set<string>();
  const pending = [...provider.getChildren()];

  while (pending.length > 0) {
    const item = pending.shift()!;
    const commandId = item.command?.command;
    if (commandId && !commandId.startsWith("lurek.editor.")) {
      seen.add(commandId);
    }
    pending.push(...provider.getChildren(item));
  }

  return [...seen].sort();
}

suite("Extension non-editor surface", () => {
  test("all non-editor manifest commands are registered after activation", async () => {
    const manifest = readManifest();
    await activateExtension();
    const registered = new Set(await vscode.commands.getCommands(true));
    const missing = nonEditorContributedCommands(manifest).filter((command) => !registered.has(command));

    assert.deepStrictEqual(missing, []);
  });

  test("keybindings and menu contributions reference declared commands", () => {
    const manifest = readManifest();
    const declared = contributedCommands(manifest);
    const missing: string[] = [];

    for (const binding of manifest.contributes?.keybindings ?? []) {
      if (!declared.has(binding.command)) missing.push(`keybinding:${binding.command}`);
    }

    for (const [menuId, entries] of Object.entries(manifest.contributes?.menus ?? {})) {
      for (const entry of entries) {
        if (!declared.has(entry.command)) missing.push(`${menuId}:${entry.command}`);
      }
    }

    assert.deepStrictEqual(missing, []);
  });

  test("non-editor sidebar commands are declared and registered", async () => {
    const manifest = readManifest();
    const declared = contributedCommands(manifest);
    await activateExtension();
    const registered = new Set(await vscode.commands.getCommands(true));
    const sidebarCommands = new Set([
      ...collectSidebarCommands(new ProjectToolsProvider()),
      ...collectSidebarCommands(new DevToolsProvider()),
      ...collectSidebarCommands(new AiToolsProvider()),
    ]);

    assert.ok(sidebarCommands.size > 40, "Expected broad non-editor sidebar command coverage.");

    const undeclared = [...sidebarCommands].filter((command) => !declared.has(command));
    const unregistered = [...sidebarCommands].filter((command) => !registered.has(command));

    assert.deepStrictEqual(undeclared, []);
    assert.deepStrictEqual(unregistered, []);
  });

  test("activation, views, settings, debugger, and snippets are wired", () => {
    const manifest = readManifest();
    const extensionRoot = findExtensionRoot();

    assert.deepStrictEqual(manifest.activationEvents, [
      "workspaceContains:**/main.lua",
      "workspaceContains:Cargo.toml",
    ]);

    assert.ok(
      manifest.contributes?.viewsContainers?.activitybar?.some((entry) => entry.id === "lurek-sidebar"),
      "Expected Lurek2D activity bar container.",
    );
    assert.deepStrictEqual(
      (manifest.contributes?.views?.["lurek-sidebar"] ?? []).map((entry) => entry.id).sort(),
      [
        "lurek.aiCopilot",
        "lurek.assetExplorer",
        "lurek.devTools",
        "lurek.editors",
        "lurek.projectTools",
      ],
    );

    const settings = Object.keys(manifest.contributes?.configuration?.properties ?? {});
    assert.ok(settings.includes("lurek.lurekPath"));
    assert.ok(settings.includes("lurek.debugBridge.port"));
    assert.ok(settings.includes("lurek.luaVersion"));
    assert.ok(settings.includes("lurek.intellisense.typeInference"));

    const debuggerTypes = (manifest.contributes?.debuggers ?? []).map((entry) => entry.type);
    assert.deepStrictEqual(debuggerTypes, ["lurek"]);

    const snippets = manifest.contributes?.snippets ?? [];
    assert.strictEqual(snippets.length, 1);
    assert.strictEqual(snippets[0].language, "lua");
    assert.ok(fs.existsSync(path.join(extensionRoot, snippets[0].path)));

    const snippetData = JSON.parse(fs.readFileSync(path.join(extensionRoot, snippets[0].path), "utf-8")) as Record<string, unknown>;
    assert.ok(Object.keys(snippetData).length > 0, "Expected generated Lua snippets.");
  });
});
