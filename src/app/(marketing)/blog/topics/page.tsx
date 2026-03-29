import { topicsMetadata } from '@/core/metadata'
import { TopicsView } from './view'

export const revalidate = 60

export { topicsMetadata as metadata }

export default function Page() {
	return <TopicsView />
}
