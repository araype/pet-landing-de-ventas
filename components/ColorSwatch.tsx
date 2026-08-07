import { MULTI_GRADIENT } from "@/lib/colors";

export default function ColorSwatch({
  hex,
  size = 12,
}: {
  hex: string;
  size?: number;
}) {
  return (
    <span
      className="inline-block shrink-0 rounded-full border border-black/15"
      style={{
        width: size,
        height: size,
        background: hex === "multi" ? MULTI_GRADIENT : hex,
      }}
    />
  );
}
