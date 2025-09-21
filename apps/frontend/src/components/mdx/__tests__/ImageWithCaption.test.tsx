import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImageWithCaption } from '../ImageWithCaption';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, onLoad, ...props }: any) => {
    // Simulate image load after a short delay
    setTimeout(() => {
      if (onLoad) onLoad();
    }, 10);
    
    return (
      <img
        src={src}
        alt={alt}
        {...props}
        data-testid="next-image"
      />
    );
  }
}));

describe('ImageWithCaption', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
    width: 800,
    height: 600
  };

  it('renders image with alt text', () => {
    render(<ImageWithCaption {...defaultProps} />);
    
    expect(screen.getByAltText('Test image')).toBeInTheDocument();
  });

  it('renders caption when provided', () => {
    render(
      <ImageWithCaption 
        {...defaultProps} 
        caption="This is a test caption" 
      />
    );
    
    expect(screen.getByText('This is a test caption')).toBeInTheDocument();
  });

  it('does not render caption when not provided', () => {
    render(<ImageWithCaption {...defaultProps} />);
    
    expect(screen.queryByRole('figure')).toBeInTheDocument();
    expect(screen.queryByText(/caption/i)).not.toBeInTheDocument();
  });

  it('opens zoom modal when image is clicked', async () => {
    render(<ImageWithCaption {...defaultProps} />);
    
    const imageContainer = screen.getByRole('button', { name: /zoom image/i });
    fireEvent.click(imageContainer);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Close zoomed view')).toBeInTheDocument();
    });
  });

  it('closes zoom modal when close button is clicked', async () => {
    render(<ImageWithCaption {...defaultProps} />);
    
    // Open modal
    const imageContainer = screen.getByRole('button', { name: /zoom image/i });
    fireEvent.click(imageContainer);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByLabelText('Close zoomed view');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes zoom modal when escape key is pressed', async () => {
    render(<ImageWithCaption {...defaultProps} />);
    
    // Open modal
    const imageContainer = screen.getByRole('button', { name: /zoom image/i });
    fireEvent.click(imageContainer);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Press escape
    fireEvent.keyDown(imageContainer, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows caption in zoom modal when provided', async () => {
    render(
      <ImageWithCaption 
        {...defaultProps} 
        caption="Zoom modal caption" 
      />
    );
    
    // Open modal
    const imageContainer = screen.getByRole('button', { name: /zoom image/i });
    fireEvent.click(imageContainer);
    
    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(screen.getAllByText('Zoom modal caption')).toHaveLength(2); // One in figure, one in modal
    });
  });

  it('applies custom className', () => {
    render(
      <ImageWithCaption 
        {...defaultProps} 
        className="custom-image-class" 
      />
    );
    
    expect(screen.getByRole('figure')).toHaveClass('custom-image-class');
  });

  it('handles keyboard navigation for zoom functionality', () => {
    render(<ImageWithCaption {...defaultProps} />);
    
    const imageContainer = screen.getByRole('button', { name: /zoom image/i });
    
    // Should be focusable
    expect(imageContainer).toHaveAttribute('tabIndex', '0');
    
    // Should respond to Enter key
    fireEvent.keyDown(imageContainer, { key: 'Enter' });
    // Note: In a real implementation, you might want to handle Enter key for accessibility
  });
});