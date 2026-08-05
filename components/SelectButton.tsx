"use client";

import { useSelection, type SelectedItem } from "./SelectionProvider";

export default function SelectButton({
  item,
  className,
}: {
  item: SelectedItem;
  className?: string;
}) {
  const { isSelected, toggle } = useSelection();
  const selected = isSelected(item.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={`${className ?? ""} rounded-full px-3 py-2 text-xs font-semibold transition ${
        selected
          ? "bg-[var(--teal)] text-white"
          : "border border-[var(--ink)]/25 bg-white text-[var(--ink)] hover:border-[var(--ink)]"
      }`}
    >
      {selected ? "✓ Agregado a tu consulta" : "+ Agregar a mi consulta"}
    </button>
  );
}
