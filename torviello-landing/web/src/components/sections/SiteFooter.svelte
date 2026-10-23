<!-- Copyright (c) 2026 Torviello. -->
<!-- Footer slot of template T1. The sheets define the slot but not the copy,
     so this stays minimal: brand line, the unit tagline, repository and docs
     links, and the copyright. -->
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
    <nav class="tv-footer__links" aria-label="Footer">
      <a
        class="tv-footer__link"
        href="https://github.com/torviello"
        target="_blank"
        rel="noopener noreferrer">GitHub</a
      >
      <a class="tv-footer__link" href="https://docs.torviello.dev" target="_blank" rel="noopener noreferrer">
        Docs
      </a>
    </nav>
    <p class="tv-footer__copyright">© {year} Torviello</p>
  </div>
</footer>
