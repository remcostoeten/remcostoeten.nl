import {
  AboutSection,
  ProjectsSection,
  ContactSection,
  TimezoneSection,
} from "@/modules/sections";

export const dynamic = 'force-dynamic';

const LatestActivitySection = dynamic(() => import("@/modules/sections").then(m => m.LatestActivitySection), { ssr: true });
const BlogSection = dynamic(() => import("@/modules/sections").then(m => m.BlogSection), { ssr: true });
import { AnnouncementBanner } from "@/shared/components/announcement";
import type { Metadata } from 'next';
import { buildSeo } from "@/lib/seo";


export const metadata: Metadata = {
  title: "Remco Stoeten | Software Engineer (React, Next.js, TypeScript)",
  description: "Portfolio, projects, and blog by Remco Stoeten. Frontend-focused software engineer building modern web applications with React, Next.js, and TypeScript.",
  alternates: { canonical: "https://remcostoeten.nl/" },
  ...buildSeo({
    title: "Remco Stoeten | Software Engineer (React, Next.js, TypeScript)",
    description: "Portfolio, projects, and blog by Remco Stoeten. Frontend-focused software engineer building modern web applications with React, Next.js, and TypeScript.",
    url: "https://remcostoeten.nl/",
  }),
};

export default async function HomePage() {
  return (
    <main id="main-content" role="main" className='home'>
      <h1 className="sr-only">Remco Stoeten — Software Engineer</h1>
      <div className="space-y-8">
        <AnnouncementBanner />
        {/* <HeroSection /> */}
        <AboutSection />
        <LatestActivitySection />
        <ProjectsSection />
        <BlogSection />
        <ContactSection />
        <TimezoneSection />
      </div>
    </main>
  );
}
