import { pgTable, text, serial, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  price: doublePrecision("price").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  views: integer("views").default(0).notNull(),
});

export const productMedia = pgTable("product_media", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'image' or 'video'
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  views: true,
});

export const insertProductMediaSchema = createInsertSchema(productMedia).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProductMedia = z.infer<typeof insertProductMediaSchema>;
export type ProductMedia = typeof productMedia.$inferSelect;
