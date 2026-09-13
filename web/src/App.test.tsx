import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the root app container with a shadcn Button", () => {
    render(<App />);
    expect(screen.getByTestId("app-root")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Torch Inference Engine" })).toBeInTheDocument();
  });
});
