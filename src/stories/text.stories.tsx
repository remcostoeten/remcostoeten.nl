import { Text } from '../components/primitives/text'
import { For } from 'solid-js'

type TStoryMeta = {
  title: string
  component: typeof Text
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
  title: 'Primitives/Text',
  component: Text,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Text is a versatile component that supports multiple semantic elements, visual styles, variants, and sizes.

## Features
- **Semantic elements**: p, span, div, headers (h1-h6)
- **Variants**: hero, body, highlight, caption, quote
- **Sizes**: xs to 6xl
- **Custom classes**: extend or override with custom class names

This component provides a consistent typography standard across the application.
        `
      }
    }
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'Semantic HTML element to use'
    },
    variant: {
      control: 'select',
      options: ['hero', 'body', 'highlight', 'caption', 'quote'],
      description: 'Visual style variant of the text'
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'],
      description: 'Size of the text'
    },
    children: {
      control: 'text',
      description: 'Text content'
    },
    class: {
      control: 'text',
      description: 'Additional custom classes'
    }
  },
  args: {
    children: 'Sample Text',
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
      <div class="space-y-4">
        <For each={['hero', 'body', 'highlight', 'caption', 'quote'] as const}>
          {(variant) => (
            <Text variant={variant} class="block">{`${variant.charAt(0).toUpperCase() + variant.slice(1)} Text`}</Text>
          )}
        </For>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Display of all text variants in their default styles.'
        }
      }
    }
  }
}

export function AllSizes(): TStory {
  return {
    render: () => (
      <div class="space-y-2">
        <For each={['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const}>
          {(size) => (
            <Text size={size} class="block">{`Size ${size.toUpperCase()}`}</Text>
          )}
        </For>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Display of all text sizes in their default styles.'
        }
      }
    }
  }
}

export function HeroText(): TStory {
  return {
    args: {
      variant: 'hero'
    },
    parameters: {
      docs: {
        description: {
          story: 'Hero variant for prominent display of headline text.'
        }
      }
    }
  }
}

export function BodyText(): TStory {
  return {
    args: {
      variant: 'body'
    },
    parameters: {
      docs: {
        description: {
          story: 'Body variant for standard paragraph text.'
        }
      }
    }
  }
}

export function HighlightText(): TStory {
  return {
    args: {
      variant: 'highlight'
    },
    parameters: {
      docs: {
        description: {
          story: 'Highlight variant for emphasizing important text.'
        }
      }
    }
  }
}

export function CaptionText(): TStory {
  return {
    args: {
      variant: 'caption'
    },
    parameters: {
      docs: {
        description: {
          story: 'Caption variant for smaller, muted descriptive text.'
        }
      }
    }
  }
}

export function QuoteText(): TStory {
  return {
    args: {
      variant: 'quote',
      children: 'This is a quoted text with special styling including a border and italic formatting.'
    },
    parameters: {
      docs: {
        description: {
          story: 'Quote variant for blockquotes and emphasized text with border styling.'
        }
      }
    }
  }
}

export function SemanticElements(): TStory {
  return {
    render: () => (
      <div class="space-y-4">
        <For each={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'] as const}>
          {(element) => (
            <Text as={element} class="block">
              {`${element.toUpperCase()} Element: Sample text content`}
            </Text>
          )}
        </For>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Display of all supported semantic HTML elements.'
        }
      }
    }
  }
}

export function VariantSizeCombinations(): TStory {
  return {
    render: () => (
      <div class="space-y-6">
        <For each={['hero', 'body', 'highlight', 'caption'] as const}>
          {(variant) => (
            <div class="space-y-2">
              <h3 class="font-semibold capitalize">{variant} Variant</h3>
              <div class="space-y-1">
                <For each={['sm', 'base', 'lg', 'xl'] as const}>
                  {(size) => (
                    <Text variant={variant} size={size} class="block">
                      {`${variant} text in ${size} size`}
                    </Text>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Comprehensive combinations of variants and sizes.'
        }
      }
    }
  }
}

export function CustomClassExample(): TStory {
  return {
    args: {
      class: 'text-red-500 font-bold'
    },
    parameters: {
      docs: {
        description: {
          story: 'Example of applying custom classes to text for additional styling.'
        }
      }
    }
  }
}

export function TypographyShowcase(): TStory {
  return {
    render: () => (
      <div class="space-y-8 max-w-4xl">
        <section>
          <Text as="h1" variant="hero" size="3xl" class="mb-4">
            Typography Showcase
          </Text>
          <Text variant="body" size="lg">
            This demonstrates the Text component's versatility in creating consistent typography across your application.
          </Text>
        </section>

        <section class="space-y-4">
          <Text as="h2" variant="hero" size="2xl">Variants</Text>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text variant="hero" class="block mb-2">Hero Text</Text>
              <Text variant="body" class="block mb-2">Body Text</Text>
              <Text variant="highlight" class="block mb-2">Highlighted Text</Text>
            </div>
            <div>
              <Text variant="caption" class="block mb-2">Caption Text</Text>
              <Text variant="quote" class="block">
                "Quote text with special styling"
              </Text>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <Text as="h2" variant="hero" size="2xl">Size Scale</Text>
          <div class="space-y-2">
            <Text size="6xl" class="block">Extra Large (6xl)</Text>
            <Text size="4xl" class="block">Large (4xl)</Text>
            <Text size="2xl" class="block">Medium Large (2xl)</Text>
            <Text size="xl" class="block">Large (xl)</Text>
            <Text size="lg" class="block">Medium (lg)</Text>
            <Text size="base" class="block">Base (base)</Text>
            <Text size="sm" class="block">Small (sm)</Text>
            <Text size="xs" class="block">Extra Small (xs)</Text>
          </div>
        </section>

        <section class="space-y-4">
          <Text as="h2" variant="hero" size="2xl">Semantic HTML</Text>
          <div class="space-y-2">
            <Text as="h3" size="lg">This is an H3 heading</Text>
            <Text as="p">This is a paragraph with default body styling.</Text>
            <Text as="span" variant="highlight">This is an inline span with highlight variant.</Text>
            <Text as="div" variant="caption">This is a div with caption styling.</Text>
          </div>
        </section>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Complete typography showcase demonstrating real-world usage patterns.'
        }
      }
    }
  }
}

// Story names for better navigation
Default.storyName = 'Default (Body Variant)'
AllVariants.storyName = 'All Variants'
AllSizes.storyName = 'All Sizes'
SemanticElements.storyName = 'Semantic Elements'
VariantSizeCombinations.storyName = 'Variant + Size Combinations'
TypographyShowcase.storyName = 'Typography Showcase'

