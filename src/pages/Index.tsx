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
        {/* Navigation */}
        <nav className="flex gap-4 p-4 bg-muted rounded-lg">
          <a href="/" className="text-primary font-medium">Home</a>
          <a href="/timezone-demo" className="text-muted-foreground hover:text-primary transition-colors">Timezone Demo</a>
          <a href="/numberflow-test" className="text-muted-foreground hover:text-primary transition-colors">NumberFlow Test</a>
        </nav>
        
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