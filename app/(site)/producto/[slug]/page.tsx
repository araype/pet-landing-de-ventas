import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data";
import { CATEGORY_LABELS } from "@/components/category-labels";
import Gallery from "@/components/Gallery";
import SelectButton from "@/components/SelectButton";
import { singleProductMessage, whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = product.images[0]?.url;
  const description =
    product.description || `${product.name} disponible en el Bazar de Aracely.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isPublished) notFound();

  const lowStock = product.stockQty > 0 && product.stockQty <= 2;
  const priceLabel =
    product.priceMin === product.priceMax
      ? `S/ ${product.priceMin}`
      : `S/ ${product.priceMin} – ${product.priceMax}`;
  const waLink = whatsappLink(singleProductMessage(product.name, product.colors));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/#catalogo"
        className="mb-6 inline-block text-sm text-[var(--teal-deep)] hover:underline"
      >
        ← Seguir viendo el catálogo
      </Link>
      <div className="grid gap-8 sm:grid-cols-2">
        <Gallery images={product.images} name={product.name} />

        <div>
          <span className="mb-2 inline-block rounded-full bg-[var(--teal)]/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-[var(--teal-deep)]">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </span>
          <h1 className="font-display text-3xl font-bold">{product.name}</h1>

          {lowStock && (
            <p className="mt-2 inline-block rounded-full bg-[var(--coral)] px-3 py-1 text-xs font-bold text-white">
              ¡Últimas unidades!
            </p>
          )}

          <p className="mt-3 font-mono text-2xl font-bold text-[var(--coral)]">
            {priceLabel}
          </p>

          <dl className="mt-4 divide-y divide-dashed divide-[var(--line)] border-y border-dashed border-[var(--line)] text-sm">
            <Row label="Colores" value={product.colors || "—"} />
            <Row label="Stock" value={`${product.stockQty} unidades`} />
          </dl>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-[var(--ink)]/80">
              {product.description}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noopener"
              className="rounded-full bg-[#25D366] px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_6px_0_#159a48] transition active:translate-y-1 active:shadow-none"
            >
              Consultar por WhatsApp
            </a>
            <SelectButton
              item={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                colors: product.colors,
              }}
              className="w-full py-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2">
      <dt className="w-24 shrink-0 font-mono text-xs uppercase tracking-wide text-[var(--ink)]/50">
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
