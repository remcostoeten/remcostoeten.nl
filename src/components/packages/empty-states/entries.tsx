import type { ReactNode } from 'react'
import {
	BookOpen,
	FileText,
	Kanban,
	LayoutTemplate,
	Plug,
	Plus,
	Timer,
	Upload
} from 'lucide-react'
import {
	ActivityIllustration,
	BuildingIcon,
	CalendarIllustration,
	ChartIllustration,
	CommentsIllustration,
	FolderIcon,
	IconStack,
	InboxIllustration,
	KeyIllustration,
	keyIllustrationVariants,
	OfflineIllustration,
	ProjectIllustration,
	RecordIllustration,
	SearchIllustration,
	TrashIllustration,
	UploadIllustration,
	type KeyIllustrationVariant
} from '@/components/empty-state/illustrations'

export type DemoAction = {
	id: string
	call: string
	variant?: 'primary' | 'secondary'
	icon?: ReactNode
}

export type DemoGuide = {
	id: string
	label: string
	href: string
	icon: ReactNode
}

export type DemoValues = {
	title: string
	description: string
	primaryLabel: string
	secondaryLabel: string
	linkTopic: string
	variant: string
	showActions: boolean
	showGuides: boolean
	showLink: boolean
	animated: string
	pointer: string
	loop: string
}

export type DemoEntry = {
	id: string
	name: string
	summary: string
	imports: readonly string[]
	illustration: (variant: string) => ReactNode
	illustrationCode: (variant: string) => string
	variants?: readonly string[]
	size?: 'lg'
	loopKind: 'variant' | 'toggle'
	actions: readonly DemoAction[]
	guides?: { title: string; items: readonly DemoGuide[] }
	link?: { href: string }
	defaults: DemoValues
}

const iconClass = 'size-4'

const baseValues = {
	primaryLabel: '',
	secondaryLabel: '',
	linkTopic: '',
	variant: '',
	showActions: true,
	showGuides: false,
	showLink: false,
	animated: 'off',
	pointer: 'tilt',
	loop: 'on'
} satisfies Partial<DemoValues>

function simple(
	id: string,
	name: string,
	summary: string,
	illustrationName: string,
	illustration: ReactNode,
	action: DemoAction,
	copy: Pick<DemoValues, 'title' | 'description' | 'primaryLabel'>,
	overrides: Partial<DemoValues> = {}
): DemoEntry {
	return {
		id,
		name,
		summary,
		imports: [illustrationName],
		illustration: () => illustration,
		illustrationCode: () => `<${illustrationName} />`,
		loopKind: 'toggle',
		actions: [action],
		defaults: { ...baseValues, ...copy, ...overrides }
	}
}

function parseKeyVariant(value: string): KeyIllustrationVariant {
	return (
		keyIllustrationVariants.find(variant => variant === value) ?? 'keyhole'
	)
}

export const demoEntries: readonly DemoEntry[] = [
	simple(
		'activity',
		'Activity log',
		'Nothing happened yet',
		'ActivityIllustration',
		<ActivityIllustration />,
		{ id: 'refresh', call: 'refresh', variant: 'secondary' },
		{
			title: 'No activity yet',
			description: 'Events show up here as your team makes changes.',
			primaryLabel: 'Refresh'
		}
	),
	simple(
		'analytics',
		'Analytics',
		'No data to chart',
		'ChartIllustration',
		<ChartIllustration />,
		{ id: 'setup', call: 'openSetupGuide', variant: 'secondary' },
		{
			title: 'No data yet',
			description: 'Charts appear here once the first events arrive.',
			primaryLabel: 'View setup guide'
		}
	),
	{
		id: 'api-keys',
		name: 'API keys',
		summary: 'Nothing issued yet',
		imports: ['KeyIllustration'],
		illustration: variant => (
			<KeyIllustration variant={parseKeyVariant(variant)} />
		),
		illustrationCode: variant =>
			parseKeyVariant(variant) === 'keyhole'
				? '<KeyIllustration />'
				: `<KeyIllustration variant="${variant}" />`,
		variants: keyIllustrationVariants,
		loopKind: 'toggle',
		actions: [{ id: 'create', call: 'createKey' }],
		defaults: {
			...baseValues,
			title: 'No API keys yet',
			description: 'Create a key to authenticate requests to the API.',
			primaryLabel: 'Create key',
			variant: 'keyhole'
		}
	},
	simple(
		'calendar',
		'Calendar',
		'Nothing scheduled',
		'CalendarIllustration',
		<CalendarIllustration />,
		{ id: 'create', call: 'createEvent' },
		{
			title: 'Nothing scheduled',
			description: 'Events you create or accept appear on your calendar.',
			primaryLabel: 'New event'
		},
		{ animated: 'rise' }
	),
	simple(
		'comments',
		'Comments',
		'No discussion yet',
		'CommentsIllustration',
		<CommentsIllustration />,
		{ id: 'comment', call: 'writeComment' },
		{
			title: 'No comments yet',
			description: 'Start the conversation with the first comment.',
			primaryLabel: 'Write a comment'
		}
	),
	{
		id: 'file-sources',
		name: 'File sources',
		summary: 'Nothing linked yet',
		imports: ['IconStack', 'FolderIcon'],
		illustration: () => <IconStack icon={<FolderIcon />} />,
		illustrationCode: () => '<IconStack icon={<FolderIcon />} />',
		loopKind: 'variant',
		actions: [{ id: 'link', call: 'linkStorage' }],
		defaults: {
			...baseValues,
			title: 'No file sources are linked',
			description: 'Link a storage workspace to start receiving files.',
			primaryLabel: 'Link storage',
			showActions: false,
			loop: 'float'
		}
	},
	simple(
		'inbox',
		'Inbox',
		'All caught up',
		'InboxIllustration',
		<InboxIllustration />,
		{ id: 'settings', call: 'openSettings', variant: 'secondary' },
		{
			title: "You're all caught up",
			description: 'New notifications will land here.',
			primaryLabel: 'Notification settings'
		}
	),
	simple(
		'offline',
		'Offline',
		'Connection lost',
		'OfflineIllustration',
		<OfflineIllustration />,
		{ id: 'retry', call: 'retry', variant: 'secondary' },
		{
			title: "You're offline",
			description:
				"Check your connection. Changes sync when you're back online.",
			primaryLabel: 'Try again'
		}
	),
	{
		id: 'organizations',
		name: 'Organizations',
		summary: 'A feature to enable',
		imports: ['IconStack', 'BuildingIcon'],
		illustration: () => <IconStack icon={<BuildingIcon />} />,
		illustrationCode: () => '<IconStack icon={<BuildingIcon />} />',
		loopKind: 'variant',
		actions: [{ id: 'enable', call: 'enableOrganizations' }],
		link: { href: '/docs/organizations' },
		defaults: {
			...baseValues,
			title: 'Enable organizations',
			description:
				'Let users create organizations, manage members and control access with roles.',
			primaryLabel: 'Enable organizations',
			linkTopic: 'Organizations',
			showLink: true,
			loop: 'float'
		}
	},
	{
		id: 'projects',
		name: 'Projects',
		summary: 'A workspace to start',
		imports: ['ProjectIllustration'],
		illustration: () => <ProjectIllustration />,
		illustrationCode: () => '<ProjectIllustration />',
		size: 'lg',
		loopKind: 'variant',
		actions: [
			{
				id: 'new',
				call: 'createProject',
				icon: <Plus className={iconClass} />
			},
			{
				id: 'templates',
				call: 'openTemplates',
				variant: 'secondary',
				icon: <LayoutTemplate className={iconClass} />
			}
		],
		guides: {
			title: 'Quick starts',
			items: [
				{
					id: 'board',
					label: 'Task board',
					href: '/templates/task-board',
					icon: <Kanban className={iconClass} />
				},
				{
					id: 'sprint',
					label: 'Sprint tracker',
					href: '/templates/sprint-tracker',
					icon: <Timer className={iconClass} />
				}
			]
		},
		defaults: {
			...baseValues,
			title: 'No projects to show',
			description: 'Create a project or start from a template.',
			primaryLabel: 'New project',
			secondaryLabel: 'Explore templates',
			loop: 'float'
		}
	},
	{
		id: 'records',
		name: 'Records',
		summary: 'An empty collection',
		imports: ['RecordIllustration'],
		illustration: () => <RecordIllustration />,
		illustrationCode: () => '<RecordIllustration />',
		size: 'lg',
		loopKind: 'variant',
		actions: [
			{
				id: 'connect',
				call: 'connectSource',
				icon: <Plug className={iconClass} />
			},
			{
				id: 'upload',
				call: 'uploadCsv',
				variant: 'secondary',
				icon: <Upload className={iconClass} />
			}
		],
		guides: {
			title: 'Quick guides',
			items: [
				{
					id: 'records',
					label: 'Usage example',
					href: '/docs/usage',
					icon: <BookOpen className={iconClass} />
				},
				{
					id: 'csv',
					label: 'Component source',
					href: '/docs/component',
					icon: <FileText className={iconClass} />
				}
			]
		},
		defaults: {
			...baseValues,
			title: 'Your record space is empty',
			description:
				'Connect a source or upload a CSV to add your first records.',
			primaryLabel: 'Connect source',
			secondaryLabel: 'Upload CSV',
			loop: 'float'
		}
	},
	simple(
		'search',
		'Search results',
		'Nothing matched',
		'SearchIllustration',
		<SearchIllustration />,
		{ id: 'clear', call: 'clearFilters', variant: 'secondary' },
		{
			title: 'No results found',
			description: 'Try a different search term or clear the filters.',
			primaryLabel: 'Clear filters'
		}
	),
	simple(
		'trash',
		'Trash',
		'Nothing deleted',
		'TrashIllustration',
		<TrashIllustration />,
		{ id: 'back', call: 'goBack', variant: 'secondary' },
		{
			title: 'Trash is empty',
			description: 'Deleted items stay here for 30 days.',
			primaryLabel: 'Back to files'
		}
	),
	simple(
		'uploads',
		'Uploads',
		'A place to drop files',
		'UploadIllustration',
		<UploadIllustration />,
		{ id: 'browse', call: 'openFilePicker', variant: 'primary' },
		{
			title: 'No files uploaded',
			description: 'Drop files here or browse to upload.',
			primaryLabel: 'Browse files'
		}
	)
]
