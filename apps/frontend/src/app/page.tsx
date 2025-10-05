import {
  HeroSection,
  AboutSection,
  ProjectsSection,
  LatestActivitySection,
  ContactSection,
  TimezoneSection,
  BlogSection
} from "@/modules/sections";
import { AnnouncementBanner } from "@/shared/components/announcement";
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Remco Stoeten | Software Engineer (React, Next.js, TypeScript)",
  description: "Portfolio, projects, and blog by Remco Stoeten. Frontend-focused software engineer building modern web applications with React, Next.js, and TypeScript.",
  alternates: {
    canonical: "https://remcostoeten.nl/",
  },
};

export default async function HomePage() {
  return (
    <main id="main-content" role="main" className='home'>
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
