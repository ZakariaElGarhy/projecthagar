import { createInsertSchema } from "drizzle-zod";
import { jsonb, pgTable, serial, text, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const productSchema = z.object({
  name: z.string(),
  material: z.string(),
  image: z.string(),
  description: z.string(),
  amazon_link: z.string(),
});

export type Product = z.infer<typeof productSchema>;

export const postsTable = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    accentColor: text("accent_color").notNull(),
    introText: text("intro_text").notNull(),
    coverImage: text("cover_image").notNull(),
    products: jsonb("products").$type<Product[]>().notNull(),
    conclusionText: text("conclusion_text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIndex: uniqueIndex("posts_slug_idx").on(table.slug),
  }),
);

export const insertPostSchema = createInsertSchema(postsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;

export const adminUsersTable = pgTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("admin"),
  },
  (table) => ({
    usernameIndex: uniqueIndex("admin_users_username_idx").on(table.username),
  }),
);

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => adminUsersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});