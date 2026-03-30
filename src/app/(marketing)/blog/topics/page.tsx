import { topicsMetadata } from '@/core/metadata'
import { TopicsView } from '@/views/marketing/blog/topics'

export const revalidate = 60

export { topicsMetadata as metadata }

export default function Page() {
	return <TopicsView />
}
