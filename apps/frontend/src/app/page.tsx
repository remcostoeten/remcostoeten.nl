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
 import {  LatestActivityRedesign } from "@/components/latest-activity-redesign";

export default async function HomePage() {
  return (
    <PageLayout>
      <HeroSection />
      <AboutSection />
      <LatestActivityRedesign />
      <ProjectsSection />
      <LatestProjectSection />
      <BlogSection />
      <ContactSection />
      <TimezoneSection />
    </PageLayout>
  );
}
