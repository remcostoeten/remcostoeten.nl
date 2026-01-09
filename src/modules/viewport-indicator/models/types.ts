export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'custom'

export const breakpoints = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
} as const

export type ViewportPreset = {
  id: ViewportSize
  name: string
  width: string
  height: string
  initial: string
}

export const viewportPresets: Record<ViewportSize, ViewportPreset> = {
  mobile: { id: 'mobile', name: 'Mobile', width: '375', height: '667', initial: 'M' },
  tablet: { id: 'tablet', name: 'Tablet', width: '768', height: '1024', initial: 'T' },
  desktop: { id: 'desktop', name: 'Desktop', width: '1024', height: '768', initial: 'D' },
  custom: { id: 'custom', name: 'Custom', width: '800', height: '600', initial: 'C' },
}