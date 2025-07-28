import { JSX, createEffect } from 'solid-js';
import { useKeyboardShortcuts } from '~/hooks/use-keyboard-shortcuts';
import { createShortcut, KeyHelpers } from '~/hooks/keyboard-shortcuts-utils';
import { navigateTo } from '~/utils/navigation';

type TProps = {
  children: JSX.Element;
};

function buildVisualKeyString(sequence: { key: string; modifiers?: string[] }[]): string {
  const keyMap: Record<string, string> = {
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Tab': '⇥',
    'Shift': '⇧',
    'Control': '⌃',
    'Alt': '⌥',
    'Meta': '⌘',
    'Enter': '↵',
    'Escape': '⎋',
    'Backspace': '⌫',
    'Delete': '⌦',
    'Home': '↖',
    'End': '↘',
    'PageUp': '⇞',
    'PageDown': '⇟',
    'space': '␣'
  };

  function formatKey(key: string): string {
    return keyMap[key] || key.toUpperCase();
  }

  return sequence.map(keystroke => {
    const modifiers = keystroke.modifiers || [];
    const modifierSymbols = modifiers.map(mod => {
      switch (mod) {
        case 'ctrl': return '⌃';
        case 'alt': return '⌥';
        case 'meta': case 'cmd': return '⌘';
        case 'shift': return '⇧';
        default: return mod.toUpperCase();
      }
    });
    const parts = [...modifierSymbols, formatKey(keystroke.key)];
    return parts.join(' + ');
  }).join(' ');
}

function KeyboardShortcutsProvider(props: TProps) {
  const shortcuts = [
    createShortcut(
      'home-access',
      'Go to Home',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('1')
      ],
      function() {
        const key = buildVisualKeyString([
          { key: 'space' },
          { key: 'space' },
          { key: 'space' },
          { key: '1' }
        ]);
        navigateTo('/', {
          key,
          action: 'Navigate to home with triple space + 1'
        });
      },
      { 
        description: 'Navigate to home with triple space + 1',
        global: true 
      }
    ),
    createShortcut(
      'about-access',
      'Go to About',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('2')
      ],
      function() {
        const key = buildVisualKeyString([
          { key: 'space' },
          { key: 'space' },
          { key: 'space' },
          { key: '2' }
        ]);
        navigateTo('/about', {
          key,
          action: 'Navigate to about with triple space + 2'
        });
      },
      { 
        description: 'Navigate to about with triple space + 2',
        global: true 
      }
    ),
    createShortcut(
      'analytics-access',
      'Go to Analytics',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('3')
      ],
      function() {
        const key = buildVisualKeyString([
          { key: 'space' },
          { key: 'space' },
          { key: 'space' },
          { key: '3' }
        ]);
        navigateTo('/analytics', {
          key,
          action: 'Navigate to analytics with triple space + 3'
        });
      },
      { 
        description: 'Navigate to analytics with triple space + 3',
        global: true 
      }
    ),
    createShortcut(
      'login-access',
      'Go to Login',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('4')
      ],
      function() {
        const key = buildVisualKeyString([
          { key: 'space' },
          { key: 'space' },
          { key: 'space' },
          { key: '4' }
        ]);
        navigateTo('/auth/login', {
          key,
          action: 'Navigate to login with triple space + 4'
        });
      },
      { 
        description: 'Navigate to login with triple space + 4',
        global: true 
      }
    ),
    createShortcut(
      'register-access',
      'Go to Register',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('5')
      ],
      function() {
        const key = buildVisualKeyString([
          { key: 'space' },
          { key: 'space' },
          { key: 'space' },
          { key: '5' }
        ]);
        navigateTo('/auth/register', {
          key,
          action: 'Navigate to register with triple space + 5'
        });
      },
      { 
        description: 'Navigate to register with triple space + 5',
        global: true 
      }
    ),
    createShortcut(
      'contact-access',
      'Go to Contact',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('6')
      ],
      function() {
        const key = buildVisualKeyString([
          { key: 'space' },
          { key: 'space' },
          { key: 'space' },
          { key: '6' }
        ]);
        navigateTo('/contact', {
          key,
          action: 'Navigate to contact with triple space + 6'
        });
      },
      { 
        description: 'Navigate to contact with triple space + 6',
        global: true 
      }
    ),
    createShortcut(
      'demo-access',
      'Go to Demo',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('7')
      ],
      function() {
        const key = buildVisualKeyString([
          { key: 'space' },
          { key: 'space' },
          { key: 'space' },
          { key: '7' }
        ]);
        navigateTo('/demo', {
          key,
          action: 'Navigate to demo with triple space + 7'
        });
      },
      { 
        description: 'Navigate to demo with triple space + 7',
        global: true 
      }
    ),
    createShortcut(
      'projects-access',
      'Go to Projects',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('8')
      ],
      function() {
        const key = buildVisualKeyString([
          { key: 'space' },
          { key: 'space' },
          { key: 'space' },
          { key: '8' }
        ]);
        navigateTo('/projects', {
          key,
          action: 'Navigate to projects with triple space + 8'
        });
      },
      { 
        description: 'Navigate to projects with triple space + 8',
        global: true 
      }
    ),
    createShortcut(
      'tailwind-demo-access',
      'Go to Tailwind Demo',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('9')
      ],
      function() {
        const key = buildVisualKeyString([
          { key: 'space' },
          { key: 'space' },
          { key: 'space' },
          { key: '9' }
        ]);
        navigateTo('/tailwind-demo', {
          key,
          action: 'Navigate to tailwind demo with triple space + 9'
        });
      },
      { 
        description: 'Navigate to tailwind demo with triple space + 9',
        global: true 
      }
    )
  ];

  useKeyboardShortcuts(shortcuts, {
    debug: true,
    ignoreInputs: true,
    preventDefaultOnMatch: true,
    sequenceTimeout: 2000
  });

  return <>{props.children}</>;
}

export default KeyboardShortcutsProvider;
