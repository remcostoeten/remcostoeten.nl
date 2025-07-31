// src/routes/showcase.tsx
import { createSignal, For, onMount } from 'solid-js'
import { Button } from '~/components/primitives/button'
import { Text } from '~/components/primitives/text'
import { Textarea } from '~/components/primitives/textarea'

// Mock style-utils for demo purposes - replace with your actual implementation
const getButtonClasses = (variant: string, size: string) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    ghost: 'hover:bg-gray-100 text-gray-900',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
    outlined: 'border border-gray-300 hover:bg-gray-50 text-gray-900',
    link: 'text-blue-600 hover:text-blue-800 underline',
    admin: 'bg-purple-600 hover:bg-purple-700 text-white'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  return `inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]}`
}

const getTextareaClasses = (state: string) => {
  const states = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500'
  }
  
  return `w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 ${states[state]}`
}

type TProps = {
  title: string
  description: string
  component: () => any
  code: string
}

export default function ComponentShowcase() {
  onMount(() => {
    window.getButtonClasses = getButtonClasses
    window.getTextareaClasses = getTextareaClasses
  });

  const [activeTab, setActiveTab] = createSignal('button')
  const [textareaValue, setTextareaValue] = createSignal('')

  const tabs = [
    { id: 'button', label: 'Button' },
    { id: 'text', label: 'Text' },
    { id: 'textarea', label: 'Textarea' }
  ]

  const buttonExamples: TProps[] = [
    {
      title: 'Primary Button',
      description: 'Default primary button for main actions',
      component: () => <Button variant="primary">Primary Button</Button>,
      code: `<Button variant="primary">Primary Button</Button>`
    },
    {
      title: 'Secondary Button',
      description: 'Secondary button for less prominent actions',
      component: () => <Button variant="secondary">Secondary Button</Button>,
      code: `<Button variant="secondary">Secondary Button</Button>`
    },
    {
      title: 'Ghost Button',
      description: 'Subtle button with minimal styling',
      component: () => <Button variant="ghost">Ghost Button</Button>,
      code: `<Button variant="ghost">Ghost Button</Button>`
    },
    {
      title: 'Destructive Button',
      description: 'For dangerous or destructive actions',
      component: () => <Button variant="destructive">Delete</Button>,
      code: `<Button variant="destructive">Delete</Button>`
    },
    {
      title: 'Outlined Button',
      description: 'Button with border outline',
      component: () => <Button variant="outlined">Outlined</Button>,
      code: `<Button variant="outlined">Outlined</Button>`
    },
    {
      title: 'Link Button',
      description: 'Button styled as a link',
      component: () => <Button variant="link">Link Button</Button>,
      code: `<Button variant="link">Link Button</Button>`
    },
    {
      title: 'Admin Button',
      description: 'Special admin-themed button',
      component: () => <Button variant="admin">Admin Action</Button>,
      code: `<Button variant="admin">Admin Action</Button>`
    },
    {
      title: 'Button Sizes',
      description: 'Different button sizes',
      component: () => (
        <div class="space-x-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      ),
      code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`
    },
    {
      title: 'Loading Button',
      description: 'Button in loading state',
      component: () => <Button loading>Loading...</Button>,
      code: `<Button loading>Loading...</Button>`
    },
    {
      title: 'Disabled Button',
      description: 'Disabled button state',
      component: () => <Button disabled>Disabled</Button>,
      code: `<Button disabled>Disabled</Button>`
    }
  ]

  const textExamples: TProps[] = [
    {
      title: 'Hero Text',
      description: 'Large, prominent text for hero sections',
      component: () => <Text variant="hero">Hero Text</Text>,
      code: `<Text variant="hero">Hero Text</Text>`
    },
    {
      title: 'Body Text',
      description: 'Default body text for content',
      component: () => <Text variant="body">This is body text with good readability and spacing.</Text>,
      code: `<Text variant="body">This is body text with good readability and spacing.</Text>`
    },
    {
      title: 'Highlight Text',
      description: 'Highlighted text for emphasis',
      component: () => <Text variant="highlight">This text is highlighted</Text>,
      code: `<Text variant="highlight">This text is highlighted</Text>`
    },
    {
      title: 'Caption Text',
      description: 'Small caption text for subtitles',
      component: () => <Text variant="caption">This is a caption</Text>,
      code: `<Text variant="caption">This is a caption</Text>`
    },
    {
      title: 'Quote Text',
      description: 'Styled quote text with border',
      component: () => <Text variant="quote">This is a quote with italic styling and border</Text>,
      code: `<Text variant="quote">This is a quote with italic styling and border</Text>`
    },
    {
      title: 'Different Elements',
      description: 'Text rendered as different HTML elements',
      component: () => (
        <div class="space-y-2">
          <Text as="h1" variant="hero">H1 Hero</Text>
          <Text as="h2" variant="body">H2 Body</Text>
          <Text as="span" variant="caption">Span Caption</Text>
          <Text as="div" variant="highlight">Div Highlight</Text>
        </div>
      ),
      code: `<Text as="h1" variant="hero">H1 Hero</Text>
<Text as="h2" variant="body">H2 Body</Text>
<Text as="span" variant="caption">Span Caption</Text>
<Text as="div" variant="highlight">Div Highlight</Text>`
    },
    {
      title: 'Different Sizes',
      description: 'Text with different size overrides',
      component: () => (
        <div class="space-y-2">
          <Text size="xs">Extra Small Text</Text>
          <Text size="sm">Small Text</Text>
          <Text size="base">Base Text</Text>
          <Text size="lg">Large Text</Text>
          <Text size="xl">Extra Large Text</Text>
          <Text size="2xl">2XL Text</Text>
        </div>
      ),
      code: `<Text size="xs">Extra Small Text</Text>
<Text size="sm">Small Text</Text>
<Text size="base">Base Text</Text>
<Text size="lg">Large Text</Text>
<Text size="xl">Extra Large Text</Text>
<Text size="2xl">2XL Text</Text>`
    }
  ]

  const textareaExamples: TProps[] = [
    {
      title: 'Basic Textarea',
      description: 'Simple textarea without any additional features',
      component: () => <Textarea placeholder="Enter your message..." />,
      code: `<Textarea placeholder="Enter your message..." />`
    },
    {
      title: 'Labeled Textarea',
      description: 'Textarea with a label',
      component: () => <Textarea label="Message" placeholder="Enter your message..." />,
      code: `<Textarea label="Message" placeholder="Enter your message..." />`
    },
    {
      title: 'Required Textarea',
      description: 'Required textarea with asterisk indicator',
      component: () => <Textarea label="Required Field" required placeholder="This field is required..." />,
      code: `<Textarea label="Required Field" required placeholder="This field is required..." />`
    },
    {
      title: 'Textarea with Helper Text',
      description: 'Textarea with additional helper information',
      component: () => (
        <Textarea 
          label="Description" 
          helperText="Provide a detailed description of your request"
          placeholder="Enter description..."
        />
      ),
      code: `<Textarea 
  label="Description" 
  helperText="Provide a detailed description of your request"
  placeholder="Enter description..."
/>`
    },
    {
      title: 'Error State',
      description: 'Textarea showing error state',
      component: () => (
        <Textarea 
          label="Message" 
          error="This field is required"
          placeholder="Enter your message..."
        />
      ),
      code: `<Textarea 
  label="Message" 
  error="This field is required"
  placeholder="Enter your message..."
/>`
    },
    {
      title: 'Success State',
      description: 'Textarea showing success state',
      component: () => (
        <Textarea 
          label="Message" 
          success
          placeholder="Enter your message..."
          value="This looks good!"
        />
      ),
      code: `<Textarea 
  label="Message" 
  success
  placeholder="Enter your message..."
  value="This looks good!"
/>`
    },
    {
      title: 'Character Limit',
      description: 'Textarea with character counting',
      component: () => (
        <Textarea 
          label="Tweet" 
          maxLength={280}
          placeholder="What's happening?"
          value={textareaValue()}
          onInput={(e) => setTextareaValue(e.currentTarget.value)}
        />
      ),
      code: `<Textarea 
  label="Tweet" 
  maxLength={280}
  placeholder="What's happening?"
  value={textareaValue()}
  onInput={(e) => setTextareaValue(e.currentTarget.value)}
/>`
    },
    {
      title: 'Autosize Textarea',
      description: 'Textarea that grows with content',
      component: () => (
        <Textarea 
          label="Auto-growing Message" 
          autosize
          minRows={3}
          placeholder="Start typing and watch this grow..."
        />
      ),
      code: `<Textarea 
  label="Auto-growing Message" 
  autosize
  minRows={3}
  placeholder="Start typing and watch this grow..."
/>`
    },
    {
      title: 'Resize Options',
      description: 'Different resize behaviors',
      component: () => (
        <div class="space-y-4">
          <Textarea label="No Resize" resize="none" placeholder="Cannot be resized" />
          <Textarea label="Vertical Resize" resize="vertical" placeholder="Resize vertically only" />
          <Textarea label="Both Resize" resize="both" placeholder="Resize in both directions" />
        </div>
      ),
      code: `<Textarea label="No Resize" resize="none" placeholder="Cannot be resized" />
<Textarea label="Vertical Resize" resize="vertical" placeholder="Resize vertically only" />
<Textarea label="Both Resize" resize="both" placeholder="Resize in both directions" />`
    }
  ]

  const getExamplesForTab = (tab: string) => {
    switch (tab) {
      case 'button': return buttonExamples
      case 'text': return textExamples
      case 'textarea': return textareaExamples
      default: return []
    }
  }

  return (
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-6xl mx-auto px-4">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Component Showcase</h1>
          <p class="text-gray-600">Interactive documentation for your custom components</p>
        </div>

        {/* Tab Navigation */}
        <div class="bg-white rounded-lg shadow-sm border mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6">
              <For each={tabs}>
                {(tab) => (
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    class={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab() === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                )}
              </For>
            </nav>
          </div>
        </div>

        {/* Component Examples */}
        <div class="grid gap-6">
          <For each={getExamplesForTab(activeTab())}>
            {(example) => (
              <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-900">{example.title}</h3>
                  <p class="text-sm text-gray-600 mt-1">{example.description}</p>
                </div>
                
                <div class="p-6">
                  <div class="mb-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                    <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {example.component()}
                    </div>
                  </div>
                  
                  <div>
                    <h4 class="text-sm font-medium text-gray-700 mb-3">Code</h4>
                    <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}