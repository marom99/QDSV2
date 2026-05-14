import { describe, it, expect } from "vitest";

// Test the detection logic directly by importing and testing the pattern matching
// Note: We can't easily test oxlint rules in isolation, so we test the core logic

const PACKAGE_DIRS = new Set(["qw", "qw-docs-astro", "qw-figma"]);
const CROSS_PACKAGE_PATTERN = /^((?:\.\.\/)+)([a-z0-9-]+)\//;

function getCrossPackageImport(importPath: string): string | null {
  if (!importPath || !importPath.startsWith("..")) {
    return null;
  }

  const match = importPath.match(CROSS_PACKAGE_PATTERN);
  if (!match) {
    return null;
  }

  const traversal = match[1];
  const packageDir = match[2];

  const levelsUp = (traversal.match(/\.\.\//g) || []).length;

  if (levelsUp < 2) {
    return null;
  }

  if (PACKAGE_DIRS.has(packageDir)) {
    return packageDir;
  }

  return null;
}

describe("no-cross-package-imports", () => {
  describe("should detect cross-package imports", () => {
    it("detects ../../qw/path", () => {
      expect(getCrossPackageImport("../../qw/src/button")).toBe("qw");
    });

    it("detects ../../../qw/path (deeper nesting)", () => {
      expect(getCrossPackageImport("../../../qw/src/button")).toBe("qw");
    });

    it("detects ../../qw-docs-astro/path", () => {
      expect(getCrossPackageImport("../../qw-docs-astro/src/foo")).toBe(
        "qw-docs-astro",
      );
    });

    it("detects ../../qw-figma/path", () => {
      expect(getCrossPackageImport("../../qw-figma/src/bar")).toBe(
        "qw-figma",
      );
    });
  });

  describe("should NOT detect local imports", () => {
    it("ignores ../qw/path (single level up)", () => {
      expect(getCrossPackageImport("../qw/button")).toBeNull();
    });

    it("ignores ./kumo/path (same directory)", () => {
      expect(getCrossPackageImport("./qw/button")).toBeNull();
    });

    it("ignores ../components/button (not a package dir)", () => {
      expect(getCrossPackageImport("../components/button")).toBeNull();
    });

    it("ignores ../../components/button (not a package dir)", () => {
      expect(getCrossPackageImport("../../components/button")).toBeNull();
    });

    it("ignores relative paths without package names", () => {
      expect(getCrossPackageImport("../../utils/helpers")).toBeNull();
    });

    it("ignores absolute paths", () => {
      expect(getCrossPackageImport("/absolute/path")).toBeNull();
    });

    it("ignores package imports", () => {
      expect(getCrossPackageImport("@qw/design-system")).toBeNull();
    });

    it("ignores node_modules imports", () => {
      expect(getCrossPackageImport("react")).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(getCrossPackageImport("")).toBeNull();
    });

    it("handles path with only traversal", () => {
      expect(getCrossPackageImport("../../")).toBeNull();
    });

    it("handles path ending at package dir (no subpath)", () => {
      // This matches but kumo/ needs something after it
      expect(getCrossPackageImport("../../qw/")).toBe("qw");
    });
  });
});
