// Copyright (c) 2026 Torviello.
import { useState } from "react";

import { Button } from "./Button";
import { StatePanel } from "./StatePanel";

type Status = "loading" | "error" | "empty" | "ready";

export function InferencePanel() {
  const [status, setStatus] = useState<Status>("empty");

  const runInference = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/classify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: "demo" })
      });
      setStatus(response.ok ? "ready" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main aria-label="Inference workspace">
      <h1>Torviello Engine</h1>
      <Button state={status === "loading" ? "loading" : "idle"} onActivate={runInference}>
        Run inference
      </Button>
      <StatePanel state={status} message={status === "error" ? "Request failed" : undefined} />
    </main>
  );
}
