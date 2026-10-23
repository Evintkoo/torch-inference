<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet M4: one audience card — eyebrow, heading, and body over a decorative
     photo with a gradient scrim to the surface base. Non-interactive in
     slice 1; a per-card CTA is slice 2 scope and must not be improvised. -->
<script lang="ts">
  import SectionLabel from "./SectionLabel.svelte";

  let {
    eyebrow,
    heading,
    body,
    image,
  }: {
    eyebrow: string;
    heading: string;
    body: string;
    /** Decorative photo; rendered as an aria-hidden background when set. */
    image?: string;
  } = $props();
</script>

<article class="tv-audience-card">
  {#if image}
    <img
      class="tv-audience-card__photo"
      src={image}
      alt=""
      aria-hidden="true"
      loading="lazy"
    />
  {/if}
  <div class="tv-audience-card__content">
    <div class="tv-audience-card__eyebrow">
      <SectionLabel label={eyebrow} accent />
    </div>
    <h3 class="tv-audience-card__heading">{heading}</h3>
    <p class="tv-audience-card__body">{body}</p>
  </div>
</article>
