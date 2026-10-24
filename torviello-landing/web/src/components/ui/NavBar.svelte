<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet M1: brand anchor + fixed-order nav links + paired actions; menu button
     toggles the link list below 768px with aria-expanded. The A5 logo lockup is
     deferred pending the brand SVG asset, so the wordmark carries the name. -->
<script lang="ts">
  import Icon from "./Icon.svelte";
  import Logo from "./Logo.svelte";
  import NavLink from "./NavLink.svelte";

  interface NavBarLink {
    label: string;
    href: string;
    /** External links open in a new tab with safe rel attributes (F-03). */
    external?: boolean;
  }

  let {
    links,
    currentHref = "",
    getStartedHref,
    githubHref,
    defaultMenuOpen = false,
  }: {
    links: NavBarLink[];
    /** The href of the section the visitor is currently viewing. */
    currentHref?: string;
    /** The install route (F-02) — the single primary action of the bar. */
    getStartedHref: string;
    /** The GitHub repository (F-03). */
    githubHref: string;
    /** Initial menu state for deterministic server renders and tests. */
    defaultMenuOpen?: boolean;
  } = $props();

  // Initial menu state by design: defaultMenuOpen seeds the toggle like a
  // useState initializer; later changes come from the button, not the prop.
  // svelte-ignore state_referenced_locally
  let open = $state(defaultMenuOpen);
</script>

<header class="tv-navbar">
  <div class="tv-navbar__inner">
    <Logo />
    <button
      type="button"
      class="tv-navbar__menu"
      aria-expanded={open}
      aria-controls="tv-navbar-links"
      onclick={() => (open = !open)}
    >
      Menu
    </button>
    <nav
      id="tv-navbar-links"
      class="tv-navbar__nav"
      aria-label="Main"
      data-menu={open ? "open" : "closed"}
    >
      <ul class="tv-navbar__list">
        {#each links as link (link.href)}
          <li>
            <NavLink
              label={link.label}
              href={link.href}
              current={link.href === currentHref}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
            />
          </li>
        {/each}
      </ul>
      <div class="tv-navbar__actions">
        <a
          class="tv-button tv-button--ghost"
          href={githubHref}
          target="_blank"
          rel="noopener noreferrer"><Icon name="github" />GitHub</a
        >
        <a class="tv-button tv-button--primary" href={getStartedHref}>
          <Icon name="arrow-right" />Get Started</a
        >
      </div>
    </nav>
  </div>
</header>
