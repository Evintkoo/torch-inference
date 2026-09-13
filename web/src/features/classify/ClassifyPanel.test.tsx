import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClassifyPanel } from "./ClassifyPanel";
import type { ClassifyEnvelope } from "./types";

function makeFile(name: string, type: string, content = "fake-image-bytes") {
  return new File([content], name, { type });
}

const envelope: ClassifyEnvelope = {
  data: {
    results: [
      [
        { label: "cat", confidence: 0.95, class_id: 0 },
        { label: "dog", confidence: 0.03, class_id: 1 },
      ],
    ],
    batch_size: 1,
  },
  meta: {
    latency_ms: 12.3,
    model_id: "classification-backend",
    postprocessing_applied: true,
    postprocess_steps: ["softmax"],
    warnings: [],
    version: "1.0.0",
    request_id: "req-1",
  },
};

describe("ClassifyPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("disables Classify until an image is loaded, then submits to /classify/batch and renders predictions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => envelope,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ClassifyPanel />);
    expect(screen.getByTestId("classify-submit")).toBeDisabled();
    expect(screen.getByTestId("classify-waiting")).toHaveTextContent(/waiting for image/i);

    const input = screen.getByTestId("classify-file-input");
    await userEvent.upload(input, makeFile("cat.png", "image/png"));

    await waitFor(() => expect(screen.getByTestId("classify-submit")).not.toBeDisabled());

    await userEvent.click(screen.getByTestId("classify-submit"));

    await waitFor(() => expect(screen.getByText("cat")).toBeInTheDocument());
    expect(screen.getByText("95.00%")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(
      "/classify/batch",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ top_k: 5, model_width: 224, model_height: 224 });
    expect(body.images).toHaveLength(1);
  });

  it("shows an error message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "images array must not be empty" }),
      }),
    );

    render(<ClassifyPanel />);
    const input = screen.getByTestId("classify-file-input");
    await userEvent.upload(input, makeFile("cat.png", "image/png"));
    await waitFor(() => expect(screen.getByTestId("classify-submit")).not.toBeDisabled());

    await userEvent.click(screen.getByTestId("classify-submit"));

    await waitFor(() =>
      expect(screen.getByTestId("classify-error")).toHaveTextContent("images array must not be empty"),
    );
  });
});
