// No-op auth stubs to prevent compile errors
// These are placeholder functions that do nothing

export async function signOut() {
  // No-op stub - sign out functionality removed
  console.log('Sign out called - no-op stub');
}

export function useSession() {
  // No-op stub - returns mock session data
  return {
    data: null,
    isPending: false,
  };
}

export function getSession() {
  // No-op stub - returns null session
  return null;
}

export function requireAuth() {
  // No-op stub - returns true (no auth required)
  return true;
}
