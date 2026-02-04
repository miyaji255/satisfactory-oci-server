import { $ } from "bun";
import { rm } from "node:fs/promises";

console.log("Building satisfactory-service...");

await rm(`${import.meta.dirname}/dist`, { recursive: true, force: true });

await Bun.build({
  entrypoints: [`${import.meta.dirname}/src/index.ts`],
  tsconfig: `${import.meta.dirname}/tsconfig.json`,
  format: "cjs",
  compile: {
    outfile: `${import.meta.dirname}/dist/satisfactory-service`,
    autoloadBunfig: false,
    autoloadPackageJson: false,
    autoloadTsconfig: false,
  },
  bytecode: true,
  minify: true,
  target: "bun",
  sourcemap: "inline"
});

console.log("Build completed.");

// Only run docker build if not in CI
if (!process.env.CI) {
  await $`docker buildx build .`.cwd(import.meta.dirname);
}
