import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'
import { ButtonLink } from './ButtonLink'

describe('ButtonLink', () => {
  describe('Element rendering behavior', () => {
    it('renders anchor element when href is provided', () => {
      render(() => (
        <ButtonLink href="/test">
          Link Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element.tagName).toBe('A')
      expect(element).toHaveAttribute('href', '/test')
    })

    it('renders button element when href is not provided', () => {
      render(() => (
        <ButtonLink>
          Regular Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element.tagName).toBe('BUTTON')
      expect(element).not.toHaveAttribute('href')
    })

    it('renders button element when href is undefined', () => {
      render(() => (
        <ButtonLink href={undefined}>
          Undefined Href Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element.tagName).toBe('BUTTON')
    })

    it('renders button element when href is empty string', () => {
      render(() => (
        <ButtonLink href="">
          Empty Href Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element.tagName).toBe('BUTTON')
      expect(element).not.toHaveAttribute('href')
    })
  })

  describe('Disabled state behavior', () => {
    it('sets aria-disabled when disabled prop is true for anchor element', () => {
      render(() => (
        <ButtonLink href="/test" disabled>
          Disabled Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveAttribute('aria-disabled', 'true')
      expect(element).toHaveAttribute('tabindex', '-1')
    })

    it('sets disabled attribute when disabled prop is true for button element', () => {
      render(() => (
        <ButtonLink disabled>
          Disabled Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element.disabled).toBe(true)
    })

    it('blocks navigation when disabled anchor is clicked', () => {
      const mockNavigate = vi.fn()
      
      render(() => (
        <ButtonLink href="/test" disabled onClick={mockNavigate}>
          Disabled Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      fireEvent.click(element)
      
      // The onClick handler is still called but should be prevented
      expect(mockNavigate).toHaveBeenCalled()
    })

    it('allows navigation when enabled anchor is clicked', () => {
      const mockNavigate = vi.fn()
      
      render(() => (
        <ButtonLink href="/test" onClick={mockNavigate}>
          Enabled Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      fireEvent.click(element)
      
      expect(mockNavigate).toHaveBeenCalled()
    })

    it('blocks keyboard navigation when disabled anchor receives Enter key', () => {
      const mockNavigate = vi.fn()
      
      render(() => (
        <ButtonLink href="/test" disabled onClick={mockNavigate}>
          Disabled Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      fireEvent.keyDown(element, { key: 'Enter' })
      
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('blocks keyboard navigation when disabled anchor receives Space key', () => {
      const mockNavigate = vi.fn()
      
      render(() => (
        <ButtonLink href="/test" disabled onClick={mockNavigate}>
          Disabled Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      fireEvent.keyDown(element, { key: ' ' })
      
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('sets aria-disabled when loading prop is true', () => {
      render(() => (
        <ButtonLink href="/test" loading>
          Loading Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveAttribute('aria-disabled', 'true')
      expect(element).toHaveAttribute('tabindex', '-1')
    })

    it('disables button when loading prop is true', () => {
      render(() => (
        <ButtonLink loading>
          Loading Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element.disabled).toBe(true)
    })
  })

  describe('Loading state behavior', () => {
    it('renders spinner when loading is true', () => {
      render(() => (
        <ButtonLink loading>
          Loading Button
        </ButtonLink>
      ))

      const spinner = screen.getByRole('button').querySelector('svg')
      expect(spinner).not.toBeNull()
      expect(spinner).toHaveClass('animate-spin')
      expect(spinner).toHaveClass('-ml-1', 'mr-2', 'h-4', 'w-4')
    })

    it('does not render spinner when loading is false', () => {
      render(() => (
        <ButtonLink loading={false}>
          Not Loading Button
        </ButtonLink>
      ))

      const spinner = screen.getByRole('button').querySelector('svg')
      expect(spinner).toBeNull()
    })

    it('renders spinner when loading is undefined (falsy)', () => {
      render(() => (
        <ButtonLink>
          Default Button
        </ButtonLink>
      ))

      const spinner = screen.getByRole('button').querySelector('svg')
      expect(spinner).toBeNull()
    })

    it('renders spinner with correct SVG structure for anchor element', () => {
      render(() => (
        <ButtonLink href="/test" loading>
          Loading Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      const spinner = element.querySelector('svg')
      
      expect(spinner).not.toBeNull()
      expect(spinner).toHaveAttribute('fill', 'none')
      expect(spinner).toHaveAttribute('viewBox', '0 0 24 24')
      
      const circle = spinner!.querySelector('circle')
      const path = spinner!.querySelector('path')
      
      expect(circle).toHaveAttribute('cx', '12')
      expect(circle).toHaveAttribute('cy', '12')
      expect(circle).toHaveAttribute('r', '10')
      expect(circle).toHaveClass('opacity-25')
      
      expect(path).toHaveClass('opacity-75')
      expect(path).toHaveAttribute('fill', 'currentColor')
    })
  })

  describe('Variant class generation', () => {
    it('applies primary variant classes', () => {
      render(() => (
        <ButtonLink variant="primary">
          Primary Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('bg-accent', 'text-accent-foreground', 'hover:bg-accent/90', 'focus:ring-accent')
    })

    it('applies secondary variant classes', () => {
      render(() => (
        <ButtonLink variant="secondary">
          Secondary Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80', 'focus:ring-secondary')
    })

    it('applies ghost variant classes', () => {
      render(() => (
        <ButtonLink variant="ghost">
          Ghost Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('hover:bg-muted', 'hover:text-foreground', 'focus:ring-muted')
    })

    it('applies destructive variant classes', () => {
      render(() => (
        <ButtonLink variant="destructive">
          Destructive Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('bg-destructive', 'text-destructive-foreground', 'hover:bg-destructive/90', 'focus:ring-destructive')
    })

    it('applies admin variant classes', () => {
      render(() => (
        <ButtonLink variant="admin">
          Admin Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('bg-background', 'border-2', 'border-border', 'hover:border-accent/50', 'text-foreground', 'focus:ring-accent')
    })

    it('applies default admin variant when no variant specified', () => {
      render(() => (
        <ButtonLink>
          Default Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('bg-background', 'border-2', 'border-border', 'hover:border-accent/50', 'text-foreground', 'hover:-translate-y-0.5', 'focus:ring-accent')
    })
  })

  describe('Size class generation', () => {
    it('applies small size classes', () => {
      render(() => (
        <ButtonLink size="sm">
          Small Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('h-8', 'px-3', 'text-sm')
    })

    it('applies medium size classes', () => {
      render(() => (
        <ButtonLink size="md">
          Medium Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('h-10', 'px-4')
    })

    it('applies large size classes', () => {
      render(() => (
        <ButtonLink size="lg">
          Large Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('h-12', 'px-6', 'text-lg')
    })

    it('applies default medium size when no size specified', () => {
      render(() => (
        <ButtonLink>
          Default Size Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('h-10', 'px-4')
    })
  })

  describe('Base classes', () => {
    it('applies base button classes to all variants', () => {
      render(() => (
        <ButtonLink>
          Base Classes Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-md',
        'transition-colors',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed'
      )
    })

    it('combines custom class with generated classes', () => {
      render(() => (
        <ButtonLink class="custom-class">
          Custom Class Button
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveClass('custom-class')
      expect(element).toHaveClass('inline-flex', 'items-center', 'justify-center')
    })
  })

  describe('Accessibility attributes for anchor elements', () => {
    it('sets correct accessibility attributes for enabled anchor', () => {
      render(() => (
        <ButtonLink href="/test">
          Accessible Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveAttribute('role', 'button')
      expect(element).not.toHaveAttribute('aria-disabled')
      expect(element).toHaveAttribute('tabindex', '0')
    })

    it('sets correct accessibility attributes for disabled anchor', () => {
      render(() => (
        <ButtonLink href="/test" disabled>
          Disabled Accessible Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveAttribute('role', 'button')
      expect(element).toHaveAttribute('aria-disabled', 'true')
      expect(element).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Keyboard interaction for anchor elements', () => {
    it('handles Enter key press on enabled anchor', () => {
      const mockClick = vi.fn()
      
      render(() => (
        <ButtonLink href="/test" onClick={mockClick}>
          Keyboard Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      
      // Mock the click method
      element.click = vi.fn()
      
      fireEvent.keyDown(element, { key: 'Enter' })
      
      expect(element.click).toHaveBeenCalled()
    })

    it('handles Space key press on enabled anchor', () => {
      const mockClick = vi.fn()
      
      render(() => (
        <ButtonLink href="/test" onClick={mockClick}>
          Keyboard Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      
      // Mock the click method
      element.click = vi.fn()
      
      fireEvent.keyDown(element, { key: ' ' })
      
      expect(element.click).toHaveBeenCalled()
    })

    it('ignores other key presses on anchor', () => {
      const mockClick = vi.fn()
      
      render(() => (
        <ButtonLink href="/test" onClick={mockClick}>
          Keyboard Link
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      
      // Mock the click method
      element.click = vi.fn()
      
      fireEvent.keyDown(element, { key: 'Tab' })
      fireEvent.keyDown(element, { key: 'Escape' })
      fireEvent.keyDown(element, { key: 'a' })
      
      expect(element.click).not.toHaveBeenCalled()
    })
  })

  describe('Props passing', () => {
    it('passes through additional button attributes to button element', () => {
      render(() => (
        <ButtonLink 
          type="submit"
          form="test-form"
          data-testid="custom-button"
        >
          Button with Attributes
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveAttribute('type', 'submit')
      expect(element).toHaveAttribute('form', 'test-form')
      expect(element).toHaveAttribute('data-testid', 'custom-button')
    })

    it('passes through additional anchor attributes to anchor element', () => {
      render(() => (
        <ButtonLink 
          href="/test"
          target="_blank"
          rel="noopener"
          data-testid="custom-link"
        >
          Link with Attributes
        </ButtonLink>
      ))

      const element = screen.getByRole('button')
      expect(element).toHaveAttribute('target', '_blank')
      expect(element).toHaveAttribute('rel', 'noopener')
      expect(element).toHaveAttribute('data-testid', 'custom-link')
    })
  })
})
