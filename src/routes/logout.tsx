import { action, redirect } from "@solidjs/router";
import { clearAuthCookie } from "~/lib/auth";

export const logoutAction = action(async () => {
  await clearAuthCookie();
  throw redirect("/login");
});

export default function Logout() {
  return null;
}
