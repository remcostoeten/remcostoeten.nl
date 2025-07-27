import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'
import path from 'path'

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})
