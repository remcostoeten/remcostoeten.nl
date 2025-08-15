import { authenticateUser, setAuthCookie } from "~/lib/auth";

export async function POST({ request }: { request: Request }) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let email = "";
    let password = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = String(body.email || "");
      password = String(body.password || "");
    } else {
      const form = await request.formData();
      email = String(form.get("email") || "");
      password = String(form.get("password") || "");
    }

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    await setAuthCookie(user);

    return new Response(JSON.stringify({ success: true, user }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("/api/auth/login error", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
