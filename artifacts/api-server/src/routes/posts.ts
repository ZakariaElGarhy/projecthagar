import { and, desc, eq, ilike, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreatePostBody,
  CreatePostResponse,
  DeletePostParams,
  GetDashboardSummaryResponse,
  GetPostBySlugParams,
  GetPostBySlugResponse,
  ListCategoriesResponse,
  ListPostsQueryParams,
  ListPostsResponse,
  UpdatePostBody,
  UpdatePostParams,
  UpdatePostResponse,
} from "@workspace/api-zod";
import { db, postsTable } from "@workspace/db";
import { getSessionUser } from "../lib/auth";

const router: IRouter = Router();

function toApiPost(post: typeof postsTable.$inferSelect) {
  const products = (post.products as Array<Record<string, unknown>>).map((product) => ({
    name: String(product.name ?? ""),
    material: String(product.material ?? "Mixed materials"),
    image: String(product.image ?? ""),
    description: String(product.description ?? ""),
    amazon_link: String(product.amazon_link ?? ""),
  }));
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    accent_color: post.accentColor,
    intro_text: post.introText,
    cover_image: post.coverImage,
    products,
    conclusion_text: post.conclusionText,
    created_at: post.createdAt.toISOString(),
  };
}

function toDbPost(data: {
  title?: string;
  slug?: string;
  category?: string;
  accent_color?: string;
  intro_text?: string;
  cover_image?: string;
  products?: unknown;
  conclusion_text?: string;
}) {
  return {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.slug !== undefined ? { slug: data.slug } : {}),
    ...(data.category !== undefined ? { category: data.category } : {}),
    ...(data.accent_color !== undefined ? { accentColor: data.accent_color } : {}),
    ...(data.intro_text !== undefined ? { introText: data.intro_text } : {}),
    ...(data.cover_image !== undefined ? { coverImage: data.cover_image } : {}),
    ...(data.products !== undefined
      ? { products: data.products as typeof postsTable.$inferInsert.products }
      : {}),
    ...(data.conclusion_text !== undefined ? { conclusionText: data.conclusion_text } : {}),
  };
}

async function requireAdmin(req: Parameters<Parameters<IRouter["get"]>[1]>[0], res: Parameters<Parameters<IRouter["get"]>[1]>[1]) {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return user;
}

router.get("/posts", async (req, res): Promise<void> => {
  const parsed = ListPostsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, featured } = parsed.data;
  const category =
    parsed.data.category === "Living Room" ? "Living Rooms" : parsed.data.category;
  const conditions = [];
  if (category) conditions.push(eq(postsTable.category, category));
  if (search) {
    conditions.push(
      or(ilike(postsTable.title, `%${search}%`), ilike(postsTable.introText, `%${search}%`)),
    );
  }
  const posts = await db
    .select()
    .from(postsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(postsTable.createdAt))
    .limit(featured ? 6 : 100);
  res.json(ListPostsResponse.parse(posts.map(toApiPost)));
});

router.get("/posts/slug/:slug", async (req, res): Promise<void> => {
  const parsed = GetPostBySlugParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [post] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.slug, parsed.data.slug))
    .limit(1);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(GetPostBySlugResponse.parse(toApiPost(post)));
});

router.get("/categories", async (_req, res): Promise<void> => {
  const posts = await db
    .select({
      category: postsTable.category,
      coverImage: postsTable.coverImage,
    })
    .from(postsTable)
    .orderBy(desc(postsTable.createdAt));
  const grouped = new Map<string, { count: number; image: string }>();
  for (const post of posts) {
    const current = grouped.get(post.category);
    grouped.set(post.category, {
      count: (current?.count ?? 0) + 1,
      image: current?.image ?? post.coverImage,
    });
  }
  res.json(
    ListCategoriesResponse.parse(
      [...grouped.entries()].map(([name, details]) => ({ name, ...details })),
    ),
  );
});

router.post("/posts", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(eq(postsTable.slug, parsed.data.slug))
    .limit(1);
  if (existing) {
    res.status(400).json({ error: "A post with this slug already exists" });
    return;
  }
  const [post] = await db
    .insert(postsTable)
    .values(toDbPost(parsed.data) as typeof postsTable.$inferInsert)
    .returning();
  res.status(201).json(CreatePostResponse.parse(toApiPost(post)));
});

router.patch("/posts/:id", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const params = UpdatePostParams.safeParse(req.params);
  const parsed = UpdatePostBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [post] = await db
    .update(postsTable)
    .set(toDbPost(parsed.data))
    .where(eq(postsTable.id, params.data.id))
    .returning();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(UpdatePostResponse.parse(toApiPost(post)));
});

router.delete("/posts/:id", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [post] = await db
    .delete(postsTable)
    .where(eq(postsTable.id, params.data.id))
    .returning({ id: postsTable.id });
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const posts = await db
    .select()
    .from(postsTable)
    .orderBy(desc(postsTable.createdAt));
  const summary = {
    total_posts: posts.length,
    categories: new Set(posts.map((post) => post.category)).size,
    latest_post: posts[0] ? toApiPost(posts[0]) : null,
  };
  res.json(GetDashboardSummaryResponse.parse(summary));
});

export default router;