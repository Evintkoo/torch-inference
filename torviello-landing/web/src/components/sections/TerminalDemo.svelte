<!-- Copyright (c) 2026 Torviello. -->
<!-- F-07: the terminal demo — a decorative window frame around the documented
     engine session. The body is a preformatted block (sheet A6); every line
     is a real text node via the A6 atom; the status fade-in is CSS-only and
     static under reduced motion. -->
<script lang="ts">
  import TerminalLine from "../ui/TerminalLine.svelte";

  interface TerminalLineInput {
    kind: "prompt" | "status";
    text: string;
  }

  let { lines }: { lines: TerminalLineInput[] } = $props();
</script>

<div class="tv-terminal">
  <div class="tv-terminal__chrome" aria-hidden="true">
    <span class="tv-terminal__dot"></span>
    <span class="tv-terminal__dot"></span>
    <span class="tv-terminal__dot"></span>
  </div>
  <pre class="tv-terminal__body">{#each lines as line (line.text)}<TerminalLine kind={line.kind} text={line.text} />{/each}</pre>
</div>
