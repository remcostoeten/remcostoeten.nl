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
        <nav className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div className="flex gap-4">
            <a href="/" className="text-primary font-medium">Home</a>
            <a href="/timezone-demo" className="text-muted-foreground hover:text-primary transition-colors">Timezone Demo</a>
            <a href="/numberflow-test" className="text-muted-foreground hover:text-primary transition-colors">NumberFlow Test</a>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="hidden sm:inline">Try: </span>
            <kbd className="bg-background px-2 py-1 rounded text-xs">⎵ ⎵ ⎵ 1</kbd>
            <span className="hidden sm:inline"> for admin</span>
          </div>
        </nav>
        
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
        <TimezoneSection 
          highlightVariant="dashed" 
          showAnimation={true} 
          animationDelay={0.8}
        />
        
        {/* Example variants - uncomment to test:
        <TimezoneSection highlightVariant="yellow" />
        <TimezoneSection highlightVariant="solid" />
        <TimezoneSection highlightVariant="outline" />
        <TimezoneSection highlightVariant="underline" />
        <TimezoneSection highlightVariant="border-blue" />
        <TimezoneSection highlightVariant="border-green" />
        <TimezoneSection highlightVariant="border-red" />
        <TimezoneSection highlightVariant="border-purple" />
        <TimezoneSection highlightVariant="border-orange" />
        <TimezoneSection highlightVariant="border-pink" />
        <TimezoneSection highlightVariant="border-cyan" />
        <TimezoneSection highlightVariant="dashed" showAnimation={false} />
        */}
      </div>
    </div>
  );
}

export default Index;