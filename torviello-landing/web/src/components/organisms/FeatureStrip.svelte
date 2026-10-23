<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet O2: four value items in the responsive grid defined on sheet M3. -->
<script lang="ts">
  import FeatureItem from "../ui/FeatureItem.svelte";

  interface StripItem {
    icon: string;
    title: string;
    subcopy: string;
  }

  let { items }: { items: StripItem[] } = $props();
</script>

<div class="tv-feature-grid">
  {#each items as item (item.title)}
    <FeatureItem icon={item.icon} title={item.title} subcopy={item.subcopy} />
  {/each}
</div>
