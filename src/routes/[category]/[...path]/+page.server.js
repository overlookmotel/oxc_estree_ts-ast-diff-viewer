import { error } from "@sveltejs/kit";
import { readFile } from "node:fs/promises";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { category, path } = params;
  const id = [category, path].join("/");

  console.log("Loading data for ID:", id);

  try {
    const [source, ours, theirs, diff] = await Promise.all(
      ["source.ts", "ours.json", "theirs.json", "diff.json"].map((f) =>
        readFile([import.meta.dirname, "../../../../generated", id, f].join("/"), "utf-8"),
      ),
    );

    return {
      id,
      source,
      ours,
      theirs,
      diff: JSON.parse(diff),
    };
  } catch {
    error(404, "Not found");
  }
}
