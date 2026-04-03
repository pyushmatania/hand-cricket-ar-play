import { toPng } from "html-to-image";

/**
 * Capture an HTML element as a PNG blob
 */
export async function captureElement(element: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(element, {
    quality: 0.95,
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#0d1117",
  });
  const res = await fetch(dataUrl);
  return res.blob();
}

/**
 * Share image via Web Share API or fallback to download
 */
export async function shareImage(blob: Blob, title: string, text?: string): Promise<void> {
  const file = new File([blob], "handcricket-share.png", { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title,
        text: text || title,
        files: [file],
      });
      return;
    } catch (e: any) {
      if (e?.name === "AbortError") return; // user cancelled
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "handcricket-share.png";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Combined capture + share flow
 */
export async function captureAndShare(
  element: HTMLElement | null,
  title: string,
  text?: string
): Promise<boolean> {
  if (!element) return false;
  try {
    const blob = await captureElement(element);
    await shareImage(blob, title, text);
    return true;
  } catch {
    return false;
  }
}
