<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet A5: brand mark + wordmark as a single home link. The mark is the
     canonical ribbon-T imported from torviello-design (GOV-12.07, ticket
     0036), decorative and aria-hidden; the wordmark carries the name. -->
<script lang="ts">
  import { logoMark } from "../../lib/brand";

  let { href = "#top" }: { href?: string } = $props();
</script>

<a class="tv-logo" {href} aria-label="Torviello home">
  <span class="tv-logo__mark" aria-hidden="true">{@html logoMark}</span>
  <span class="tv-logo__wordmark">torviello</span>
</a>
