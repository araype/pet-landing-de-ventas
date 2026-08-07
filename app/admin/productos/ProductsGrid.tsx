"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductWithImages } from "@/lib/data";
import { CATEGORY_LABELS } from "@/components/category-labels";
import { badgeColorClass, badgeDisplayText } from "@/components/badge-labels";
import ColorSwatches from "@/components/ColorSwatches";
import { deleteProductAction } from "../actions";

export default function ProductsGrid({
  products,
}: {
  products: ProductWithImages[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div>
      <input
        type="search"
        placeholder="Buscar producto…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-none border-2 border-[var(--ink)] bg-white px-3 py-2 outline-none focus:border-[var(--coral)]"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductAdminCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductAdminCard({ product }: { product: ProductWithImages }) {
  const [isPending, startTransition] = useTransition();
  const cover = product.images[0];
  const badgeText = badgeDisplayText(product.badge, product.badgeLabel);

  function handleDelete() {
    if (
      !window.confirm(
        `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteProductAction(product.id);
    });
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[var(--ink)]/16 bg-white">
      <div className="relative aspect-[4/3] bg-[var(--paper-2)]">
        {cover ? (
          <Image
            src={cover.url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className={cover.fit === "contain" ? "object-contain" : "object-cover"}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--ink)]/40">
            Sin foto
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {badgeText && (
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold ${badgeColorClass(product.badge)}`}
            >
              {badgeText}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${
              product.isPublished
                ? "bg-[var(--lime)] text-[var(--ink)]"
                : "bg-black/70 text-white"
            }`}
          >
            {product.isPublished ? "Publicado" : "Oculto"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--teal-deep)]">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>
        <h3 className="font-display text-base font-semibold leading-tight">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--ink)]/60">{product.stockQty} unid.</p>
        <ColorSwatches colors={product.colors} className="mt-1" />
        {product.description && (
          <p className="mt-2 line-clamp-3 text-sm text-[var(--ink)]/70">
            {product.description}
          </p>
        )}
        <p className="mt-2 font-mono text-sm font-bold text-[var(--coral)]">
          S/ {product.price}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <Link
            href={`/admin/productos/${product.id}/editar`}
            className="text-sm text-[var(--teal-deep)] hover:underline"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm text-[var(--coral)] hover:underline disabled:opacity-50"
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </article>
  );
}
