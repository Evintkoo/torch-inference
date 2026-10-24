<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet O1: the hero promise — eyebrow, two-line display heading with the
     orange emphasis, body copy, the paired actions, and the three glass cards
     over decorative ribbon artwork. One h1 per view. -->
<script lang="ts">
  import GlassCard from "../ui/GlassCard.svelte";
  import Icon from "../ui/Icon.svelte";
  import SectionLabel from "../ui/SectionLabel.svelte";

  interface HeroCard {
    icon: string;
    title: string;
    caption: string;
  }

  let {
    eyebrow,
    line1,
    line2,
    accent,
    body,
    primaryLabel,
    primaryHref,
    ghostLabel,
    githubHref,
    cards,
  }: {
    eyebrow: string;
    /** First display line ("Torviello"). */
    line1: string;
    /** Second display line before the emphasis ("Built to"). */
    line2: string;
    /** The orange-emphasized word ("infer."). */
    accent: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    ghostLabel: string;
    githubHref: string;
    cards: HeroCard[];
  } = $props();
</script>

<section class="tv-hero">
  <svg class="tv-hero__ribbon" aria-hidden="true" viewBox="0 0 640 420" fill="none" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="tv-ribbon-gradient" x1="0" y1="420" x2="640" y2="0" gradientUnits="userSpaceOnUse">
        <stop stop-color="var(--tv-action-primary)" stop-opacity="0.15"></stop>
        <stop offset="0.5" stop-color="var(--tv-action-primary)" stop-opacity="0.85"></stop>
        <stop offset="1" stop-color="var(--tv-accent-secondary)" stop-opacity="0.35"></stop>
      </linearGradient>
    </defs>
    <path
      d="M-40 330 C 130 390, 190 130, 330 190 S 560 70, 680 150"
      stroke="url(#tv-ribbon-gradient)"
      stroke-width="56"
      stroke-linecap="round"
      opacity="0.35"
    ></path>
    <path
      d="M-40 330 C 130 390, 190 130, 330 190 S 560 70, 680 150"
      stroke="url(#tv-ribbon-gradient)"
      stroke-width="18"
      stroke-linecap="round"
    ></path>
  </svg>
  <div class="tv-container tv-hero__layout">
    <div class="tv-hero__copy">
      <SectionLabel label={eyebrow} accent />
      <h1 class="tv-hero__heading">
        <span class="tv-hero__line">{line1}</span>
        <span class="tv-hero__line">{line2} <em class="tv-hero__accent">{accent}</em></span>
      </h1>
      <p class="tv-hero__body">{body}</p>
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
    </div>
    <div class="tv-hero__cards">
      {#each cards as card (card.title)}
        <GlassCard icon={card.icon} title={card.title} caption={card.caption} />
      {/each}
    </div>
  </div>
</section>
