import ProductForm from "@/components/ProductForm";
import { createProductAction } from "../../actions";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Agregar producto</h1>
      <ProductForm
        action={createProductAction}
        submitLabel="Crear producto"
        imagesHint="Puedes subir varias fotos ahora, o agregarlas después desde la edición del producto."
      />
    </div>
  );
}
