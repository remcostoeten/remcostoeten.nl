import { JSX, createEffect } from 'solid-js';
import { useKeyboardShortcuts } from '~/hooks/use-keyboard-shortcuts';
import { createShortcut, KeyHelpers } from '~/hooks/keyboard-shortcuts-utils';
import { navigateTo } from '~/utils/navigation';

type TProps = {
  children: JSX.Element;
};

function KeyboardShortcutsProvider(props: TProps) {
  const shortcuts = [
    createShortcut(
      'admin-access',
      'Go to Admin Panel',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'), 
        KeyHelpers.plain('space'),
        KeyHelpers.plain('1')
      ],
      () => navigateTo('/admin'),
      { 
        description: 'Navigate to admin panel with triple space + 1',
        global: true 
      }
    ),
    
    createShortcut(
      'home-access',
      'Go to Home',
      [
        KeyHelpers.plain('1'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space')
      ],
      () => navigateTo('/'),
      { 
        description: 'Navigate to home with 1 + triple space',
        global: true 
      }
    ),
    
    createShortcut(
      'db-test-access',
      'Go to Database Test',
      [
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('space'),
        KeyHelpers.plain('2')
      ],
      () => navigateTo('/db-test'),
      { 
        description: 'Navigate to database test page with triple space + 2',
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
