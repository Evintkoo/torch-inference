// Copyright (c) 2026 Torviello.
// Code twin of brand/logo-mark.svg (GOV-12.07, ticket 0036): the folded
// ribbon T as published for unit consumers; the sync contract test proves it
// equals the canonical asset. Consumers import, never fork.
export const logoMark = `<!-- Canonical brand mark, sliced from the approved board (ticket 0034,
     superseding the 0023 triangle interpretation): the folded ribbon T with
     its warm-white slash shard. Vector interpretation pending official brand
     files; palette per the board labels. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="tv-mark-bar" x1="0" y1="0.2" x2="1" y2="0.5">
      <stop offset="0" stop-color="#FF9E72"/>
      <stop offset="0.55" stop-color="#FF855F"/>
      <stop offset="1" stop-color="#FF683B"/>
    </linearGradient>
    <linearGradient id="tv-mark-leg" x1="0.7" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="#FF855F"/>
      <stop offset="1" stop-color="#EF4E23"/>
    </linearGradient>
  </defs>
  <path fill="url(#tv-mark-leg)" d="M42 6.8 C 34.5 7.8, 26.5 9, 20 10.2 C 16 11.1, 13.2 12.7, 12.4 15.1 C 11.7 17.2, 12.7 18.7, 14.2 19.1 C 15 19.3, 15.8 19.2, 16.6 18.7 C 15.6 23.4, 15.3 28.6, 15.9 33.8 C 16.3 36.7, 16.7 39.5, 17.2 42.2 C 20.6 37.8, 22.5 31.8, 22.8 24.8 C 22.9 21.7, 22.7 18.8, 22.2 16.2 C 26.7 15.3, 31.3 14.4, 35.6 13.4 C 37.9 11.5, 40.2 9.2, 42 6.8 Z"/>
  <path fill="#F7F8FA" d="M23.4 16.2 L30 13.2 L27.2 17.8 L28.8 18.8 C 27.2 23, 25.8 27, 24.2 30.6 C 23.2 25.8, 23.1 20.9, 23.4 16.2 Z"/>
</svg>`;
