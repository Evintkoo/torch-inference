<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet O5 (slice 3, ticket 0038): the inference-flow artwork. A luminous
     orange multi-stroke stream (blurred depth duplicates, edge mask) flows
     through three translucent stage panels — DEVELOP, DEPLOY, INFER — growing
     in size and emphasis. Entirely decorative: one aria-hidden figure, no
     interactive surface; the drift/breathing loops only where motion is
     welcome. -->
<script lang="ts">
  import GlassCard from "../ui/GlassCard.svelte";

  interface FlowStage {
    icon: string;
    title: string;
    caption: string;
  }

  let { stages }: { stages: FlowStage[] } = $props();

  const variants = ["develop", "deploy", "infer"] as const;
</script>

<div class="tv-flow" aria-hidden="true">
  <svg
    class="tv-flow__stream"
    viewBox="0 0 640 480"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="tv-flow-main" x1="0" y1="470" x2="640" y2="10" gradientUnits="userSpaceOnUse">
        <stop stop-color="var(--tv-accent-orange-dark)" stop-opacity="0.25"></stop>
        <stop offset="0.45" stop-color="var(--tv-action-primary)" stop-opacity="0.9"></stop>
        <stop offset="0.8" stop-color="var(--tv-accent-orange-light)"></stop>
        <stop offset="1" stop-color="var(--tv-accent-orange-light)" stop-opacity="0.65"></stop>
      </linearGradient>
      <linearGradient id="tv-flow-soft" x1="0" y1="470" x2="640" y2="10" gradientUnits="userSpaceOnUse">
        <stop stop-color="var(--tv-action-primary)" stop-opacity="0.05"></stop>
        <stop offset="0.6" stop-color="var(--tv-action-primary)" stop-opacity="0.35"></stop>
        <stop offset="1" stop-color="var(--tv-accent-orange-light)" stop-opacity="0.2"></stop>
      </linearGradient>
      <filter id="tv-flow-blur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="14"></feGaussianBlur>
      </filter>
      <filter id="tv-flow-bloom" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="26"></feGaussianBlur>
      </filter>
      <radialGradient id="tv-flow-core" cx="0.78" cy="0.42" r="0.5">
        <stop stop-color="var(--tv-accent-orange-light)" stop-opacity="0.55"></stop>
        <stop offset="1" stop-color="var(--tv-accent-orange-light)" stop-opacity="0"></stop>
      </radialGradient>
      <mask id="tv-flow-mask">
        <rect width="640" height="480" fill="#fff"></rect>
        <rect width="640" height="30" fill="#000"></rect>
        <rect y="450" width="640" height="30" fill="#000"></rect>
      </mask>
    </defs>
    <g mask="url(#tv-flow-mask)">
      <ellipse cx="500" cy="200" rx="240" ry="150" fill="url(#tv-flow-core)"></ellipse>
      <g class="tv-flow__drift">
        <path
          d="M-60 400 C 90 452, 150 320, 235 345 C 330 373, 300 180, 405 195 C 500 208, 545 150, 700 165"
          stroke="url(#tv-flow-soft)"
          stroke-width="92"
          stroke-linecap="round"
          filter="url(#tv-flow-bloom)"
        ></path>
        <path
          d="M-60 402 C 95 448, 155 325, 238 348 C 332 374, 305 185, 408 198 C 502 210, 548 152, 700 168"
          stroke="url(#tv-flow-main)"
          stroke-width="34"
          stroke-linecap="round"
          opacity="0.5"
          filter="url(#tv-flow-blur)"
        ></path>
        <path
          d="M-60 402 C 95 448, 155 325, 238 348 C 332 374, 305 185, 408 198 C 502 210, 548 152, 700 168"
          stroke="url(#tv-flow-main)"
          stroke-width="10"
          stroke-linecap="round"
        ></path>
        <path
          d="M-60 350 C 110 390, 190 260, 300 285 C 396 306, 380 150, 470 140 C 545 132, 590 96, 700 100"
          stroke="url(#tv-flow-soft)"
          stroke-width="14"
          stroke-linecap="round"
          opacity="0.7"
        ></path>
        <path
          d="M-60 442 C 120 470, 210 400, 320 408 C 430 416, 470 300, 560 285 C 630 273, 665 250, 700 245"
          stroke="url(#tv-flow-soft)"
          stroke-width="8"
          stroke-linecap="round"
          opacity="0.55"
        ></path>
      </g>
    </g>
  </svg>
  <div class="tv-flow__stages">
    {#each stages as stage, index (stage.title)}
      <GlassCard
        icon={stage.icon}
        title={stage.title}
        caption={stage.caption}
        stage={variants[index] ?? "develop"}
      />
    {/each}
  </div>
</div>
