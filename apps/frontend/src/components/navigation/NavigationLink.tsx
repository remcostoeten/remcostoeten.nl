"use client";

import React, { memo } from 'react';
import { TransitionLink } from '@/components/view-transitions';
import { NavigationLinkProps } from './types';

const NavigationLink = memo(function NavigationLink({ item }: NavigationLinkProps) {
  return (
    <TransitionLink
      href={item.href}
      className={`
        px-2.5 py-0.5 rounded-lg text-sm font-normal transition-all duration-200
        hover:bg-stone-700/50 hover:text-white
        ${item.isActive 
          ? 'bg-stone-800 text-white' 
          : 'text-stone-300 hover:text-white'
        }
      `}
    >
      {item.label}
    </TransitionLink>
  );
});

export { NavigationLink };