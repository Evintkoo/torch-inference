// Copyright (c) 2026 Torviello.
// LP-06 copy affordance (ticket 0041 amendment; feature layer, ticket 0048):
// the chip confirms "Copied" only when the clipboard write succeeded.
import { expect, test } from "bun:test";

import { copyText } from "./copy-command";

test("a successful write reports success and writes the exact text", async () => {
  const written: string[] = [];
  const ok = await copyText("pip install torviello", {
    writeText: async (text: string) => {
      written.push(text);
    },
  });
  expect(ok).toBe(true);
  expect(written).toEqual(["pip install torviello"]);
});

test("a denied write reports failure", async () => {
  const ok = await copyText("x", {
    writeText: async () => {
      throw new DOMException("denied", "NotAllowedError");
    },
  });
  expect(ok).toBe(false);
});

// 2026-11-10 defect: `navigator.clipboard?.writeText(...)` resolved to
// undefined when the API was absent, and the chip showed a fake "Copied".
test("a missing clipboard API reports failure, not a fake success", async () => {
  expect(await copyText("x", undefined)).toBe(false);
});
