"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductWithImages } from "@/lib/data";
import { deleteProductAction } from "../actions";

export default function ProductsTable({
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
      <div className="overflow-x-auto rounded-2xl border border-[var(--ink)]/16">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--ink)]/16 bg-white text-left">
              <th className="p-3">Foto</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: ProductWithImages }) {
  const [isPending, startTransition] = useTransition();
  const cover = product.images[0];

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
    <tr className="border-b border-[var(--ink)]/10 bg-white/60 last:border-0">
      <td className="p-3">
        {cover ? (
          <Image
            src={cover.url}
            alt={product.name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--paper-2)] text-[10px] text-[var(--ink)]/50">
            sin foto
          </div>
        )}
      </td>
      <td className="p-3 font-medium">{product.name}</td>
      <td className="p-3 capitalize">{product.category}</td>
      <td className="p-3">
        {product.priceMin === product.priceMax
          ? `S/ ${product.priceMin}`
          : `S/ ${product.priceMin} – ${product.priceMax}`}
      </td>
      <td className="p-3">{product.stockQty}</td>
      <td className="p-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            product.isPublished
              ? "bg-[var(--lime)]/20 text-[var(--teal-deep)]"
              : "bg-black/10 text-[var(--ink)]/60"
          }`}
        >
          {product.isPublished ? "Publicado" : "Oculto"}
        </span>
      </td>
      <td className="space-x-3 p-3 text-right whitespace-nowrap">
        <Link
          href={`/admin/productos/${product.id}/editar`}
          className="text-[var(--teal-deep)] hover:underline"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-[var(--coral)] hover:underline disabled:opacity-50"
        >
          {isPending ? "Eliminando…" : "Eliminar"}
        </button>
      </td>
    </tr>
  );
}
