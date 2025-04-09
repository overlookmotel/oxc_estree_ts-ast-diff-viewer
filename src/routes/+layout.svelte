<script>
  import { toViewId } from "$lib/utils.js";
  import { page } from "$app/state";
  /** @typedef {import("./+layout.server.js").Index} Index */

  /** @type {import('./$types').LayoutProps} */
  const { children, data } = $props();

  /** @type {Index[]} */
  let compilerIndex = $state(data.compilerIndex);
  /** @type {Index[]} */
  let conformanceIndex = $state(data.conformanceIndex);

  let category = $state("compiler");
  let activeIndex = $derived(category === "compiler" ? compilerIndex : conformanceIndex);

  /** @param {string} newCategory */
  const setCategory = (newCategory) => (category = newCategory);

  /** @param {string} sortType */
  const sortIndexes = (sortType) => {
    if (sortType === "id") {
      compilerIndex = compilerIndex.toSorted((a, b) => a.id.localeCompare(b.id));
      conformanceIndex = conformanceIndex.toSorted((a, b) => a.id.localeCompare(b.id));
    }
    if (sortType === "added") {
      compilerIndex = compilerIndex.toSorted((a, b) => a.added - b.added);
      conformanceIndex = conformanceIndex.toSorted((a, b) => a.added - b.added);
    }
    if (sortType === "removed") {
      compilerIndex = compilerIndex.toSorted((a, b) => a.removed - b.removed);
      conformanceIndex = conformanceIndex.toSorted((a, b) => a.removed - b.removed);
    }
    if (sortType === "diff") {
      compilerIndex = compilerIndex.toSorted(
        (a, b) => Math.abs(a.added - a.removed) - Math.abs(b.added - b.removed),
      );
      conformanceIndex = conformanceIndex.toSorted(
        (a, b) => Math.abs(a.added - a.removed) - Math.abs(b.added - b.removed),
      );
    }
  };
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
        <button onclick={() => setCategory("compiler")}>Compiler({compilerIndex.length})</button>
        <button onclick={() => setCategory("conformance")}
          >Conformance({conformanceIndex.length})</button
        >
      </div>
      <div>
        <span>Order by:</span>
        <button onclick={() => sortIndexes("id")}>Id</button>
        <button onclick={() => sortIndexes("added")}>Added</button>
        <button onclick={() => sortIndexes("removed")}>Removed</button>
        <button onclick={() => sortIndexes("diff")}>Diff</button>
      </div>
    </fieldset>

    <ul data-sveltekit-preload-data="false">
      {#each activeIndex as { id, added, removed }}
        {@const viewId = toViewId(id)}
        <li>
          <div class="diff">
            <span class="-a">+{added}</span>
            <span class="-r">-{removed}</span>
          </div>
          {#if page.url.pathname.endsWith(id)}
            <strong>{viewId}</strong>
          {:else}
            <a href="/{id}" onmouseenter={(ev) => ev.currentTarget.click()}>{viewId}</a>
          {/if}
        </li>
      {/each}
    </ul>
  </nav>

  <!-- XXX: Scroll top hack for in-page-scroll -->
  {#key page.url.pathname}
    <div class="main">{@render children()}</div>
  {/key}
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
    gap: 1rem;
    grid-template-columns: 320px 1fr;
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
    grid-template-columns: max-content 1fr;
    gap: 0.5rem;
    align-items: center;
    word-break: break-word;
  }

  .diff {
    display: grid;
    font-size: 0.7rem;
    font-weight: bold;
    text-align: center;

    span.-a {
      color: var(--color-diff-added);
    }
    span.-r {
      color: var(--color-diff-removed);
    }
  }

  .main {
    overflow-y: auto;
    padding: 0.5rem 0;
  }
</style>
