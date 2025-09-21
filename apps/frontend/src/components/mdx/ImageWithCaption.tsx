'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ZoomIn, X } from 'lucide-react';

export interface ImageWithCaptionProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function ImageWithCaption({
  src,
  alt,
  caption,
  width = 800,
  height = 600,
  className,
  priority = false
}: ImageWithCaptionProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isZoomed) {
      setIsZoomed(false);
    }
  };

  return (
    <>
      <figure className={cn('my-8', className)}>
        <div className="relative group overflow-hidden rounded-lg border border-border bg-muted">
          <div 
            className="relative cursor-zoom-in"
            onClick={handleZoomToggle}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Zoom image: ${alt}`}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              className={cn(
                'w-full h-auto transition-opacity duration-300',
                isLoading ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={() => setIsLoading(false)}
            />
            
            {/* Loading skeleton */}
            {isLoading && (
              <div 
                className="absolute inset-0 bg-muted animate-pulse"
                style={{ aspectRatio: `${width}/${height}` }}
              />
            )}
            
            {/* Zoom overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        </div>
        
        {caption && (
          <figcaption className="mt-3 text-sm text-muted-foreground text-center italic">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Zoom modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleZoomToggle}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed image view"
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={handleZoomToggle}
            aria-label="Close zoomed view"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-full max-h-full">
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="max-w-full max-h-full object-contain"
              priority
            />
            
            {caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 text-center">
                {caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}