import bcrypt from "bcryptjs";
import { createDb } from "~/db/client";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function POST({ request }: { request: Request }) {
  try {
    const db = createDb();
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "remcostoeten@hotmail.com");
    const password = String(body.password || "Mhca6r4g1!");

    const hashed = await bcrypt.hash(password, 12);

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      await db.update(users).set({ password: hashed }).where(eq(users.email, email));
    } else {
      await db.insert(users).values({ email, password: hashed, role: "admin" });
    }

    const verify = await bcrypt.compare(password, hashed);

    return new Response(JSON.stringify({ success: true, hashWorks: verify }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("/api/setup-admin error", error);
    return new Response(JSON.stringify({ error: "Setup failed" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: "Use POST with { email, password }" }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
}
