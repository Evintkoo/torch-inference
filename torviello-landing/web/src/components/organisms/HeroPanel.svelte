<!-- Copyright (c) 2026 Torviello. -->
<!-- Landing redesign O4 (ticket 0041, LP-02): the unboxed hero. One promise
     h1 (the brand name lives in the sticky nav, not the headline), the
     approved body copy, the inline DEVELOP → DEPLOY → INFER rail in normal
     flow (nothing can clip), the two actions with the factual trust line,
     and the documented engine session in a terminal window — the only
     transcript on the page presented as verified behavior. -->
<script lang="ts">
  import SectionLabel from "../ui/SectionLabel.svelte";
  import TerminalLine from "../ui/TerminalLine.svelte";
  import Icon from "../ui/Icon.svelte";
  import type { IconName } from "../../lib/icons";

  interface FlowStage {
    icon: IconName;
    title: string;
    caption: string;
  }

  let {
    eyebrow,
    promiseLine,
    accent,
    body,
    primaryLabel,
    primaryHref,
    ghostLabel,
    githubHref,
    stages,
    session,
  }: {
    eyebrow: string;
    promiseLine: string;
    accent: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    ghostLabel: string;
    githubHref: string;
    stages: FlowStage[];
    session: { commands: string[]; output: string };
  } = $props();
</script>

<section class="tv-hero">
  <div class="tv-hero__copy">
    <SectionLabel label={eyebrow} accent />
    <h1 class="tv-hero__heading">
      <span class="tv-hero__line">{promiseLine} <em class="tv-hero__accent">{accent}</em></span>
    </h1>
    <p class="tv-hero__body-copy">{body}</p>
    <ol class="tv-hero__rail" aria-label="Develop, deploy, infer">
      {#each stages as stage, index (stage.title)}
        {#if index > 0}
          <li class="tv-hero__rail-connector" aria-hidden="true"></li>
        {/if}
        <li class="tv-hero__stage">
          <span class="tv-hero__stage-icon" aria-hidden="true"><Icon name={stage.icon} /></span>
          <p class="tv-hero__stage-title">{stage.title}</p>
          <p class="tv-hero__stage-caption">{stage.caption}</p>
        </li>
      {/each}
    </ol>
    <div class="tv-hero__actions">
      <a class="tv-button tv-button--primary" href={primaryHref}>
        <Icon name="arrow-right" />{primaryLabel}</a
      >
      <a
        class="tv-button tv-button--ghost"
        href={githubHref}
        target="_blank"
        rel="noopener noreferrer"><Icon name="github" />{ghostLabel}</a
      >
    </div>
    <p class="tv-hero__trust">MIT licensed · Runs on your machine</p>
  </div>
  <div class="tv-hero__terminal">
    <div class="tv-terminal-card__window">
      <div class="tv-terminal-card__chrome">
        <span class="tv-terminal-card__dots" aria-hidden="true">
          <span class="tv-terminal-card__dot"></span>
          <span class="tv-terminal-card__dot"></span>
          <span class="tv-terminal-card__dot"></span>
        </span>
        <p class="tv-terminal-card__note">Documented engine session</p>
      </div>
      <pre class="tv-hero__session"
        >{#each session.commands as command (command)}<TerminalLine kind="prompt" text={command} />{/each}<span
            class="tv-hero__session-output">{session.output}</span
          ></pre
      >
    </div>
  </div>
</section>
