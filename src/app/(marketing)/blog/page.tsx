import { blogMetadata } from '@/core/metadata'
import { BlogView } from '@/views/marketing/blog'

export const revalidate = 60

export { blogMetadata as metadata }

export default function Page() {
	return <BlogView />
}
