<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet A4: small all-caps eyebrow above headings ("AI-NATIVE INFERENCE ENGINE"). -->
<script lang="ts">
  let {
    label,
    accent = false,
    id,
  }: {
    label: string;
    /** Accent variant for eyebrows on the dark hero (sheet A4). */
    accent?: boolean;
    id?: string;
  } = $props();
</script>

<p id={id} class={accent ? "tv-section-label tv-section-label--accent" : "tv-section-label"}>
  {label}
</p>
