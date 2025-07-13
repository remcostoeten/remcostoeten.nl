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
import React from 'react'
import { Page } from '@/types/cms'
import { Badge } from '@/components/ui/badge'

interface PagesListProps {
	pages: Page[]
	onEdit: (page: Page) => void
	onCreate: () => void
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

export default function PagesList({
	pages,
	onEdit,
	onCreate,
	onDelete
}: PagesListProps) {
	const totalPages = pages.length

	if (totalPages === 0) {
		return (
			<div className='p-8'>
				<div className='flex justify-between items-center mb-8'>
					<div>
						<h2 className='text-2xl font-semibold text-foreground'>
							Pages
						</h2>
						<p className='text-muted-foreground mt-1'>
							Manage your website pages
						</p>
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
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='text-center py-20 bg-card/30 rounded-xl border border-border'
				>
					<div className='w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6'>
						<FileText className='w-8 h-8 text-muted-foreground' />
					</div>
					<h3 className='text-lg font-medium text-foreground mb-2'>
						No pages yet
					</h3>
					<p className='text-muted-foreground mb-8 max-w-sm mx-auto'>
						Get started by creating your first page. You can add
						content, customize layouts, and manage everything from
						here.
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
		)
	}

	return (
		<div className='p-8 max-w-7xl mx-auto'>
			<div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8'>
				<div>
					<h2 className='text-2xl font-semibold text-foreground'>
						Pages
					</h2>
					<div className='flex items-center gap-3 mt-2'>
						<p className='text-muted-foreground'>
							{totalPages} {totalPages === 1 ? 'page' : 'pages'}
						</p>
						<span className='w-1 h-1 bg-border rounded-full'></span>
						<div className='flex items-center gap-2 text-xs text-muted-foreground'>
							<div className='flex items-center gap-1'>
								<kbd className='px-1.5 py-0.5 bg-secondary border border-border rounded text-xs font-mono text-muted-foreground'>
									<Command className='w-3 h-3' />
								</kbd>
								<span>+</span>
								<kbd className='px-1.5 py-0.5 bg-secondary border border-border rounded text-xs font-mono text-muted-foreground'>
									S
								</kbd>
								<span className='text-muted-foreground/60'>
									save
								</span>
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
								<span className='text-muted-foreground/60'>
									undo
								</span>
							</div>
						</div>
					</div>
				</div>
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={onCreate}
					className='flex items-center px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-all duration-200 border border-border'
				>
					<Plus className='w-4 h-4 mr-2' />
					Create Page
				</motion.button>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='bg-popover text-popover-foreground rounded-xl border border-border overflow-hidden backdrop-blur-lg shadow-2xl'
			>
				<div className='divide-y divide-border'>
					<AnimatePresence initial={false}>
						{pages.map((page, index) => (
							<motion.div
								key={page.id}
								className='group hover:bg-secondary/30 transition-all duration-200'
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, x: -20, scale: 0.95 }}
								layout
								transition={{
									duration: 0.3,
									ease: 'easeOut',
									delay: index * 0.03
								}}
							>
								<div className='p-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6'>
									{/* Page Info */}
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
													{page.slug === 'home' && (
														<Badge
															variant='home'
															className='text-xs'
														>
															<Home className='w-3 h-3' />
														</Badge>
													)}
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
														<span>
															{formatTimeAgo(
																page.updatedAt
															)}
														</span>
													</div>
													<div className='flex items-center gap-1.5'>
														<Calendar className='w-3 h-3' />
														<span>
															{page.updatedAt.toLocaleDateString()}
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Actions */}
									<div className='flex items-center gap-2 lg:flex-shrink-0'>
										<motion.button
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={() => onEdit(page)}
											className='flex items-center px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-all duration-200 text-sm font-medium border border-border'
										>
											<Edit className='w-4 h-4 mr-2' />
											Edit
										</motion.button>
										{page.slug !== 'home' && (
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												onClick={() =>
													onDelete(page.id)
												}
												className='p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 border border-transparent hover:border-destructive/20'
												title='Delete page'
											>
												<Trash2 className='w-4 h-4' />
											</motion.button>
										)}
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</motion.div>
		</div>
	)
}

// import { AnimatePresence, motion } from "framer-motion";
// import { Clock, Edit, Plus, Trash2, Home } from "lucide-react";
// import React from "react";
// import { Page } from "@/types/cms";
// import { Badge } from "@/components/ui/badge";
//
// interface PagesListProps {
// 	pages: Page[];
// 	onEdit: (page: Page) => void;
// 	onCreate: () => void;
// 	onDelete: (pageId: string) => void;
// }
//
// function formatTimeAgo(date: Date): string {
// 	const now = new Date();
// 	const diffInMinutes = Math.floor(
// 		(now.getTime() - date.getTime()) / (1000 * 60),
// 	);
//
// 	if (diffInMinutes < 1) return "Just now";
// 	if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//
// 	const diffInHours = Math.floor(diffInMinutes / 60);
// 	if (diffInHours < 24) return `${diffInHours}h ago`;
//
// 	const diffInDays = Math.floor(diffInHours / 24);
// 	if (diffInDays < 7) return `${diffInDays}d ago`;
//
// 	return date.toLocaleDateString();
// }
//
// export default function PagesList({
// 	pages,
// 	onEdit,
// 	onCreate,
// 	onDelete,
// }: PagesListProps) {
// 	const totalPages = pages.length;
//
// 	return (
// 		<div className="p-6">
// 			<div className="flex justify-between items-center mb-6">
// 				<div>
// 					<h2 className="text-2xl font-bold text-foreground">Pages</h2>
// 					<p className="text-sm text-muted-foreground mt-1">
// 						{totalPages} {totalPages === 1 ? "page" : "pages"}
// 					</p>
// 				</div>
// 				<div className="flex items-center gap-4">
// 					<div className="text-xs text-muted-foreground">
// 						<kbd>CapsLock</kbd> + <kbd>S</kbd> to save, <kbd>CapsLock</kbd> +{" "}
// 						<kbd>Z</kbd> to revert
// 					</div>
// 					<button
// 						onClick={onCreate}
// 						className="flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
// 					>
// 						<Plus className="w-4 h-4 mr-2" />
// 						Create Page
// 					</button>
// 				</div>
// 			</div>
//
// 			<div className="bg-card rounded-lg shadow-sm border border-border">
// 				<div className="overflow-x-auto">
// 					<table className="w-full">
// 						<thead className="bg-muted border-b border-border">
// 							<tr>
// 								<th className="text-left py-3 px-6 font-medium text-foreground">
// 									Title
// 								</th>
// 								<th className="text-left py-3 px-6 font-medium text-foreground">
// 									Slug
// 								</th>
// 								<th className="text-left py-3 px-6 font-medium text-foreground">
// 									Updated
// 								</th>
// 								<th className="text-right py-3 px-6 font-medium text-foreground">
// 									Actions
// 								</th>
// 							</tr>
// 						</thead>
// 						<tbody>
// 							<AnimatePresence initial={false}>
// 								{pages.map((page) => (
// 									<motion.tr
// 										key={page.id}
// 										className="border-b border-border hover:bg-muted/50"
// 										initial={{ opacity: 0, y: -10 }}
// 										animate={{ opacity: 1, y: 0 }}
// 										exit={{ opacity: 0, x: -20 }}
// 										layout
// 										transition={{ duration: 0.2, ease: "easeOut" }}
// 									>
// 										<td className="py-4 px-6">
// 											<div>
// 												<div className="font-medium text-foreground">
// 													{page.title}
// 												</div>
// 												<div className="text-sm text-muted-foreground">
// 													{page.description}
// 												</div>
// 											</div>
// 										</td>
// 										<td className="py-4 px-6">
// 											<div className="flex items-center gap-2">
// 												<code className="px-2 py-1 bg-muted rounded text-sm">
// 													/{page.slug}
// 												</code>
// 												{page.slug === "home" && (
// 													<Badge
// 														variant="secondary"
// 														className="text-xs bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 border-blue-200/50 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-200 shadow-sm"
// 													>
// 														<Home className="w-3 h-3 mr-1" />
// 														Home Page
// 													</Badge>
// 												)}
// 											</div>
// 										</td>
// 										<td className="py-4 px-6">
// 											<div className="text-sm text-muted-foreground">
// 												<div>{formatTimeAgo(page.updatedAt)}</div>
// 												<div
// 													className="text-xs"
// 													title={page.updatedAt.toLocaleString()}
// 												>
// 													{page.updatedAt.toLocaleDateString()}
// 												</div>
// 											</div>
// 										</td>
// 										<td className="py-4 px-6">
// 											<div className="flex items-center justify-end space-x-2">
// 												<button
// 													onClick={() => onEdit(page)}
// 													className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
// 												>
// 													Edit
// 												</button>
// 												{page.slug !== "home" && (
// 													<button
// 														onClick={() => onDelete(page.id)}
// 														className="p-2 text-muted-foreground hover:text-destructive transition-colors"
// 														title="Delete page"
// 													>
// 														<Trash2 className="w-4 h-4" />
// 													</button>
// 												)}
// 											</div>
// 										</td>
// 									</motion.tr>
// 								))}
// 							</AnimatePresence>
// 						</tbody>
// 					</table>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }
