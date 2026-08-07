export type ColorOption = { name: string; hex: string };

// hex "multi" es un valor especial: el swatch lo pinta con un degradé
// en vez de un color plano.
export const PRESET_COLORS: ColorOption[] = [
  { name: "Rojo", hex: "#e8432a" },
  { name: "Naranja", hex: "#f2a93b" },
  { name: "Amarillo", hex: "#eab308" },
  { name: "Verde limón", hex: "#a9c400" },
  { name: "Verde", hex: "#16a34a" },
  { name: "Turquesa", hex: "#0e6e6e" },
  { name: "Celeste", hex: "#38bdf8" },
  { name: "Azul", hex: "#2563eb" },
  { name: "Morado", hex: "#7c3aed" },
  { name: "Rosa", hex: "#ec4899" },
  { name: "Fucsia", hex: "#d6009a" },
  { name: "Marrón", hex: "#92400e" },
  { name: "Negro", hex: "#1f2937" },
  { name: "Blanco", hex: "#f9fafb" },
  { name: "Gris", hex: "#9ca3af" },
  { name: "Multicolor", hex: "multi" },
];

export const MULTI_GRADIENT =
  "conic-gradient(#e8432a, #eab308, #16a34a, #2563eb, #7c3aed, #ec4899, #e8432a)";
