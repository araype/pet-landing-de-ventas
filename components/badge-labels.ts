import type { Badge } from "@/lib/schema";

export const BADGE_LABELS: Record<Badge, string> = {
  liquidacion: "En liquidación",
  nuevo: "Producto nuevo",
  otro: "Otro",
};

export const BADGE_COLOR_CLASS: Record<Badge, string> = {
  liquidacion: "bg-[var(--coral)] text-white",
  nuevo: "bg-[var(--teal)] text-white",
  otro: "bg-[var(--mustard)] text-[var(--ink)]",
};

export function badgeDisplayText(
  badge: string | null,
  badgeLabel: string | null
): string | null {
  if (!badge) return null;
  if (badge === "otro") return badgeLabel?.trim() || "Otro";
  return BADGE_LABELS[badge as Badge] ?? null;
}

export function badgeColorClass(badge: string | null): string {
  if (badge && badge in BADGE_COLOR_CLASS) {
    return BADGE_COLOR_CLASS[badge as Badge];
  }
  return "bg-[var(--mustard)] text-[var(--ink)]";
}
