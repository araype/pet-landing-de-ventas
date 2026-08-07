import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "fs";
import { resolve } from "path";
import { put } from "@vercel/blob";
import { db } from "../lib/db";
import { productColors, productImages, products, type Category } from "../lib/schema";
import { uniqueSlug } from "../lib/data";
import { PRESET_COLORS } from "../lib/colors";

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

function parsePrice(priceText: string): number {
  // El catálogo viejo mostraba un rango ("S/ 12 – 18"); nos quedamos con el
  // extremo inferior como precio único de partida.
  const numbers = priceText.match(/\d+/g)?.map(Number) ?? [0];
  return numbers[0] ?? 0;
}

function parseStockQty(qtyText: string): number {
  const match = qtyText.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseColors(text: string): { name: string; hex: string }[] {
  if (!text) return [];
  const cleaned = text.replace(/\by\b/gi, ",").replace(/[/·]/g, ",");
  const tokens = cleaned.split(",").map((t) => t.trim()).filter(Boolean);

  const result: { name: string; hex: string }[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (/\d/.test(lower)) continue;
    if (
      /talla|unid|set|combinacion|surtido|con tachas|^liso$|dije|cuero|tendon|tendón|natural/.test(
        lower
      )
    )
      continue;

    let matched = PRESET_COLORS.find(
      (p) => lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lower)
    );
    if (!matched && lower.includes("camuflad")) {
      matched = { name: "Camuflado", hex: "#6b7057" };
    }

    const finalName = matched ? matched.name : capitalize(token);
    if (seen.has(finalName)) continue;
    seen.add(finalName);
    result.push({ name: finalName, hex: matched ? matched.hex : "#9ca3af" });
  }

  return result;
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
    const price = parsePrice(item.priceText);
    const stockQty = parseStockQty(item.qtyText);
    const slug = await uniqueSlug(item.name);

    const [created] = await db
      .insert(products)
      .values({
        slug,
        name: item.name,
        category: item.category,
        stockQty,
        price,
        description: item.description,
        isPublished: true,
        sortOrder: index,
      })
      .returning({ id: products.id });

    const colors = parseColors(item.colors);
    if (colors.length > 0) {
      await db.insert(productColors).values(
        colors.map((c, i) => ({
          productId: created.id,
          name: c.name,
          hex: c.hex,
          sortOrder: i,
        }))
      );
    }

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
