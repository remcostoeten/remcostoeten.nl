import { PageLayout } from "@/components/layout/PageLayout";
import { 
  HeroSection, 
  AboutSection, 
  ProjectsSection, 
  ContactSection, 
  TimezoneSection 
} from "@/modules/sections";

function Index() {
  return (
    <PageLayout>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <ContactSection />
      <TimezoneSection />
    </PageLayout>
  );
}

export default Index;