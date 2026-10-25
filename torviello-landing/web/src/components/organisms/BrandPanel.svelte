<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet O6 (slice 3, ticket 0038): the brand identity panel — the primary
     lockup (canonical imported mark, GOV-12.07), three logo-variation
     previews, the four hex-labeled palette swatches, and the two typography
     samples. A non-interactive complementary landmark; swatch values are the
     token contract values, not independent literals. -->
<script lang="ts">
  import SectionLabel from "../ui/SectionLabel.svelte";
  import { logoMark } from "../../lib/brand";

  const variations = [
    { kind: "dark", label: "LOGO VARIATIONS" },
    { kind: "light", label: "LOGO VARIATIONS" },
    { kind: "icon", label: "APP ICON" },
  ];

  const palette = [
    { name: "Midnight", hex: "#0B1020", token: "var(--tv-color-midnight)" },
    { name: "Torviello Orange", hex: "#FF683B", token: "var(--tv-color-orange)" },
    { name: "Warm White", hex: "#F7F8FA", token: "var(--tv-color-warm-white)" },
    { name: "Signal Teal", hex: "#22D3C5", token: "var(--tv-color-signal-teal)" },
  ];

  const typefaces = [
    { kind: "sans", family: "var(--tv-font-sans)", name: "Inter", usage: "Headings & UI" },
    { kind: "mono", family: "var(--tv-font-mono)", name: "JetBrains Mono", usage: "Code & Technical" },
  ];
</script>

<aside class="tv-brand-panel" aria-label="Brand identity">
  <div class="tv-brand">
    <div class="tv-brand__lockup">
      <span class="tv-brand__mark" aria-hidden="true">{@html logoMark}</span>
      <span class="tv-brand__wordmark">torviello</span>
    </div>

    <div class="tv-brand__row">
      {#each variations as variation (variation.kind)}
        <div class="tv-brand__variation tv-brand__variation--{variation.kind}">
          <span class="tv-brand__variation-mark" aria-hidden="true">{@html logoMark}</span>
        </div>
      {/each}
    </div>
    <div class="tv-brand__row-labels" aria-hidden="true">
      <p class="tv-brand__caption tv-brand__caption--group">LOGO VARIATIONS</p>
      <p class="tv-brand__caption">APP ICON</p>
    </div>

    <SectionLabel id="tv-brand-palette-label" label="COLOR PALETTE" />
    <div class="tv-brand__palette" role="list" aria-labelledby="tv-brand-palette-label">
      {#each palette as color (color.hex)}
        <div class="tv-brand__swatch tv-brand__swatch--{color.name.toLowerCase().replaceAll(' ', '-')}" role="listitem">
          <span class="tv-brand__swatch-chip" style:background={color.token} aria-hidden="true"></span>
          <p class="tv-brand__swatch-name">{color.name}</p>
          <p class="tv-brand__swatch-hex">{color.hex}</p>
        </div>
      {/each}
    </div>

    <div class="tv-brand__typography">
      {#each typefaces as typeface (typeface.name)}
        <div class="tv-brand__type-sample tv-brand__type-sample--{typeface.kind}">
          <span class="tv-brand__type-glyph" style:font-family={typeface.family} aria-hidden="true">Aa</span>
          <div>
            <p class="tv-brand__type-name">{typeface.name}</p>
            <p class="tv-brand__type-usage">{typeface.usage}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</aside>
