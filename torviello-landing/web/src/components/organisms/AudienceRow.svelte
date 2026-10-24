<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet O3: three audience cards. From slice 2 (ticket 0024) each card
     renders exactly one M4 action link; no other interactive surface. -->
<script lang="ts">
  import AudienceCard from "../ui/AudienceCard.svelte";

  interface RowCard {
    eyebrow: string;
    heading: string;
    body: string;
    image?: string;
    action?: { label: string; href: string; external?: boolean };
  }

  let { cards }: { cards: RowCard[] } = $props();
</script>

<div class="tv-audience-grid">
  {#each cards as card (card.heading)}
    <AudienceCard
      eyebrow={card.eyebrow}
      heading={card.heading}
      body={card.body}
      image={card.image}
      action={card.action}
    />
  {/each}
</div>
