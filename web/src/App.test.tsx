import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the Dashboard nav tab by default", () => {
    render(<App />);
    expect(screen.getByTestId("panel-nav-dashboard")).toBeInTheDocument();
  });
});
