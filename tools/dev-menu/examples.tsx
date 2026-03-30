/** Example usage configurations for DevMenu */

import { DevWidget } from './components/DevWidget'

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
