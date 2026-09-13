import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiError, apiPost } from "@/lib/api-client";
import { ClassifyOptions, type ClassifyOptionsValue } from "./ClassifyOptions";
import { ClassifyResults } from "./ClassifyResults";
import { ImageUploader } from "./ImageUploader";
import type { ClassifyEnvelope, ClassifyRequest, LoadedImage } from "./types";

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as { error?: string } | null;
    return body?.error ?? err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

/**
 * Image classification panel — parity with playground.html's "Classify"
 * File/Batch pane: upload/drag-drop one or more images, POST them (base64,
 * one JSON request) to `/classify/batch`, and render ranked label +
 * confidence predictions per image.
 */
export function ClassifyPanel() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [options, setOptions] = useState<ClassifyOptionsValue>({ topK: 5, width: 224, height: 224 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ClassifyEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  function handleImagesLoaded(loaded: LoadedImage[]) {
    setImages(loaded);
    setResult(null);
    setError(null);
    setElapsedMs(null);
  }

  async function runClassify() {
    if (images.length === 0) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const body: ClassifyRequest = {
      images: images.map((img) => img.base64),
      top_k: options.topK,
      model_width: options.width,
      model_height: options.height,
    };
    const t0 = performance.now();
    try {
      const envelope = await apiPost<ClassifyEnvelope>("/classify/batch", body);
      setResult(envelope);
      setElapsedMs(performance.now() - t0);
    } catch (err) {
      setResult(null);
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader images={images} onImagesLoaded={handleImagesLoaded} disabled={isSubmitting} />
          <ClassifyOptions value={options} onChange={setOptions} disabled={isSubmitting} />
          <Button
            data-testid="classify-submit"
            disabled={images.length === 0 || isSubmitting}
            onClick={runClassify}
          >
            {isSubmitting ? "Classifying…" : "Classify"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Predictions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!result && !error && (
            <p className="text-sm text-muted-foreground" data-testid="classify-waiting">
              {images.length === 0 ? "waiting for image…" : `${images.length} image(s) loaded — click Classify.`}
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive" data-testid="classify-error">
              Error: {error}
            </p>
          )}
          {result && (
            <>
              <ClassifyResults
                results={result.data.results}
                imageNames={images.map((img) => img.name)}
              />
              {elapsedMs !== null && (
                <p className="text-xs text-muted-foreground" data-testid="classify-metrics">
                  ⏱ {elapsedMs.toFixed(0)}ms
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
