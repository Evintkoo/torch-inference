<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet M8 (slice 3, ticket 0038): the terminal execution showcase card. The
     pip/serve commands are the board's design example — a visible mono label
     marks the card ILLUSTRATIVE so nothing reads as verified engine behavior
     (BC-06; the F-07 amendment on ticket 0038). Real selectable text, window
     chrome, and a four-step status rail with an orange connector line. -->
<script lang="ts">
  import TerminalLine from "../ui/TerminalLine.svelte";

  let {
    commands,
    steps,
  }: {
    commands: string[];
    steps: string[];
  } = $props();
</script>

<article class="tv-showcase-card tv-showcase-card--terminal">
  <div class="tv-terminal-card">
    <div class="tv-terminal-card__window">
      <div class="tv-terminal-card__chrome">
        <span class="tv-terminal-card__dots" aria-hidden="true">
          <span class="tv-terminal-card__dot"></span>
          <span class="tv-terminal-card__dot"></span>
          <span class="tv-terminal-card__dot"></span>
        </span>
        <p class="tv-terminal-card__note">Illustrative example</p>
      </div>
      <pre class="tv-terminal-card__transcript"
        >{#each commands as command (command)}<TerminalLine kind="prompt" text={command} />{/each}</pre
      >
      <ol class="tv-terminal-card__rail">
        {#each steps as step, index (step)}
          <li class="tv-terminal-card__step" data-step={index + 1}>
            <span class="tv-terminal-card__marker" aria-hidden="true"></span>
            <span class="tv-terminal-card__step-text">{step}</span>
          </li>
        {/each}
      </ol>
    </div>
  </div>
</article>
