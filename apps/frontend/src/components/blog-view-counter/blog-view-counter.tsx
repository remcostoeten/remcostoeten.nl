"use client";

import { PageviewCounter } from '@/components/analytics';

type TProps = {
  blogSlug: string;
  blogTitle: string;
  showDetails?: boolean;
  className?: string;
};

export function BlogViewCounter({ 
  blogSlug, 
  blogTitle, 
  showDetails = false, 
  className = '' 
}: TProps) {
  return (
    <PageviewCounter
      blogSlug={blogSlug}
      blogTitle={blogTitle}
      showDetails={showDetails}
      className={className}
      variant="blog"
    />
  );
}

