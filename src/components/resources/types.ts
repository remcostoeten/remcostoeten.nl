export type ResourceEntry = {
	id: string
	name: string
	summary: string
}

export type InstallMode = 'copy' | 'registry'

export type ResourceConfig = {
	title: string
	description: string
	stack: string
	navLabel: string
	itemNoun: string
	countLabel: string
	version: string
	registryItem: string
	installDir: string
	files: readonly string[]
	defaultId: string
}
