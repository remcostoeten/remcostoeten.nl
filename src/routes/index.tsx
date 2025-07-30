import { HeroSection, AboutSection, ProjectsSection, ContactSection, TimezoneSection } from "~/modules/sections";

function HomePage() {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <div class="container-centered">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
        <TimezoneSection        />
      </div>
    </div>
  );
}

export default HomePage;
