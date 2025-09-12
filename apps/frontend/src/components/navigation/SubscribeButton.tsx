"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { SubscribeButtonProps } from './types';

const SubscribeButton = memo(function SubscribeButton({ href }: SubscribeButtonProps) {
  return (
    <Link
      href={href}
      className="
        inline-flex items-center gap-1.5 px-3 py-1 rounded-lg
        bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium
        shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40
        transition-all duration-200 hover:scale-105
        border border-orange-500/20
      "
    >
      Subscribe
      <Mail size={14} />
    </Link>
  );
});

export { SubscribeButton };