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

  const strokeIcons = {
    wrap: (paths: string) =>
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`,
  };

  const zap = strokeIcons.wrap('<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path>');
  const layers = strokeIcons.wrap(
    '<path d="m12 2 10 5-10 5L2 7l10-5z"></path><path d="m2 17 10 5 10-5"></path><path d="m2 12 10 5 10-5"></path>'
  );
  const sliders = strokeIcons.wrap(
    '<path d="M4 21v-7"></path><path d="M4 10V3"></path><path d="M12 21v-9"></path><path d="M12 8V3"></path><path d="M20 21v-5"></path><path d="M20 12V3"></path><path d="M1 14h6"></path><path d="M9 8h6"></path><path d="M17 16h6"></path>'
  );
  const users = strokeIcons.wrap(
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
  );
  const box = strokeIcons.wrap(
    '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path>'
  );
  const packageIcon = strokeIcons.wrap(
    '<path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path>'
  );

  const heroCards = [
    { icon: box, title: "DEVELOP", caption: "Experiment, iterate, and optimize." },
    { icon: packageIcon, title: "DEPLOY", caption: "Scale with confidence." },
    { icon: zap, title: "INFER", caption: "Real-world impact." },
  ];

  const stripItems = [
    { icon: zap, title: "High Performance", subcopy: "Optimized for real workloads" },
    { icon: layers, title: "Flexible Deployment", subcopy: "Cloud, on-prem, or edge" },
    { icon: sliders, title: "Developer & AI Native Friendly", subcopy: "Simple APIs, powerful control" },
    { icon: users, title: "Built for Real Teams", subcopy: "From research to production" },
  ];

  const audienceCards = [
    {
      eyebrow: "For builders",
      heading: "From idea to impact.",
      body: "The inference engine that moves with you — from notebooks to production.",
      action: { label: "Start building →", href: "https://docs.torviello.dev/install" },
    },
    {
      eyebrow: "For AI teams",
      heading: "Build, deploy, scale together.",
      body: "A unified inference engine for researchers, engineers, and product teams.",
      action: {
        label: "Read the docs →",
        href: "https://docs.torviello.dev",
        external: true,
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
