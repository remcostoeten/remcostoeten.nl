import {
  AboutSection,
  ProjectsSection,
  Footer,
} from "@/modules/sections";

export const dynamic = 'force-dynamic';

import nextDynamic from "next/dynamic";
import { AnnouncementBanner } from "@/shared/components/announcement";
import type { Metadata } from 'next';
import { buildSeo } from "@/lib/seo";

const LatestActivitySection = nextDynamic(() => import("@/modules/sections").then(m => m.LatestActivitySection), { ssr: true });
const BlogSection = nextDynamic(() => import("@/modules/sections/blog-section").then(m => m.BlogSection), { ssr: true });


export const metadata: Metadata = {
  title: "Remco Stoeten | Front-end Engineer (React, Next.js, TypeScript)",
  description: "Remco Stoeten his personal site containing a handfull of projects, his writings curriculum vitae and other information.",
  alternates: { canonical: "https://remcostoeten.nl/" },
  ...buildSeo({
    title: "Remco Stoeten | Software Engineer (React, Next.js, TypeScript)",
    description: "Remco Stoeten his personal site containing a handfull of projects, his writings curriculum vitae and other information.",
    url: "https://remcostoeten.nl/",
  }),
};

export default async function HomePage() {
  return (
    <main id="main-content" role="main" className='home'>
      <h1 className="sr-only">Remco Stoeten — Front-end Engineer</h1>
      <div className="space-y-8">
        <AnnouncementBanner />
        <AboutSection />
        <LatestActivitySection />
        <ProjectsSection />
        <BlogSection />
        <Footer />
      </div>
    </main>
  );
}
