"use client";

import { useTransition } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/schema";
import { deleteImageAction, moveImageAction } from "../../../actions";

export default function GalleryManager({
  productId,
  images,
}: {
  productId: number;
  images: ProductImage[];
}) {
  const [isPending, startTransition] = useTransition();

  if (images.length === 0) {
    return (
      <p className="text-sm text-[var(--ink)]/60">
        Todavía no hay fotos. Súbelas desde el formulario de arriba.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {images.map((image, index) => (
        <li
          key={image.id}
          className="overflow-hidden rounded-xl border border-[var(--ink)]/16 bg-white"
        >
          <div className="aspect-square overflow-hidden">
            <Image
              src={image.url}
              alt=""
              width={200}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-1 p-2 text-xs">
            <button
              type="button"
              disabled={isPending || index === 0}
              onClick={() =>
                startTransition(() => moveImageAction(image.id, productId, "up"))
              }
              className="rounded border border-[var(--ink)]/30 px-2 py-1 disabled:opacity-30"
              aria-label="Mover antes"
            >
              ↑
            </button>
            <button
              type="button"
              disabled={isPending || index === images.length - 1}
              onClick={() =>
                startTransition(() => moveImageAction(image.id, productId, "down"))
              }
              className="rounded border border-[var(--ink)]/30 px-2 py-1 disabled:opacity-30"
              aria-label="Mover después"
            >
              ↓
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (window.confirm("¿Eliminar esta foto?")) {
                  startTransition(() => deleteImageAction(image.id, productId));
                }
              }}
              className="rounded border border-[var(--coral)]/50 px-2 py-1 text-[var(--coral)] disabled:opacity-30"
              aria-label="Eliminar foto"
            >
              ✕
            </button>
          </div>
          {index === 0 && (
            <p className="border-t border-[var(--ink)]/10 px-2 py-1 text-center text-[10px] uppercase tracking-wide text-[var(--teal-deep)]">
              Portada
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
