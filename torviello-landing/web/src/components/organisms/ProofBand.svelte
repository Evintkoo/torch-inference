<!-- Copyright (c) 2026 Torviello. -->
<!-- Landing redesign (ticket 0041, LP-04): the proof band. Three metric slots
     rendered as a definition list; every value stays an em-dash marked
     data-pending until a real benchmark run publishes, and the footnote says
     so. ED rule: no claimed performance numbers. -->
<script lang="ts">
  import { reveal } from "../../lib/reveal";

  let { metrics }: { metrics: { label: string }[] } = $props();
</script>

<section class="tv-proof" aria-labelledby="tv-proof-title" use:reveal>
  <h2 class="tv-section__title" id="tv-proof-title">Numbers, not claims.</h2>
  <dl class="tv-proof__grid">
    {#each metrics as metric (metric.label)}
      <div class="tv-proof__slot">
        <dt class="tv-proof__label">{metric.label}</dt>
        <dd class="tv-proof__value" data-pending="true">—</dd>
        <dd class="tv-proof__state">First benchmark pending</dd>
      </div>
    {/each}
  </dl>
  <p class="tv-proof__footnote">
    No performance number is claimed until the first benchmark run publishes —
    slots fill with real measurements only.
  </p>
</section>
