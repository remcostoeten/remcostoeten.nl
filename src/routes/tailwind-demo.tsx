import { JSX } from 'solid-js';

function TailwindDemoPage(): JSX.Element {
  return (
    <div class="min-h-screen bg-background text-foreground p-8 space-y-8">
      <h1 class="text-4xl font-bold mb-4">Tailwind CSS Demo</h1>

      {/* Typography */}
      <h2 class="text-2xl font-semibold">Typography</h2>
      <p class="text-lg">This is a paragraph with larger text.</p>
      <p class="text-muted-foreground">This is muted text.</p>

      {/* Buttons */}
      <h2 class="text-2xl font-semibold">Buttons</h2>
      <button class="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
        Primary Button
      </button>
      <button class="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md ml-4">
        Secondary Button
      </button>

      {/* Inputs */}
      <h2 class="text-2xl font-semibold">Inputs</h2>
      <input class="border border-input rounded-md px-3 py-2 w-full mb-4" placeholder="Default state" />
      <input class="border border-destructive focus:ring-destructive rounded-md px-3 py-2 w-full" placeholder="Error state" />

      {/* Cards */}
      <h2 class="text-2xl font-semibold">Cards</h2>
      <div class="bg-card text-card-foreground p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold">Card Title</h3>
        <p class="text-muted-foreground">Card description or content goes here.</p>
      </div>

      {/* Flex and Grid */}
      <h2 class="text-2xl font-semibold">Flex & Grid</h2>
      <div class="flex space-x-4">
        <div class="bg-muted p-4 rounded-lg">Flex Item 1</div>
        <div class="bg-muted p-4 rounded-lg">Flex Item 2</div>
      </div>
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div class="bg-muted p-4 rounded-lg">Grid Item 1</div>
        <div class="bg-muted p-4 rounded-lg">Grid Item 2</div>
      </div>

      {/* Colors */}
      <h2 class="text-2xl font-semibold">Colors</h2>
      <div class="space-x-4">
        <div class="inline-block w-12 h-12 bg-accent" />
        <div class="inline-block w-12 h-12 bg-destructive" />
        <div class="inline-block w-12 h-12 bg-foreground" />
      </div>

      {/* Borders and Shadows */}
      <h2 class="text-2xl font-semibold">Borders & Shadows</h2>
      <div class="border border-border rounded-md p-4 shadow-md">
        This element has a border and shadow.
      </div>
    </div>
  );
}

export default TailwindDemoPage;

