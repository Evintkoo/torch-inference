<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet A7: one glyph from the sliced brand asset set, decorative by
     definition; the labeled element carries the accessible name. -->
<script lang="ts">
  import { icons, type IconName } from "../../lib/icons";

  let { name }: { name: IconName } = $props();
</script>

<span class="tv-icon" aria-hidden="true">{@html icons[name]}</span>
