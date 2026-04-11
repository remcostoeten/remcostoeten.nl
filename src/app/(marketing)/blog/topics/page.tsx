import { topicsMetadata } from '@/core/metadata'
import { TopicsView } from '@/views/marketing/blog/topics'

export const dynamic = 'force-dynamic'

export { topicsMetadata as metadata }

export default function Page() {
	return <TopicsView />
}
