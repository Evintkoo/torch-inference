<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet M3: one value-strip entry. The icon is aria-hidden; the pair reads
     title then subcopy. Grid behavior (4-up / 2x2 / stacked) lives in
     molecules.css per the sheet. -->
<script lang="ts">
  let {
    icon,
    title,
    subcopy,
  }: {
    icon: string;
    title: string;
    subcopy: string;
  } = $props();
</script>

<div class="tv-feature-item">
  <span class="tv-feature-item__icon" aria-hidden="true">{@html icon}</span>
  <h3 class="tv-feature-item__title">{title}</h3>
  <p class="tv-feature-item__subcopy">{subcopy}</p>
</div>
