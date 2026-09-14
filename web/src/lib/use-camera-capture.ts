import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared "open camera → preview → grab a frame" state machine, used by the
 * Classify and Detect image inputs. Frame capture returns a raw JPEG `Blob`
 * (`captureBlob`) rather than funneling through an `onCapture(file)`
 * callback — both callers now stream frames straight to a `/ws/detect` /
 * `/ws/classify` WebSocket (see DetectFileUpload.tsx / ImageUploader.tsx),
 * so there's no "load this into app state as a File" step to hook into
 * anymore; a plain Blob is all a binary WS frame needs.
 */
export function useCameraCapture() {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  // Release the camera on unmount so the capture LED doesn't stay on.
  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access requires a secure context (https:// or localhost).");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setActive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Camera error");
    }
  }, []);

  // The <video> element only mounts once `active` flips true, so the ref
  // isn't attached yet at the point `start()` calls setActive — attaching
  // the stream here (after the element has actually committed) instead of
  // inline in start() is what makes the preview show anything at all.
  useEffect(() => {
    if (!active || !videoRef.current || !streamRef.current) {
      return;
    }
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    void video.play();
  }, [active]);

  /**
   * Grab the current video frame as a JPEG Blob (null if the video has no
   * frames yet — e.g. called in the brief window right after `start()`
   * resolves but before the stream has actually rendered a frame). JPEG
   * over PNG: frames are sent one after another over a WebSocket, and JPEG
   * is far smaller per frame for photographic camera input.
   */
  const captureBlob = useCallback((quality = 0.85): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) {
        resolve(null);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
    });
  }, []);

  return { active, error, videoRef, start, stop, captureBlob };
}
