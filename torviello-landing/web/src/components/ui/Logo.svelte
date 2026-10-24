<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet A5: brand mark + wordmark as a single home link. The mark is the
     folded ribbon T sliced from the board (ticket 0034; canonical asset
     torviello-design/brand/logo-mark.svg), decorative and aria-hidden; the
     wordmark carries the name. -->
<script lang="ts">
  let { href = "#top" }: { href?: string } = $props();
</script>

<a class="tv-logo" {href} aria-label="Torviello home">
  <svg class="tv-logo__mark" aria-hidden="true" viewBox="0 0 48 48" focusable="false">
    <defs>
      <linearGradient id="tv-logo-bar" x1="0" y1="0.2" x2="1" y2="0.5">
        <stop offset="0" stop-color="color-mix(in srgb, var(--tv-action-primary) 68%, var(--tv-text-primary))"></stop>
        <stop offset="0.55" stop-color="var(--tv-action-primary-hover)"></stop>
        <stop offset="1" stop-color="var(--tv-action-primary)"></stop>
      </linearGradient>
      <linearGradient id="tv-logo-leg" x1="0.7" y1="0" x2="0.2" y2="1">
        <stop offset="0" stop-color="var(--tv-action-primary-hover)"></stop>
        <stop offset="1" stop-color="color-mix(in srgb, var(--tv-action-primary) 80%, black)"></stop>
      </linearGradient>
    </defs>
    <path
      fill="url(#tv-logo-leg)"
      d="M42 6.8 C 34.5 7.8, 26.5 9, 20 10.2 C 16 11.1, 13.2 12.7, 12.4 15.1 C 11.7 17.2, 12.7 18.7, 14.2 19.1 C 15 19.3, 15.8 19.2, 16.6 18.7 C 15.6 23.4, 15.3 28.6, 15.9 33.8 C 16.3 36.7, 16.7 39.5, 17.2 42.2 C 20.6 37.8, 22.5 31.8, 22.8 24.8 C 22.9 21.7, 22.7 18.8, 22.2 16.2 C 26.7 15.3, 31.3 14.4, 35.6 13.4 C 37.9 11.5, 40.2 9.2, 42 6.8 Z"
    ></path>
    <path
      fill="var(--tv-text-primary)"
      d="M23.4 16.2 L30 13.2 L27.2 17.8 L28.8 18.8 C 27.2 23, 25.8 27, 24.2 30.6 C 23.2 25.8, 23.1 20.9, 23.4 16.2 Z"
    ></path>
  </svg>
  <span class="tv-logo__wordmark">torviello</span>
</a>
