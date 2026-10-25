<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet T1 (slice-3 amendment, ticket 0038): the panel canvas — a 12px-gutter
     grid of bordered panels. The nav lives inside the hero panel; the template
     carries the skip link, the main landmark, and the footer slot. -->
<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    footer,
  }: {
    children: Snippet;
    footer: Snippet;
  } = $props();
</script>

<div class="tv-template" id="top">
  <a class="tv-skip-link" href="#main">Skip to content</a>
  <main class="tv-template__main" id="main">
    <div class="tv-canvas">
      {@render children()}
    </div>
  </main>
  <div class="tv-template__footer">
    {@render footer()}
  </div>
</div>
