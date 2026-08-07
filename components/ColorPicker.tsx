"use client";

import { useState } from "react";
import { PRESET_COLORS, type ColorOption } from "@/lib/colors";
import ColorSwatch from "./ColorSwatch";

export default function ColorPicker({
  name,
  defaultColors,
}: {
  name: string;
  defaultColors: ColorOption[];
}) {
  const [selected, setSelected] = useState<ColorOption[]>(defaultColors);
  const [customName, setCustomName] = useState("");
  const [customHex, setCustomHex] = useState("#888888");
  const [addingCustom, setAddingCustom] = useState(false);

  function isSelected(colorName: string) {
    return selected.some((c) => c.name.toLowerCase() === colorName.toLowerCase());
  }

  function togglePreset(preset: ColorOption) {
    setSelected((prev) =>
      isSelected(preset.name)
        ? prev.filter((c) => c.name.toLowerCase() !== preset.name.toLowerCase())
        : [...prev, preset]
    );
  }

  function removeColor(colorName: string) {
    setSelected((prev) => prev.filter((c) => c.name !== colorName));
  }

  function addCustomColor() {
    const trimmed = customName.trim();
    if (!trimmed) return;
    if (isSelected(trimmed)) {
      setCustomName("");
      return;
    }
    setSelected((prev) => [...prev, { name: trimmed, hex: customHex }]);
    setCustomName("");
    setCustomHex("#888888");
    setAddingCustom(false);
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(selected)} />

      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((preset) => {
          const active = isSelected(preset.name);
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => togglePreset(preset)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition ${
                active
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : "border-[var(--ink)]/25 bg-white text-[var(--ink)] hover:border-[var(--ink)]"
              }`}
            >
              <ColorSwatch hex={preset.hex} />
              {preset.name}
            </button>
          );
        })}
      </div>

      {selected.some((c) => !PRESET_COLORS.some((p) => p.name === c.name)) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected
            .filter((c) => !PRESET_COLORS.some((p) => p.name === c.name))
            .map((c) => (
              <span
                key={c.name}
                className="flex items-center gap-1.5 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-2.5 py-1.5 text-xs text-[var(--paper)]"
              >
                <ColorSwatch hex={c.hex} />
                {c.name}
                <button
                  type="button"
                  onClick={() => removeColor(c.name)}
                  aria-label={`Quitar ${c.name}`}
                  className="ml-0.5 opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            ))}
        </div>
      )}

      {addingCustom ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="color"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            className="h-9 w-9 cursor-pointer border-2 border-[var(--ink)] p-0.5"
            aria-label="Tono del color personalizado"
          />
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nombre del color (ej: Camuflado)"
            className="rounded-none border-2 border-[var(--ink)] bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--coral)]"
          />
          <button
            type="button"
            onClick={addCustomColor}
            className="rounded-full bg-[var(--teal)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Agregar
          </button>
          <button
            type="button"
            onClick={() => setAddingCustom(false)}
            className="text-xs text-[var(--ink)]/60 hover:underline"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingCustom(true)}
          className="mt-3 text-xs font-semibold text-[var(--teal-deep)] hover:underline"
        >
          + Agregar color personalizado
        </button>
      )}
    </div>
  );
}
