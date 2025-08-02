import { createSignal, onMount, onCleanup } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';

type TShortcutSequence = {
  keys: string[];
  description: string;
  target?: string | ((currentPath: string) => string);
};

function KeyboardShortcutIndicator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSequence, setCurrentSequence] = createSignal<string[]>([]);

  const SEQUENCE_TIMEOUT = 2000;

  // Define the custom shortcuts
  const shortcuts: TShortcutSequence[] = [
    {
      keys: ['space', 'space', 'space', 'escape'],
      description: 'Navigate to Admin/Home',
      target: (currentPath: string) => {
        return currentPath.startsWith('/admin') ? '/' : '/admin';
      }
    }
  ];

  let sequenceTimeout: number | null = null;

  function clearSequence() {
    setCurrentSequence([]);
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
      sequenceTimeout = null;
    }
  }

  function checkForSequenceMatch(sequence: string[]): TShortcutSequence | null {
    return shortcuts.find(shortcut => 
      shortcut.keys.length === sequence.length &&
      shortcut.keys.every((key, index) => key === sequence[index])
    ) || null;
  }

  function checkForPartialMatch(sequence: string[]): boolean {
    return shortcuts.some(shortcut => 
      shortcut.keys.length >= sequence.length &&
      sequence.every((key, index) => shortcut.keys[index] === key)
    );
  }

  function handleKeyDown(event: KeyboardEvent) {
    // Skip if in input elements
    const activeElement = document.activeElement;
    if (activeElement && (
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) ||
      activeElement.hasAttribute('contenteditable')
    )) {
      return;
    }

    const key = event.key === ' ' ? 'space' : event.key.toLowerCase();
    
    // Handle sequence tracking for custom shortcuts
    const currentSeq = currentSequence();
    const newSequence = [...currentSeq, key];
    
    // Check for complete match
    const match = checkForSequenceMatch(newSequence);
    if (match) {
      if (match.target) {
        if (typeof match.target === 'function') {
          navigate(match.target(location.pathname));
        } else {
          navigate(match.target);
        }
      }
      clearSequence();
      return;
    }
    
    // Check for partial match
    const hasPartialMatch = checkForPartialMatch(newSequence);
    if (hasPartialMatch) {
      setCurrentSequence(newSequence);

      // Clear sequence timeout
      if (sequenceTimeout) clearTimeout(sequenceTimeout);
      sequenceTimeout = setTimeout(() => {
        clearSequence();
      }, SEQUENCE_TIMEOUT);
      return;
    }
    
    // Clear sequence if no match
    if (currentSeq.length > 0) {
      clearSequence();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown, { passive: true });
    
    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }
    });
  });

  return null;
}

export { KeyboardShortcutIndicator };
