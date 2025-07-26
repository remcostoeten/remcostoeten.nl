import { HeroSection, AboutSection, ProjectsSection, ContactSection, TimezoneSection } from "~/modules/sections";
import { CMSContainer } from "~/cms/container";

function HomePage() {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <div class={CMSContainer()}>
        {/* Navigation */}
        <nav class="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div class="flex items-center gap-4">
            <span class="text-primary font-medium">Home</span>
          </div>
          <div class="text-xs text-muted-foreground">
            <span class="hidden sm:inline">Try: </span>
            <kbd class="bg-background px-2 py-1 rounded text-xs">⎵ ⎵ ⎵ 1</kbd>
            <span class="hidden sm:inline"> for admin</span>
          </div>
        </nav>
        
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
