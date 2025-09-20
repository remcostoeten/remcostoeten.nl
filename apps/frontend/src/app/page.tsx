import { PageLayout } from "@/components/layout/PageLayout";
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
    <PageLayout>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <LatestProjectSection />
      <BlogSection />
      <ContactSection />
      <TimezoneSection />
    </PageLayout>
  );
}