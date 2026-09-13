import { useEffect, useRef, useState } from "react";
import {
  loadScalarScript,
  scalarConfiguration,
  type ScalarApiReferenceInstance,
} from "./scalar-config";

/// Interactive OpenAPI reference, mounting Scalar's standalone bundle into a
/// ref'd div — the React equivalent of playground.html's `renderApiRef()` /
/// `#panel-endpoints`. No new backend endpoints: the bundle is self-hosted at
/// `/assets/scalar.js` and reads the spec from `/openapi.json`, both served
/// unchanged from `src/api/assets.rs` / `src/api/openapi.rs`.
export function ApiReferencePanel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    let cancelled = false;
    let instance: ScalarApiReferenceInstance | null = null;

    loadScalarScript()
      .then(() => {
        if (cancelled) {
          return;
        }
        if (!window.Scalar?.createApiReference) {
          throw new Error("Scalar bundle loaded but window.Scalar.createApiReference is missing");
        }
        instance = window.Scalar.createApiReference(mount, scalarConfiguration());
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : String(err));
      });

    // Mirrors playground.html's `updateScalarTheme()`, which it called from
    // its theme toggle. This app doesn't have a theme toggle yet, so watch
    // the `data-theme` attribute directly instead of depending on being
    // wired up from wherever that toggle eventually lands.
    const observer = new MutationObserver(() => {
      instance?.updateConfiguration?.(scalarConfiguration());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      instance?.destroy?.();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-medium">API Reference</h2>
        <p className="text-sm text-muted-foreground">
          Interactive OpenAPI reference — every route this server exposes, with request/response
          schemas and copy-ready examples. Powered by{" "}
          <a
            href="https://github.com/scalar/scalar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            Scalar
          </a>
          , served from <code className="font-mono">/openapi.json</code>.
        </p>
      </div>
      {error && (
        <p className="text-sm text-muted-foreground" data-testid="api-reference-error">
          Could not load the API reference (offline, and no self-hosted copy cached yet): {error}
        </p>
      )}
      <div
        ref={mountRef}
        id="scalar-api-reference"
        data-testid="api-reference-mount"
        className="min-h-[70vh] border-t border-border"
      />
    </div>
  );
}
