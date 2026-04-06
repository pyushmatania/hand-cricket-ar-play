import StoneDustEffect from "@/components/shared/StoneDustEffect";

/**
 * Wraps a carved-stone header image with a subtle dust particle overlay.
 * Drop-in replacement for bare <img> stone headers.
 */
export default function StoneHeader({ src, alt, height = 28 }: { src: string; alt: string; height?: number }) {
  // Estimate width from aspect ratio (~3:1 for most stone tablets)
  const estimatedWidth = height * 3.5;

  return (
    <div style={{ position: "relative", display: "inline-block", height, lineHeight: 0 }}>
      <img
        src={src}
        alt={alt}
        style={{
          height,
          width: "auto",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
          position: "relative",
          zIndex: 2,
        }}
      />
      <StoneDustEffect width={estimatedWidth} height={height + 14} />
    </div>
  );
}
