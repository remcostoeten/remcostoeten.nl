import { blogMetadata } from '@/core/metadata'
import { BlogView } from '@/views/marketing/blog'

export const dynamic = 'force-dynamic'

export { blogMetadata as metadata }

export default function Page() {
	return <BlogView />
}
