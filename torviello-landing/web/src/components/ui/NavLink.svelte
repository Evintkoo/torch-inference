<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet A3: top navigation item; focus and current-section states are token-driven. -->
<script lang="ts">
  let {
    label,
    current = false,
    href,
    target,
    rel,
  }: {
    label: string;
    /** Marks the section the visitor is currently viewing (sheet A3). */
    current?: boolean;
    href: string;
    target?: string;
    rel?: string;
  } = $props();
</script>

<a class="tv-navlink" aria-current={current ? "true" : undefined} {href} {target} {rel}>
  {label}
</a>
