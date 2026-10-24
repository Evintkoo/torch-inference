// Copyright (c) 2026 Torviello.
// Landing entry: local webfonts (Inter + JetBrains Mono per the token
// contract), the token stylesheets, and the assembled landing page.
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import { mount } from "svelte";

import "./styles/tokens.css";
import "./styles/atoms.css";
import "./styles/molecules.css";
import "./styles/organisms.css";
import "./styles/page.css";
import faviconUrl from "@torviello/design/brand/favicon.svg?url";
import App from "./App.svelte";

// GOV-12.07: the favicon is owned by torviello-design and imported here.
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/svg+xml";
favicon.href = faviconUrl;
document.head.appendChild(favicon);

const app = mount(App, {
  target: document.getElementById("app") as HTMLElement,
});

export default app;
