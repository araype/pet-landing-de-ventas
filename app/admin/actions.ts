"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { asc, eq, gt, lt } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { db } from "@/lib/db";
import {
  BADGES,
  CATEGORIES,
  IMAGE_FITS,
  productColors,
  productImages,
  products,
  type Badge,
  type ImageFit,
} from "@/lib/schema";
import { uniqueSlug } from "@/lib/data";
import {
  checkAdminPassword,
  createAdminSession,
  destroyAdminSession,
  requireAdminSession,
} from "@/lib/auth";

export type FormState = { error?: string };

export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!password || !checkAdminPassword(password)) {
    return { error: "Contraseña incorrecta." };
  }
  await createAdminSession();
  const next = String(formData.get("next") ?? "/admin/productos");
  redirect(next.startsWith("/admin") ? next : "/admin/productos");
}

export async function logoutAction(): Promise<void> {
  await requireAdminSession();
  await destroyAdminSession();
  redirect("/admin/login");
}

function parseColors(formData: FormData): { name: string; hex: string }[] {
  const raw = String(formData.get("colorsJson") ?? "[]");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const seen = new Set<string>();
  const result: { name: string; hex: string }[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const name = String((item as { name?: unknown }).name ?? "").trim();
    const hex = String((item as { hex?: unknown }).hex ?? "").trim();
    if (!name || !hex) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ name, hex });
  }
  return result;
}

async function syncProductColors(
  productId: number,
  colors: { name: string; hex: string }[]
): Promise<void> {
  await db.delete(productColors).where(eq(productColors.productId, productId));
  if (colors.length === 0) return;
  await db.insert(productColors).values(
    colors.map((c, index) => ({
      productId,
      name: c.name,
      hex: c.hex,
      sortOrder: index,
    }))
  );
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const stockQty = Number(formData.get("stockQty") ?? 0);
  const price = Number(formData.get("price") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const isPublished = formData.get("isPublished") === "on";

  const badgeRaw = String(formData.get("badge") ?? "");
  const badge = BADGES.includes(badgeRaw as Badge) ? (badgeRaw as Badge) : null;
  const badgeLabelRaw = String(formData.get("badgeLabel") ?? "").trim();

  if (!name) throw new Error("El nombre es obligatorio.");
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    throw new Error("Elige una categoría válida.");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio debe ser un número válido.");
  }
  if (!Number.isFinite(stockQty) || stockQty < 0) {
    throw new Error("El stock debe ser un número válido.");
  }
  if (badge === "otro" && !badgeLabelRaw) {
    throw new Error('Escribe el texto de la etiqueta "Otro".');
  }

  return {
    name,
    category,
    stockQty,
    price,
    description,
    isPublished,
    badge,
    badgeLabel: badge === "otro" ? badgeLabelRaw : null,
  };
}

async function uploadProductImages(
  slug: string,
  productId: number,
  files: File[]
): Promise<void> {
  const realFiles = files.filter((f) => f && f.size > 0);
  if (realFiles.length === 0) return;

  const existing = await db
    .select({ sortOrder: productImages.sortOrder })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder));
  let nextSort = existing.length > 0 ? existing[existing.length - 1].sortOrder + 1 : 0;

  for (const file of realFiles) {
    const blob = await put(`productos/${slug}/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    await db.insert(productImages).values({
      productId,
      url: blob.url,
      sortOrder: nextSort,
    });
    nextSort += 1;
  }
}

export async function createProductAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdminSession();

  let fields;
  try {
    fields = parseProductFields(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Datos inválidos." };
  }
  const colors = parseColors(formData);

  const slug = await uniqueSlug(fields.name);

  const [created] = await db
    .insert(products)
    .values({ ...fields, slug })
    .returning({ id: products.id });

  await syncProductColors(created.id, colors);

  const files = formData.getAll("images").filter((v): v is File => v instanceof File);
  await uploadProductImages(slug, created.id, files);

  revalidatePath("/");
  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${created.id}/editar`);
}

export async function updateProductAction(
  productId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdminSession();

  let fields;
  try {
    fields = parseProductFields(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Datos inválidos." };
  }
  const colors = parseColors(formData);

  const current = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (current.length === 0) {
    return { error: "El producto ya no existe." };
  }

  const slug = await uniqueSlug(fields.name, productId);

  await db
    .update(products)
    .set({ ...fields, slug, updatedAt: new Date() })
    .where(eq(products.id, productId));

  await syncProductColors(productId, colors);

  const files = formData.getAll("images").filter((v): v is File => v instanceof File);
  await uploadProductImages(slug, productId, files);

  revalidatePath("/");
  revalidatePath(`/producto/${slug}`);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/editar`);

  return {};
}

export async function deleteProductAction(productId: number): Promise<void> {
  await requireAdminSession();

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId));

  await db.delete(products).where(eq(products.id, productId));

  await Promise.allSettled(images.map((img) => del(img.url)));

  revalidatePath("/");
  revalidatePath("/admin/productos");
}

export async function deleteImageAction(
  imageId: number,
  productId: number
): Promise<void> {
  await requireAdminSession();

  const [image] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, imageId))
    .limit(1);

  await db.delete(productImages).where(eq(productImages.id, imageId));

  if (image) {
    await del(image.url).catch(() => {});
  }

  revalidatePath("/");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/editar`);
}

export async function moveImageAction(
  imageId: number,
  productId: number,
  direction: "up" | "down"
): Promise<void> {
  await requireAdminSession();

  const [current] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, imageId))
    .limit(1);
  if (!current) return;

  const neighborQuery = db
    .select()
    .from(productImages)
    .where(
      direction === "up"
        ? lt(productImages.sortOrder, current.sortOrder)
        : gt(productImages.sortOrder, current.sortOrder)
    )
    .orderBy(direction === "up" ? asc(productImages.sortOrder) : asc(productImages.sortOrder));

  const candidates = await neighborQuery;
  const neighbor =
    direction === "up" ? candidates[candidates.length - 1] : candidates[0];
  if (!neighbor) return;

  await db
    .update(productImages)
    .set({ sortOrder: neighbor.sortOrder })
    .where(eq(productImages.id, current.id));
  await db
    .update(productImages)
    .set({ sortOrder: current.sortOrder })
    .where(eq(productImages.id, neighbor.id));

  revalidatePath("/");
  revalidatePath(`/admin/productos/${productId}/editar`);
}

export async function setImageFitAction(
  imageId: number,
  productId: number,
  fit: ImageFit
): Promise<void> {
  await requireAdminSession();

  if (!IMAGE_FITS.includes(fit)) return;

  await db.update(productImages).set({ fit }).where(eq(productImages.id, imageId));

  revalidatePath("/");
  revalidatePath(`/admin/productos/${productId}/editar`);
}
