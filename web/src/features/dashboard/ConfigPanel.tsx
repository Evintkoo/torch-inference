import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api-client";

type ConfigValue = string | number | boolean | null;
type ConfigSection = Record<string, ConfigValue>;
type ConfigResponse = Record<string, ConfigSection>;

function formatValue(value: ConfigValue): string {
  if (value === null) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function labelFor(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Read-only view of the server's running configuration — `GET /system/config`
 * — one card per top-level section, generically rendered (no hardcoded
 * per-field metadata like playground.html's old `CFG_META` table needed;
 * the backend's section/key shape is descriptive enough on its own).
 */
export function ConfigPanel() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => apiGet<ConfigResponse>("/system/config"),
    refetchInterval: 30_000,
  });
  const [copied, setCopied] = useState(false);

  async function copyConfig() {
    if (!data) return;
    const text = JSON.stringify(data, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable/blocked (non-secure origin, unfocused
      // document) — nothing sensible to fall back to silently, so just
      // leave the button state alone; the user can still read the cards.
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-semibold">Config</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Running configuration from <code className="text-xs">GET /system/config</code>.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="config-copy-btn"
          disabled={!data}
          onClick={copyConfig}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      {isPending && <Skeleton className="h-24 w-full" />}
      {isError && (
        <p className="text-sm text-destructive" data-testid="config-error">
          Failed to load configuration.
        </p>
      )}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2" data-testid="config-sections">
          {Object.entries(data).map(([section, fields]) => (
            <Card key={section}>
              <CardHeader>
                <CardTitle className="capitalize">{section}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(fields).map(([key, value]) => (
                    <div key={key} className="col-span-2 grid grid-cols-2">
                      <dt className="text-muted-foreground">{labelFor(key)}</dt>
                      <dd className="font-mono">{formatValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
