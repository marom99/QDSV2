import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve once — points at the sibling kumo package root
const kumoRoot = resolve(__dirname, "../../../qw");
const kumoSrc = resolve(kumoRoot, "src");

/**
 * Map every `@qw/design-system` sub-path export to its source equivalent.
 *
 * In dev mode Vite will resolve these to the raw .ts/.tsx source files,
 * which means file-watcher-based HMR works instantly — no rebuild of
 * the kumo package required.
 *
 * In production builds (astro build) this plugin is NOT loaded, so the
 * normal package.json `exports` field is used (dist/), which validates
 * the real consumer experience.
 */
const aliases: Record<string, string> = {
  // Main barrel — resolves to source index.ts
  "@qw/design-system": resolve(kumoSrc, "index.ts"),

  // CSS styles — resolve to source CSS
  "@qw/design-system/styles/tailwind": resolve(kumoSrc, "styles/kumo.css"),
  "@qw/design-system/styles/standalone": resolve(
    kumoSrc,
    "styles/kumo-standalone.css",
  ),
  "@qw/design-system/styles": resolve(kumoSrc, "styles/kumo.css"),

  // JSON registry — these live outside src/ and are NOT built, so same
  // path works in dev and prod.  We alias anyway so Vite can resolve
  // the workspace:* link correctly and watch the file.
  "@qw/design-system/ai/component-registry.json": resolve(
    kumoRoot,
    "ai/component-registry.json",
  ),

  // Theme generator — resolve to source TS so the docs color page
  // always reflects the latest config without a kumo build step.
  "@qw/design-system/scripts/theme-generator/config": resolve(
    kumoRoot,
    "scripts/theme-generator/config.ts",
  ),
  "@qw/design-system/scripts/theme-generator/types": resolve(
    kumoRoot,
    "scripts/theme-generator/types.ts",
  ),
};

/**
 * Vite plugin that rewires `@qw/design-system` imports to the raw source
 * files of the sibling package during `astro dev`.
 *
 * **Why not just use `resolve.alias`?**
 * `resolve.alias` is a simple prefix match — it can't distinguish
 * `@qw/design-system` from `@qw/design-system-figma` without a trailing
 * slash, and it can't handle the overlapping sub-path exports cleanly.
 * A plugin gives us exact-match control.
 */
export function kumoHmrPlugin() {
  return {
    name: "vite-plugin-kumo-hmr",
    enforce: "pre" as const,

    resolveId(source: string) {
      // Exact match first (most imports)
      if (aliases[source]) {
        return aliases[source];
      }

      // Sub-path component imports: @qw/design-system/components/button
      // → packages/qw/src/components/button/index.ts
      if (source.startsWith("@qw/design-system/components/")) {
        const componentName = source.replace(
          "@qw/design-system/components/",
          "",
        );
        return resolve(kumoSrc, `components/${componentName}/index.ts`);
      }

      // Primitives: @qw/design-system/primitives/dialog
      // → packages/qw/src/primitives/dialog.ts
      if (source.startsWith("@qw/design-system/primitives/")) {
        const primitiveName = source.replace(
          "@qw/design-system/primitives/",
          "",
        );
        return resolve(kumoSrc, `primitives/${primitiveName}.ts`);
      }
      if (source === "@qw/design-system/primitives") {
        return resolve(kumoSrc, "primitives/index.ts");
      }

      // Utils barrel
      if (source === "@qw/design-system/utils") {
        return resolve(kumoSrc, "utils/index.ts");
      }

      // Catalog barrel
      if (source === "@qw/design-system/catalog") {
        return resolve(kumoSrc, "catalog/index.ts");
      }

      // Registry barrel
      if (source === "@qw/design-system/registry") {
        return resolve(kumoSrc, "registry/index.ts");
      }

      // Catch-all for any other @qw/design-system/styles/* CSS imports
      if (source.startsWith("@qw/design-system/styles/")) {
        const styleName = source.replace("@qw/design-system/styles/", "");
        return resolve(kumoSrc, `styles/${styleName}.css`);
      }

      return undefined;
    },

    configResolved(config: { server: { fs: { allow: string[] } } }) {
      // Append kumo source to the existing allow list rather than replacing it.
      // Using config() would shallow-merge and override Astro/Vite defaults.
      if (config.server?.fs?.allow) {
        config.server.fs.allow.push(kumoRoot);
      }
    },
  };
}
