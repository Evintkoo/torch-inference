<!-- Copyright (c) 2026 Torviello. -->
<!-- Landing redesign (ticket 0041, LP-10): the "A real session" band. The
     documented engine session — the only transcript on the page presented as
     verified behavior — in its own centered window, with the caption naming
     it as such and the docs link for evaluating visitors. -->
<script lang="ts">
  import Icon from "../ui/Icon.svelte";
  import TerminalLine from "../ui/TerminalLine.svelte";
  import { reveal } from "../../lib/reveal";

  let {
    session,
  }: {
    session: { commands: string[]; output: string };
  } = $props();
</script>

<section class="tv-session" aria-labelledby="tv-session-title" use:reveal>
  <h2 class="tv-section__title" id="tv-session-title">A real session.</h2>
  <p class="tv-section__sub">
    The window below is the documented engine session — the only transcript on
    this page presented as verified behavior. Everything else here is design
    material, labeled as such.
  </p>
  <div class="tv-session__window">
    <div class="tv-terminal-card__window">
      <div class="tv-terminal-card__chrome">
        <span class="tv-terminal-card__dots" aria-hidden="true">
          <span class="tv-terminal-card__dot"></span>
          <span class="tv-terminal-card__dot"></span>
          <span class="tv-terminal-card__dot"></span>
        </span>
        <p class="tv-terminal-card__note">Documented engine session</p>
      </div>
      <pre class="tv-session__transcript"
        >{#each session.commands as command (command)}<TerminalLine kind="prompt" text={command} />{/each}<span
            class="tv-session__output">{session.output}</span
          ></pre
      >
    </div>
  </div>
  <a
    class="tv-button tv-button--ghost"
    href="https://github.com/Evintkoo/torch-inference/tree/main/torviello-docs"
    target="_blank"
    rel="noopener noreferrer"><Icon name="book-open" />Read the docs</a
  >
</section>
