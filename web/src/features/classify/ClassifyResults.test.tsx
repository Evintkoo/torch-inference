import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClassifyResults } from "./ClassifyResults";
import type { Prediction } from "./types";

describe("ClassifyResults", () => {
  it("shows a 'no predictions' message when results is empty", () => {
    render(<ClassifyResults results={[]} imageNames={[]} />);
    expect(screen.getByTestId("classify-empty")).toBeInTheDocument();
  });

  it("shows a 'no predictions' message when the first result is falsy (no model loaded)", () => {
    render(<ClassifyResults results={[undefined as unknown as Prediction[]]} imageNames={["a.png"]} />);
    expect(screen.getByTestId("classify-empty")).toBeInTheDocument();
  });

  it("renders ranked label + confidence-% predictions for a single image", () => {
    const results: Prediction[][] = [
      [
        { label: "cat", confidence: 0.951, class_id: 0 },
        { label: "dog", confidence: 0.032, class_id: 1 },
      ],
    ];
    render(<ClassifyResults results={results} imageNames={["cat.png"]} />);
    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText("95.10%")).toBeInTheDocument();
    expect(screen.getByText("dog")).toBeInTheDocument();
    expect(screen.getByText("3.20%")).toBeInTheDocument();
  });

  it("labels each image's predictions when there is more than one image", () => {
    const results: Prediction[][] = [
      [{ label: "cat", confidence: 0.9, class_id: 0 }],
      [{ label: "dog", confidence: 0.8, class_id: 1 }],
    ];
    render(<ClassifyResults results={results} imageNames={["a.png", "b.png"]} />);
    expect(screen.getByText("a.png")).toBeInTheDocument();
    expect(screen.getByText("b.png")).toBeInTheDocument();
  });
});
