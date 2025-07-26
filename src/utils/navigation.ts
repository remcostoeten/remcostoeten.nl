/**
 * Navigation utility for programmatic routing in SolidJS
 */
function navigateTo(path: string): void {
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
