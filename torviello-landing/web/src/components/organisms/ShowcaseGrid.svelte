<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet O7 (slice 3, ticket 0038): the showcase grid — three M4 audience
     cards plus the M8 terminal execution card in one equal-height row. Card
     order is the board order: builders, AI teams, real-world AI, terminal. -->
<script lang="ts">
  import AudienceCard from "../ui/AudienceCard.svelte";
  import TerminalCard from "../sections/TerminalCard.svelte";
  import type { IconName } from "../../lib/icons";

  interface ShowcaseCard {
    eyebrow: string;
    heading: string;
    body: string;
    image?: string;
    art?: "city";
    action?: { label: string; href: string; external?: boolean; icon?: IconName };
  }

  let {
    cards,
    terminal,
  }: {
    cards: ShowcaseCard[];
    terminal: { commands: string[]; steps: string[] };
  } = $props();
</script>

<div class="tv-showcase-grid">
  {#each cards as card (card.heading)}
    <AudienceCard
      eyebrow={card.eyebrow}
      heading={card.heading}
      body={card.body}
      image={card.image}
      art={card.art}
      action={card.action}
    />
  {/each}
  <TerminalCard commands={terminal.commands} steps={terminal.steps} />
</div>
