import { createDb } from "~/db/client";
import { pages, pageVersions } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const db = createDb();

    const homepageWidgets = [
      { id: "header-1", type: "header", props: { logo: { src: "/gradient.png", alt: "logo", width: 100, height: 100 }, navigation: [ { label: "work", href: "https://www.figma.com/proto/V0gqcvrLqb8H05Mo90mOCL/Portfolio?node-id=1-3601&t=3QozI3ydj9zgIlkI-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A3601", external: true }, { label: "experience", href: "/experience" }, { label: "connect", href: "/connect" } ] } },
      { id: "hero-1", type: "hero", props: { name: "Ritu Gaur", tagline: "design • ui/ux • branding • no code", badge: { text: "open to work", rotation: -6, animated: true } } },
      { id: "bio-1", type: "text", props: { content: "Hi there, I'm Hritu, a student and designer focused on **digital experiences**. I blend **aesthetics** with **functionality** to create intuitive interfaces. Through **research** and **design**, I craft solutions that solve real user needs.", size: "sm", className: "mb-12 max-w-3xl" } },
      { id: "social-1", type: "social-links", props: { links: [ { platform: "twitter", url: "https://x.com/ritss32", label: "twitter" }, { platform: "dribbble", url: "https://dribbble.com/thisisritu", label: "dribbble" }, { platform: "behance", url: "https://www.behance.net/thisisritu", label: "behance" }, { platform: "linkedin", url: "https://www.linkedin.com/in/ritu-gaur-b717a0315/", label: "linkedin" }, { platform: "email", url: "mailto:ritugaur564@gmail.com", label: "email" } ] } },
      { id: "projects-1", type: "projects", props: { title: "latest projects", projects: [ { name: "Lucia Dashboard", url: "https://github.com/remcostoeten/nextjs-lucia-neon-postgresql-drizzle-dashboard", github: true, external: true }, { name: "File Tree", url: "https://github.com/remcostoeten/Beautiful-interactive-file-tree", github: true, external: true }, { name: "Sync Node", url: "https://www.figma.com/proto/V0gqcvrLqb8H05Mo90mOCL/Portfolio?node-id=1-2912&t=3QozI3ydj9zgIlkI-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A3601", external: true } ] } },
      { id: "tools-1", type: "tools", props: { title: "tools", tools: [ { name: "Figma", icon: "figma" }, { name: "Framer", icon: "/framer.svg" }, { name: "Spline", icon: "/spline_logo.webp" }, { name: "Rive", icon: "/rive.webp" }, { name: "Photoshop", icon: "/photoshop.png" }, { name: "Canva", icon: "/canva.svg" } ] } },
      { id: "ai-tools-1", type: "tools", props: { title: "ai tools", tools: [ { name: "Synthesia", icon: "synthesia" }, { name: "Galileo" }, { name: "Relume", icon: "/relume.png" }, { name: "Midjourney", icon: "/mid.webp" }, { name: "Stitch by Google", icon: "/google.webp" } ] } },
      { id: "footer-1", type: "footer", props: { feedbackText: "Feel free to drop a feedback my", feedbackLink: "https://x.com/ritss32", statusText: "Currently High on Creativity" } },
    ];

    const pageData = {
      slug: "home",
      title: "Homepage",
      widgets: homepageWidgets,
      metadata: { description: "Portfolio homepage for Ritu Gaur", author: "Ritu Gaur" },
    };

    const [existing] = await db.select().from(pages).where(eq(pages.slug, "home")).limit(1);

    if (existing) {
      await db.update(pages).set({ title: "Homepage", content: pageData, isPublished: true, updatedAt: new Date() }).where(eq(pages.slug, "home"));
    } else {
      await db.insert(pages).values({ slug: "home", title: "Homepage", content: pageData, isPublished: true });
    }

    await db.insert(pageVersions).values({ pageSlug: "home", versionNumber: 1, content: pageData, commitMessage: "Initial homepage conversion to CMS", author: "System" }).onConflictDoNothing();

    return new Response(JSON.stringify({ success: true, message: "Homepage successfully converted to CMS widgets", widgets: homepageWidgets.length }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (error) {
    console.error("/api/convert-homepage error", error);
    return new Response(JSON.stringify({ error: "Failed to convert homepage" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
