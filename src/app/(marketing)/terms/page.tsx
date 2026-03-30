import { createPageMetadata } from '@/core/metadata/base'
import { TermsView } from '@/views/marketing/terms'

export const metadata = createPageMetadata({
	title: 'Terms of Service',
	description:
		'Terms of service for remcostoeten.nl - Rules and guidelines for using this website.',
	canonical: '/terms'
})

export default function Page() {
	return <TermsView />
}
