<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet A5: brand mark + wordmark as a single home link. The mark is a
     decorative aria-hidden vector of the canonical brand asset
     (torviello-design/brand/logo-mark.svg); the wordmark carries the name. -->
<script lang="ts">
  let { href = "#top" }: { href?: string } = $props();
</script>

<a class="tv-logo" {href} aria-label="Torviello home">
  <svg class="tv-logo__mark" aria-hidden="true" viewBox="0 0 48 48" focusable="false">
    <path fill="var(--tv-action-primary)" d="M6 12.5 40 5l-7.2 14.6L13 21.8Z"></path>
    <path fill="var(--tv-action-primary-hover)" d="m14.6 23.6 15.1-2.1-4.3 20.7H13.4Z"></path>
  </svg>
  <span class="tv-logo__wordmark">torviello</span>
</a>
