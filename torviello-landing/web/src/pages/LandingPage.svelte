<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet P1: template T1 populated with O1 → O2 → O3 → terminal → footer.
     Copy is embedded verbatim from the approved brand board (functional
     design: static content, no API calls in slice 1). Anchors: #product on
     the hero, #use-cases on the audience row, #community on the footer.
     Slice 2: the audience cards carry the M4 actions from ticket 0024. -->
<script lang="ts">
  import AudienceRow from "../components/organisms/AudienceRow.svelte";
  import FeatureStrip from "../components/organisms/FeatureStrip.svelte";
  import HeroSection from "../components/organisms/HeroSection.svelte";
  import SiteFooter from "../components/sections/SiteFooter.svelte";
  import TerminalDemo from "../components/sections/TerminalDemo.svelte";
  import NavBar from "../components/ui/NavBar.svelte";
  import LandingTemplate from "../template/LandingTemplate.svelte";
  import { icons } from "../lib/icons";

  const heroCards = [
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

  const audienceCards = [
    {
      eyebrow: "For builders",
      heading: "From idea to impact.",
      body: "The inference engine that moves with you — from notebooks to production.",
      action: {
        label: "Start building →",
        href: "https://docs.torviello.dev/install",
        icon: "arrow-right",
      },
    },
    {
      eyebrow: "For AI teams",
      heading: "Build, deploy, scale together.",
      body: "A unified inference engine for researchers, engineers, and product teams.",
      action: {
        label: "Read the docs →",
        href: "https://docs.torviello.dev",
        external: true,
        icon: "book-open",
      },
    },
    {
      eyebrow: "For real-world AI",
      heading: "Models in motion.",
      body: "Efficient, adaptable, and ready for production use cases.",
      action: {
        label: "See it on GitHub →",
        href: "https://github.com/torviello",
        external: true,
        icon: "github",
      },
    },
  ];

  const terminalLines = [
    { kind: "prompt", text: "torviello-engine --help" },
    { kind: "prompt", text: "TORCH_PORT=8000 torviello-engine" },
    {
      kind: "status",
      text:
        '{"event":"startup","version":"1.0.0","correlation_id":"…","message":"engine started"}',
    },
  ] as const;

  const navLinks = [
    { label: "Product", href: "#product" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "Docs", href: "https://docs.torviello.dev", external: true },
    { label: "Community", href: "#community" },
  ];
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
    <section id="product" class="tv-section tv-section--hero">
      <HeroSection
        eyebrow="AI-native inference engine"
        line1="Torviello"
        line2="Built to"
        accent="infer."
        body="An AI-native inference engine for the next generation of builders. From experimentation to production, Torviello gives you the speed, control, and flexibility to run AI your way."
        primaryLabel="Get Started →"
        primaryHref="https://docs.torviello.dev/install"
        ghostLabel="View on GitHub"
        githubHref="https://github.com/torviello"
        cards={heroCards}
      />
    </section>

    <section class="tv-section tv-container" aria-label="Why Torviello">
      <FeatureStrip items={stripItems} />
    </section>

    <section id="use-cases" class="tv-section tv-container">
      <AudienceRow cards={audienceCards} />
    </section>

    <section class="tv-section tv-container tv-section--terminal" aria-label="Terminal demo">
      <TerminalDemo lines={[...terminalLines]} />
    </section>
  {/snippet}

  {#snippet footer()}
    <SiteFooter id="community" />
  {/snippet}
</LandingTemplate>
