import { AnimatePresence, motion } from 'framer-motion'
import {
	Clock,
	Edit,
	Plus,
	Trash2,
	Home,
	Calendar,
	FileText,
	Command
} from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Page } from '@/types/cms'

type TProps = {
	pages: Page[]
	onEdit: (page: Page) => void
	onCreate: () => void
	onCreateHomepage?: () => void
	onDelete: (pageId: string) => void
}

function formatTimeAgo(date: Date): string {
	const now = new Date()
	const diffInMinutes = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60)
	)

	if (diffInMinutes < 1) return 'Just now'
	if (diffInMinutes < 60) return `${diffInMinutes}m ago`

	const diffInHours = Math.floor(diffInMinutes / 60)
	if (diffInHours < 24) return `${diffInHours}h ago`

	const diffInDays = Math.floor(diffInHours / 24)
	if (diffInDays < 7) return `${diffInDays}d ago`

	return date.toLocaleDateString()
}

const listItemVariants = {
	hidden: { opacity: 0, y: -10 },
	visible: { opacity: 1, y: 0 },
	exit: { opacity: 0, x: -20, scale: 0.95 }
}

const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 }
}

// Memoized empty state component
function EmptyState({ onCreate }: { onCreate: () => void }) {
	return (
	<div className='p-8'>
		<div className='flex justify-between items-center mb-8'>
			<div>
				<h2 className='text-2xl font-semibold text-foreground'>Pages</h2>
				<p className='text-muted-foreground mt-1'>Manage your website pages</p>
			</div>
			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={onCreate}
				className='flex items-center px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-all duration-200 border border-border'
			>
				<Plus className='w-4 h-4 mr-2' />
				Create Your First Page
			</motion.button>
		</div>

		<motion.div
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='text-center py-20 bg-card/30 rounded-xl border border-border'
		>
			<div className='w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6'>
				<FileText className='w-8 h-8 text-muted-foreground' />
			</div>
			<h3 className='text-lg font-medium text-foreground mb-2'>No pages yet</h3>
			<p className='text-muted-foreground mb-8 max-w-sm mx-auto'>
				Get started by creating your first page. You can add content, customize layouts, and manage everything from here.
			</p>
			<motion.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={onCreate}
				className='inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium border border-border'
			>
				<Plus className='w-4 h-4 mr-2' />
				Create Page
			</motion.button>
		</motion.div>
	</div>
)}


function PageItem({
	page,
	index,
	onEdit,
	onDelete
}: {
	page: Page
	index: number
	onEdit: (page: Page) => void
	onDelete: (pageId: string) => void
}) {
	const handleEdit = useCallback(() => onEdit(page), [onEdit, page])
	const handleDelete = useCallback(() => onDelete(page.id), [onDelete, page.id])

	const timeAgo = useMemo(() => formatTimeAgo(page.updatedAt), [page.updatedAt])
	const formattedDate = useMemo(() => page.updatedAt.toLocaleDateString(), [page.updatedAt])

	return (
		<motion.div
			className='group hover:bg-secondary/30 transition-all duration-200'
			variants={listItemVariants}
			initial='hidden'
			animate='visible'
			exit='exit'
			layout
			transition={{
				duration: 0.3,
				ease: 'easeOut',
				delay: index * 0.03
			}}
		>
			<div className='p-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6'>
				<div className='flex-1 min-w-0'>
					<div className='flex items-start gap-4'>
						<div className='flex-shrink-0 w-10 h-10 bg-secondary rounded-lg flex items-center justify-center border border-border'>
							<FileText className='w-5 h-5 text-muted-foreground' />
						</div>
						<div className='flex-1 min-w-0'>
							<div className='flex items-center gap-3 mb-2'>
								<h3 className='font-medium text-foreground truncate'>
									{page.title}
								</h3>
							</div>
							{page.description && (
								<p className='text-sm text-muted-foreground mb-3 line-clamp-2'>
									{page.description}
								</p>
							)}
							<div className='flex flex-wrap items-center gap-4 text-xs text-muted-foreground'>
								<div className='flex items-center gap-1.5'>
									<span className='font-mono bg-secondary px-2 py-1 rounded border border-border text-muted-foreground'>
										/{page.slug}
									</span>
								</div>
								<div className='flex items-center gap-1.5'>
									<Clock className='w-3 h-3' />
									<span>{timeAgo}</span>
								</div>
								<div className='flex items-center gap-1.5'>
									<Calendar className='w-3 h-3' />
									<span>{formattedDate}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='flex items-center gap-2 lg:flex-shrink-0'>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleEdit}
						className='flex items-center px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-all duration-200 text-sm font-medium border border-border'
					>
						<Edit className='w-4 h-4 mr-2' />
						Edit
					</motion.button>
					{page.slug !== 'home' && (
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							onClick={handleDelete}
							className='p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 border border-transparent hover:border-destructive/20'
							title='Delete page'
						>
							<Trash2 className='w-4 h-4' />
						</motion.button>
					)}
				</div>
			</div>
		</motion.div>
	)
}

const MemoizedPageItem = memo(PageItem)

// Memoized keyboard shortcuts component
function KeyboardShortcuts() {
	return (
	<div className='flex items-center gap-2 text-xs text-muted-foreground'>
		<div className='flex items-center gap-1'>
			<kbd className='px-1.5 py-0.5 bg-secondary border border-border rounded text-xs font-mono text-muted-foreground'>
				<Command className='w-3 h-3' />
			</kbd>
			<span>+</span>
			<kbd className='px-1.5 py-0.5 bg-secondary border border-border rounded text-xs font-mono text-muted-foreground'>
				S
			</kbd>
			<span className='text-muted-foreground/60'>save</span>
		</div>
		<span className='text-border'>•</span>
		<div className='flex items-center gap-1'>
			<kbd className='px-1.5 py-0.5 bg-secondary border border-border rounded text-xs font-mono text-muted-foreground'>
				<Command className='w-3 h-3' />
			</kbd>
			<span>+</span>
			<kbd className='px-1.5 py-0.5 bg-secondary border border-border rounded text-xs font-mono text-muted-foreground'>
				Z
			</kbd>
			<span className='text-muted-foreground/60'>undo</span>
		</div>
	</div>
)}

KeyboardShortcuts.displayName = 'KeyboardShortcuts'

function PagesList({
	pages,
	onEdit,
	onCreate,
	onCreateHomepage,
	onDelete
}: TProps) {
	const totalPages = pages.length

	// Memoize computed values
	const hasHomepage = useMemo(() =>
		pages.some(p => p.slug === 'home'),
		[pages]
	)

	const pageCountText = useMemo(() =>
		`${totalPages} ${totalPages === 1 ? 'page' : 'pages'}`,
		[totalPages]
	)

	if (totalPages === 0) {
		return <EmptyState onCreate={onCreate} />
	}

	return (
		<div className='p-8 max-w-7xl mx-auto'>
			<div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8'>
				<div>
					<h2 className='text-2xl font-semibold text-foreground'>Pages</h2>
					<div className='flex items-center gap-3 mt-2'>
						<p className='text-muted-foreground'>{pageCountText}</p>
						<span className='w-1 h-1 bg-border rounded-full' />
						<KeyboardShortcuts />
					</div>
				</div>
				<div className='flex items-center gap-2'>
					{onCreateHomepage && !hasHomepage && (
						<motion.button
							onClick={onCreateHomepage}
							className='flex items-center px-4 py-2.5 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-all duration-200 border border-border'
						>
							<Home className='w-4 h-4 mr-2' />
							Create Homepage
						</motion.button>
					)}
					<motion.button
						onClick={onCreate}
						className='flex items-center px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-all duration-200 border border-border'
					>
						<Plus className='w-4 h-4 mr-2' />
						Create Page
					</motion.button>
				</div>
			</div>

			<motion.div
				variants={containerVariants}
				initial='hidden'
				animate='visible'
				className='bg-popover text-popover-foreground rounded-xl border border-border overflow-hidden backdrop-blur-lg shadow-2xl'
			>
				<div className='divide-y divide-border'>
					<AnimatePresence mode='popLayout'>
						{pages.map((page, index) => (
							<MemoizedPageItem
								key={page.id}
								page={page}
								index={index}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
					</AnimatePresence>
				</div>
			</motion.div>
		</div>
	)
}

const MemoizedPagesList = memo(PagesList)
MemoizedPagesList.displayName = 'PagesList'

export { MemoizedPagesList as PagesList }
