"use client";

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavigationProps, NavigationItem } from './types';
import { NavigationLink } from './NavigationLink';
import { SubscribeButton } from './SubscribeButton';
import { UserProfile } from './UserProfile';

const defaultNavigationItems: NavigationItem[] = [
  { label: 'Home', href: '/', isActive: true },
  { label: 'All posts', href: '/posts', isActive: false },
  { label: 'Contact', href: '/contact', isActive: false },
];

const Navigation = memo(function Navigation({
  user = {
    name: 'Frank Price',
    avatar: 'https://framerusercontent.com/images/ak3huUt2CL8kTQwiGctKwXcjeQ.png',
    timestamp: '4:04:04 AM'
  },
  navigationItems = defaultNavigationItems,
  subscribeHref = '#newsletter',
  className = ''
}: NavigationProps) {
  // Memoize navigation items to prevent unnecessary re-renders
  const memoizedNavigationItems = useMemo(() => navigationItems, [navigationItems]);
  return (
    <div className={`fixed top-0 left-1/2 transform -translate-x-1/2 w-full z-50 ${className}`} style={{ viewTransitionName: 'navigation' }}>
      <nav className="flex items-center justify-center overflow-hidden">
        <div 
          className="flex items-center justify-between flex-1 px-6 py-5 backdrop-blur-sm"
          style={{ 
            background: 'linear-gradient(to bottom, rgba(23, 22, 22, 1) 0%, rgba(23, 22, 22, 0.8) 50%, transparent 100%)' 
          }}
        >
          <div className="flex items-center flex-1 gap-3 pr-3">
            <div className="flex items-center flex-1 gap-2.5">
              <UserProfile user={user} />
            </div>
            
            <nav className="flex items-center gap-0">
              {memoizedNavigationItems.map((item) => (
                <NavigationLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
          
          <SubscribeButton href={subscribeHref} />
        </div>
      </nav>
    </div>
  );
});

export { Navigation };