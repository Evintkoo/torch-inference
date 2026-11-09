<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet O7 (slice 3, ticket 0038; ticket 0040 re-composition): the showcase
     grid — the three M4 audience cards in one equal-height row. The M8
     terminal example moved out of this row into its own full-width band on the
     page. Card order is the board order: builders, AI teams, real-world AI. -->
<script lang="ts">
  import AudienceCard from "../ui/AudienceCard.svelte";
  import { reveal } from "../../lib/reveal";
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
  }: {
    cards: ShowcaseCard[];
  } = $props();
</script>

<div class="tv-showcase-grid">
  {#each cards as card, index (card.heading)}
    <div class="tv-showcase-grid__slot" use:reveal={{ delay: index * 90 }}>
      <AudienceCard
        eyebrow={card.eyebrow}
        heading={card.heading}
        body={card.body}
        image={card.image}
        art={card.art}
        action={card.action}
      />
    </div>
  {/each}
</div>
