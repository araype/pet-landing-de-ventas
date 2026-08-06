"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/schema";

export default function Gallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] text-sm text-[var(--ink)]/40">
        Sin fotos todavía
      </div>
    );
  }

  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper-2)]">
        <Image
          src={current.url}
          alt={name}
          width={640}
          height={640}
          priority
          className={`h-full w-full ${
            current.fit === "contain" ? "object-contain" : "object-cover"
          }`}
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-[var(--coral)]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
