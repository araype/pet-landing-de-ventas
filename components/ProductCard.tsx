import Image from "next/image";
import Link from "next/link";
import type { ProductWithImages } from "@/lib/data";
import { CATEGORY_LABELS } from "./category-labels";
import { badgeColorClass, badgeDisplayText } from "./badge-labels";
import SelectButton from "./SelectButton";

export default function ProductCard({ product }: { product: ProductWithImages }) {
  const cover = product.images[0];
  const lowStock = product.stockQty > 0 && product.stockQty <= 2;
  const badgeText = badgeDisplayText(product.badge, product.badgeLabel);

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)] transition hover:-translate-y-1">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--paper-2)]">
          {cover ? (
            <Image
              src={cover.url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, 240px"
              className={`transition duration-300 group-hover:scale-105 ${
                cover.fit === "contain" ? "object-contain" : "object-cover"
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--ink)]/40">
              Sin foto
            </div>
          )}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {badgeText && (
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold ${badgeColorClass(product.badge)}`}
              >
                {badgeText}
              </span>
            )}
            {lowStock && (
              <span className="rounded-full bg-[var(--coral)] px-2 py-1 text-[10px] font-bold text-white">
                ¡Últimas unidades!
              </span>
            )}
          </div>
        </div>
        <div className="p-4 pb-2">
          <span className="mb-1 inline-block rounded-full bg-[var(--teal)]/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--teal-deep)]">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </span>
          <h3 className="font-display text-base font-semibold leading-tight">
            {product.name}
          </h3>
          <p className="mb-2 text-sm text-[var(--ink)]/60">
            {product.colors ? `${product.colors} · ` : ""}
            {product.stockQty} unid.
          </p>
          <p className="font-mono text-sm font-bold text-[var(--coral)]">S/ {product.price}</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <SelectButton
          item={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            colors: product.colors,
          }}
          className="w-full"
        />
      </div>
    </article>
  );
}
