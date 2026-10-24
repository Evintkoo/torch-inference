<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet A6: one line of the terminal transcript; real selectable text, not an image. -->
<script lang="ts">
  let {
    text,
    kind = "prompt",
  }: {
    text: string;
    /** "prompt" renders a $ marker; "status" renders a teal bullet marker (sheet A6). */
    kind?: "prompt" | "status";
  } = $props();
</script>

<span class="tv-terminal-line tv-terminal-line--{kind}">
  <span class="tv-terminal-line__marker" aria-hidden="true">{kind === "prompt" ? "$" : "•"}</span>
  <span class="tv-terminal-line__text">{text}</span>
</span>
