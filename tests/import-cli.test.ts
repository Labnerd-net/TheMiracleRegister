import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { minimalMiracle, minimalSaint } from "./helpers/content";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), "cli-"));
  dirs.push(d);
  return d;
};

// Runs from an empty working directory with no DATABASE_URL, so dotenv finds no .env and any
// attempt to reach a database would show up as a different error.
const cli = (args: string[], env: Record<string, string> = {}) =>
  spawnSync(resolve("node_modules/.bin/tsx"), [resolve("scripts/import-content.ts"), ...args], {
    cwd: tmp(),
    encoding: "utf8",
    env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "", ...env },
    timeout: 60_000,
  });

// Each case starts a tsx process, which is slow when the whole suite runs in parallel.
describe("import-content CLI", { timeout: 30_000 }, () => {
  it("exits non-zero on a missing content directory before looking at the database", () => {
    const r = cli(["--content-dir", join(tmp(), "nope")]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("does not exist");
    expect(r.stderr).toContain("git clone https://github.com/Labnerd-net/catholic-research");
    expect(r.stderr).not.toContain("DATABASE_URL");
  });

  it("reads CONTENT_DIR and names it as the source", () => {
    const r = cli([], { CONTENT_DIR: join(tmp(), "stale") });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("CONTENT_DIR env var");
  });

  it("validates content first, then requires DATABASE_URL", () => {
    const root = tmp();
    writeFileSync(join(root, ".content-root"), "");
    mkdirSync(join(root, "saints"));
    writeFileSync(join(root, "saints/a.json"), JSON.stringify(minimalSaint("a")));
    const r = cli(["--content-dir", root]);
    expect(r.status).toBe(2);
    expect(r.stdout).toContain("Files: 1 saints, 0 miracles");
    expect(r.stderr).toContain("DATABASE_URL is not set");
  });

  it("reports validation errors with exit 1", () => {
    const root = tmp();
    writeFileSync(join(root, ".content-root"), "");
    mkdirSync(join(root, "saints"));
    writeFileSync(join(root, "saints/a.json"), JSON.stringify({ ...minimalSaint("a"), published: true }));
    const r = cli(["--content-dir", root]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("saints/a.json");
  });
});

const validate = (args: string[]) =>
  spawnSync(resolve("node_modules/.bin/tsx"), [resolve("scripts/validate-content.ts"), ...args], {
    cwd: tmp(),
    encoding: "utf8",
    env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "" },
    timeout: 60_000,
  });

describe("validate-content CLI", { timeout: 30_000 }, () => {
  const root = (files: Record<string, unknown>) => {
    const r = tmp();
    writeFileSync(join(r, ".content-root"), "");
    mkdirSync(join(r, "saints"));
    mkdirSync(join(r, "miracles"));
    for (const [name, body] of Object.entries(files)) writeFileSync(join(r, name), JSON.stringify(body));
    return r;
  };

  it("exits 2 on a missing directory, naming the clone command", () => {
    const r = validate(["--content-dir", join(tmp(), "nope")]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("git clone https://github.com/Labnerd-net/catholic-research");
  });

  it("exits 0 on valid content and never needs a database", () => {
    const r = validate(["--content-dir", root({ "saints/a.json": minimalSaint("a") })]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK");
  });

  it("exits 1 on an invalid file and on a dangling saint reference", () => {
    const bad = validate(["--content-dir", root({ "saints/a.json": { ...minimalSaint("a"), bogus: 1 } })]);
    expect(bad.status).toBe(1);
    expect(bad.stderr).toContain("saints/a.json");
    const dangling = validate(["--content-dir", root({ "miracles/m.json": { ...minimalMiracle("m"), saints: ["ghost"] } })]);
    expect(dangling.status).toBe(1);
    expect(dangling.stderr).toContain('unknown saint "ghost"');
  });
});
