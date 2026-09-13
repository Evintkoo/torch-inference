import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppLayout } from "./layout";

describe("AppLayout", () => {
  const panels = [
    { id: "dashboard", label: "Dashboard", content: <div>Dashboard content</div> },
    { id: "logs", label: "Logs", content: <div>Logs content</div> },
  ];

  it("renders a nav tab per panel and shows the first panel's content by default", () => {
    render(<AppLayout panels={panels} />);
    expect(screen.getByTestId("panel-nav-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("panel-nav-logs")).toBeInTheDocument();
    expect(screen.getByTestId("panel-content-dashboard")).toHaveTextContent("Dashboard content");
  });

  it("switches panel content when a nav tab is clicked", async () => {
    const user = userEvent.setup();
    render(<AppLayout panels={panels} />);
    await user.click(screen.getByTestId("panel-nav-logs"));
    expect(screen.getByTestId("panel-content-logs")).toHaveTextContent("Logs content");
  });
});
