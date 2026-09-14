import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiError, apiPost } from "@/lib/api-client";
import { ClassifyOptions, type ClassifyOptionsValue } from "./ClassifyOptions";
import { ClassifyResults } from "./ClassifyResults";
import { ImageUploader } from "./ImageUploader";
import type { ClassifyEnvelope, ClassifyRequest, LoadedImage, Prediction } from "./types";

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
 * confidence predictions per image. The camera path bypasses this REST call
 * entirely — it streams over `GET /ws/classify` (see ImageUploader.tsx) and
 * reports predictions straight into the same results state via
 * `handleCameraResult`.
 */
export function ClassifyPanel() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [options, setOptions] = useState<ClassifyOptionsValue>({ topK: 5, width: 224, height: 224 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<Prediction[][] | null>(null);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  // The still frame from a "Take Photo" capture — shown next to the
  // Predictions so there's a record of what was actually classified (Live
  // Cam already has its own video feed on screen and never sets this).
  const [cameraFrameUrl, setCameraFrameUrl] = useState<string | null>(null);

  function handleImagesLoaded(loaded: LoadedImage[]) {
    setImages(loaded);
    setResults(null);
    setImageNames([]);
    setError(null);
    setElapsedMs(null);
    setCameraFrameUrl(null);
  }

  function handleCameraResult(predictions: Prediction[], ms: number) {
    setError(null);
    setResults([predictions]);
    setImageNames(["Camera"]);
    setElapsedMs(ms);
  }

  async function classifyImages(toClassify: LoadedImage[]) {
    if (toClassify.length === 0) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const body: ClassifyRequest = {
      images: toClassify.map((img) => img.base64),
      top_k: options.topK,
      model_width: options.width,
      model_height: options.height,
    };
    const t0 = performance.now();
    try {
      const envelope = await apiPost<ClassifyEnvelope>("/classify/batch", body);
      setResults(envelope.data.results);
      setImageNames(toClassify.map((img) => img.name));
      setElapsedMs(performance.now() - t0);
    } catch (err) {
      setResults(null);
      setImageNames([]);
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function runClassify() {
    void classifyImages(images);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2" data-testid="classify-panel-layout">
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader
            images={images}
            onImagesLoaded={handleImagesLoaded}
            disabled={isSubmitting}
            classifyConfig={options}
            onCameraResult={handleCameraResult}
            onCameraFrame={setCameraFrameUrl}
          />
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
          {cameraFrameUrl && (
            <img
              src={cameraFrameUrl}
              alt="Captured photo"
              data-testid="classify-camera-frame"
              className="max-h-48 rounded-md border border-border object-contain"
            />
          )}
          {!results && !error && (
            <p className="text-sm text-muted-foreground" data-testid="classify-waiting">
              {images.length === 0 ? "waiting for image…" : `${images.length} image(s) loaded — click Classify.`}
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive" data-testid="classify-error">
              Error: {error}
            </p>
          )}
          {results && (
            <>
              <ClassifyResults results={results} imageNames={imageNames} />
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
