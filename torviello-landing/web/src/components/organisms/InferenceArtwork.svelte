<!-- Copyright (c) 2026 Torviello. -->
<!-- Landing redesign (ticket 0041, LP-02 amendment): the decorative inference
     artwork — an abstract stream-and-nodes composition in brand tokens. Pure
     decoration: aria-hidden, no text, no data, no claimed behavior. Motion is
     a slow dash-flow, suppressed under reduced motion. -->
<svg
  class="tv-artwork"
  viewBox="0 0 960 420"
  fill="none"
  aria-hidden="true"
  role="presentation"
>
  <defs>
    <linearGradient id="tv-art-stream" x1="0" y1="380" x2="960" y2="60" gradientUnits="userSpaceOnUse">
      <stop stop-color="var(--tv-accent-orange-dark)" stop-opacity="0.15"></stop>
      <stop offset="0.45" stop-color="var(--tv-action-primary)" stop-opacity="0.9"></stop>
      <stop offset="1" stop-color="var(--tv-accent-orange-light)" stop-opacity="0.7"></stop>
    </linearGradient>
    <linearGradient id="tv-art-soft" x1="0" y1="380" x2="960" y2="60" gradientUnits="userSpaceOnUse">
      <stop stop-color="var(--tv-action-primary)" stop-opacity="0.04"></stop>
      <stop offset="0.6" stop-color="var(--tv-action-primary)" stop-opacity="0.22"></stop>
      <stop offset="1" stop-color="var(--tv-accent-orange-light)" stop-opacity="0.12"></stop>
    </linearGradient>
    <radialGradient id="tv-art-core" cx="0.5" cy="0.45" r="0.6">
      <stop stop-color="var(--tv-action-primary)" stop-opacity="0.16"></stop>
      <stop offset="1" stop-color="var(--tv-action-primary)" stop-opacity="0"></stop>
    </radialGradient>
    <linearGradient id="tv-art-node" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="var(--tv-surface-raised)"></stop>
      <stop offset="1" stop-color="var(--tv-surface-card)"></stop>
    </linearGradient>
    <filter id="tv-art-blur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="18"></feGaussianBlur>
    </filter>
  </defs>

  <rect width="960" height="420" fill="url(#tv-art-core)"></rect>

  <!-- the soft under-glow and the luminous stream -->
  <path
    d="M-20 330 C 150 366, 240 250, 380 268 C 520 286, 560 170, 700 178 C 810 184, 880 130, 980 120"
    stroke="url(#tv-art-soft)"
    stroke-width="72"
    stroke-linecap="round"
    filter="url(#tv-art-blur)"
  ></path>
  <path
    class="tv-artwork__stream"
    d="M-20 330 C 150 366, 240 250, 380 268 C 520 286, 560 170, 700 178 C 810 184, 880 130, 980 120"
    stroke="url(#tv-art-stream)"
    stroke-width="6"
    stroke-linecap="round"
    stroke-dasharray="10 18"
  ></path>
  <path
    d="M-20 372 C 170 396, 300 312, 430 322 C 570 332, 640 236, 780 236 C 870 236, 930 204, 980 198"
    stroke="url(#tv-art-soft)"
    stroke-width="10"
    stroke-linecap="round"
    opacity="0.7"
  ></path>

  <!-- stage nodes along the stream: develop, deploy, infer -->
  {#each [{ x: 150, y: 330 }, { x: 460, y: 272 }, { x: 780, y: 168 }] as node, i (i)}
    <g class="tv-artwork__node">
      <circle cx={node.x} cy={node.y} r="26" fill="url(#tv-art-node)"></circle>
      <circle
        cx={node.x}
        cy={node.y}
        r="26"
        stroke="var(--tv-border-panel-strong)"
      ></circle>
      <circle
        cx={node.x}
        cy={node.y}
        r="7"
        fill="var(--tv-action-primary)"
        opacity={0.55 + i * 0.2}
      ></circle>
    </g>
  {/each}

  <!-- satellite particles -->
  {#each [
    { x: 90, y: 150, r: 3, o: 0.5 },
    { x: 250, y: 90, r: 2.5, o: 0.35 },
    { x: 420, y: 120, r: 3.5, o: 0.5 },
    { x: 600, y: 80, r: 2.5, o: 0.4 },
    { x: 705, y: 90, r: 3, o: 0.55 },
    { x: 880, y: 260, r: 2.5, o: 0.35 },
    { x: 520, y: 360, r: 3, o: 0.4 },
    { x: 330, y: 380, r: 2.5, o: 0.3 }
  ] as p, i (i)}
    <circle cx={p.x} cy={p.y} r={p.r} fill="var(--tv-color-warm-white)" opacity={p.o}></circle>
  {/each}
</svg>
