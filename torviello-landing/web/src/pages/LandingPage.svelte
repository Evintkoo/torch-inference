<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet P1 (slice-3 amendment, ticket 0038/0039/0040): the full board
     composition — the full-width O4 hero panel, the O7 showcase grid (three M4
     audience cards with torviello-media photography), the M8 terminal example
     in its own band below the row, then the footer. The brand identity sheet
     drawn on the board is internal design documentation and is not rendered
     (ticket 0040). Copy is embedded verbatim from the approved brand board; the
     terminal band carries the board's pip/serve example under the M8
     illustrative label. Anchors: #product on the hero panel, #use-cases on the
     showcase, #community on the footer. -->
<script lang="ts">
  import HeroPanel from "../components/organisms/HeroPanel.svelte";
  import ShowcaseGrid from "../components/organisms/ShowcaseGrid.svelte";
  import SiteFooter from "../components/sections/SiteFooter.svelte";
  import TerminalCard from "../components/sections/TerminalCard.svelte";
  import LandingTemplate from "../template/LandingTemplate.svelte";
  import { icons } from "../lib/icons";
  // Ticket 0039: the showcase photography is owned by torviello-media and
  // imported through the alias (GOV-12.07), sliced from the approved reference
  // board — never generated copies inside this unit.
  import buildersPhoto from "@torviello/media/assets/landing/builders.jpg";
  import teamsPhoto from "@torviello/media/assets/landing/teams.jpg";
  import cityPhoto from "@torviello/media/assets/landing/city.jpg";

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

    <section id="use-cases" class="tv-showcase" aria-label="Torviello for every stage">
      <ShowcaseGrid cards={showcaseCards} />
      <div class="tv-terminal-band">
        <TerminalCard commands={terminalExample.commands} steps={terminalExample.steps} />
      </div>
    </section>
  {/snippet}

  {#snippet footer()}
    <SiteFooter id="community" />
  {/snippet}
</LandingTemplate>
