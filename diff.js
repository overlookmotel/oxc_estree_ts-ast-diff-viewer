import sortObject from "sort-keys";
import { parse } from "@typescript-eslint/parser";
import { parseSync } from "../oxc/napi/parser/index.js";

// import { readFileSync } from "node:fs";
// const CODE = readFileSync("../oxc/tasks/coverage/typescript/tests/cases/conformance/es6/templates/templateStringMultiline1_ES6.ts", "utf8");
const CODE = `
({...({})} = {});
`.trim();

const [, , target] = process.argv;

switch (target) {
  case "O":
  case "o": {
    console.log(parseOurs(CODE));
    break;
  }
  case "T":
  case "t": {
    console.log(parseTheirs(CODE));
    break;
  }
  default: {
    console.log(CODE);
  }
}

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

    // if ("start" in value) value.start = undefined;
    // if ("end" in value) value.end = undefined;

    const deep = ["Literal", "TemplateElement"].includes(value.type);
    return sortObject(value, { deep });
  }
}

function parseOurs(code) {
  const ret = parseSync("foo.ts", code, {
    preserveParens: false,
    showSemanticErrors: true,
    experimentalRawTransfer: true,
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

    // if ("start" in value) value.start = undefined;
    // if ("end" in value) value.end = undefined;

    const deep = ["Literal", "TemplateElement"].includes(value.type);
    return sortObject(value, { deep });
  }
}
