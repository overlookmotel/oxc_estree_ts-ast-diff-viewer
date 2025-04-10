<script>
  import { toViewId } from "$lib/utils.js";
  import Viewer from "./viewer.svelte";

  /** @type {import('./$types').PageProps} */
  const { data } = $props();

  /** @type {string | null} */
  let selectedId = $state(null);

  let category = $state("compiler");
  /** @param {string} newCategory */
  const setCategory = (newCategory) => (category = newCategory);

  let sortType = $state("diff");
  /** @param {string} newSortType */
  const sortIndexes = (newSortType) => (sortType = newSortType);

  /** @type {import("./+page.server.js").Index[]} */
  let activeIndex = $derived.by(() => {
    if (category === "compiler") return data.compilerIndex;
    if (category === "conformance") return data.conformanceIndex;
    throw new Error(`Unknown category: ${category}`);
  });
  let activeSortedIndex = $derived.by(() => {
    if (sortType === "id") return activeIndex.toSorted((a, b) => a.id.localeCompare(b.id));
    if (sortType === "added") return activeIndex.toSorted((a, b) => a.added - b.added);
    if (sortType === "removed") return activeIndex.toSorted((a, b) => a.removed - b.removed);
    if (sortType === "diff")
      return activeIndex.toSorted(
        (a, b) => Math.abs(a.added - a.removed) - Math.abs(b.added - b.removed),
      );
    throw new Error(`Unknown sortType: ${sortType}`);
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
        <button onclick={() => setCategory("compiler")} disabled={category === "compiler"}
          >Compiler({data.compilerIndex.length})</button
        ><button onclick={() => setCategory("conformance")} disabled={category === "conformance"}
          >Conformance({data.conformanceIndex.length})</button
        >
      </div>
      <div>
        <span>Order by:</span>
        {#each ["id", "added", "removed", "diff"] as type}
          <button onclick={() => sortIndexes(type)} disabled={sortType === type}>{type}</button>
        {/each}
      </div>
    </fieldset>

    <ul data-sveltekit-preload-data="false">
      {#each activeSortedIndex as { id, added, removed }}
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
    gap: 0.5rem;
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .controls {
    & button {
      font-size: 0.6rem;
    }
    & button + button {
      margin-inline-start: 0.25rem;
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
    padding: 0 0.5rem;
  }
</style>
