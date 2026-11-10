<!-- Copyright (c) 2026 Torviello. -->
<!-- Landing redesign (ticket 0041, LP-07): the closing call-to-action band on
     the brand gradient. The inverse button is this region's primary; the
     ghost keeps the safe external GitHub link. -->
<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import { reveal } from "../../features/reveal/reveal";

  let {
    heading,
    body,
    primaryLabel,
    primaryHref,
    ghostLabel,
    githubHref,
  }: {
    heading: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    ghostLabel: string;
    githubHref: string;
  } = $props();
</script>

<section class="tv-cta" aria-label="Get started" use:reveal>
  <div class="tv-cta__copy">
    <h2 class="tv-cta__heading">{heading}</h2>
    <p class="tv-cta__body">{body}</p>
  </div>
  <div class="tv-cta__actions">
    <a class="tv-button tv-button--inverse" href={primaryHref}>
      <Icon name="arrow-right" />{primaryLabel}</a
    >
    <a
      class="tv-button tv-button--ghost"
      href={githubHref}
      target="_blank"
      rel="noopener noreferrer"><Icon name="github" />{ghostLabel}</a
    >
  </div>
</section>
