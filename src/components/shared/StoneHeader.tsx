/**
 * Pure CSS carved-stone header text.
 * No images — instant render with 3D chiseled stone look.
 */
export default function StoneHeader({
  text,
  size = "md",
}: {
  text: string;
  size?: "sm" | "md" | "lg";
  /** @deprecated use text prop instead */
  src?: string;
  alt?: string;
  height?: number;
}) {
  const fontSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <span
      className={`stone-carved-text ${fontSize} font-display uppercase tracking-[0.15em] leading-none select-none`}
      aria-label={text}
    >
      {text}
    </span>
  );
}
