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
    
    
    
  );
}
