<!-- Copyright (c) 2026 Torviello. -->
<!-- Landing redesign T1 (ticket 0041): the page shell. The nav renders once at
     the template level in a sticky wrapper (LP-01) — the hero no longer owns
     it. The template carries the skip link, the main landmark, and the footer
     slot; sections render unboxed on the canvas. -->
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
  <a class="tv-skip-link" href="#main">Skip to content</a>
  <div class="tv-topnav">
    {@render nav()}
  </div>
  <main class="tv-template__main" id="main">
    <div class="tv-canvas">
      {@render children()}
    </div>
  </main>
  <div class="tv-template__footer">
    {@render footer()}
  </div>
</div>
