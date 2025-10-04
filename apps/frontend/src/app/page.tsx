// PageLayout is now handled by template.tsx
import {
  HeroSection,
  AboutSection,
  ProjectsSection,
  LatestProjectSection,
  ContactSection,
  TimezoneSection,
  BlogSection
} from "@/modules/sections";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  return (
    <div className='home'>
      <div className="space-y-12"><HeroSection />
        <AboutSection />
      </div>
      <ProjectsSection />
      <LatestProjectSection />
      <BlogSection />
      <ContactSection />
      <TimezoneSection />
    </div>
  );
}
