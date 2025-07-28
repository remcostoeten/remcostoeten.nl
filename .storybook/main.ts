import type { StorybookConfig } from '@storybook/web-components-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  viteFinal: async (config) => {
    // Add SolidJS support
    config.plugins = config.plugins || []
    
    return config
  },
  docs: {
    autodocs: 'tag'
  }
}

export default config
