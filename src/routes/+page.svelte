<script>
  import { toViewId } from "$lib/utils.js";
  import Viewer from "./viewer.svelte";

  /** @type {import('./$types').PageProps} */
  const { data } = $props();

  /** @type {string | null} */
  let selectedId = $state(null);

  let controlsState = $state({
    category: "compiler",
    sortType: "diff",
    filterRe: "",
  });

  /** @type {import("./+page.server.js").Index[]} */
  let activeIndex = $derived.by(() => {
    if (controlsState.category === "compiler") return data.compilerIndex;
    if (controlsState.category === "conformance") return data.conformanceIndex;
    throw new Error(`[Unreachable] Uknown category: ${controlsState.category}`);
  });
  let activeFilteredIndex = $derived.by(() => {
    if (controlsState.filterRe === "") return activeIndex;
    try {
      const re = new RegExp(controlsState.filterRe, "vi");
      return activeIndex.filter(({ id }) => re.test(id));
    } catch {
      return activeIndex;
    }
  });
  let activeFilteredSortedIndex = $derived.by(() => {
    if (controlsState.sortType === "id")
      return activeFilteredIndex.toSorted((a, b) => a.id.localeCompare(b.id));
    if (controlsState.sortType === "added")
      return activeFilteredIndex.toSorted((a, b) => a.added - b.added);
    if (controlsState.sortType === "removed")
      return activeFilteredIndex.toSorted((a, b) => a.removed - b.removed);
    if (controlsState.sortType === "diff")
      return activeFilteredIndex.toSorted(
        (a, b) => Math.abs(a.added - a.removed) - Math.abs(b.added - b.removed),
      );
    throw new Error(`[Unreachable] Unknown sortType: ${controlsState.sortType}`);
  });
</script>

<svelte:head>
  <title>OXC ESTree-TS AST Diff Viewer</title>
</svelte:head>

<main>
  <nav>
    <fieldset class="controls">
      <legend>Controls</legend>
      <div>
        <span>Category:</span>
        <div>
          {#each ["compiler", "conformance"] as category}
            <label>
              <input
                type="radio"
                bind:group={controlsState.category}
                value={category}
                name="category"
              />
              {category}
            </label>
          {/each}
        </div>
      </div>
      <div>
        <span>Order:</span>
        <div>
          {#each ["id", "added", "removed", "diff"] as type}
            <label>
              <input
                type="radio"
                bind:group={controlsState.sortType}
                value={type}
                name="sortType"
              />
              {type}
            </label>
          {/each}
        </div>
      </div>
      <div>
        <span>Filter:</span>
        <div>
          <input type="text" bind:value={controlsState.filterRe} />
        </div>
      </div>
      <hr />
      <p>Listing: {activeFilteredIndex.length}/{activeIndex.length}</p>
    </fieldset>

    <ul data-sveltekit-preload-data="false">
      {#each activeFilteredSortedIndex as { id, added, removed }}
        {@const viewId = toViewId(id)}
        <li>
          <input type="radio" bind:group={selectedId} value={id} id={viewId} name="id" />
          <div class="diff">
            <span class="-a">+{added}</span>
            <span class="-r">-{removed}</span>
          </div>
          <label for={viewId}>{viewId}</label>
        </li>
      {/each}
    </ul>
  </nav>

  <div class="viewer">
    <Viewer {selectedId} />
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  :root {
    --color-diff-added: #4caf50;
    --color-diff-removed: #f44336;
  }

  main {
    display: grid;
    grid-template-columns: 280px 1fr;
    height: 100vh;
  }

  nav {
    box-sizing: border-box;
    height: inherit;
    display: grid;
    grid-template-rows: max-content 1fr;
    align-content: start;
    gap: 0.5rem;
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .controls {
    display: grid;
    gap: 0.25rem;
    font-size: 0.8rem;
    margin: 0;
    background-color: #fafafa;

    > div {
      display: grid;
      grid-template-columns: 55px 1fr;
      align-items: center;
    }

    label {
      display: inline-flex;
      align-items: baseline;
    }

    label + label {
      margin-left: 0.5rem;
    }

    hr {
      width: 100%;
      margin: 0;
    }

    p {
      margin: 0;
      text-align: center;
    }
  }

  ul {
    display: grid;
    gap: 0.5rem;
    align-content: start;
    list-style: none;
    overflow: auto;
    padding: 0;
    margin: 0;
  }

  li {
    display: grid;
    grid-template-columns: min-content 5ch 1fr;
    gap: 0.25rem;
    align-items: center;
    word-break: break-word;
  }

  input[type="radio"] {
    zoom: 0.6;
    cursor: pointer;
  }

  label {
    cursor: pointer;
  }

  .diff {
    display: grid;
    font-size: 0.7rem;
    text-align: center;

    & .-a {
      color: var(--color-diff-added);
    }
    & .-r {
      color: var(--color-diff-removed);
    }
  }

  .viewer {
    overflow-y: auto;
    padding: 0.5rem;
  }
</style>
