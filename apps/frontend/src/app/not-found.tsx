'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { Center } from '@/shared/components/center';

export default function NotFound() {
  return (
    <Center fullHeight className="bg-background">
      <div className="mx-auto max-w-xl text-center px-6">
        <div className="mb-6 text-sm font-medium text-muted-foreground">404</div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you are looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2" />
              Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/posts">
              <ArrowLeft className="mr-2" />
              Browse posts
            </Link>
          </Button>
        </div>
      </div>
    </Center>
  );
}
