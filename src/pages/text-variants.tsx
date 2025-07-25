import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function TextVariantsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Navigation */}
        <nav className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">← Back to Home</Link>
          </Button>
        </nav>
        
        {/* Text Component Variants */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <Text as="h1" size="4xl" weight="bold">Text Component Variants</Text>
            <Text variant="muted" size="lg">Different text styles and variants available</Text>
          </div>
          
          <div className="space-y-6">
            {/* Basic Variants */}
            <div className="space-y-3">
              <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Text Variants</Text>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Text size="sm" variant="muted" transform="uppercase" spacing="wide">Default</Text>
                  <Text>Default text styling</Text>
                </div>
                <div className="space-y-1">
                  <Text size="sm" variant="muted" transform="uppercase" spacing="wide">Accent</Text>
                  <Text variant="accent">Accent text (lime green)</Text>
                </div>
                <div className="space-y-1">
                  <Text size="sm" variant="muted" transform="uppercase" spacing="wide">Muted</Text>
                  <Text variant="muted">Muted secondary text</Text>
                </div>
                <div className="space-y-1">
                  <Text size="sm" variant="muted" transform="uppercase" spacing="wide">Primary</Text>
                  <Text variant="primary">Primary text variant</Text>
                </div>
                <div className="space-y-1">
                  <Text size="sm" variant="muted" transform="uppercase" spacing="wide">Secondary</Text>
                  <Text variant="secondary">Secondary text variant</Text>
                </div>
                <div className="space-y-1">
                  <Text size="sm" variant="muted" transform="uppercase" spacing="wide">Destructive</Text>
                  <Text variant="destructive">Error/destructive text</Text>
                </div>
              </div>
            </div>
            
            {/* Sizes */}
            <div className="space-y-3">
              <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Text Sizes</Text>
              <div className="space-y-2">
                <Text size="xs">Extra small text (xs)</Text>
                <Text size="sm">Small text (sm)</Text>
                <Text size="base">Base text (base) - default</Text>
                <Text size="lg">Large text (lg)</Text>
                <Text size="xl">Extra large text (xl)</Text>
                <Text size="2xl">2XL text (2xl)</Text>
                <Text size="3xl">3XL text (3xl)</Text>
                <Text size="4xl">4XL text (4xl)</Text>
                <Text size="5xl">5XL text (5xl)</Text>
                <Text size="6xl">6XL text (6xl)</Text>
              </div>
            </div>
            
            {/* Font Weights */}
            <div className="space-y-3">
              <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Font Weights</Text>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Text weight="light" size="lg">Light weight</Text>
                <Text weight="normal" size="lg">Normal weight</Text>
                <Text weight="medium" size="lg">Medium weight</Text>
                <Text weight="semibold" size="lg">Semibold weight</Text>
                <Text weight="bold" size="lg">Bold weight</Text>
                <Text weight="extrabold" size="lg">Extra bold weight</Text>
              </div>
            </div>
            
            {/* Text Styles */}
            <div className="space-y-3">
              <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Text Styles</Text>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Text size="sm" variant="muted" transform="uppercase" spacing="wide">Regular Text</Text>
                  <Text size="lg">This is regular text without any special styling</Text>
                </div>
                <div className="space-y-2">
                  <Text size="sm" variant="muted" transform="uppercase" spacing="wide">Highlighted Text</Text>
                  <Text highlight size="lg">This is highlighted text with background and border</Text>
                </div>
                <div className="space-y-2">
                  <Text size="sm" variant="muted" transform="uppercase" spacing="wide">Italic Text</Text>
                  <Text italic size="lg">This is italic text styling</Text>
                </div>
              </div>
            </div>
            
            {/* Text Transformations */}
            <div className="space-y-3">
              <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Text Transformations</Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Text transform="uppercase" size="lg">UPPERCASE TEXT</Text>
                  <Text transform="lowercase" size="lg">lowercase text</Text>
                  <Text transform="capitalize" size="lg">capitalize each word</Text>
                </div>
                <div className="space-y-2">
                  <Text decoration="underline" size="lg">Underlined text</Text>
                  <Text decoration="line-through" size="lg">Strikethrough text</Text>
                  <Text decoration="overline" size="lg">Overlined text</Text>
                </div>
              </div>
            </div>
            
            {/* Links */}
            <div className="space-y-3">
              <Text as="h2" size="2xl" weight="semibold" className="border-b border-border pb-2">Links</Text>
              <div className="space-y-2">
                <Text href="#" variant="accent" decoration="underline" size="lg">
                  Link with accent styling and underline
                </Text>
                <Text href="https://example.com" target="_blank" variant="accent" size="lg">
                  External link (opens in new tab)
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
