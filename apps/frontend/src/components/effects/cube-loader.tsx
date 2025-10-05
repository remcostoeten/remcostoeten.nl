'use client';

import { cn } from '@/lib/utils';
import React from 'react';

type TProps = {
  size?: number;
  color?: string;
  className?: string;
};

export const CubeLoader = React.memo(function CubeLoader({ className, size = 70.4, color = 'rgb(247, 197, 159)' }: TProps) {
  const border = size * 0.05;
  const half = size / 2;

  return (
    <section role="status" aria-label="Loading content" className={cn("flex items-center justify-center", className)}>
      <style>
        {`
          @keyframes cube-spin {
            0% { transform: rotate(45deg) rotateX(-25deg) rotateY(25deg); }
            50% { transform: rotate(45deg) rotateX(-385deg) rotateY(25deg); }
            100% { transform: rotate(45deg) rotateX(-385deg) rotateY(385deg); }
          }
        `}
      </style>

      <div
        className="relative"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transformStyle: 'preserve-3d',
          animation: 'cube-spin 1.6s infinite ease',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => {
          const baseStyle: React.CSSProperties = {
            backgroundColor: `${color.replace('rgb', 'rgba').replace(')', ',0.1)')}`,
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: `${border}px solid ${color}`,
          };

          const transforms: Record<number, string> = {
            0: `translateZ(-${half}px) rotateY(180deg)`,
            1: `rotateY(-270deg) translateX(50%)`,
            2: `rotateY(270deg) translateX(-50%)`,
            3: `rotateX(90deg) translateY(-50%)`,
            4: `rotateX(-90deg) translateY(50%)`,
            5: `translateZ(${half}px)`,
          };

          const origins: Record<number, string> = {
            1: 'top right',
            2: 'center left',
            3: 'top center',
            4: 'bottom center',
          };

          return (
            <div
              key={i}
              style={{
                ...baseStyle,
                transform: transforms[i],
                transformOrigin: origins[i] ?? undefined,
              }}
            />
          );
        })}
      </div>
    </section>
  );
});

