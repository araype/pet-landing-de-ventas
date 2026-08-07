import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const CATEGORIES = [
  "juguetes",
  "accesorios",
  "higiene",
  "snacks",
  "vestimenta",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const BADGES = ["liquidacion", "nuevo", "otro"] as const;

export type Badge = (typeof BADGES)[number];

export const IMAGE_FITS = ["cover", "contain"] as const;

export type ImageFit = (typeof IMAGE_FITS)[number];

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  stockQty: integer("stock_qty").notNull().default(0),
  price: integer("price").notNull(),
  badge: varchar("badge", { length: 20 }),
  badgeLabel: varchar("badge_label", { length: 60 }),
  description: text("description").notNull().default(""),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  fit: varchar("fit", { length: 10 }).notNull().default("cover"),
});

export const productColors = pgTable("product_colors", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 60 }).notNull(),
  hex: varchar("hex", { length: 10 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductColor = typeof productColors.$inferSelect;
