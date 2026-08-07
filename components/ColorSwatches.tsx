import type { ProductColor } from "@/lib/schema";
import ColorSwatch from "./ColorSwatch";

export default function ColorSwatches({
  colors,
  className,
}: {
  colors: Pick<ProductColor, "name" | "hex">[];
  className?: string;
}) {
  if (colors.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className ?? ""}`}>
      {colors.map((c) => (
        <span key={c.name} className="inline-flex items-center gap-1.5 text-xs text-[var(--ink)]/70">
          <ColorSwatch hex={c.hex} />
          {c.name}
        </span>
      ))}
    </div>
  );
}
