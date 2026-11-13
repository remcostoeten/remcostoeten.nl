import { createPageMetadata } from '@/core/metadata/base'
import { PrivacyView } from '@/views/marketing/privacy'

export const metadata = createPageMetadata({
	title: 'Privacy policy',
	description:
		'How I collect, use, and protect your data on remcostoeten.nl.',
	canonical: '/privacy'
})

export default function Page() {
	return <PrivacyView />
}
