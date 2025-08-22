import React from "react";
import { SwappingWordsLoader } from "./swapping-word-loader";


export function SwappingLoaderExamples() {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold mb-4">SwappingWordsLoader Examples</h2>
      
      {}
      <div>
        <h3 className="text-lg font-semibold mb-2">Default (CMS Colors)</h3>
        <SwappingWordsLoader />
      </div>

      {}
      <div>
        <h3 className="text-lg font-semibold mb-2">Custom Text & Words</h3>
        <SwappingWordsLoader 
          loadingText="building"
          words={["components", "layouts", "features", "designs", "components"]}
        />
      </div>

      {}
      <div>
        <h3 className="text-lg font-semibold mb-2">Secondary Theme</h3>
        <SwappingWordsLoader 
          backgroundColor="hsl(var(--secondary))"
          gradientTopBottom="hsl(var(--secondary))"
          textColor="hsl(var(--foreground))"
          wordColor="hsl(var(--accent))"
        />
      </div>

      {}
      <div>
        <h3 className="text-lg font-semibold mb-2">Muted Theme</h3>
        <SwappingWordsLoader 
          backgroundColor="hsl(var(--muted))"
          gradientTopBottom="hsl(var(--muted))"
          textColor="hsl(var(--muted-foreground))"
          wordColor="hsl(var(--foreground))"
        />
      </div>

      {}
      <div>
        <h3 className="text-lg font-semibold mb-2">Accent Background</h3>
        <SwappingWordsLoader 
          backgroundColor="hsl(var(--accent))"
          gradientTopBottom="hsl(var(--accent))"
          textColor="hsl(var(--accent-foreground))"
          wordColor="hsl(var(--background))"
        />
      </div>

      {}
      <div>
        <h3 className="text-lg font-semibold mb-2">Fast Animation</h3>
        <SwappingWordsLoader 
          animationDuration="2s"
          words={["fast", "quick", "speedy", "rapid", "fast"]}
        />
      </div>

      {}
      <div>
        <h3 className="text-lg font-semibold mb-2">Large Text</h3>
        <SwappingWordsLoader 
          fontSize="35px"
          loadingText="processing"
        />
      </div>

      {}
      <div>
        <h3 className="text-lg font-semibold mb-2">Custom Colors (Override)</h3>
        <SwappingWordsLoader 
          backgroundColor="#1a1a1a"
          gradientTopBottom="#1a1a1a"
          textColor="#888888"
          wordColor="#60a5fa"
        />
      </div>
    </div>
  );
}
