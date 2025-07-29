import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../components/primitives/button'

type Story = StoryObj<typeof Button>

const meta: TStoryMeta = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Button is a foundational primitive component that provides consistent button styling and behavior across the application.

## Features
- **Multiple variants**: primary, secondary, ghost, destructive, outlined, link, admin
- **Size options**: sm, md, lg
- **Loading states**: with animated spinner
- **Disabled states**: visual and functional disabled support
- **Accessibility**: proper semantic button element with ARIA support

## Design System
This component serves as the base for more complex button-like components and follows the design system's color and spacing tokens.
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'outlined', 'link', 'admin'],
      description: 'Visual style variant of the button'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled'
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in loading state'
    },
    onClick: {
      description: 'Click handler function'
    },
    children: {
      control: 'text',
      description: 'Button content'
    }
  },
  args: {
    children: 'Button Text',
    onClick: () => console.log('clicked')
  }
}

export default meta

export const Default: TStory = {
  args: {}
}

export function AllVariants(): TStory {
  return {
    render: () => (
      <div class="flex flex-wrap gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="link">Link</Button>
        <Button variant="admin">Admin</Button>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'All available button variants displayed together for comparison.'
        }
      }
    }
  }
}

export function AllSizes(): TStory {
  return {
    render: () => (
      <div class="flex items-center gap-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'All available button sizes demonstrated with the default primary variant.'
        }
      }
    }
  }
}

export function Primary(): TStory {
  return {
    args: {
      variant: 'primary'
    }
  }
}

export function Secondary(): TStory {
  return {
    args: {
      variant: 'secondary'
    }
  }
}

export function Ghost(): TStory {
  return {
    args: {
      variant: 'ghost'
    }
  }
}

export function Destructive(): TStory {
  return {
    args: {
      variant: 'destructive'
    }
  }
}

export function Outlined(): TStory {
  return {
    args: {
      variant: 'outlined'
    }
  }
}

export function Link(): TStory {
  return {
    args: {
      variant: 'link'
    }
  }
}

export function Admin(): TStory {
  return {
    args: {
      variant: 'admin'
    }
  }
}

export function Small(): TStory {
  return {
    args: {
      size: 'sm'
    }
  }
}

export function Medium(): TStory {
  return {
    args: {
      size: 'md'
    }
  }
}

export function Large(): TStory {
  return {
    args: {
      size: 'lg'
    }
  }
}

export function Loading(): TStory {
  return {
    args: {
      loading: true,
      children: 'Processing...'
    },
    parameters: {
      docs: {
        description: {
          story: 'Loading state displays an animated spinner and disables interaction.'
        }
      }
    }
  }
}

export function LoadingVariants(): TStory {
  return {
    render: () => (
      <div class="flex flex-wrap gap-4">
        <Button variant="primary" loading>Primary Loading</Button>
        <Button variant="secondary" loading>Secondary Loading</Button>
        <Button variant="ghost" loading>Ghost Loading</Button>
        <Button variant="destructive" loading>Destructive Loading</Button>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Loading states across different variants.'
        }
      }
    }
  }
}

export function Disabled(): TStory {
  return {
    args: {
      disabled: true,
      children: 'Disabled Button'
    },
    parameters: {
      docs: {
        description: {
          story: 'Disabled button prevents interaction and shows visual feedback.'
        }
      }
    }
  }
}

export function DisabledVariants(): TStory {
  return {
    render: () => (
      <div class="flex flex-wrap gap-4">
        <Button variant="primary" disabled>Primary Disabled</Button>
        <Button variant="secondary" disabled>Secondary Disabled</Button>
        <Button variant="ghost" disabled>Ghost Disabled</Button>
        <Button variant="destructive" disabled>Destructive Disabled</Button>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Disabled states across different variants.'
        }
      }
    }
  }
}

export function InteractiveDemo(): TStory {
  return {
    render: () => (
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="font-semibold">Click Interactions</h3>
          <div class="flex gap-3">
            <Button onClick={() => alert('Primary clicked!')}>
              Primary Action
            </Button>
            <Button variant="secondary" onClick={() => console.log('Secondary clicked!')}>
              Secondary Action
            </Button>
            <Button variant="destructive" onClick={() => confirm('Are you sure?')}>
              Destructive Action
            </Button>
          </div>
        </section>

        <section class="space-y-3">
          <h3 class="font-semibold">Form Actions</h3>
          <div class="flex gap-3">
            <Button type="submit">Submit Form</Button>
            <Button type="reset" variant="ghost">Reset Form</Button>
            <Button type="button" variant="outlined">Cancel</Button>
          </div>
        </section>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: `
Interactive demonstration showing different button types and click handlers:

**Click Interactions:**
- Primary: Shows alert dialog
- Secondary: Logs to console
- Destructive: Shows confirmation dialog

**Form Actions:**
- Submit: Form submission button
- Reset: Form reset button  
- Cancel: Generic cancel action
          `
        }
      }
    }
  }
}

export function ComprehensiveDemo(): TStory {
  return {
    render: () => (
      <div class="space-y-8 max-w-4xl">
        <section class="space-y-4">
          <h2 class="text-xl font-bold">Variants</h2>
          <div class="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="link">Link</Button>
            <Button variant="admin">Admin</Button>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-bold">Sizes</h2>
          <div class="flex items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium (Default)</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-bold">States</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-3">
              <h3 class="font-semibold">Normal States</h3>
              <div class="flex flex-wrap gap-2">
                <Button>Normal</Button>
                <Button variant="secondary">Secondary</Button>
              </div>
            </div>
            <div class="space-y-3">
              <h3 class="font-semibold">Loading States</h3>
              <div class="flex flex-wrap gap-2">
                <Button loading>Loading</Button>
                <Button variant="secondary" loading>Loading Secondary</Button>
              </div>
            </div>
            <div class="space-y-3">
              <h3 class="font-semibold">Disabled States</h3>
              <div class="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button variant="secondary" disabled>Disabled Secondary</Button>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-bold">Size + Variant Combinations</h2>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <h4 class="font-medium mb-2">Small</h4>
              <div class="space-y-2">
                <Button variant="primary" size="sm">Primary SM</Button>
                <Button variant="secondary" size="sm">Secondary SM</Button>
                <Button variant="destructive" size="sm">Destructive SM</Button>
              </div>
            </div>
            <div>
              <h4 class="font-medium mb-2">Medium</h4>
              <div class="space-y-2">
                <Button variant="primary" size="md">Primary MD</Button>
                <Button variant="secondary" size="md">Secondary MD</Button>
                <Button variant="destructive" size="md">Destructive MD</Button>
              </div>
            </div>
            <div>
              <h4 class="font-medium mb-2">Large</h4>
              <div class="space-y-2">
                <Button variant="primary" size="lg">Primary LG</Button>
                <Button variant="secondary" size="lg">Secondary LG</Button>
                <Button variant="destructive" size="lg">Destructive LG</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Comprehensive demonstration of all Button features and combinations.'
        }
      }
    }
  }
}

// Story names for better navigation
Default.storyName = 'Default (Primary Variant)'
AllVariants.storyName = 'All Variants'
AllSizes.storyName = 'All Sizes'
LoadingVariants.storyName = 'Loading States'
DisabledVariants.storyName = 'Disabled States'
InteractiveDemo.storyName = 'Interactive Demo'
ComprehensiveDemo.storyName = 'Complete Demo'
