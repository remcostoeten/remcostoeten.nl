import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';
import { createCustomSequenceShortcut } from '../hooks/keyboard-shortcuts-utils';
// import { useAuthContext } from '../modules/auth/providers/auth-provider';

type TProps = {
  children: React.ReactNode;
};

export function KeyboardShortcutsProvider({ children }: TProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // const { user } = useAuthContext(); // Commented out until auth is properly set up
  const user = true; // Temporary: simulate authenticated user for demo

  const shortcuts = useMemo(() => {
    const shortcutList = [];

    // Space Space Space 1 - Navigate to admin dashboard (from anywhere)
    if (user) {
      shortcutList.push(
        createCustomSequenceShortcut(
          'nav-to-admin-quick',
          'Quick Admin Access',
          ['space', 'space', 'space', '1'],
          () => navigate('/admin'),
          'Quick navigation to admin dashboard'
        )
      );
    }

    // Space Space Space 2 - Navigate to admin analytics (from anywhere)
    if (user) {
      shortcutList.push(
        createCustomSequenceShortcut(
          'nav-to-admin-analytics',
          'Admin Analytics',
          ['space', 'space', 'space', '2'],
          () => navigate('/admin/analytics'),
          'Quick navigation to admin analytics'
        )
      );
    }

    // Space Space Space 0 - Navigate to home (from anywhere)
    shortcutList.push(
      createCustomSequenceShortcut(
        'nav-to-home-quick',
        'Quick Home Access',
        ['space', 'space', 'space', '0'],
        () => navigate('/'),
        'Quick navigation to home page'
      )
    );

    // Space Space Space Backspace Backspace Backspace - Toggle between admin and home
    const isOnAdminRoute = location.pathname.startsWith('/admin');
    
    if (isOnAdminRoute) {
      // If on admin route, go to home
      shortcutList.push(
        createCustomSequenceShortcut(
          'nav-to-home',
          'Navigate to Home',
          ['space', 'space', 'space', 'backspace', 'backspace', 'backspace'],
          () => navigate('/'),
          'Navigate from admin to home page'
        )
      );
    } else {
      // If on home route and user is authenticated, go to admin
      if (user) {
        shortcutList.push(
          createCustomSequenceShortcut(
            'nav-to-admin',
            'Navigate to Admin',
            ['space', 'space', 'space', 'backspace', 'backspace', 'backspace'],
            () => navigate('/admin'),
            'Navigate from home to admin dashboard'
          )
        );
      }
    }

    return shortcutList;
  }, [navigate, location.pathname, user]);

  useKeyboardShortcuts(shortcuts, {
    debug: false,
    ignoreInputs: true,
    preventDefaultOnMatch: true,
    sequenceTimeout: 2000, // Give 2 seconds for the sequence
  });

  return <>{children}</>;
}
