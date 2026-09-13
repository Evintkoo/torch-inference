import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Panel {
  id: string;
  label: string;
  content: ReactNode;
}

export function AppLayout({ panels }: { panels: Panel[] }) {
  if (panels.length === 0) {
    throw new Error("AppLayout requires at least one panel");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold">Torch Inference Engine</h1>
      </header>
      <Tabs defaultValue={panels[0].id} className="p-6">
        <TabsList>
          {panels.map((panel) => (
            <TabsTrigger key={panel.id} value={panel.id} data-testid={`panel-nav-${panel.id}`}>
              {panel.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {panels.map((panel) => (
          <TabsContent key={panel.id} value={panel.id} data-testid={`panel-content-${panel.id}`}>
            {panel.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
