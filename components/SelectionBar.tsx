"use client";

import { useSelection } from "./SelectionProvider";
import { multiProductMessage, whatsappLink } from "@/lib/whatsapp";

export default function SelectionBar() {
  const { items, clear } = useSelection();

  if (items.length === 0) return null;

  const link = whatsappLink(multiProductMessage(items));

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[var(--paper)]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <span className="text-sm">
          {items.length} producto{items.length > 1 ? "s" : ""} seleccionado
          {items.length > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={clear}
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            Limpiar
          </button>
          <a
            href={link}
            target="_blank"
            rel="noopener"
            className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_0_#159a48] transition active:translate-y-1 active:shadow-none"
          >
            Consultar por WhatsApp →
          </a>
        </div>
      </div>
    </div>
  );
}
