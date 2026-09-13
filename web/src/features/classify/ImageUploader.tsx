import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { LoadedImage } from "./types";

function readAsLoadedImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      resolve({ name: file.name, dataUrl, base64 });
    };
    reader.onerror = () => reject(reader.error ?? new Error("failed to read file"));
    reader.readAsDataURL(file);
  });
}

export interface ImageUploaderProps {
  images: LoadedImage[];
  onImagesLoaded: (images: LoadedImage[]) => void;
  disabled?: boolean;
}

/**
 * Drag/drop + click-to-upload image picker. Mirrors playground.html's
 * `#dropzone` / `handleFile()` / `handleDrop()`: reads every selected file
 * as a data URL client-side (via FileReader), keeps the base64 payload for
 * the `/classify/batch` request body, and shows a single large preview when
 * exactly one image is loaded.
 */
export function ImageUploader({ images, onImagesLoaded, disabled }: ImageUploaderProps) {
  const [isOver, setIsOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) {
        return;
      }
      Promise.all(Array.from(fileList).map(readAsLoadedImage))
        .then(onImagesLoaded)
        .catch(() => {
          // A file failed to read (corrupt/unsupported); leave the previous
          // selection in place rather than clobbering it with a partial one.
        });
    },
    [onImagesLoaded],
  );

  return (
    <div className="space-y-3">
      <label
        htmlFor="classify-file-input"
        data-testid="classify-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          loadFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border px-4 py-8 text-center text-sm transition-colors",
          isOver ? "border-primary bg-accent" : "hover:bg-accent/50",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <div>Click to upload or drag &amp; drop</div>
        <div className="text-xs text-muted-foreground">JPEG / PNG</div>
        <input
          ref={inputRef}
          id="classify-file-input"
          data-testid="classify-file-input"
          type="file"
          accept="image/jpeg,image/png"
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(e) => loadFiles(e.target.files)}
        />
      </label>

      {images.length === 1 && (
        <img
          src={images[0].dataUrl}
          alt="preview"
          data-testid="classify-preview"
          className="max-h-48 rounded-md border border-border object-contain"
        />
      )}
      {images.length > 1 && (
        <p className="text-sm text-muted-foreground" data-testid="classify-preview-count">
          {images.length} images loaded
        </p>
      )}
    </div>
  );
}
