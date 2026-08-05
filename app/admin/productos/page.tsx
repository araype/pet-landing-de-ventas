import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/data";
import ProductsTable from "./ProductsTable";

export default async function AdminProductsPage() {
  const productList = await getAllProductsForAdmin();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">
          Productos ({productList.length})
        </h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-[var(--coral)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_0_#a82c19] transition active:translate-y-1 active:shadow-none"
        >
          + Agregar producto
        </Link>
      </div>
      {productList.length === 0 ? (
        <p className="text-sm text-[var(--ink)]/70">
          Todavía no hay productos. Usa &ldquo;Agregar producto&rdquo; para crear el
          primero.
        </p>
      ) : (
        <ProductsTable products={productList} />
      )}
    </div>
  );
}
