import {
  HeroSection,
  AboutSection,
  ProjectsSection,
  LatestActivitySection,
  ContactSection,
  TimezoneSection,
  BlogSection
} from "@/modules/sections";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  return (
    <main id="main-content" role="main" className='home'>
      <div className="space-y-12">
        <HeroSection />
        <AboutSection />
        <LatestActivitySection />
      </div>
      <ProjectsSection />

      <BlogSection />
      <ContactSection />
      <TimezoneSection />
    </main>
  );
}
