import { blogMetadata } from '@/core/metadata'
import { BlogView } from './view'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export { blogMetadata as metadata }

export default function Page() {
	return <BlogView />
}
