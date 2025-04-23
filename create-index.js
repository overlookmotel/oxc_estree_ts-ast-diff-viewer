import { mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { diffLines } from "diff";
import sortObject from "sort-keys";
import { parse } from "@typescript-eslint/parser";
import { parseSync } from "../oxc/napi/parser/index.js";
import { glob } from "tinyglobby";

const stats = {};

for (const cwd of [
  resolve("../oxc/tasks/coverage/typescript/tests/cases/compiler"),
  resolve("../oxc/tasks/coverage/typescript/tests/cases/conformance"),
]) {
  const category = cwd.split("/").pop();

  await rm(join("./generated", category), { recursive: true, force: true });
  await mkdir(join("./generated", category), { recursive: true });

  const time = performance.now();
  const counter = {
    theirsFailed: 0,
    oursFailed: 0,
    matched: 0,
    created: 0,
  };
  const index = [];

  const files = await glob("**/*.ts", { cwd, absolute: true });
  for (const absPath of files) {
    const path = absPath.split(cwd).pop().slice(1).replace(/\//g, ".");
    const id = [category, path].join("/");

    const sourceText = await readFile(absPath, "utf-8");

    const results = {
      theirs: null,
      ours: null,
    };

    try {
      results.theirs = ensureTrailingComma(parseTheirs(sourceText));
    } catch {
      // There are some files that fail to parse
      // - Invalid syntax
      // - etc...
      // console.log(path);
      counter.theirsFailed++;
      continue;
    }

    try {
      results.ours = ensureTrailingComma(parseOurs(sourceText));
    } catch {
      counter.oursFailed++;
      continue;
    }

    // Match!
    if (results.ours === results.theirs) {
      counter.matched++;
      continue;
    }

    console.log("Diffing", id);
    console.time();

    // `diff` also exports `diffJson()` and it supports ordering and prettifying.
    // But we don't use it since:
    // - It is too slow
    // - It is not possible to save formatted JSON
    const changes = diffLines(results.ours, results.theirs);

    const diff = [0, 0];
    for (const change of changes) {
      if (change.added) diff[0] += change.count ?? 0;
      if (change.removed) diff[1] += change.count ?? 0;
    }

    index.push([id, diff[0], diff[1]].join("|"));

    const dest = join("./generated", id);
    await mkdir(dest, { recursive: true });
    await Promise.all([
      writeFile(`${dest}/source.ts`, sourceText),
      writeFile(`${dest}/ours.json`, results.ours),
      writeFile(`${dest}/theirs.json`, results.theirs),
      writeFile(`${dest}/diff.json`, JSON.stringify(changes)),
    ]);

    counter.created++;
    console.timeEnd();
  }

  index.sort((a, b) => a.localeCompare(b));
  await writeFile(`./generated/${category}/index.txt`, index.join("\n"));

  stats[category] = {
    ...counter,
    time: ((performance.now() - time) / 1000).toFixed(2) + " sec",
  };
}

console.log("✅", `files created in ./generated/(${Object.keys(stats).join("|")})/`);
console.table(stats);

// ---

const INFINITY_PLACEHOLDER = "__INFINITY__INFINITY__INFINITY__";
const BIGINT_PLACEHOLDER = "__BIGINT__";

function parseTheirs(code) {
  const ast = parse(code, {
    sourceType: "module",
    tokens: false,
    range: false,
    comments: false,
  });
  delete ast.tokens;
  delete ast.comments;

  return JSON.stringify(ast, transformerTs, 2);

  // Transformer for TS-ESLint AST.
  function transformerTs(_key, value) {
    if (typeof value === "bigint") return `${BIGINT_PLACEHOLDER}${value}${BIGINT_PLACEHOLDER}`;
    if (value === Infinity) return INFINITY_PLACEHOLDER;

    if (typeof value !== "object" || value === null || !Object.hasOwn(value, "type")) return value;

    if (value.type === "Literal" && Object.hasOwn(value, "regex")) {
      value.regex.flags = [...value.regex.flags].sort().join("");
      value.value = null;
    }

    // Replace `undefined` with `null`
    for (const key of Object.keys(value)) {
      if (typeof value[key] === "undefined") {
        value[key] = null;
      }
    }

    // Remove `loc` field
    if (Object.hasOwn(value, "loc")) value.loc = undefined;

    // Convert `range` field to `start` + `end`
    if (Object.hasOwn(value, "range")) {
      value = {
        type: value.type,
        start: value.range[0],
        end: value.range[1],
        ...value,
        range: undefined,
      };
    }

    const deep = ["Literal", "TemplateElement"].includes(value.type);
    return sortObject(value, { deep });
  }
}

function parseOurs(code) {
  const ret = parseSync("foo.ts", code, {
    preserveParens: false,
  });

  if (ret.errors.length !== 0) throw new Error("OXC failed to parse");

  // TODO: For theirs, this is comment w/ `type: Shebang`
  delete ret.program.hashbang;

  return JSON.stringify(ret.program, transformerOxc, 2);

  // Transformer for Oxc AST.
  function transformerOxc(_key, value) {
    if (typeof value === "bigint") return `${BIGINT_PLACEHOLDER}${value}${BIGINT_PLACEHOLDER}`;
    if (value === Infinity) return INFINITY_PLACEHOLDER;

    if (typeof value !== "object" || value === null || !Object.hasOwn(value, "type")) return value;

    if (value.type === "Literal" && Object.hasOwn(value, "regex")) {
      value.regex.flags = [...value.regex.flags].sort().join("");
      value.value = null;
    }

    const deep = ["Literal", "TemplateElement"].includes(value.type);
    return sortObject(value, { deep });
  }
}

// Naive, but very much faster than `json5.stringify()` and enough for us
function ensureTrailingComma(json) {
  return json
    .split("\n")
    .map((line) =>
      line.endsWith(",") || line.endsWith("{") || line.endsWith("[") ? line : line + ",",
    )
    .join("\n");
}
