import { HeroSection } from "~/modules/sections/hero-section";
import { AboutSection } from "~/modules/sections/about-section";
import { ProjectsSection } from "~/modules/sections/projects-section";
import { ContactSection } from "~/modules/sections/contact-section";
import { TimezoneSection } from "~/modules/sections/timezone-section";

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
