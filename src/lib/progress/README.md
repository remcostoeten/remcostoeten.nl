# Global Progress Indicator System

This system provides a global progress indicator using `nprogress` with React hooks and utility functions for common async operations.

## Features

- **Singleton Controller**: Centralized progress management
- **React Hook**: `useProgress` for component state management
- **Helper Functions**: Pre-configured functions for common operations
- **Global Progress Bar**: Automatically styled progress bar at the top of the page

## Installation

The system is already installed and configured. The `nprogress` package is installed and the system is integrated into the app layout.

## Usage

### Basic Usage

```typescript
import { startProgress, stopProgress } from '@/lib/progress';

// Start progress
startProgress();

// Stop progress
stopProgress();
```

### Using the React Hook

```typescript
import { useProgress } from '@/lib/progress';

function MyComponent() {
  const { isActive, start, stop } = useProgress();
  
  return (
    <div>
      <p>Progress is {isActive ? 'active' : 'inactive'}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### Helper Functions for Common Operations

#### Saving Operations
```typescript
import { progressForSaving } from '@/lib/progress';

async function handleSave() {
  await progressForSaving(async () => {
    // Your save logic here
    await api.saveData(data);
  });
}
```

#### Deleting Operations
```typescript
import { progressForDeleting } from '@/lib/progress';

async function handleDelete() {
  await progressForDeleting(async () => {
    // Your delete logic here
    await api.deleteItem(id);
  });
}
```

#### Page Load Operations
```typescript
import { progressForPageLoad } from '@/lib/progress';

async function loadPageData() {
  await progressForPageLoad(async () => {
    // Your page load logic here
    const data = await api.fetchPageData();
    return data;
  });
}
```

### Advanced Usage

#### Custom Progress with Steps
```typescript
import { withProgress } from '@/lib/progress';

await withProgress(
  async () => {
    // Your async operation
    await doSomething();
  },
  {
    onProgress: (progress) => {
      console.log(\`Progress: \${progress * 100}%\`);
    },
    steps: 3
  }
);
```

#### Multiple Step Operations
```typescript
import { withProgressSteps } from '@/lib/progress';

await withProgressSteps(
  [
    async () => await step1(),
    async () => await step2(),
    async () => await step3(),
  ],
  async () => await finalStep()
);
```

#### Simulated Progress
```typescript
import { simulateProgress } from '@/lib/progress';

// Simulate progress for 2 seconds
await simulateProgress(2000);
```

## API Reference

### Core Functions

- `startProgress()` - Start the progress indicator
- `stopProgress()` - Stop the progress indicator
- `incrementProgress(amount?: number)` - Increment progress
- `setProgress(progress: number)` - Set progress to specific value (0-1)

### Helper Functions

- `progressForSaving<T>(fn: () => Promise<T>)` - Progress for save operations
- `progressForDeleting<T>(fn: () => Promise<T>)` - Progress for delete operations
- `progressForPageLoad<T>(fn: () => Promise<T>)` - Progress for page load operations
- `withProgress<T>(fn, options)` - Custom progress wrapper
- `withProgressSteps<T>(steps, finalStep)` - Multi-step progress
- `simulateProgress(duration)` - Simulate progress for testing

### React Hook

The `useProgress` hook returns:
```typescript
{
  isActive: boolean;        // Current progress state
  start: () => void;        // Start progress
  stop: () => void;         // Stop progress
  increment: (amount?: number) => void;  // Increment progress
  set: (progress: number) => void;       // Set progress
}
```

## Styling

The progress bar uses CSS custom properties for theming:
- `--primary` - Progress bar color (uses your app's primary color)

The progress bar appears at the top of the page with a subtle glow effect.

## Integration

The system is automatically integrated into your app layout via the `<Providers>` component, which includes the `<ProgressBar>` component that handles the visual progress indicator.

## Examples

See `src/components/progress-demo.tsx` for a complete example of all functionality.
