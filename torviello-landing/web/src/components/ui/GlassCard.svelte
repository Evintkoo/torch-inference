<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet M2: the hero's DEVELOP / DEPLOY / INFER card. Decorative only — no
     pointer cursor, no tab stop; icon and glow are aria-hidden. -->
<script lang="ts">
  let {
    icon,
    title,
    caption,
  }: {
    icon: string;
    title: string;
    caption: string;
  } = $props();
</script>

<div class="tv-glass-card">
  <span class="tv-glass-card__glow" aria-hidden="true"></span>
  <span class="tv-glass-card__icon" aria-hidden="true">{@html icon}</span>
  <p class="tv-glass-card__title">{title}</p>
  <p class="tv-glass-card__caption">{caption}</p>
</div>
