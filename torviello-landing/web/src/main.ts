// Copyright (c) 2026 Torviello.
// Landing entry: mounts the slice-one app shell and the token stylesheets.
// Page assembly (organisms, template, page) lands with its own design sheets.
import { mount } from "svelte";

import "./styles/tokens.css";
import "./styles/atoms.css";
import "./styles/molecules.css";
import App from "./App.svelte";

const app = mount(App, {
  target: document.getElementById("app") as HTMLElement,
});

export default app;
