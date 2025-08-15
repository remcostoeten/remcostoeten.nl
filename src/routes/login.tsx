import { createSignal } from "solid-js";
import { action, redirect } from "@solidjs/router";
import { authenticateUser, setAuthCookie } from "~/lib/auth";

const loginAction = action(async (formData: FormData) => {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    return { ok: false, error: "Email and password are required" } as const;
  }
  const user = await authenticateUser(email, password);
  if (!user) {
    return { ok: false, error: "Invalid credentials" } as const;
  }
  await setAuthCookie(user);
  throw redirect("/cms");
});

export default function Login() {
  const [error, setError] = createSignal<string | null>(null);
  return (
    
    
    
    
    
    
    
    
    
    
    
    
  );
}
