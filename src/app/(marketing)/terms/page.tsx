import { createPageMetadata } from '@/core/metadata/base'
import { TermsView } from '@/views/marketing/terms'

export const metadata = createPageMetadata({
	title: 'Terms of service',
	description:
		'The terms for using my personal website and blog, remcostoeten.nl.',
	canonical: '/terms'
})

export default function Page() {
	return <TermsView />
}
