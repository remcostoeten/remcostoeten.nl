import { getLatestCommit } from '@/server/github'
import { Footer } from './footer'

export async function FooterWithCommit() {
	const latestCommit = await getLatestCommit(
		'remcostoeten',
		'remcostoeten.nl'
	)

	return <Footer latestCommit={latestCommit} />
}
