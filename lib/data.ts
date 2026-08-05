import { asc, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { productImages, products, type Product, type ProductImage } from "./schema";

export type ProductWithImages = Product & { images: ProductImage[] };

async function attachImages(rows: Product[]): Promise<ProductWithImages[]> {
  if (rows.length === 0) return [];
  // Catalog is small (tens of products), so a per-product lookup is simple and fast enough.
  const byProduct = new Map<number, ProductImage[]>();
  for (const row of rows) {
    byProduct.set(
      row.id,
      await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, row.id))
        .orderBy(asc(productImages.sortOrder))
    );
  }
  return rows.map((r) => ({ ...r, images: byProduct.get(r.id) ?? [] }));
}

export async function getPublishedProducts(): Promise<ProductWithImages[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.isPublished, true))
    .orderBy(asc(products.sortOrder), desc(products.createdAt));
  return attachImages(rows);
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithImages | null> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (rows.length === 0) return null;
  const [withImages] = await attachImages(rows);
  return withImages;
}

export async function getAllProductsForAdmin(): Promise<ProductWithImages[]> {
  const rows = await db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder), desc(products.createdAt));
  return attachImages(rows);
}

export async function getProductByIdForAdmin(
  id: number
): Promise<ProductWithImages | null> {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (rows.length === 0) return null;
  const [withImages] = await attachImages(rows);
  return withImages;
}

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uniqueSlug(name: string, excludeId?: number): Promise<string> {
  const base = slugify(name) || "producto";
  let candidate = base;
  let n = 2;
  for (;;) {
    const rows = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, candidate))
      .limit(1);
    const clash = rows[0] && rows[0].id !== excludeId;
    if (!clash) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}
