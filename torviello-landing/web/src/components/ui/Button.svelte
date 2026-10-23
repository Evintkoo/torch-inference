<!-- Copyright (c) 2026 Torviello. -->
<!-- Sheet A1/A2: one primary action per view; ghost is the secondary pairing. -->
<script lang="ts">
  export type ButtonVariant = "primary" | "ghost";
  export type ButtonState = "idle" | "loading" | "error" | "empty";

  let {
    label,
    variant = "primary",
    state = "idle",
    onclick,
  }: {
    label: string;
    variant?: ButtonVariant;
    state?: ButtonState;
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
  {label}
</button>
