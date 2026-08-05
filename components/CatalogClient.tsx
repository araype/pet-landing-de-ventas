"use client";

import { useMemo, useState } from "react";
import type { ProductWithImages } from "@/lib/data";
import { CATEGORY_LABELS } from "./category-labels";
import ProductCard from "./ProductCard";

const FILTERS = [
  { value: "todos", label: "Todos" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

export default function CatalogClient({ products }: { products: ProductWithImages[] }) {
  const [category, setCategory] = useState("todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = category === "todos" || p.category === category;
      const matchesQuery = !q || p.name.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, category, query]);

  return (
    <div id="catalogo">
      <div className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--paper)] px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full rounded-full border border-[var(--ink)]/30 bg-white px-4 py-2 text-sm outline-none focus:border-[var(--coral)] sm:max-w-xs"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setCategory(f.value)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition ${
                  category === f.value
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                    : "border-[var(--ink)]/40 text-[var(--ink)] hover:bg-[var(--paper-2)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {filtered.length === 0 ? (
          <p className="py-16 text-center font-mono text-sm text-[var(--ink)]/50">
            No hay productos en esta búsqueda por ahora.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
