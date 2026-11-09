<!-- Copyright (c) 2026 Torviello. -->
<!-- Landing redesign O4 (ticket 0041, second amendment, LP-02): the centered
     hero. Badge chip, display promise, centered body, the inline
     DEVELOP → DEPLOY → INFER rail, the actions with the factual trust line,
     and the decorative aria-hidden inference artwork as the visual anchor.
     The documented engine session lives in its own band (LP-10), not here. -->
<script lang="ts">
  import SectionLabel from "../ui/SectionLabel.svelte";
  import Icon from "../ui/Icon.svelte";
  import InferenceArtwork from "./InferenceArtwork.svelte";
  import type { IconName } from "../../lib/icons";

  interface FlowStage {
    icon: IconName;
    title: string;
    caption: string;
  }

  let {
    eyebrow,
    promiseLine,
    accent,
    body,
    primaryLabel,
    primaryHref,
    ghostLabel,
    githubHref,
    stages,
  }: {
    eyebrow: string;
    promiseLine: string;
    accent: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    ghostLabel: string;
    githubHref: string;
    stages: FlowStage[];
  } = $props();
</script>

<section class="tv-hero">
  <div class="tv-hero__copy">
    <div class="tv-hero__badge">
      <span class="tv-hero__badge-dot" aria-hidden="true"></span>
      <SectionLabel label={eyebrow} accent />
    </div>
    <h1 class="tv-hero__heading">
      <span class="tv-hero__line">{promiseLine} <em class="tv-hero__accent">{accent}</em></span>
    </h1>
    <p class="tv-hero__body-copy">{body}</p>
    <ol class="tv-hero__rail" aria-label="Develop, deploy, infer">
      {#each stages as stage, index (stage.title)}
        {#if index > 0}
          <li class="tv-hero__rail-connector" aria-hidden="true"></li>
        {/if}
        <li class="tv-hero__stage">
          <span class="tv-hero__stage-icon" aria-hidden="true"><Icon name={stage.icon} /></span>
          <p class="tv-hero__stage-title">{stage.title}</p>
          <p class="tv-hero__stage-caption">{stage.caption}</p>
        </li>
      {/each}
    </ol>
    <div class="tv-hero__actions">
      <a class="tv-button tv-button--primary" href={primaryHref}>
        <Icon name="arrow-right" />{primaryLabel}</a
      >
      <a
        class="tv-button tv-button--ghost"
        href={githubHref}
        target="_blank"
        rel="noopener noreferrer"><Icon name="github" />{ghostLabel}</a
      >
    </div>
    <p class="tv-hero__trust">MIT licensed · Runs on your machine</p>
  </div>
  <div class="tv-hero__visual">
    <InferenceArtwork />
  </div>
</section>
