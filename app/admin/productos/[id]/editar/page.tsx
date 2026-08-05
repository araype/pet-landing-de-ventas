import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getProductByIdForAdmin } from "@/lib/data";
import { updateProductAction } from "../../../actions";
import GalleryManager from "./GalleryManager";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const product = await getProductByIdForAdmin(productId);
  if (!product) notFound();

  const boundUpdate = updateProductAction.bind(null, productId);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-1 font-display text-2xl font-bold">Editar producto</h1>
        <p className="mb-6 text-sm text-[var(--ink)]/60">
          Vista pública:{" "}
          <a
            className="underline"
            href={`/producto/${product.slug}`}
            target="_blank"
            rel="noopener"
          >
            /producto/{product.slug}
          </a>
        </p>
        <ProductForm
          action={boundUpdate}
          submitLabel="Guardar cambios"
          imagesHint="Estas fotos se agregan al final de la galería."
          defaultValues={product}
        />
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-bold">
          Galería ({product.images.length})
        </h2>
        <GalleryManager productId={product.id} images={product.images} />
      </div>
    </div>
  );
}
