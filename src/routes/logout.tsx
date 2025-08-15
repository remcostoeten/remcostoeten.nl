import { action, redirect } from "@solidjs/router";

export const logoutAction = action(async () => {
  const { clearAuthCookie } = await import("~/lib/auth");
  await clearAuthCookie();
  throw redirect("/login");
});

export default function Logout() {
  return null;
}
