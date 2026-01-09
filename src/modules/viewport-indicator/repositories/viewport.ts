import type { ViewportSize, ViewportPreset } from '../models/types'
import { viewportPresets } from '../models/types'

export function getInitial(viewport: ViewportSize): string {
  return viewportPresets[viewport].initial
}

export function getInterval(size: number): number {
  if (size <= 400) return 25
  if (size <= 800) return 50
  return 100
}

export function getLabelInterval(size: number): number {
  if (size <= 400) return 50
  if (size <= 800) return 100
  return 200
}

export function applyViewportStyles(width: number): void {
  const bodyStyle = document.body.style
  bodyStyle.maxWidth = `${width}px`
  bodyStyle.margin = '24px auto'
  bodyStyle.border = `1px solid hsl(var(--border))`
  bodyStyle.boxShadow = `0 0 20px 5px hsl(var(--foreground) / 0.05)`
  bodyStyle.borderRadius = '8px'
  bodyStyle.transition = 'all 0.3s ease-in-out'
}

export function resetViewportStyles(): void {
  const bodyStyle = document.body.style
  bodyStyle.maxWidth = ''
  bodyStyle.margin = ''
  bodyStyle.border = ''
  bodyStyle.boxShadow = ''
  bodyStyle.borderRadius = ''
}

export function detectCurrentViewport(): ViewportSize {
  if (typeof window === 'undefined') return 'desktop'

  if (window.matchMedia('(max-width: 768px)').matches) return 'mobile'
  if (window.matchMedia('(min-width: 769px) and (max-width: 1024px)').matches) return 'tablet'
  return 'desktop'
}

export function getViewportDimensions(
  viewport: ViewportSize | null,
  customWidth: number
): { width: number; height: number } {
  if (!viewport) return { width: 0, height: 0 }

  if (viewport === 'custom') {
    return { width: customWidth, height: 600 }
  }

  const preset = viewportPresets[viewport]
  return {
    width: parseInt(preset.width, 10),
    height: parseInt(preset.height, 10)
  }
}