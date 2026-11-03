<!-- Copyright (c) 2026 Torviello. -->
<!-- Landing redesign P1 (ticket 0041, LP-01…LP-09): the page is a product
     page, not a board reproduction. Sticky template-level nav, unboxed hero
     with the documented engine session, the value props as a headed section,
     the honest pending-benchmark proof band, the three audience cards, the
     two-column illustrative terminal band, the closing CTA band, and the
     structured footer. Copy is the approved board copy; the only transcript
     presented as verified behavior is the documented engine session; the
     pip/serve example keeps its visible ILLUSTRATIVE label. Anchors:
     #product on the value section, #use-cases on the showcase, #community on
     the footer. -->
<script lang="ts">
  import CtaBand from "../components/organisms/CtaBand.svelte";
  import HeroPanel from "../components/organisms/HeroPanel.svelte";
  import ProofBand from "../components/organisms/ProofBand.svelte";
  import FeatureStrip from "../components/organisms/FeatureStrip.svelte";
  import ShowcaseGrid from "../components/organisms/ShowcaseGrid.svelte";
  import NavBar from "../components/ui/NavBar.svelte";
  import SiteFooter from "../components/sections/SiteFooter.svelte";
  import TerminalCard from "../components/sections/TerminalCard.svelte";
  import Icon from "../components/ui/Icon.svelte";
  import LandingTemplate from "../template/LandingTemplate.svelte";
  import { icons } from "../lib/icons";
  // The showcase photography is owned by torviello-media and imported through
  // the alias (GOV-12.07), sliced from the approved reference board — never
  // generated copies inside this unit.
  import buildersPhoto from "@torviello/media/assets/landing/builders.jpg";
  import teamsPhoto from "@torviello/media/assets/landing/teams.jpg";
  import cityPhoto from "@torviello/media/assets/landing/city.jpg";

  const navLinks = [
    { label: "Product", href: "#product" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "Docs", href: "https://docs.torviello.dev", external: true },
    { label: "Community", href: "#community" },
  ];

  // LP-02: the documented engine session — the only transcript presented as
  // verified behavior (carried from the slice-two truthfulness rule).
  const engineSession = {
    commands: ["torviello-engine --help", "TORCH_PORT=8000 torviello-engine"],
    output:
      '{"event":"startup","version":"1.0.0","correlation_id":"…","message":"engine started"}',
  };

  const flowStages = [
    { icon: icons.box, title: "DEVELOP", caption: "Experiment, iterate, and optimize." },
    { icon: icons.package, title: "DEPLOY", caption: "Scale with confidence." },
    { icon: icons.zap, title: "INFER", caption: "Real-world impact." },
  ];

  const valueItems = [
    { icon: icons.zap, title: "High Performance", subcopy: "Optimized for real workloads" },
    { icon: icons.layers, title: "Flexible Deployment", subcopy: "Cloud, on-prem, or edge" },
    {
      icon: icons.sliders,
      title: "Developer & AI Native Friendly",
      subcopy: "Simple APIs, powerful control",
    },
    { icon: icons.users, title: "Built for Real Teams", subcopy: "From research to production" },
  ];

  // LP-04: labels only — the band itself renders pending states, no numbers.
  const proofMetrics = [{ label: "p99 latency" }, { label: "Throughput" }, { label: "Cold start" }];

  const showcaseCards = [
    {
      eyebrow: "For builders",
      heading: "From idea to impact.",
      body: "The inference engine that moves with you — from notebooks to production.",
      image: buildersPhoto,
      action: {
        label: "Start building",
        href: "https://docs.torviello.dev/install",
        icon: "arrow-right",
      },
    },
    {
      eyebrow: "For AI teams",
      heading: "Build, deploy, scale together.",
      body: "A unified inference engine for researchers, engineers, and product teams.",
      image: teamsPhoto,
      action: {
        label: "Read the docs",
        href: "https://docs.torviello.dev",
        external: true,
        icon: "book-open",
      },
    },
    {
      eyebrow: "For real-world AI",
      heading: "Models in motion.",
      body: "Efficient, adaptable, and ready for production use cases.",
      image: cityPhoto,
      action: {
        label: "See it on GitHub",
        href: "https://github.com/torviello",
        external: true,
        icon: "github",
      },
    },
  ];

  // LP-06: the pip/serve example stays visibly ILLUSTRATIVE (BC-06 carried).
  const terminalExample = {
    commands: ["pip install torviello", "torviello serve --model my-model"],
    steps: [
      "Loading model...",
      "Optimizing graph...",
      "Starting inference server...",
      "Ready.",
    ],
  };
</script>

<LandingTemplate>
  {#snippet nav()}
    <NavBar
      links={navLinks}
      getStartedHref="https://docs.torviello.dev/install"
      githubHref="https://github.com/torviello"
    />
  {/snippet}

  {#snippet children()}
    <HeroPanel
      eyebrow="AI-native inference engine"
      promiseLine="Built to"
      accent="infer."
      body="An AI-native inference engine for the next generation of builders. From experimentation to production, Torviello gives you the speed, control, and flexibility to run AI your way."
      primaryLabel="Get Started"
      primaryHref="https://docs.torviello.dev/install"
      ghostLabel="View on GitHub"
      githubHref="https://github.com/torviello"
      stages={flowStages}
      session={engineSession}
    />

    <section id="product" class="tv-section tv-values" aria-labelledby="tv-values-title">
      <h2 class="tv-section__title" id="tv-values-title">Why Torviello</h2>
      <p class="tv-section__sub">The speed, control, and flexibility to run AI your way.</p>
      <FeatureStrip items={valueItems} />
    </section>

    <ProofBand metrics={proofMetrics} />

    <section id="use-cases" class="tv-section tv-showcase" aria-labelledby="tv-showcase-title">
      <h2 class="tv-section__title" id="tv-showcase-title">Torviello for every stage.</h2>
      <ShowcaseGrid cards={showcaseCards} />
      <div class="tv-terminal-band">
        <div class="tv-terminal-band__copy">
          <h2 class="tv-section__title">Up and running in minutes.</h2>
          <p class="tv-section__sub">
            Install the package, point it at a model, and serve. The docs walk through every
            step, from local experiments to production deployments.
          </p>
          <a
            class="tv-button tv-button--ghost"
            href="https://docs.torviello.dev"
            target="_blank"
            rel="noopener noreferrer"><Icon name="book-open" />Read the docs</a
          >
        </div>
        <div class="tv-terminal-band__terminal">
          <TerminalCard commands={terminalExample.commands} steps={terminalExample.steps} />
        </div>
      </div>
    </section>

    <CtaBand
      heading="Start building today."
      body="From install to a running server — the docs walk you through every step."
      primaryLabel="Get Started"
      primaryHref="https://docs.torviello.dev/install"
      ghostLabel="View on GitHub"
      githubHref="https://github.com/torviello"
    />
  {/snippet}

  {#snippet footer()}
    <SiteFooter id="community" />
  {/snippet}
</LandingTemplate>
