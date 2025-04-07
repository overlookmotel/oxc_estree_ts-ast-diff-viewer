<script>
  import { toViewId } from "$lib/utils.js";

  const { data } = $props();
  const viewId = $derived(toViewId(data.id));
</script>

<h2>{viewId}</h2>

<div class="viewer">
  <pre class="source" data-label="SOURCE">{data.source}</pre>
  <pre class="ours" data-label="OXC">{data.ours}</pre>
  <pre class="theirs" data-label="TS-ESLint">{data.theirs}</pre>
  <div class="diff" data-label="DIFF">
    {#each data.diff as { value, added, removed }}
      <div class={added ? "-a" : removed ? "-r" : ""}>{value}</div>
    {/each}
  </div>
</div>

<style>
  h2 {
    font-size: 1rem;
  }

  .viewer {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.5rem;
    font-size: 0.6rem;
  }

  pre,
  .diff {
    background-color: #eee;
    margin: 0;
    position: relative;
    overflow-x: auto;
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
      background-color: var(--color);
      padding: 0 0.5rem;
      color: #fff;
    }
  }

  .diff {
    white-space: pre;
    font-family: monospace;
    color: #999;

    :global(.-a) {
      color: var(--color-diff-added);
    }
    :global(.-r) {
      color: var(--color-diff-removed);
    }
  }
</style>
