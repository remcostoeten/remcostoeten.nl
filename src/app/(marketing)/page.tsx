import { homeMetadata } from '@/core/metadata'
import { HomeView } from '@/views/marketing/home'

export const revalidate = 60

export { homeMetadata as metadata }

export default function Page() {
	return <HomeView />
}
