<!-- Copyright (c) 2026 Torviello. -->
<!-- Landing redesign (ticket 0041, LP-08 second amendment): the footer —
     brand block, Product / Resources / Community columns, an oversized
     decorative wordmark, and the legal bar. Every link resolves to a real,
     reachable location (the public GitHub repository and its docs tree per
     the owner's URL-fix direction, ticket 0047); externals carry safe rel
     attributes. -->
<script lang="ts">
  let { id }: { id?: string } = $props();

  const year = new Date().getFullYear();
</script>

<footer class="tv-footer" {id}>
  <div class="tv-container tv-footer__layout">
    <div class="tv-footer__brand">
      <a class="tv-footer__wordmark" href="#top" aria-label="Torviello home">torviello</a>
      <p class="tv-footer__tagline">The execution layer for AI.</p>
    </div>
    <nav class="tv-footer__columns" aria-label="Footer">
      <div class="tv-footer__column">
        <p class="tv-footer__column-title">Product</p>
        <a
          class="tv-footer__link"
          href="https://github.com/Evintkoo/torch-inference/blob/main/torviello-docs/docs/INSTALL.md"
          target="_blank"
          rel="noopener noreferrer">Install</a
        >
        <a
          class="tv-footer__link"
          href="https://github.com/Evintkoo/torch-inference/tree/main/torviello-docs"
          target="_blank"
          rel="noopener noreferrer">Docs</a
        >
      </div>
      <div class="tv-footer__column">
        <p class="tv-footer__column-title">Resources</p>
        <a
          class="tv-footer__link"
          href="https://github.com/Evintkoo/torch-inference/tree/main/torviello-docs"
          target="_blank"
          rel="noopener noreferrer">Documentation</a
        >
        <a
          class="tv-footer__link"
          href="https://github.com/Evintkoo/torch-inference/blob/main/torviello-engine/contracts/openapi.yaml"
          target="_blank"
          rel="noopener noreferrer">API Reference</a
        >
      </div>
      <div class="tv-footer__column">
        <p class="tv-footer__column-title">Community</p>
        <a
          class="tv-footer__link"
          href="https://github.com/Evintkoo/torch-inference"
          target="_blank"
          rel="noopener noreferrer">GitHub</a
        >
        <a
          class="tv-footer__link"
          href="https://github.com/Evintkoo/torch-inference/issues"
          target="_blank"
          rel="noopener noreferrer">Issues</a
        >
        <a
          class="tv-footer__link"
          href="https://github.com/Evintkoo/torch-inference"
          target="_blank"
          rel="noopener noreferrer">Contributing</a
        >
      </div>
    </nav>
  </div>
  <div class="tv-container tv-footer__mega" aria-hidden="true">torviello</div>
  <div class="tv-container tv-footer__bottom">
    <p class="tv-footer__copyright">© {year} Torviello</p>
    <p class="tv-footer__legal">MIT licensed</p>
  </div>
</footer>
