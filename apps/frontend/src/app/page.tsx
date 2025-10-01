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
