<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet P1 (slice-3 amendment, ticket 0038): the full board composition —
     the upper main grid (O4 hero panel + O6 brand panel) and the lower O7
     showcase grid (three M4 audience cards + the M8 terminal card), then the
     footer. Copy is embedded verbatim from the approved brand board; the
     terminal card carries the board's pip/serve example under the M8
     illustrative label. Anchors: #product on the hero panel, #use-cases on
     the showcase, #community on the footer. -->
<script lang="ts">
  import BrandPanel from "../components/organisms/BrandPanel.svelte";
  import HeroPanel from "../components/organisms/HeroPanel.svelte";
  import ShowcaseGrid from "../components/organisms/ShowcaseGrid.svelte";
  import SiteFooter from "../components/sections/SiteFooter.svelte";
  import LandingTemplate from "../template/LandingTemplate.svelte";
  import { icons } from "../lib/icons";

  const flowStages = [
    { icon: icons.box, title: "DEVELOP", caption: "Experiment, iterate, and optimize." },
    { icon: icons.package, title: "DEPLOY", caption: "Scale with confidence." },
    { icon: icons.zap, title: "INFER", caption: "Real-world impact." },
  ];

  const stripItems = [
    { icon: icons.zap, title: "High Performance", subcopy: "Optimized for real workloads" },
    { icon: icons.layers, title: "Flexible Deployment", subcopy: "Cloud, on-prem, or edge" },
    {
      icon: icons.sliders,
      title: "Developer & AI Native Friendly",
      subcopy: "Simple APIs, powerful control",
    },
    { icon: icons.users, title: "Built for Real Teams", subcopy: "From research to production" },
  ];

  const showcaseCards = [
    {
      eyebrow: "For builders",
      heading: "From idea to impact.",
      body: "The inference engine that moves with you — from notebooks to production.",
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
      art: "city",
      action: {
        label: "See it on GitHub",
        href: "https://github.com/torviello",
        external: true,
        icon: "github",
      },
    },
  ];

  const terminalExample = {
    commands: ["pip install torviello", "torviello serve --model my-model"],
    steps: [
      "Loading model...",
      "Optimizing graph...",
      "Starting inference server...",
      "Ready.",
    ],
  };

  const navLinks = [
    { label: "Product", href: "#product" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "Docs", href: "https://docs.torviello.dev", external: true },
    { label: "Community", href: "#community" },
  ];
</script>

<LandingTemplate>
  {#snippet children()}
    <div class="tv-main-grid">
      <HeroPanel
        links={navLinks}
        getStartedHref="https://docs.torviello.dev/install"
        githubHref="https://github.com/torviello"
        eyebrow="AI-native inference engine"
        line1="Torviello"
        line2="Built to"
        accent="infer."
        body="An AI-native inference engine for the next generation of builders. From experimentation to production, Torviello gives you the speed, control, and flexibility to run AI your way."
        primaryLabel="Get Started"
        primaryHref="https://docs.torviello.dev/install"
        ghostLabel="View on GitHub"
        stages={flowStages}
        strip={stripItems}
      />
      <BrandPanel />
    </div>

    <section id="use-cases" class="tv-showcase" aria-label="Torviello for every stage">
      <ShowcaseGrid cards={showcaseCards} terminal={terminalExample} />
    </section>
  {/snippet}

  {#snippet footer()}
    <SiteFooter id="community" />
  {/snippet}
</LandingTemplate>
