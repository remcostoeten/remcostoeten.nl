import { Geist } from 'next/font/google'
import { EmptyStatesShowcase } from '@/components/packages/empty-states/showcase'
import { resourcePage } from '../resource-page'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

const { metadata, Page } = resourcePage(
	'empty-states',
	EmptyStatesShowcase,
	geist.variable
)

export const instant = true
export { metadata }
export default Page
