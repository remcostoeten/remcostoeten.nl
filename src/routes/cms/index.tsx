export const route = {
  preload: async () => {
    const { getCurrentUser } = await import("~/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return Response.redirect("/login", 302);
    }
  },
};

export default function CMSIndex() {
  return (
    <div class="h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-xl font-semibold">CMS</div>
      </div>
    </div>
  );
}
