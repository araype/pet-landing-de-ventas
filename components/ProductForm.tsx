"use client";

import { useActionState, useState } from "react";
import { BADGES, CATEGORIES } from "@/lib/schema";
import type { FormState } from "@/app/admin/actions";
import type { ColorOption } from "@/lib/colors";
import { BADGE_LABELS } from "./badge-labels";
import ColorPicker from "./ColorPicker";

const CATEGORY_LABELS: Record<string, string> = {
  juguetes: "Juguetes",
  accesorios: "Accesorios",
  higiene: "Higiene",
  snacks: "Snacks",
  vestimenta: "Vestimenta",
};

type Defaults = {
  name: string;
  category: string;
  colors: ColorOption[];
  stockQty: number;
  price: number;
  description: string;
  isPublished: boolean;
  badge: string | null;
  badgeLabel: string | null;
};

const emptyDefaults: Defaults = {
  name: "",
  category: "juguetes",
  colors: [],
  stockQty: 1,
  price: 0,
  description: "",
  isPublished: true,
  badge: null,
  badgeLabel: null,
};

export default function ProductForm({
  action,
  defaultValues,
  submitLabel,
  imagesHint,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: Partial<Defaults>;
  submitLabel: string;
  imagesHint: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {}
  );
  const values = { ...emptyDefaults, ...defaultValues };
  const [badge, setBadge] = useState(values.badge ?? "");

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre del producto" htmlFor="name">
          <input
            id="name"
            name="name"
            required
            defaultValue={values.name}
            className={inputClass}
          />
        </Field>

        <Field label="Categoría" htmlFor="category">
          <select
            id="category"
            name="category"
            defaultValue={values.category}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Stock (unidades disponibles)" htmlFor="stockQty">
          <input
            id="stockQty"
            name="stockQty"
            type="number"
            min={0}
            required
            defaultValue={values.stockQty}
            className={inputClass}
          />
        </Field>

        <Field label="Precio (S/)" htmlFor="price">
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            required
            defaultValue={values.price}
            className={inputClass}
          />
        </Field>

        <Field label="Etiqueta" htmlFor="badge">
          <select
            id="badge"
            name="badge"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className={inputClass}
          >
            <option value="">Ninguna</option>
            {BADGES.map((b) => (
              <option key={b} value={b}>
                {BADGE_LABELS[b]}
              </option>
            ))}
          </select>
          {badge === "otro" && (
            <input
              name="badgeLabel"
              placeholder="Texto de la etiqueta"
              required
              defaultValue={values.badgeLabel ?? ""}
              className={`${inputClass} mt-2`}
            />
          )}
        </Field>
      </div>

      <Field label="Colores disponibles" htmlFor="colorsJson">
        <ColorPicker name="colorsJson" defaultColors={values.colors} />
      </Field>

      <Field label="Descripción" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={values.description}
          className={inputClass}
        />
      </Field>

      <Field label="Fotos" htmlFor="images">
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          className={inputClass}
        />
        <p className="mt-1 text-xs text-[var(--ink)]/60">{imagesHint}</p>
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={values.isPublished}
          className="h-4 w-4"
        />
        Publicado (visible en el catálogo)
      </label>

      {state.error && (
        <p className="rounded-lg bg-[var(--coral)]/10 px-3 py-2 text-sm text-[var(--coral)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--coral)] px-6 py-3 font-semibold text-white shadow-[0_6px_0_#a82c19] transition active:translate-y-1 active:shadow-none disabled:opacity-60"
      >
        {pending ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-none border-2 border-[var(--ink)] bg-white px-3 py-2 outline-none focus:border-[var(--coral)]";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
