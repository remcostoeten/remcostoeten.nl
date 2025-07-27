import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Setup DOM globals
const dom = new (require('jsdom').JSDOM)('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable',
})

global.window = dom.window as any
global.document = dom.window.document
global.navigator = dom.window.navigator
global.HTMLElement = dom.window.HTMLElement
global.Element = dom.window.Element

// Mock fetch globally
global.fetch = vi.fn()
