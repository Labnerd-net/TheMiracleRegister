import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  ContentDirError,
  DEFAULT_CONTENT_DIR,
  crossFileErrors,
  loadContent,
  resolveContentDir,
  type ContentDir,
} from "../scripts/content-load";
import { saintFileSchema } from "../scripts/content-schema";
import { minimalMiracle, minimalSaint } from "./helpers/content";

const dirs: string[] = [];
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), "content-"));
  dirs.push(d);
  return d;
};
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

const asDir = (path: string): ContentDir => ({ path, source: "--content-dir flag" });
const writeJson = (root: string, rel: string, v: unknown) => {
  mkdirSync(join(root, rel, ".."), { recursive: true });
  writeFileSync(join(root, rel), JSON.stringify(v, null, 2));
};

describe("resolveContentDir", () => {
  it("prefers the flag, then the env var, then the default", () => {
    expect(resolveContentDir({ flag: "/a", env: "/b", repoRoot: "/r" })).toEqual({ path: "/a", source: "--content-dir flag" });
    expect(resolveContentDir({ env: "/b", repoRoot: "/r" })).toEqual({ path: "/b", source: "CONTENT_DIR env var" });
    expect(resolveContentDir({ repoRoot: "/r/x" })).toEqual({ path: resolve("/r/x", DEFAULT_CONTENT_DIR), source: "default" });
  });
});

describe("loadContent hard failures", () => {
  const expectDirError = (dir: ContentDir) => {
    try {
      loadContent(dir);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ContentDirError);
      const msg = (e as Error).message;
      expect(msg).toContain(dir.path);
      expect(msg).toContain(dir.source);
      expect(msg).toContain("--content-dir flag, CONTENT_DIR env var");
      expect(msg).toContain("git clone https://github.com/Labnerd-net/catholic-research");
    }
  };

  it("fails when the directory is missing", () => expectDirError(asDir(join(tmp(), "nope"))));
  it("fails without the .content-root marker", () => {
    const root = tmp();
    writeJson(root, "saints/a.json", minimalSaint("a"));
    expectDirError(asDir(root));
  });
  it("fails when there are no entity files", () => {
    const root = tmp();
    writeFileSync(join(root, ".content-root"), "");
    expectDirError(asDir(root));
  });
});

describe("loadContent", () => {
  const fixture = () => {
    const root = tmp();
    writeFileSync(join(root, ".content-root"), "");
    return root;
  };

  it("loads valid saint and miracle files", () => {
    const root = fixture();
    writeJson(root, "saints/a.json", minimalSaint("a"));
    writeJson(root, "miracles/m.json", minimalMiracle("m", { saints: ["a"] }));
    const c = loadContent(asDir(root));
    expect(c.errors).toEqual([]);
    expect([c.saints.length, c.miracles.length]).toEqual([1, 1]);
  });

  it("tolerates CRLF line endings and a BOM", () => {
    const root = fixture();
    mkdirSync(join(root, "saints"));
    writeFileSync(join(root, "saints/a.json"), `\uFEFF${JSON.stringify(minimalSaint("a"), null, 2).replace(/\n/g, "\r\n")}\r\n`);
    expect(loadContent(asDir(root)).errors).toEqual([]);
  });

  it("collects every problem: bad JSON, bad schema, file name mismatch", () => {
    const root = fixture();
    mkdirSync(join(root, "saints"));
    writeFileSync(join(root, "saints/broken.json"), "{ nope");
    writeJson(root, "saints/wrong-name.json", minimalSaint("other"));
    writeJson(root, "saints/extra.json", { ...minimalSaint("extra"), published: true });
    const errors = loadContent(asDir(root)).errors.join("\n");
    expect(errors).toContain("broken.json: invalid JSON");
    expect(errors).toContain('file name must equal slug "other"');
    expect(errors).toContain("extra.json");
  });
});

describe("crossFileErrors", () => {
  const saint = (slug: string, extra = {}) => saintFileSchema.parse(minimalSaint(slug, extra));

  it("flags duplicate slugs", () => {
    expect(crossFileErrors([saint("a"), saint("a")], []).join()).toContain("duplicate slug");
  });
  it("flags an unmirrored relation", () => {
    const errors = crossFileErrors([saint("a", { relations: [{ saint: "b", type: "family" }] }), saint("b")], []);
    expect(errors.join()).toContain("not mirrored");
  });
  it("accepts a mirrored relation", () => {
    const rel = (s: string) => ({ relations: [{ saint: s, type: "family" }] });
    expect(crossFileErrors([saint("a", rel("b")), saint("b", rel("a"))], [])).toEqual([]);
  });
  it("flags bad previous_slugs", () => {
    expect(crossFileErrors([saint("a", { previous_slugs: ["a"] })], []).join()).toContain("its own slug");
    expect(crossFileErrors([saint("a", { previous_slugs: ["b"] }), saint("b")], []).join()).toContain("current slug");
    expect(crossFileErrors([saint("a", { previous_slugs: ["x"] }), saint("b", { previous_slugs: ["x"] })], []).join()).toContain("also claimed");
  });
});
