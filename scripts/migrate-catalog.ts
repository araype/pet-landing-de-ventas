import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";
import { put } from "@vercel/blob";
import { db } from "../lib/db";
import { productImages, products, type Category } from "../lib/schema";
import { uniqueSlug } from "../lib/data";

const SOURCE_HTML = resolve(
  __dirname,
  "../../uploads/catalogo_bazar_aracely (2).html"
);

type OldProduct = {
  category: Category;
  name: string;
  qtyText: string;
  colors: string;
  description: string;
  imageDataUri: string;
  priceText: string;
};

function attr(block: string, name: string): string {
  const match = block.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : "";
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseOldCatalog(html: string): OldProduct[] {
  const articleRegex = /<article class="tag-card"([^]*?)>([\s\S]*?)<\/article>/g;
  const items: OldProduct[] = [];

  for (const match of html.matchAll(articleRegex)) {
    const [, attrs, content] = match;
    const category = attr(attrs, "data-cat") as Category;
    const name = decodeHtmlEntities(attr(attrs, "data-name"));
    const qtyText = decodeHtmlEntities(attr(attrs, "data-qty"));
    const colors = decodeHtmlEntities(attr(attrs, "data-colors"));
    const description = decodeHtmlEntities(attr(attrs, "data-desc"));

    const imageMatch = content.match(/<img[^>]*src="(data:[^"]*)"/);
    const priceMatch = content.match(/<div class="tag-price">([^<]*)<\/div>/);

    if (!name || !imageMatch || !priceMatch) continue;

    items.push({
      category,
      name,
      qtyText,
      colors,
      description,
      imageDataUri: imageMatch[1],
      priceText: priceMatch[1].trim(),
    });
  }

  return items;
}

function parsePriceRange(priceText: string): { min: number; max: number } {
  const numbers = priceText.match(/\d+/g)?.map(Number) ?? [0];
  return {
    min: numbers[0] ?? 0,
    max: numbers[numbers.length - 1] ?? numbers[0] ?? 0,
  };
}

function parseStockQty(qtyText: string): number {
  const match = qtyText.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

function decodeDataUri(dataUri: string): { buffer: Buffer; contentType: string; ext: string } {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Formato de imagen base64 inesperado.");
  const [, contentType, base64] = match;
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  return { buffer: Buffer.from(base64, "base64"), contentType, ext };
}

async function main() {
  console.log(`Leyendo catálogo desde ${SOURCE_HTML}`);
  const html = readFileSync(SOURCE_HTML, "utf8");
  const items = parseOldCatalog(html);
  console.log(`Se encontraron ${items.length} productos en el HTML original.`);

  for (const [index, item] of items.entries()) {
    const { min, max } = parsePriceRange(item.priceText);
    const stockQty = parseStockQty(item.qtyText);
    const slug = await uniqueSlug(item.name);

    const [created] = await db
      .insert(products)
      .values({
        slug,
        name: item.name,
        category: item.category,
        colors: item.colors,
        stockQty,
        priceMin: min,
        priceMax: max,
        description: item.description,
        isPublished: true,
        sortOrder: index,
      })
      .returning({ id: products.id });

    const { buffer, contentType, ext } = decodeDataUri(item.imageDataUri);
    const blob = await put(`productos/${slug}/${Date.now()}-foto.${ext}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: true,
    });

    await db.insert(productImages).values({
      productId: created.id,
      url: blob.url,
      sortOrder: 0,
    });

    console.log(`✓ ${item.name} (${slug})`);
  }

  console.log("Migración completa.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
