import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppLayout } from "./layout";

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("AppLayout", () => {
  const panels = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-3-line",
      group: "Tools",
      content: <div>Dashboard content</div>,
    },
    { id: "logs", label: "Logs", icon: "ri-file-list-3-line", group: "Tools", content: <div>Logs content</div> },
  ];

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("renders a nav tab per panel and shows the first panel's content by default", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ status: "healthy" }) }),
    );
    renderWithQueryClient(<AppLayout panels={panels} />);
    expect(screen.getByTestId("panel-nav-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("panel-nav-logs")).toBeInTheDocument();
    expect(screen.getByTestId("panel-content-dashboard")).toHaveTextContent("Dashboard content");
  });

  it("switches panel content when a nav tab is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ status: "healthy" }) }),
    );
    const user = userEvent.setup();
    renderWithQueryClient(<AppLayout panels={panels} />);
    await user.click(screen.getByTestId("panel-nav-logs"));
    expect(screen.getByTestId("panel-content-logs")).toHaveTextContent("Logs content");
  });
});
