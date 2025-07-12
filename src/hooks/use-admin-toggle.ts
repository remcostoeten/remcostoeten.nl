'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

type TPatternState = {
  index: number;
  timer: NodeJS.Timeout | null;
};

function useAdminToggle() {
  const router = useRouter();
  const stateRef = useRef<TPatternState>({ index: 0, timer: null });
  
  const expectedPattern = ['Space', 'Space', 'Space', 'Backspace', 'Backspace', 'Backspace'];
  const totalTimeout = 4000;

  useEffect(() => {
    const isEnabled = process.env.NEXT_PUBLIC_ADMIN_TOGGLE === 'true';
    
    if (!isEnabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const state = stateRef.current;
      
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }
      
      if (event.code === expectedPattern[state.index]) {
        state.index++;
        
        if (state.index >= expectedPattern.length) {
          router.push('/admin/cms');
          state.index = 0;
          toast({ title: 'Navigating to admin' });
          return;
        }
        
        state.timer = setTimeout(() => {
          state.index = 0;
          state.timer = null;
        }, totalTimeout);
      } else {
        state.index = 0;
        if (state.timer) {
          clearTimeout(state.timer);
          state.timer = null;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (stateRef.current.timer) {
        clearTimeout(stateRef.current.timer);
      }
    };
  }, [router]);
}

export default useAdminToggle;
