import { createPageMetadata } from '@/core/metadata/base'
import { PrivacyView } from './view'

export const metadata = createPageMetadata({
	title: 'Privacy Policy',
	description:
		'Privacy policy for remcostoeten.nl - How we collect, use, and protect your data.',
	canonical: '/privacy'
})

export default function Page() {
	return <PrivacyView />
}
