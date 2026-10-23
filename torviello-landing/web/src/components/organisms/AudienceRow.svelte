<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet O3: three audience cards. Non-interactive in slice 1 — a per-card
     CTA is slice 2 scope and must not be improvised. -->
<script lang="ts">
  import AudienceCard from "../ui/AudienceCard.svelte";

  interface RowCard {
    eyebrow: string;
    heading: string;
    body: string;
    image?: string;
  }

  let { cards }: { cards: RowCard[] } = $props();
</script>

<div class="tv-audience-grid">
  {#each cards as card (card.heading)}
    <AudienceCard eyebrow={card.eyebrow} heading={card.heading} body={card.body} image={card.image} />
  {/each}
</div>
