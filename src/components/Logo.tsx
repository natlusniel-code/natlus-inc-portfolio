interface Props {
  src?: string;
  alt?: string;
  className?: string;
  darkChip?: boolean;
}

/**
 * The official Natlus Inc. logo. The asset is a white geometric mark on a
 * black background, so by default it renders in a dark rounded chip to stay
 * legible on the light site. Admin can override with a transparent logo URL.
 */
export function Logo({ src, alt = "Natlus Inc. logo", className = "", darkChip = true }: Props) {
  const cls = `flex items-center justify-center overflow-hidden rounded-xl ${darkChip ? "bg-ink-950" : ""} ${className || "h-10 w-10"}`;
  if (src) {
    return <img src={src} alt={alt} className={className || "h-10 w-10 object-contain"} />;
  }
  return (
    <span className={cls} role="img" aria-label={alt}>
      <img src="/logo.png" alt={alt} className="h-7 w-7 object-contain" />
    </span>
  );
}
