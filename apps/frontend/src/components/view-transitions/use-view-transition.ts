"use client";

import { useRouter } from 'next/navigation';
import { useViewTransition as useViewTransitionContext } from './view-transitions-provider';

export function useViewTransition() {
  const router = useRouter();
  const { startViewTransition, isSupported } = useViewTransitionContext();

  function navigateWithTransition(href: string) {
    startViewTransition(() => {
      router.push(href);
    });
  }

  function replaceWithTransition(href: string) {
    startViewTransition(() => {
      router.replace(href);
    });
  }

  function backWithTransition() {
    startViewTransition(() => {
      router.back();
    });
  }

  return {
    navigateWithTransition,
    replaceWithTransition,
    backWithTransition,
    isSupported,
  };
}
