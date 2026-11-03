<!-- Copyright (c) 2026 Torviello. -->
<!-- Landing redesign (ticket 0041, LP-08): the structured footer — brand
     column, Product and Community link columns, and the copyright bar. Links
     resolve only to the designated hosts (docs.torviello.dev,
     github.com/torviello); externals carry safe rel attributes. -->
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
          href="https://docs.torviello.dev/install"
          target="_blank"
          rel="noopener noreferrer">Install</a
        >
        <a
          class="tv-footer__link"
          href="https://docs.torviello.dev"
          target="_blank"
          rel="noopener noreferrer">Docs</a
        >
      </div>
      <div class="tv-footer__column">
        <p class="tv-footer__column-title">Community</p>
        <a
          class="tv-footer__link"
          href="https://github.com/torviello"
          target="_blank"
          rel="noopener noreferrer">GitHub</a
        >
        <a
          class="tv-footer__link"
          href="https://github.com/torviello"
          target="_blank"
          rel="noopener noreferrer">Discussions</a
        >
      </div>
    </nav>
  </div>
  <div class="tv-container tv-footer__bottom">
    <p class="tv-footer__copyright">© {year} Torviello</p>
  </div>
</footer>
