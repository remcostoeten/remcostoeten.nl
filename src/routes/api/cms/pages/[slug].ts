import { createDb } from "~/db/client";
import { pages } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "~/lib/auth";

export async function GET({ params }: { params: { slug: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    const db = createDb();
    const [page] = await db.select().from(pages).where(eq(pages.slug, params.slug)).limit(1);
    if (!page) {
      return new Response(JSON.stringify({ error: "Page not found" }), { status: 404, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify(page), { status: 200, headers: { "content-type": "application/json" } });
  } catch (error) {
    console.error("GET /api/cms/pages/[slug] error", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export async function PUT({ request, params }: { request: Request; params: { slug: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    const body = await request.json();
    const { title, content, is_published } = body || {};

    const db = createDb();
    const updated = await db
      .update(pages)
      .set({
        title,
        content,
        isPublished: Boolean(is_published),
        updatedAt: new Date(),
      })
      .where(eq(pages.slug, params.slug))
      .returning();

    if (updated.length === 0) {
      return new Response(JSON.stringify({ error: "Page not found" }), { status: 404, headers: { "content-type": "application/json" } });
    }

    return new Response(JSON.stringify(updated[0]), { status: 200, headers: { "content-type": "application/json" } });
  } catch (error) {
    console.error("PUT /api/cms/pages/[slug] error", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
