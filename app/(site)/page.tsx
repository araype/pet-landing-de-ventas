import { getPublishedProducts } from "@/lib/data";
import CatalogClient from "@/components/CatalogClient";
import { generalInquiryMessage, whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getPublishedProducts();
  const totalUnits = products.reduce((sum, p) => sum + p.stockQty, 0);
  const waLink = whatsappLink(generalInquiryMessage());

  return (
    <>
      <header className="relative overflow-hidden border-b-[6px] border-[var(--mustard)] bg-[var(--teal)] px-4 pb-10 pt-16 text-[var(--paper)]">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/50 bg-white/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wide">
            ✂ liquidación de mercadería · lima, perú
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.02] sm:text-5xl">
            El Bazar
            <br />
            de Aracely
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base">
            Juguetes, accesorios y cuidado para perros — mercadería nueva,
            verificada pieza por pieza. Todo con envío coordinado por WhatsApp.
          </p>
          <div className="my-6 flex flex-wrap gap-6">
            <Stat value={String(products.length)} label="productos distintos" />
            <Stat value={`${totalUnits}+`} label="unidades disponibles" />
            <Stat value="100%" label="nuevo, con etiqueta" />
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#catalogo"
              className="rounded-full bg-[var(--coral)] px-6 py-3 text-sm font-semibold shadow-[0_6px_0_#a82c19] transition active:translate-y-1 active:shadow-none"
            >
              Ver catálogo ↓
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener"
              className="rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold shadow-[0_6px_0_#159a48] transition active:translate-y-1 active:shadow-none"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </header>

      <CatalogClient products={products} />

      <ShippingFaq />

      <footer className="bg-[var(--ink)] px-4 py-12 text-center text-[var(--paper)]">
        <p className="font-display text-xl font-semibold">¿Te late algo? 🐾</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
          Escríbeme por WhatsApp indicando el nombre del producto y el color
          que quieres. Precios referenciales — cerramos el precio final por
          cantidad y forma de envío.
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener"
          className="mt-5 inline-block rounded-full bg-[var(--coral)] px-6 py-3 text-sm font-semibold shadow-[0_6px_0_#a82c19]"
        >
          Escribir por WhatsApp
        </a>
      </footer>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <b className="block font-display text-3xl text-[var(--mustard)]">{value}</b>
      <span className="text-xs uppercase tracking-wide text-white/80">{label}</span>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "¿Cómo compro?",
    a: "Elige uno o varios productos, agrégalos a tu consulta y escríbeme por WhatsApp — coordinamos color, cantidad y entrega ahí mismo.",
  },
  {
    q: "¿Hacen envíos?",
    a: "Sí, coordinamos envío dentro de Lima y encomienda a provincias. El costo se confirma según tu distrito.",
  },
  {
    q: "¿Qué formas de pago aceptan?",
    a: "Yape, Plin y transferencia. Para envíos a provincia se coordina el pago antes del despacho.",
  },
  {
    q: "¿Puedo cambiar un producto?",
    a: "Sí, si llega con algún defecto de fábrica. Escríbeme por WhatsApp dentro de las 48 horas de recibido.",
  },
];

function ShippingFaq() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16">
      <h2 className="mb-6 font-display text-2xl font-bold">Cómo comprar</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {FAQ_ITEMS.map((item) => (
          <div
            key={item.q}
            className="rounded-2xl border border-[var(--line)] bg-white p-4"
          >
            <p className="font-display font-semibold">{item.q}</p>
            <p className="mt-1 text-sm text-[var(--ink)]/70">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
