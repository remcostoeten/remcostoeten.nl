import { createSignal } from "solid-js";
import { action, redirect } from "@solidjs/router";

const loginAction = action(async (formData: FormData) => {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    return { ok: false, error: "Email and password are required" } as const;
  }
  const { authenticateUser, setAuthCookie } = await import("~/lib/auth");
  const user = await authenticateUser(email, password);
  if (!user) {
    return { ok: false, error: "Invalid credentials" } as const;
  }
  await setAuthCookie(user);
  throw redirect("/cms");
});

export default function Login() {
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);

  async function onSubmit(e: Event) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const result = await loginAction(formData).catch((err) => ({ ok: false, error: String(err) } as const));
    if (result && !("ok" in result)) {
      // redirect thrown by action
      return;
    }
    if (result && !result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="w-full max-w-md bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 class="text-2xl font-bold text-center">CMS Login</h1>
        <p class="text-sm text-gray-500 text-center mt-1">Enter your credentials to access the CMS</p>
        <form class="mt-6 space-y-4" onSubmit={onSubmit}>
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" name="email" type="email" required class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" required class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>
          {error() && <div class="text-red-600 text-sm text-center">{error()}</div>}
          <button type="submit" disabled={loading()} class="w-full rounded-md bg-black text-white py-2 font-medium hover:opacity-90 disabled:opacity-50">
            {loading() ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
