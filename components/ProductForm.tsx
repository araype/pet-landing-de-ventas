"use client";

import { useActionState } from "react";
import { CATEGORIES } from "@/lib/schema";
import type { FormState } from "@/app/admin/actions";

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
  colors: string;
  stockQty: number;
  priceMin: number;
  priceMax: number;
  description: string;
  isPublished: boolean;
};

const emptyDefaults: Defaults = {
  name: "",
  category: "juguetes",
  colors: "",
  stockQty: 1,
  priceMin: 0,
  priceMax: 0,
  description: "",
  isPublished: true,
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

        <Field label="Colores / variantes" htmlFor="colors">
          <input
            id="colors"
            name="colors"
            placeholder="Ej: Rojo, verde limón"
            defaultValue={values.colors}
            className={inputClass}
          />
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

        <Field label="Precio mínimo (S/)" htmlFor="priceMin">
          <input
            id="priceMin"
            name="priceMin"
            type="number"
            min={0}
            required
            defaultValue={values.priceMin}
            className={inputClass}
          />
        </Field>

        <Field label="Precio máximo (S/)" htmlFor="priceMax">
          <input
            id="priceMax"
            name="priceMax"
            type="number"
            min={0}
            required
            defaultValue={values.priceMax}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-[var(--ink)]/60">
            Si el precio no varía, pon el mismo valor en mínimo y máximo.
          </p>
        </Field>
      </div>

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
