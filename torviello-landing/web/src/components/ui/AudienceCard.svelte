<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet M4 + slice-3 O7 amendment (ticket 0038): one audience showcase card —
     eyebrow, heading, and body over a decorative visual with a gradient scrim.
     The visual is either a photo (imported by the page) or the built-in dusk
     cityscape illustration (`art="city"`, O7): architectural silhouettes with
     lit windows crossed by orange inference lines that relate to the hero
     flow. Slice 2 (ticket 0024): exactly one A2-styled action link below the
     body, never more. All artwork is aria-hidden. -->
<script lang="ts">
  import Icon from "./Icon.svelte";
  import SectionLabel from "./SectionLabel.svelte";
  import type { IconName } from "../../lib/icons";

  let {
    eyebrow,
    heading,
    body,
    image,
    art,
    action,
  }: {
    eyebrow: string;
    heading: string;
    body: string;
    /** Decorative photo; rendered as an aria-hidden background when set. */
    image?: string;
    /** Built-in decorative illustration; "city" is the dusk skyline (O7). */
    art?: "city";
    /** Sheet M4 slice-2 action: one ghost link, icon paired with the label. */
    action?: { label: string; href: string; external?: boolean; icon?: IconName };
  } = $props();
</script>

<article class="tv-audience-card tv-showcase-card">
  {#if image}
    <img
      class="tv-audience-card__photo"
      src={image}
      alt=""
      aria-hidden="true"
      loading="lazy"
    />
  {/if}
  {#if art === "city"}
    <svg
      class="tv-audience-card__city"
      viewBox="0 0 320 360"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tv-city-sky" x1="0" y1="0" x2="0" y2="360" gradientUnits="userSpaceOnUse">
          <stop stop-color="var(--tv-color-deep)"></stop>
          <stop offset="1" stop-color="var(--tv-color-canvas)" stop-opacity="0.4"></stop>
        </linearGradient>
        <linearGradient id="tv-lines-grad" x1="0" y1="360" x2="320" y2="0" gradientUnits="userSpaceOnUse">
          <stop stop-color="var(--tv-accent-orange-dark)" stop-opacity="0.1"></stop>
          <stop offset="0.55" stop-color="var(--tv-action-primary)" stop-opacity="0.85"></stop>
          <stop offset="1" stop-color="var(--tv-accent-orange-light)" stop-opacity="0.9"></stop>
        </linearGradient>
      </defs>
      <rect width="320" height="360" fill="url(#tv-city-sky)"></rect>
      <g fill="var(--tv-color-elevated)">
        <rect x="18" y="150" width="38" height="210"></rect>
        <rect x="62" y="118" width="30" height="242"></rect>
        <rect x="120" y="170" width="44" height="190"></rect>
        <rect x="196" y="132" width="26" height="228"></rect>
        <rect x="252" y="168" width="50" height="192"></rect>
      </g>
      <g fill="var(--tv-color-deep)">
        <rect x="0" y="200" width="34" height="160"></rect>
        <rect x="100" y="150" width="34" height="210"></rect>
        <rect x="168" y="196" width="40" height="164"></rect>
        <rect x="228" y="182" width="30" height="178"></rect>
        <rect x="292" y="214" width="28" height="146"></rect>
      </g>
      <g fill="var(--tv-color-warm-white)" opacity="0.22">
        <rect x="26" y="164" width="4" height="4"></rect>
        <rect x="38" y="178" width="4" height="4"></rect>
        <rect x="70" y="130" width="4" height="4"></rect>
        <rect x="80" y="146" width="4" height="4"></rect>
        <rect x="130" y="184" width="4" height="4"></rect>
        <rect x="148" y="200" width="4" height="4"></rect>
        <rect x="202" y="146" width="4" height="4"></rect>
        <rect x="262" y="182" width="4" height="4"></rect>
        <rect x="284" y="198" width="4" height="4"></rect>
      </g>
      <g fill="var(--tv-accent-secondary)" opacity="0.35">
        <rect x="108" y="162" width="4" height="4"></rect>
        <rect x="236" y="194" width="4" height="4"></rect>
        <rect x="44" y="192" width="4" height="4"></rect>
      </g>
      <g class="tv-audience-card__lines-drift">
        <path d="M-20 300 C 70 330, 120 220, 200 240 C 270 258, 300 150, 360 140" stroke="url(#tv-lines-grad)" stroke-width="26" stroke-linecap="round" opacity="0.35"></path>
        <path d="M-20 302 C 72 326, 122 224, 202 242 C 272 258, 302 154, 360 144" stroke="url(#tv-lines-grad)" stroke-width="5" stroke-linecap="round"></path>
        <path d="M-20 250 C 60 280, 150 190, 230 190 C 300 190, 320 90, 360 80" stroke="url(#tv-lines-grad)" stroke-width="2.5" stroke-linecap="round" opacity="0.8"></path>
        <path d="M-20 340 C 90 350, 170 300, 250 300 C 310 300, 330 210, 360 205" stroke="url(#tv-lines-grad)" stroke-width="1.5" stroke-linecap="round" opacity="0.6"></path>
      </g>
    </svg>
  {/if}
  <div class="tv-audience-card__content">
    <div class="tv-audience-card__eyebrow">
      <SectionLabel label={eyebrow} accent />
    </div>
    <h2 class="tv-audience-card__heading">{heading}</h2>
    <p class="tv-audience-card__body">{body}</p>
    {#if action}
      <a
        class="tv-button tv-button--ghost tv-audience-card__action"
        href={action.href}
        target={action.external ? "_blank" : undefined}
        rel={action.external ? "noopener noreferrer" : undefined}
      >
        {#if action.icon}<Icon name={action.icon} />{/if}{action.label}
      </a>
    {/if}
  </div>
</article>
