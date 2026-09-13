import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Prediction } from "./types";

export interface ClassifyResultsProps {
  /** One `Prediction[]` per submitted image, in submission order. */
  results: Prediction[][];
  imageNames: string[];
}

/**
 * Renders top-K label/confidence predictions per image. Mirrors
 * playground.html's `runClassify()` rendering: a "no predictions" message
 * when the backend has no model loaded (empty/falsy first result), otherwise
 * a ranked label + confidence-% list per image.
 */
export function ClassifyResults({ results, imageNames }: ClassifyResultsProps) {
  if (!results.length || !results[0]) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="classify-empty">
        (no predictions — no model loaded on this backend)
      </p>
    );
  }

  return (
    <div className="space-y-4" data-testid="classify-results">
      {results.map((preds, idx) => (
        <div key={idx}>
          {results.length > 1 && (
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              {imageNames[idx] ?? `Image ${idx + 1}`}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Label</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(preds ?? []).map((p, i) => (
                <TableRow key={p.label + i}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>{p.label}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {(p.confidence * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
