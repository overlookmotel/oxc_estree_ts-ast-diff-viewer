<script>
  import { toViewId } from "$lib/utils.js";

  const { selectedId } = $props();

  let viewerData = $derived(
    selectedId === null ? Promise.reject() : fetch(selectedId).then((r) => r.json()),
  );
</script>

{#await viewerData}
  <p>Loading...</p>
{:then { source, ours, theirs, diff }}
  <section>
    <h2>{toViewId(selectedId)}</h2>
    <div class="viewer">
      <pre class="source" data-label="SOURCE">{source}</pre>
      <pre class="ours" data-label="OXC">{ours}</pre>
      <pre class="theirs" data-label="TS-ESLint">{theirs}</pre>
      <div class="diff" data-label="DIFF">
        {#each diff as { value, added, removed }}
          <div class={added ? "-a" : removed ? "-r" : ""}>{value}</div>
        {/each}
      </div>
    </div>
  </section>
{:catch}
  <p>Select test case. Once selected, you can navigate with `Up` and `Down` key.</p>
{/await}

<style>
  h2 {
    font-size: 1rem;
  }

  .viewer {
    display: grid;
    grid-template-columns: 15% repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    font-size: 0.6rem;
  }

  pre,
  .diff {
    margin: 0;
    padding: 0.25rem;
    position: relative;
    overflow-x: auto;
    background-color: #eee;
    white-space: pre;
    font-family: monospace;
    border: 1px solid var(--color);

    &.source {
      --color: #f0f;
    }
    &.diff {
      --color: #aa0;
    }
    &.ours {
      --color: #88bcff;
    }
    &.theirs {
      --color: #111e80;
    }

    &::before {
      content: attr(data-label);
      position: absolute;
      top: 0;
      right: 0;
      background-color: color-mix(in srgb, var(--color) 80%, transparent);
      padding: 0 0.5rem;
      color: #fff;
    }
  }

  .diff {
    color: #999;

    :global(.-a) {
      color: var(--color-diff-added);
    }
    :global(.-r) {
      color: var(--color-diff-removed);
    }
  }
</style>
