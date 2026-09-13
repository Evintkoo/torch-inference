import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ImageUploader } from "./ImageUploader";
import type { LoadedImage } from "./types";

function makeFile(name: string, type: string, content = "fake-image-bytes") {
  return new File([content], name, { type });
}

describe("ImageUploader", () => {
  it("reads a single selected file to base64 and shows a preview", async () => {
    const onImagesLoaded = vi.fn<(images: LoadedImage[]) => void>();
    render(<ImageUploader images={[]} onImagesLoaded={onImagesLoaded} />);

    const input = screen.getByTestId("classify-file-input");
    const file = makeFile("cat.png", "image/png");
    await userEvent.upload(input, file);

    await waitFor(() => expect(onImagesLoaded).toHaveBeenCalledTimes(1));
    const [loaded] = onImagesLoaded.mock.calls[0][0];
    expect(loaded.name).toBe("cat.png");
    expect(loaded.base64.length).toBeGreaterThan(0);
    expect(loaded.dataUrl.startsWith("data:")).toBe(true);
  });

  it("reads multiple selected files and reports each of them", async () => {
    const onImagesLoaded = vi.fn<(images: LoadedImage[]) => void>();
    render(<ImageUploader images={[]} onImagesLoaded={onImagesLoaded} />);

    const input = screen.getByTestId("classify-file-input");
    await userEvent.upload(input, [makeFile("a.jpg", "image/jpeg"), makeFile("b.png", "image/png")]);

    await waitFor(() => expect(onImagesLoaded).toHaveBeenCalledTimes(1));
    const loaded = onImagesLoaded.mock.calls[0][0];
    expect(loaded.map((img) => img.name)).toEqual(["a.jpg", "b.png"]);
  });

  it("shows a single large preview only when exactly one image is loaded", () => {
    const single: LoadedImage[] = [{ name: "a.png", dataUrl: "data:image/png;base64,AAA", base64: "AAA" }];
    render(<ImageUploader images={single} onImagesLoaded={vi.fn()} />);
    expect(screen.getByTestId("classify-preview")).toBeInTheDocument();
  });

  it("shows an image count instead of a preview when multiple images are loaded", () => {
    const multi: LoadedImage[] = [
      { name: "a.png", dataUrl: "data:image/png;base64,AAA", base64: "AAA" },
      { name: "b.png", dataUrl: "data:image/png;base64,BBB", base64: "BBB" },
    ];
    render(<ImageUploader images={multi} onImagesLoaded={vi.fn()} />);
    expect(screen.queryByTestId("classify-preview")).not.toBeInTheDocument();
    expect(screen.getByTestId("classify-preview-count")).toHaveTextContent("2 images loaded");
  });
});
