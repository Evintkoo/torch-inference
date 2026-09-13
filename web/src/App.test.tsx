import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the root app container", () => {
    render(<App />);
    expect(screen.getByTestId("app-root")).toBeInTheDocument();
  });
});
