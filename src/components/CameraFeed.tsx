import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from "react";

interface CameraFeedProps {
  onVideoReady: (video: HTMLVideoElement) => void;
}

export interface CameraFeedHandle {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(({ onVideoReady }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useImperativeHandle(ref, () => ({ videoRef }));

  const startCamera = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          setLoading(false);
          if (videoRef.current) onVideoReady(videoRef.current);
        };
      }
    } catch (err: any) {
      setLoading(false);
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access.");
      } else {
        setError("Could not access camera. Try a different browser.");
      }
    }
  }, [onVideoReady]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  if (error) {
    return (
      <div className="w-full aspect-[4/3] glass flex flex-col items-center justify-center text-center p-4">
        <span className="text-3xl mb-2">📷</span>
        <p className="text-destructive font-semibold text-sm">{error}</p>
        <button
          onClick={startCamera}
          className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-glass">
      {loading && (
        <div className="absolute inset-0 bg-card/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Starting camera…</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover mirror"
        style={{ transform: "scaleX(-1)" }}
      />
      {/* Overlay frame */}
      <div className="absolute inset-0 border-2 border-primary/20 rounded-xl pointer-events-none" />
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-display font-bold tracking-wider">
        LIVE
      </div>
    </div>
  );
});

CameraFeed.displayName = "CameraFeed";
export default CameraFeed;
