import * as esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const unitTestEntryPoints = globSync("src/test/unit/*.test.ts", {
  cwd: rootDir,
  absolute: true,
  windowsPathsNoEscape: true,
});

/** @type {esbuild.BuildOptions} */
const buildOptions = {
  absWorkingDir: rootDir,
  entryPoints: [path.join(rootDir, "src", "extension.ts")],
  bundle: true,
  outfile: path.join(rootDir, "dist", "extension.js"),
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  target: "node20",
  sourcemap: !production,
  minify: production,
  treeShaking: true,
  logLevel: "info",
};

/** @type {esbuild.BuildOptions} */
const testOptions = {
  entryPoints: [
    path.join(rootDir, "src", "test", "runTest.ts"),
    path.join(rootDir, "src", "test", "suite", "index.ts"),
    ...unitTestEntryPoints,
  ],
  bundle: true,
  absWorkingDir: rootDir,
  outdir: path.join(rootDir, "dist", "test"),
  external: ["vscode", "mocha", "@vscode/test-electron"],
  format: "cjs",
  platform: "node",
  target: "node20",
  sourcemap: true,
  logLevel: "info",
};

async function main() {
  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log("[esbuild] Watching for changes...");
  } else {
    await esbuild.build(buildOptions);
    if (process.argv.includes("--test")) {
      await esbuild.build(testOptions);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
