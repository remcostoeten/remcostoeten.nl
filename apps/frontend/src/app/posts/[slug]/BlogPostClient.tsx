'use client';

import { motion } from 'framer-motion';
import { ANIMATION_CONFIGS } from '@/modules/shared';

interface BlogPostClientProps {
  children: React.ReactNode;
}

export function BlogPostClient({ children }: BlogPostClientProps) {
  return (
    <motion.div className="max-w-4xl mx-auto" {...ANIMATION_CONFIGS.fadeInUp}>
      {children}
    </motion.div>
  );
}
