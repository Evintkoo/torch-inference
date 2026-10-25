<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet M2 + slice-3 O5 amendment (ticket 0038): the DEVELOP / DEPLOY /
     INFER stage card. Decorative only — no pointer cursor, no tab stop; icon
     and glow are aria-hidden. The optional stage variant sizes and tilts the
     card inside the inference-flow artwork. -->
<script lang="ts">
  let {
    icon,
    title,
    caption,
    stage,
  }: {
    icon: string;
    title: string;
    caption: string;
    /** O5 stage variant: drives size, tilt, and border emphasis in css. */
    stage?: "develop" | "deploy" | "infer";
  } = $props();
</script>

<div class="tv-glass-card" data-stage={stage}>
  <span class="tv-glass-card__glow" aria-hidden="true"></span>
  <span class="tv-glass-card__icon" aria-hidden="true">{@html icon}</span>
  <p class="tv-glass-card__title">{title}</p>
  <p class="tv-glass-card__caption">{caption}</p>
</div>
