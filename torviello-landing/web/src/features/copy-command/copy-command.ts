// Copyright (c) 2026 Torviello.
// LP-06 copy affordance (feature layer, ticket 0048): write text to the
// clipboard and report whether it really landed. Callers show "Copied" only
// on true. An absent API, a denied permission, or a rejected write is false,
// so there is never a fake success state.
export type ClipboardWriter = { writeText(text: string): Promise<void> };

export async function copyText(text: string, clipboard: ClipboardWriter | undefined): Promise<boolean> {
  if (!clipboard) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
