import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiGet } from "@/lib/api-client";

export interface Panel {
  id: string;
  label: string;
  /** Remixicon class, e.g. "ri-dashboard-3-line" (remixicon is loaded globally via index.html). */
  icon: string;
  /** Sidebar section this panel is grouped under, e.g. "Playground" | "Tools" | "Reference". */
  group: string;
  content: ReactNode;
}

interface HealthCheck {
  status: string;
}

const THEME_KEY = "theme";
const SIDEBAR_KEY = "sidebar-collapsed";
const GROUPS_KEY = "sidebar-collapsed-groups";

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="flex h-8 w-8 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      aria-label="Toggle dark/light mode"
      title="Toggle dark/light mode"
      data-testid="theme-toggle"
    >
      <i className={theme === "light" ? "ri-moon-line" : "ri-sun-line"} aria-hidden="true" />
    </button>
  );
}

function HealthStatusBadge() {
  const { data, isError } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiGet<HealthCheck>("/health"),
    refetchInterval: 10_000,
  });

  const label = isError ? "unreachable" : (data?.status ?? "checking");
  const dotClass = isError
    ? "bg-red shadow-[0_0_6px_var(--color-red)]"
    : data?.status === "healthy"
      ? "bg-green shadow-[0_0_6px_var(--color-green)]"
      : "bg-text-dim";

  return (
    <span
      className="inline-flex items-center gap-[5px] border border-border bg-card px-[9px] py-[3px] text-xs text-foreground"
      data-testid="health-badge"
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export function AppLayout({ panels }: { panels: Panel[] }) {
  if (panels.length === 0) {
    throw new Error("AppLayout requires at least one panel");
  }

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  // Per-group expand/collapse ("sidebar dropdown") — independent of the
  // whole-sidebar icon-only collapse above.
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(GROUPS_KEY) ?? "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(collapsedGroups));
  }, [collapsedGroups]);

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  const groups: Array<{ label: string; panels: Panel[] }> = [];
  for (const panel of panels) {
    let group = groups.find((g) => g.label === panel.group);
    if (!group) {
      group = { label: panel.group, panels: [] };
      groups.push(group);
    }
    group.panels.push(panel);
  }

  return (
    <Tabs
      defaultValue={panels[0].id}
      orientation="vertical"
      className={`grid h-screen grid-rows-[52px_minmax(0,1fr)] gap-0 overflow-hidden transition-[grid-template-columns] duration-150 ${collapsed ? "grid-cols-[56px_1fr]" : "grid-cols-[220px_1fr]"}`}
    >
      <header className="col-span-2 row-start-1 flex items-center gap-3 border-b border-border bg-card px-5">
        <button
          type="button"
          className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-testid="sidebar-toggle"
        >
          <i className="ri-menu-line" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center bg-[#0D0E0F] text-[11px] font-bold tracking-wide text-white">
            TIE
          </div>
          {!collapsed && (
            <>
              <span className="font-serif text-[15px] font-bold tracking-tight">Torch Inference</span>
              <span className="text-xs text-muted-foreground">Engine</span>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <HealthStatusBadge />
        </div>
      </header>

      <TabsList
        className={`group-data-[orientation=vertical]/tabs:h-full col-start-1 row-start-2 h-full w-full flex-col items-stretch justify-start gap-5 overflow-y-auto overflow-x-hidden rounded-none border-r border-border bg-card py-4 shadow-[2px_0_20px_rgba(0,0,0,0.07)] ${collapsed ? "px-2" : "px-4"}`}
      >
        {groups.map((group) => {
          const groupCollapsed = !collapsed && collapsedGroups[group.label];
          return (
            <div key={group.label} className="flex flex-col gap-0.5">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  data-testid={`sidebar-group-toggle-${group.label.toLowerCase()}`}
                  aria-expanded={!groupCollapsed}
                  className="flex w-full items-center justify-between px-2 pb-2 text-[10px] font-semibold tracking-wider text-text-dim uppercase hover:text-foreground"
                >
                  {group.label}
                  <i
                    className={groupCollapsed ? "ri-arrow-right-s-line" : "ri-arrow-down-s-line"}
                    aria-hidden="true"
                  />
                </button>
              )}
              {!groupCollapsed &&
                group.panels.map((panel) => (
                  <TabsTrigger
                    key={panel.id}
                    value={panel.id}
                    data-testid={`panel-nav-${panel.id}`}
                    title={collapsed ? panel.label : undefined}
                    className={`h-auto w-full gap-[9px] rounded-none border-0 py-[7px] text-[13px] font-medium text-muted-foreground shadow-none after:hidden data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-none ${collapsed ? "justify-center px-0" : "justify-start px-2"}`}
                  >
                    <i className={`${panel.icon} w-[18px] shrink-0 text-center text-base`} aria-hidden="true" />
                    {!collapsed && panel.label}
                  </TabsTrigger>
                ))}
            </div>
          );
        })}
      </TabsList>

      <main className="col-start-2 row-start-2 flex min-h-0 flex-col overflow-y-auto p-7">
        {panels.map((panel) => (
          <TabsContent key={panel.id} value={panel.id} data-testid={`panel-content-${panel.id}`}>
            {panel.content}
          </TabsContent>
        ))}
      </main>
    </Tabs>
  );
}
