import { HeroSection, AboutSection, ProjectsSection, ContactSection, TimezoneSection } from "~/modules/sections";
import { CMSContainer } from "~/cms/container";

function HomePage() {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <div class={CMSContainer()}>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
        <TimezoneSection 
          showAnimation={true} 
          animationDelay={0.8}
        />
      </div>
    </div>
  );
}

export default HomePage;
