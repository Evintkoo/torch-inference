<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet T1: fixed nav slot, stacked section slots, footer slot; the page
     carries a single dark theme and the #top anchor for the brand links. -->
<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    nav,
    children,
    footer,
  }: {
    nav: Snippet;
    children: Snippet;
    footer: Snippet;
  } = $props();
</script>

<div class="tv-template" id="top">
  <header class="tv-template__nav">
    {@render nav()}
  </header>
  <main class="tv-template__main">
    {@render children()}
  </main>
  <div class="tv-template__footer">
    {@render footer()}
  </div>
</div>
