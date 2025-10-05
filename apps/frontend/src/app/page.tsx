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

export const dynamic = 'force-dynamic';

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
