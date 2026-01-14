// Example usage configurations for DevMenu

import { DevWidget } from "./components/DevWidget"


// =============================================================================
// 1. Full Featured (with Auth)
// =============================================================================
export function FullFeaturedExample() {
  const session = { user: { name: 'John', email: 'john@example.com' } }

  return (
    <DevWidget
      session={session}
      onSignOut={() => console.log('signed out')}
      showAuth={true}
      showRoutes={true}
      showSystemInfo={true}
      showSettings={true}
    />
  )
}

// =============================================================================
// 2. Public Site (No Auth)
// =============================================================================
export function PublicSiteExample() {
  return (
    <DevWidget
      showAuth={false}
      showRoutes={true}
      showSystemInfo={true}
      showSettings={true}

    />
  )
}

// =============================================================================
// 3. Minimal (Routes Only)
// =============================================================================
export function MinimalExample() {
  return (
    <DevWidget
      showAuth={false}
      showRoutes={true}
      showSystemInfo={false}
      showSettings={false}

    />
  )
}

// =============================================================================
// 4. API Testing (No Routes, Just Auth & System Info)
// =============================================================================
export function ApiTestingExample() {
  const session = { user: { name: 'API Tester', email: 'tester@api.com' } }

  return (
    <DevWidget
      session={session}
      onSignOut={() => console.log('signed out')}
      showAuth={true}
      showRoutes={false}
      showSystemInfo={true}
      showSettings={true}
      customTitle="API Debug Menu"
    />
  )
}

// =============================================================================
// 5. Dashboard (Auth + Routes, Hide System Info)
// =============================================================================
export function DashboardExample() {
  const session = { user: { name: 'Admin User', email: 'admin@company.com' } }

  return (
    <DevWidget
      session={session}
      onSignOut={() => console.log('signed out')}
      showAuth={true}
      showRoutes={true}
      showSystemInfo={false}
      showSettings={true}
      isAdmin={true}

      customTitle="Admin Tools"
    />
  )
}
