import { saveRecentShortcut } from './recent-shortcut';

type TShortcutInfo = {
  key: string;
  action: string;
};

/**
 * Navigation utility for programmatic routing in SolidJS
 */
function navigateTo(path: string, shortcutInfo?: TShortcutInfo): void {
  if (shortcutInfo) {
    saveRecentShortcut({
      key: shortcutInfo.key,
      action: shortcutInfo.action,
      timestamp: Date.now()
    });
  }
  window.location.href = path;
}

function goBack(): void {
  window.history.back();
}

function goForward(): void {
  window.history.forward();
}

function reloadPage(): void {
  window.location.reload();
}

export { navigateTo, goBack, goForward, reloadPage };
export type { TShortcutInfo };
