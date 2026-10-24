<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet A1/A2: one primary action per view; ghost is the secondary pairing.
     House rule 10: the icon pairs with the label and stays decorative. -->
<script lang="ts">
  import Icon from "./Icon.svelte";
  import type { IconName } from "../../lib/icons";

  export type ButtonVariant = "primary" | "ghost";
  export type ButtonState = "idle" | "loading" | "error" | "empty";

  let {
    label,
    variant = "primary",
    state = "idle",
    icon,
    onclick,
  }: {
    label: string;
    variant?: ButtonVariant;
    state?: ButtonState;
    icon?: IconName;
    onclick?: () => void;
  } = $props();
</script>

<button
  type="button"
  class="tv-button tv-button--{variant}"
  aria-busy={state === "loading"}
  aria-disabled={state === "loading" ? "true" : "false"}
  data-state={state}
  {onclick}
>
  {#if icon}<Icon name={icon} />{/if}{label}
</button>
