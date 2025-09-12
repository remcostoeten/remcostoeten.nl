"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserProfileProps } from './types';

const UserProfile = memo(function UserProfile({ user }: UserProfileProps) {
  return (
    <Link 
      href="/" 
      className="flex items-center gap-2.5 flex-1 hover:opacity-80 transition-opacity duration-200"
    >
      <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={user.avatar}
          alt={`${user.name} avatar`}
          fill
          className="object-cover"
          sizes="36px"
          priority
        />
      </div>
      
      <div className="flex flex-col flex-1 min-w-0">
        <h2 className="text-white font-medium text-sm truncate">
          {user.name}
        </h2>
        <time className="text-stone-400 text-xs font-medium tracking-tight whitespace-nowrap">
          {user.timestamp}
        </time>
      </div>
    </Link>
  );
});

export { UserProfile };