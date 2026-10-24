<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet M4: one audience card — eyebrow, heading, and body over a decorative
     photo with a gradient scrim to the surface base. Slice 2 (ticket 0024):
     exactly one A2-styled action link below the body, never more. -->
<script lang="ts">
  import SectionLabel from "./SectionLabel.svelte";

  let {
    eyebrow,
    heading,
    body,
    image,
    action,
  }: {
    eyebrow: string;
    heading: string;
    body: string;
    /** Decorative photo; rendered as an aria-hidden background when set. */
    image?: string;
    /** Sheet M4 slice-2 action: one ghost link with a visible label. */
    action?: { label: string; href: string; external?: boolean };
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
    {#if action}
      <a
        class="tv-button tv-button--ghost tv-audience-card__action"
        href={action.href}
        target={action.external ? "_blank" : undefined}
        rel={action.external ? "noopener noreferrer" : undefined}
      >
        {action.label}
      </a>
    {/if}
  </div>
</article>
