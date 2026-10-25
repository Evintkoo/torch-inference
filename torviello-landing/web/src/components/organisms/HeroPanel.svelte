<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet O4 (slice 3, ticket 0038): the hero panel — the in-panel M1 nav, the
     hero promise (one h1), the O5 inference-flow artwork filling the right
     half, and the O2 feature strip along the bottom edge. DOM order reads nav
     → copy → flow → strip; the flow is decorative. -->
<script lang="ts">
  import InferenceFlow from "./InferenceFlow.svelte";
  import FeatureStrip from "./FeatureStrip.svelte";
  import NavBar from "../ui/NavBar.svelte";
  import SectionLabel from "../ui/SectionLabel.svelte";
  import Icon from "../ui/Icon.svelte";

  interface NavBarLink {
    label: string;
    href: string;
    external?: boolean;
  }

  interface StripItem {
    icon: string;
    title: string;
    subcopy: string;
  }

  interface FlowStage {
    icon: string;
    title: string;
    caption: string;
  }

  let {
    links,
    getStartedHref,
    githubHref,
    eyebrow,
    line1,
    line2,
    accent,
    body,
    primaryLabel,
    primaryHref,
    ghostLabel,
    stages,
    strip,
  }: {
    links: NavBarLink[];
    getStartedHref: string;
    githubHref: string;
    eyebrow: string;
    line1: string;
    line2: string;
    accent: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    ghostLabel: string;
    stages: FlowStage[];
    strip: StripItem[];
  } = $props();
</script>

<section id="product" class="tv-hero-panel">
  <div class="tv-hero-panel__nav">
    <NavBar {links} {getStartedHref} {githubHref} />
  </div>
  <div class="tv-hero-panel__body">
    <div class="tv-hero-panel__copy">
      <SectionLabel label={eyebrow} accent />
      <h1 class="tv-hero-panel__heading">
        <span class="tv-hero-panel__line">{line1}</span>
        <span class="tv-hero-panel__line">{line2} <em class="tv-hero__accent">{accent}</em></span>
      </h1>
      <p class="tv-hero-panel__body-copy">{body}</p>
      <div class="tv-hero-panel__actions">
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
    <div class="tv-hero-panel__flow">
      <InferenceFlow {stages} />
    </div>
  </div>
  <div class="tv-hero-panel__strip">
    <FeatureStrip items={strip} />
  </div>
</section>
