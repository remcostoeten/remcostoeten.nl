import { createAsync } from "@solidjs/router";
import { getCurrentUser } from "~/lib/auth";

export const route = {
  preload: async () => {
    const user = await getCurrentUser();
    if (!user) {
      return Response.redirect("/login", 302);
    }
  },
};

export default function CMSIndex() {
  const user = createAsync(() => getCurrentUser());
  return (
    <div class="h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-xl font-semibold">CMS</div>
        <div class="text-gray-500 mt-2">Welcome {user()?.email || ""}</div>
      </div>
    </div>
  );
}
