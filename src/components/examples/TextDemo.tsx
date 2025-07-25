import { Text } from '@/components/ui/text';

export function TextDemo() {
  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Text as="h1" size="4xl" weight="bold" gradient>Text Component Showcase</Text>
          <Text variant="muted" size="lg">Comprehensive demonstration of all Text component props and features</Text>
        </div>
        
        {/* Variants */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Text Variants</Text>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Default</Text>
              <Text>Default text styling</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Accent</Text>
              <Text variant="accent">Accent text (lime green)</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Muted</Text>
              <Text variant="muted">Muted text for secondary content</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Primary</Text>
              <Text variant="primary">Primary text variant</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Secondary</Text>
              <Text variant="secondary">Secondary text variant</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Destructive</Text>
              <Text variant="destructive">Destructive/error text</Text>
            </div>
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Text Sizes</Text>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Text size="xs" className="w-16 text-muted-foreground">xs</Text>
              <Text size="xs">Extra small text (12px)</Text>
            </div>
            <div className="flex items-center gap-4">
              <Text size="sm" className="w-16 text-muted-foreground">sm</Text>
              <Text size="sm">Small text (14px)</Text>
            </div>
            <div className="flex items-center gap-4">
              <Text size="base" className="w-16 text-muted-foreground">base</Text>
              <Text size="base">Base text (16px) - default</Text>
            </div>
            <div className="flex items-center gap-4">
              <Text size="lg" className="w-16 text-muted-foreground">lg</Text>
              <Text size="lg">Large text (18px)</Text>
            </div>
            <div className="flex items-center gap-4">
              <Text size="xl" className="w-16 text-muted-foreground">xl</Text>
              <Text size="xl">Extra large text (20px)</Text>
            </div>
            <div className="flex items-center gap-4">
              <Text size="2xl" className="w-16 text-muted-foreground">2xl</Text>
              <Text size="2xl">2XL text (24px)</Text>
            </div>
            <div className="flex items-center gap-4">
              <Text size="3xl" className="w-16 text-muted-foreground">3xl</Text>
              <Text size="3xl">3XL text (30px)</Text>
            </div>
            <div className="flex items-center gap-4">
              <Text size="4xl" className="w-16 text-muted-foreground">4xl</Text>
              <Text size="4xl">4XL text (36px)</Text>
            </div>
            <div className="flex items-center gap-4">
              <Text size="5xl" className="w-16 text-muted-foreground">5xl</Text>
              <Text size="5xl">5XL text (48px)</Text>
            </div>
            <div className="flex items-center gap-4">
              <Text size="6xl" className="w-16 text-muted-foreground">6xl</Text>
              <Text size="6xl">6XL text (60px)</Text>
            </div>
          </div>
        </section>

        {/* Weights */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Font Weights</Text>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Light (300)</Text>
              <Text weight="light" size="lg">Light weight text</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Normal (400)</Text>
              <Text weight="normal" size="lg">Normal weight text</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Medium (500)</Text>
              <Text weight="medium" size="lg">Medium weight text</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Semibold (600)</Text>
              <Text weight="semibold" size="lg">Semibold weight text</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Bold (700)</Text>
              <Text weight="bold" size="lg">Bold weight text</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Extrabold (800)</Text>
              <Text weight="extrabold" size="lg">Extra bold weight text</Text>
            </div>
          </div>
        </section>

        {/* Special Effects */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Special Effects</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Glow Effect</Text>
                <Text variant="accent" glow size="lg">Text with lime green glow effect</Text>
              </div>
              <div className="space-y-2">
                <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Gradient</Text>
                <Text gradient size="xl" weight="bold">Gradient text from accent to primary</Text>
              </div>
              <div className="space-y-2">
                <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Highlight</Text>
                <Text highlight size="lg">Highlighted text with accent background</Text>
              </div>
              <div className="space-y-2">
                <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Truncate</Text>
                <div className="w-48">
                  <Text truncate>This is a very long text that will be truncated with ellipsis</Text>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Pulse Animation</Text>
                <Text variant="accent" animate="pulse" size="lg">Pulsing accent text</Text>
              </div>
              <div className="space-y-2">
                <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Bounce Animation</Text>
                <Text animate="bounce" size="lg">Bouncing text animation</Text>
              </div>
              <div className="space-y-2">
                <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Fade In Animation</Text>
                <Text animate="fade-in" size="lg">Fade in animation</Text>
              </div>
              <div className="space-y-2">
                <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Shimmer Animation</Text>
                <Text animate="shimmer" size="lg" variant="accent">Shimmer effect text</Text>
              </div>
            </div>
          </div>
        </section>

        {/* Text Transformations and Decorations */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Text Transformations & Decorations</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Text size="lg" weight="semibold" variant="accent">Transformations</Text>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Text className="w-24 text-muted-foreground text-sm">uppercase</Text>
                  <Text transform="uppercase" size="lg">uppercase text</Text>
                </div>
                <div className="flex items-center gap-4">
                  <Text className="w-24 text-muted-foreground text-sm">lowercase</Text>
                  <Text transform="lowercase" size="lg">LOWERCASE TEXT</Text>
                </div>
                <div className="flex items-center gap-4">
                  <Text className="w-24 text-muted-foreground text-sm">capitalize</Text>
                  <Text transform="capitalize" size="lg">capitalize each word</Text>
                </div>
                <div className="flex items-center gap-4">
                  <Text className="w-24 text-muted-foreground text-sm">italic</Text>
                  <Text italic size="lg">Italic text styling</Text>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Text size="lg" weight="semibold" variant="accent">Decorations</Text>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Text className="w-24 text-muted-foreground text-sm">underline</Text>
                  <Text decoration="underline" size="lg">Underlined text</Text>
                </div>
                <div className="flex items-center gap-4">
                  <Text className="w-24 text-muted-foreground text-sm">line-through</Text>
                  <Text decoration="line-through" size="lg">Strikethrough text</Text>
                </div>
                <div className="flex items-center gap-4">
                  <Text className="w-24 text-muted-foreground text-sm">overline</Text>
                  <Text decoration="overline" size="lg">Overlined text</Text>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alignment */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Text Alignment</Text>
          <div className="space-y-4 border border-border p-6 rounded-lg bg-muted/5">
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Left Aligned</Text>
              <Text align="left" className="block" size="lg">Left aligned text (default)</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Center Aligned</Text>
              <Text align="center" className="block" size="lg">Center aligned text</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Right Aligned</Text>
              <Text align="right" className="block" size="lg">Right aligned text</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Justify Aligned</Text>
              <Text align="justify" className="block" leading="relaxed">
                Justified text that spans multiple lines to demonstrate the justify alignment. 
                This text should be evenly distributed across the available width when it wraps to multiple lines.
                Notice how the spacing between words is automatically adjusted to create clean edges on both sides.
              </Text>
            </div>
          </div>
        </section>

        {/* Typography families */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Font Families</Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Sans-serif</Text>
              <Text family="sans" size="lg" className="block">Sans-serif font family (default)</Text>
              <Text family="sans" variant="muted" size="sm">Modern, clean, and highly readable</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Serif</Text>
              <Text family="serif" size="lg" className="block">Serif font family</Text>
              <Text family="serif" variant="muted" size="sm">Traditional, elegant, good for long-form text</Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Monospace</Text>
              <Text family="mono" size="lg" className="block">Monospace font family</Text>
              <Text family="mono" variant="muted" size="sm">Fixed-width, perfect for code</Text>
            </div>
          </div>
        </section>

        {/* Letter spacing */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Letter Spacing (Tracking)</Text>
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">tighter</Text>
              <Text spacing="tighter" size="lg">Tighter letter spacing</Text>
            </div>
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">tight</Text>
              <Text spacing="tight" size="lg">Tight letter spacing</Text>
            </div>
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">normal</Text>
              <Text spacing="normal" size="lg">Normal letter spacing</Text>
            </div>
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">wide</Text>
              <Text spacing="wide" size="lg">Wide letter spacing</Text>
            </div>
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">wider</Text>
              <Text spacing="wider" size="lg">Wider letter spacing</Text>
            </div>
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">widest</Text>
              <Text spacing="widest" size="lg">Widest letter spacing</Text>
            </div>
          </div>
        </section>

        {/* Line height */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Line Heights (Leading)</Text>
          <div className="space-y-6 border border-border p-6 rounded-lg bg-muted/5">
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">None</Text>
              <Text leading="none" className="block" size="lg">
                None line height. This creates very tight line spacing that can be useful for headlines 
                or when you need compact text layout with minimal vertical space.
              </Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Tight</Text>
              <Text leading="tight" className="block" size="lg">
                Tight line height. This text demonstrates how tight leading affects multi-line text 
                and the spacing between lines in a paragraph or block of text.
              </Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Snug</Text>
              <Text leading="snug" className="block" size="lg">
                Snug line height. This provides slightly more breathing room than tight leading 
                while still maintaining a compact feel for your text blocks.
              </Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Normal</Text>
              <Text leading="normal" className="block" size="lg">
                Normal line height (default). This text demonstrates how normal leading affects multi-line text 
                and provides balanced spacing between lines for optimal readability.
              </Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Relaxed</Text>
              <Text leading="relaxed" className="block" size="lg">
                Relaxed line height. This provides more generous spacing between lines, 
                creating a more airy and comfortable reading experience for longer text passages.
              </Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Loose</Text>
              <Text leading="loose" className="block" size="lg">
                Loose line height. This creates the most generous spacing between lines, 
                which can improve readability for certain contexts and create a very open, breathable layout.
              </Text>
            </div>
          </div>
        </section>

        {/* Opacity levels */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Opacity Levels</Text>
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">full</Text>
              <Text opacity="full" size="lg">Full opacity (100%)</Text>
            </div>
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">high</Text>
              <Text opacity="high" size="lg">High opacity (90%)</Text>
            </div>
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">medium</Text>
              <Text opacity="medium" size="lg">Medium opacity (75%)</Text>
            </div>
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">low</Text>
              <Text opacity="low" size="lg">Low opacity (50%)</Text>
            </div>
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">lower</Text>
              <Text opacity="lower" size="lg">Lower opacity (25%)</Text>
            </div>
            <div className="flex items-center gap-6">
              <Text className="w-20 text-muted-foreground text-sm">lowest</Text>
              <Text opacity="lowest" size="lg">Lowest opacity (10%)</Text>
            </div>
          </div>
        </section>

        {/* Line clamping */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Line Clamping</Text>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">1 Line Clamp</Text>
              <Text maxLines={1} className="block" size="lg">
                This text will be clamped to a single line no matter how long it gets and will show ellipsis.
              </Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">2 Line Clamp</Text>
              <Text maxLines={2} className="block" size="lg">
                This is a longer text that will be clamped to exactly 2 lines. 
                Any content beyond these two lines will be hidden with an ellipsis. 
                This is useful for creating consistent layouts with varying content lengths.
              </Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">3 Line Clamp</Text>
              <Text maxLines={3} className="block" size="lg">
                This text demonstrates 3-line clamping. It's perfect for preview cards, 
                article summaries, or any content where you need to maintain consistent 
                height while allowing more content to be visible than single or double line clamps.
                Any additional content beyond these three lines will be truncated with ellipsis.
              </Text>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">6 Line Clamp</Text>
              <Text maxLines={6} className="block" size="lg">
                This demonstrates the maximum line clamp of 6 lines. This is useful for longer previews 
                where you want to show substantial content but still maintain layout consistency. 
                You can see how the text flows naturally until it reaches the maximum number of lines, 
                at which point it will be truncated with an ellipsis. This is particularly useful 
                for blog post previews, product descriptions, or detailed content cards where you want 
                to provide enough information to be useful while keeping the layout predictable and clean.
              </Text>
            </div>
          </div>
        </section>

        {/* As different HTML elements */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">HTML Elements (as prop)</Text>
          <div className="space-y-4">
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Headings</Text>
              <div className="space-y-3">
                <Text as="h1" size="4xl" weight="bold">H1 Heading Element</Text>
                <Text as="h2" size="3xl" weight="semibold">H2 Heading Element</Text>
                <Text as="h3" size="2xl" weight="semibold">H3 Heading Element</Text>
                <Text as="h4" size="xl" weight="medium">H4 Heading Element</Text>
                <Text as="h5" size="lg" weight="medium">H5 Heading Element</Text>
                <Text as="h6" size="base" weight="medium">H6 Heading Element</Text>
              </div>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Text Elements</Text>
              <div className="space-y-3">
                <Text as="p" className="block" leading="relaxed">
                  Paragraph element with block display. This demonstrates how the Text component 
                  can render as a proper paragraph with appropriate spacing and line height.
                </Text>
                <Text as="span">Inline span element that flows with surrounding text</Text>
                <Text as="div" className="block" variant="muted">
                  Div element rendered as a block-level container
                </Text>
              </div>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Code Elements</Text>
              <div className="space-y-3">
                <Text as="code" family="mono" variant="accent" className="bg-muted px-2 py-1 rounded">
                  Inline code element with monospace font
                </Text>
                <Text as="pre" family="mono" className="block bg-muted p-4 rounded overflow-x-auto">
{`function example() {
  return "Preformatted code block";
}`}
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Links (href prop)</Text>
          <div className="space-y-4">
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Internal Links</Text>
              <div className="space-y-2">
                <Text href="#" variant="accent" decoration="underline" size="lg">
                  Internal link with accent styling and underline
                </Text>
                <Text href="#variants" variant="primary" weight="medium">
                  Link to variants section (no underline)
                </Text>
              </div>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">External Links</Text>
              <div className="space-y-2">
                <Text href="https://example.com" target="_blank" variant="accent" glow size="lg">
                  External link with glow effect (opens in new tab)
                </Text>
                <Text href="https://github.com" target="_self" variant="accent" decoration="underline">
                  External link opening in same tab
                </Text>
              </div>
            </div>
            <div className="space-y-2">
              <Text size="sm" variant="muted" weight="medium">Note: Links automatically render as &lt;a&gt; elements when href prop is provided</Text>
            </div>
          </div>
        </section>

        {/* Real-world examples */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Real-world Examples</Text>
          <div className="space-y-8">
            {/* Hero section example */}
            <div className="space-y-4 p-6 border border-border rounded-lg bg-gradient-to-br from-background to-muted/20">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Hero Section</Text>
              <div className="space-y-3">
                <Text as="h1" size="4xl" weight="bold" leading="tight" className="max-w-2xl">
                  Build your own <Text variant="accent" weight="bold" glow>Authentication</Text> system
                </Text>
                <Text variant="muted" leading="relaxed" size="lg" className="max-w-xl">
                  Create a secure, scalable authentication solution tailored to your needs. 
                  No more relying on third-party services - take full control of your user management.
                </Text>
                <div className="flex gap-4 mt-6">
                  <Text as="a" href="#" variant="accent" weight="semibold" className="bg-accent text-accent-foreground px-6 py-2 rounded-md hover:bg-accent/90 transition-colors">
                    Get Started
                  </Text>
                  <Text as="a" href="#" variant="muted" weight="medium" decoration="underline">
                    Learn More
                  </Text>
                </div>
              </div>
            </div>

            {/* Card example */}
            <div className="space-y-4 p-6 border border-border rounded-lg">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Article Card</Text>
              <div className="space-y-3">
                <Text variant="accent" size="xs" weight="medium" transform="uppercase" spacing="widest">
                  Featured Article
                </Text>
                <Text as="h3" size="xl" weight="semibold" leading="tight">
                  Getting Started with <Text variant="accent">Next.js</Text> and TypeScript
                </Text>
                <Text variant="muted" maxLines={2} leading="relaxed">
                  Learn how to set up a modern Next.js application with TypeScript, 
                  including best practices for project structure, type safety, and development workflow.
                </Text>
                <div className="flex items-center justify-between pt-2">
                  <Text variant="muted" size="sm">5 min read</Text>
                  <Text variant="accent" size="sm" weight="medium" href="#" decoration="underline">
                    Read more
                  </Text>
                </div>
              </div>
            </div>

            {/* Status indicators */}
            <div className="space-y-4 p-6 border border-border rounded-lg">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Status Indicators</Text>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Text variant="muted" size="sm">System Status:</Text>
                  <Text variant="accent" weight="medium" highlight>
                    Operational
                  </Text>
                </div>
                <div className="flex items-center gap-3">
                  <Text variant="muted" size="sm">Deploy Status:</Text>
                  <Text variant="accent" weight="medium" animate="pulse">
                    Building...
                  </Text>
                </div>
                <div className="flex items-center gap-3">
                  <Text variant="muted" size="sm">Error:</Text>
                  <Text variant="destructive" weight="medium" family="mono" size="sm">
                    Failed to load config.json
                  </Text>
                </div>
              </div>
            </div>

            {/* Code documentation */}
            <div className="space-y-4 p-6 border border-border rounded-lg">
              <Text size="sm" variant="muted" weight="medium" transform="uppercase" spacing="wide">Code Documentation</Text>
              <div className="space-y-3">
                <Text as="h4" size="lg" weight="semibold">
                  <Text as="code" family="mono" variant="accent">Text</Text> Component API
                </Text>
                <Text variant="muted" leading="relaxed">
                  The Text component provides a flexible way to render text with consistent styling. 
                  It supports multiple variants, sizes, and styling options.
                </Text>
                <div className="bg-muted p-4 rounded">
                  <Text as="pre" family="mono" size="sm">
                    <Text variant="accent">&lt;Text</Text> variant=<Text variant="primary">"accent"</Text> size=<Text variant="primary">"lg"</Text> weight=<Text variant="primary">"bold"</Text><Text variant="accent">&gt;</Text>
                    <Text>  Your text content</Text>
                    <Text variant="accent">&lt;/Text&gt;</Text>
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Props Summary */}
        <section className="space-y-4">
          <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">All Available Props</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2 p-4 border border-border rounded-lg">
              <Text weight="semibold" variant="accent">Visual Props</Text>
              <div className="text-sm space-y-1">
                <Text variant="muted" family="mono">variant: default | accent | muted | destructive | secondary | primary</Text>
                <Text variant="muted" family="mono">size: xs | sm | base | lg | xl | 2xl | 3xl | 4xl | 5xl | 6xl</Text>
                <Text variant="muted" family="mono">weight: light | normal | medium | semibold | bold | extrabold</Text>
                <Text variant="muted" family="mono">opacity: full | high | medium | low | lower | lowest</Text>
              </div>
            </div>
            <div className="space-y-2 p-4 border border-border rounded-lg">
              <Text weight="semibold" variant="accent">Layout Props</Text>
              <div className="text-sm space-y-1">
                <Text variant="muted" family="mono">align: left | center | right | justify</Text>
                <Text variant="muted" family="mono">family: sans | serif | mono</Text>
                <Text variant="muted" family="mono">leading: none | tight | snug | normal | relaxed | loose</Text>
                <Text variant="muted" family="mono">spacing: tighter | tight | normal | wide | wider | widest</Text>
              </div>
            </div>
            <div className="space-y-2 p-4 border border-border rounded-lg">
              <Text weight="semibold" variant="accent">Style Props</Text>
              <div className="text-sm space-y-1">
                <Text variant="muted" family="mono">transform: none | uppercase | lowercase | capitalize</Text>
                <Text variant="muted" family="mono">decoration: none | underline | line-through | overline</Text>
                <Text variant="muted" family="mono">animate: none | pulse | bounce | fade-in | slide-up | shimmer</Text>
                <Text variant="muted" family="mono">as: p | span | div | h1-h6 | a | code | pre</Text>
              </div>
            </div>
            <div className="space-y-2 p-4 border border-border rounded-lg">
              <Text weight="semibold" variant="accent">Special Props</Text>
              <div className="text-sm space-y-1">
                <Text variant="muted" family="mono">gradient: boolean</Text>
                <Text variant="muted" family="mono">glow: boolean</Text>
                <Text variant="muted" family="mono">highlight: boolean</Text>
                <Text variant="muted" family="mono">truncate: boolean</Text>
                <Text variant="muted" family="mono">italic: boolean</Text>
              </div>
            </div>
            <div className="space-y-2 p-4 border border-border rounded-lg">
              <Text weight="semibold" variant="accent">Behavior Props</Text>
              <div className="text-sm space-y-1">
                <Text variant="muted" family="mono">maxLines: 1 | 2 | 3 | 4 | 5 | 6</Text>
                <Text variant="muted" family="mono">href: string</Text>
                <Text variant="muted" family="mono">target: _blank | _self</Text>
                <Text variant="muted" family="mono">className: string</Text>
              </div>
            </div>
            <div className="space-y-2 p-4 border border-border rounded-lg">
              <Text weight="semibold" variant="accent">Content</Text>
              <div className="text-sm space-y-1">
                <Text variant="muted" family="mono">children: ReactNode</Text>
                <Text variant="muted">Plus all standard HTML attributes</Text>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
