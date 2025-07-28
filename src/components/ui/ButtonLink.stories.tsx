import { ButtonLink } from './ButtonLink'

type TStoryMeta = {
  title: string
  component: typeof ButtonLink
  parameters: any
  argTypes: any
  args: any
}

type TStory = {
  args?: any
  render?: () => any
  parameters?: any
}

const meta: TStoryMeta = {
  title: 'Components/ButtonLink',
  component: ButtonLink,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
ButtonLink is a versatile component that can render as either a button or anchor element depending on the presence of an href prop. It supports multiple variants, sizes, loading states, and includes comprehensive accessibility features.

## Features
- **Dual rendering**: Button or anchor based on href prop
- **Multiple variants**: primary, secondary, ghost, destructive, admin
- **Size options**: sm, md, lg
- **Loading states**: with animated spinner
- **Accessibility**: proper ARIA attributes, keyboard navigation
- **Disabled states**: visual and functional disabled support

## Accessibility Features
- Proper role attributes for anchor elements acting as buttons
- Keyboard navigation support (Enter/Space keys)
- ARIA disabled states
- Tab index management for disabled elements
- Screen reader friendly loading states
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'admin'],
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
    href: {
      control: 'text',
      description: 'URL for anchor element (renders as <a> if provided)'
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

export function Default(): TStory {
  return {
    args: {}
  }
}

export function AllVariants(): TStory {
  return {
    render: () => (
      <div class="flex flex-wrap gap-4">
        <ButtonLink variant="primary">Primary</ButtonLink>
        <ButtonLink variant="secondary">Secondary</ButtonLink>
        <ButtonLink variant="ghost">Ghost</ButtonLink>
        <ButtonLink variant="destructive">Destructive</ButtonLink>
        <ButtonLink variant="admin">Admin</ButtonLink>
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
        <ButtonLink size="sm">Small</ButtonLink>
        <ButtonLink size="md">Medium</ButtonLink>
        <ButtonLink size="lg">Large</ButtonLink>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'All available button sizes demonstrated with the default admin variant.'
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

export function AsLink(): TStory {
  return {
    args: {
      href: '/example-link',
      children: 'Navigate to Example'
    },
    parameters: {
      docs: {
        description: {
          story: 'When href is provided, ButtonLink renders as an anchor element with button semantics.'
        }
      }
    }
  }
}

export function AsButton(): TStory {
  return {
    args: {
      onClick: () => console.log('button-clicked'),
      children: 'Click Me'
    },
    parameters: {
      docs: {
        description: {
          story: 'When href is not provided, ButtonLink renders as a button element.'
        }
      }
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
        <ButtonLink variant="primary" loading>Primary Loading</ButtonLink>
        <ButtonLink variant="secondary" loading>Secondary Loading</ButtonLink>
        <ButtonLink variant="ghost" loading>Ghost Loading</ButtonLink>
        <ButtonLink variant="destructive" loading>Destructive Loading</ButtonLink>
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

export function DisabledLink(): TStory {
  return {
    args: {
      href: '/disabled-link',
      disabled: true,
      children: 'Disabled Link'
    },
    parameters: {
      docs: {
        description: {
          story: 'Disabled link uses aria-disabled and prevents navigation.'
        }
      }
    }
  }
}

export function DisabledVariants(): TStory {
  return {
    render: () => (
      <div class="flex flex-wrap gap-4">
        <ButtonLink variant="primary" disabled>Primary Disabled</ButtonLink>
        <ButtonLink variant="secondary" disabled>Secondary Disabled</ButtonLink>
        <ButtonLink variant="ghost" disabled>Ghost Disabled</ButtonLink>
        <ButtonLink variant="destructive" disabled>Destructive Disabled</ButtonLink>
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

export function AccessibilityDemo(): TStory {
  return {
    render: () => (
      <div class="space-y-4">
        <div class="space-y-2">
          <h3 class="font-semibold">Regular Button</h3>
          <ButtonLink onClick={() => console.log('regular-clicked')}>
            Regular Button (native button element)
          </ButtonLink>
        </div>
        
        <div class="space-y-2">
          <h3 class="font-semibold">Link as Button</h3>
          <ButtonLink href="/example" onClick={() => console.log('link-clicked')}>
            Link with Button Role (anchor with role="button")
          </ButtonLink>
        </div>
        
        <div class="space-y-2">
          <h3 class="font-semibold">Disabled States</h3>
          <div class="flex gap-2">
            <ButtonLink disabled onClick={() => console.log('disabled-button')}>
              Disabled Button
            </ButtonLink>
            <ButtonLink href="/test" disabled onClick={() => console.log('disabled-link')}>
              Disabled Link
            </ButtonLink>
          </div>
        </div>
        
        <div class="space-y-2">
          <h3 class="font-semibold">Loading States</h3>
          <div class="flex gap-2">
            <ButtonLink loading onClick={() => console.log('loading-button')}>
              Loading Button
            </ButtonLink>
            <ButtonLink href="/test" loading onClick={() => console.log('loading-link')}>
              Loading Link
            </ButtonLink>
          </div>
        </div>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: `
This story demonstrates the accessibility features of ButtonLink:

**Keyboard Navigation:**
- Use Tab to focus elements
- Use Enter or Space to activate focused elements
- Disabled elements are not focusable (tabindex="-1")

**Screen Reader Support:**
- Links have role="button" for proper semantics
- Disabled state is announced via aria-disabled
- Loading state prevents interaction

**Semantic HTML:**
- Uses appropriate element types (button vs anchor)
- Maintains native browser behavior where possible
- Provides fallback keyboard support for anchor elements
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
            <ButtonLink variant="primary">Primary</ButtonLink>
            <ButtonLink variant="secondary">Secondary</ButtonLink>
            <ButtonLink variant="ghost">Ghost</ButtonLink>
            <ButtonLink variant="destructive">Destructive</ButtonLink>
            <ButtonLink variant="admin">Admin (Default)</ButtonLink>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-bold">Sizes</h2>
          <div class="flex items-center gap-3">
            <ButtonLink size="sm">Small</ButtonLink>
            <ButtonLink size="md">Medium (Default)</ButtonLink>
            <ButtonLink size="lg">Large</ButtonLink>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-bold">States</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-3">
              <h3 class="font-semibold">Normal States</h3>
              <div class="flex flex-wrap gap-2">
                <ButtonLink>Normal</ButtonLink>
                <ButtonLink href="/link">As Link</ButtonLink>
              </div>
            </div>
            <div class="space-y-3">
              <h3 class="font-semibold">Loading States</h3>
              <div class="flex flex-wrap gap-2">
                <ButtonLink loading>Loading</ButtonLink>
                <ButtonLink href="/link" loading>Loading Link</ButtonLink>
              </div>
            </div>
            <div class="space-y-3">
              <h3 class="font-semibold">Disabled States</h3>
              <div class="flex flex-wrap gap-2">
                <ButtonLink disabled>Disabled</ButtonLink>
                <ButtonLink href="/link" disabled>Disabled Link</ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-bold">Variant + Size Combinations</h2>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <h4 class="font-medium mb-2">Small</h4>
              <div class="space-y-2">
                <ButtonLink variant="primary" size="sm">Primary SM</ButtonLink>
                <ButtonLink variant="secondary" size="sm">Secondary SM</ButtonLink>
                <ButtonLink variant="destructive" size="sm">Destructive SM</ButtonLink>
              </div>
            </div>
            <div>
              <h4 class="font-medium mb-2">Medium</h4>
              <div class="space-y-2">
                <ButtonLink variant="primary" size="md">Primary MD</ButtonLink>
                <ButtonLink variant="secondary" size="md">Secondary MD</ButtonLink>
                <ButtonLink variant="destructive" size="md">Destructive MD</ButtonLink>
              </div>
            </div>
            <div>
              <h4 class="font-medium mb-2">Large</h4>
              <div class="space-y-2">
                <ButtonLink variant="primary" size="lg">Primary LG</ButtonLink>
                <ButtonLink variant="secondary" size="lg">Secondary LG</ButtonLink>
                <ButtonLink variant="destructive" size="lg">Destructive LG</ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Comprehensive demonstration of all ButtonLink features and combinations.'
        }
      }
    }
  }
}

Default.storyName = 'Default (Admin Variant)'
AllVariants.storyName = 'All Variants'
AllSizes.storyName = 'All Sizes'
AsLink.storyName = 'As Anchor Element'
AsButton.storyName = 'As Button Element'
LoadingVariants.storyName = 'Loading States'
DisabledVariants.storyName = 'Disabled States'
AccessibilityDemo.storyName = 'Accessibility Features'
ComprehensiveDemo.storyName = 'Complete Demo'
