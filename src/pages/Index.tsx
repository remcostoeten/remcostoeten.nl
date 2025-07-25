// import { PageLayout } from "@/components/layout/PageLayout";
import { 
  HeroSection, 
  AboutSection, 
  ProjectsSection, 
  ContactSection, 
  TimezoneSection 
} from "@/modules/sections";

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-16">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
        <TimezoneSection />
      </div>
    </div>
  );
}

export default Index;