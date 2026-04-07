'use client'

import { Copy, Check } from 'lucide-react'
import { getLanguageIcon } from './language-icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import React from 'react'
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter'
import type { CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/shared/lib/cn'

type TCustomTheme = { [key: string]: CSSProperties }

const customTheme: TCustomTheme = {
	'code[class*="language-"]': {
		color: 'hsl(var(--sh-text))',
		background: 'none',
		fontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		textAlign: 'left',
		whiteSpace: 'pre-wrap',
		wordSpacing: 'normal',
		wordBreak: 'normal',
		overflowWrap: 'anywhere',
		lineHeight: '1.6',
		fontSize: '14px',
		tabSize: 2,
		hyphens: 'none'
	},
	'pre[class*="language-"]': {
		color: 'hsl(var(--sh-text))',
		background: 'none',
		fontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		textAlign: 'left',
		whiteSpace: 'pre-wrap',
		wordSpacing: 'normal',
		wordBreak: 'normal',
		overflowWrap: 'anywhere',
		lineHeight: '1.6',
		fontSize: '14px',
		tabSize: 2,
		hyphens: 'none',
		padding: '1.25rem',
		margin: '0'
	},
	comment: { color: 'hsl(var(--sh-comment))', fontStyle: 'italic' },
	'block-comment': { color: 'hsl(var(--sh-comment))', fontStyle: 'italic' },
	prolog: { color: 'hsl(var(--sh-comment))' },
	doctype: { color: 'hsl(var(--sh-comment))' },
	cdata: { color: 'hsl(var(--sh-comment))' },
	punctuation: { color: 'hsl(var(--sh-punctuation))' },
	operator: { color: 'hsl(var(--sh-operator))' },
	url: { color: 'hsl(var(--sh-string))' },
	tag: { color: 'hsl(var(--sh-tag))' },
	'attr-name': { color: 'hsl(var(--sh-function))' },
	namespace: { color: 'hsl(var(--sh-keyword))' },
	property: { color: 'hsl(var(--sh-function))' },
	symbol: { color: 'hsl(var(--sh-function))' },
	important: { color: 'hsl(var(--sh-keyword))', fontWeight: 'bold' },
	atrule: { color: 'hsl(var(--sh-keyword))' },
	keyword: { color: 'hsl(var(--sh-keyword))' },
	regex: { color: 'hsl(var(--sh-string))' },
	entity: { color: 'hsl(var(--sh-keyword))', cursor: 'help' },
	'function-name': { color: 'hsl(var(--sh-function))' },
	function: { color: 'hsl(var(--sh-function))' },
	'class-name': { color: 'hsl(var(--sh-function))' },
	builtin: { color: 'hsl(var(--sh-keyword))' },
	boolean: { color: 'hsl(var(--sh-number))' },
	number: { color: 'hsl(var(--sh-number))' },
	constant: { color: 'hsl(var(--sh-number))' },
	string: { color: 'hsl(var(--sh-string))' },
	char: { color: 'hsl(var(--sh-string))' },
	'attr-value': { color: 'hsl(var(--sh-string))' },
	selector: { color: 'hsl(var(--sh-keyword))' },
	deleted: { color: 'hsl(var(--destructive))' },
	inserted: { color: 'hsl(var(--sh-string))' },
	variable: { color: 'hsl(var(--sh-function))' },
	bold: { fontWeight: 'bold' },
	italic: { fontStyle: 'italic' }
}

export type TCodeBlockProps = {
	code: string
	language: string
	fileName?: string
	showLineNumbers?: boolean
	startingLineNumber?: number
	highlightLines?: number[]
	contextBefore?: string
	contextAfter?: string
	dimmedContext?: boolean
	maxHeight?: string
	className?: string
	onCopy?: (code: string) => void
	showIcon?: boolean
	disableCopy?: boolean
	disableTopBar?: boolean
	variant?: 'default' | 'sharp'
}

const DEFAULT_ICON_SIZE = 16

function normalizeCodeSegment(value?: string) {
	if (!value) return ''
	return String(value).replace(/^\n+|\n+$/g, '')
}

function countLines(value: string) {
	if (!value) return 0
	return value.split('\n').length
}

function SimpleIcon({
	language,
	className = '',
	size = DEFAULT_ICON_SIZE
}: {
	language: string
	className?: string
	size?: number
}) {
	const IconComponent = getLanguageIcon(language)

	return (
		<IconComponent size={size} className={cn('flex-shrink-0', className)} />
	)
}

export function CodeBlock({
	code,
	language,
	fileName,
	showLineNumbers = true,
	startingLineNumber = 1,
	highlightLines = [],
	contextBefore,
	contextAfter,
	dimmedContext = true,
	maxHeight,
	className,
	onCopy,
	showIcon = true,
	disableCopy = false,
	disableTopBar = false,
	variant: _variant = 'default'
}: TCodeBlockProps) {
	const [isCopied, setIsCopied] = useState(false)
	const [isMounted, setIsMounted] = useState(false)
	const codeRef = useRef<HTMLDivElement>(null)
	const beforeCode = normalizeCodeSegment(contextBefore)
	const mainCode = normalizeCodeSegment(code)
	const afterCode = normalizeCodeSegment(contextAfter)
	const beforeLineCount = countLines(beforeCode)
	const mainLineCount = countLines(mainCode)
	const afterLineCount = countLines(afterCode)
	const displayCode = [beforeCode, mainCode, afterCode]
		.filter(Boolean)
		.join('\n')
	const displayLines = displayCode.split('\n')
	const hasContext =
		dimmedContext && (beforeLineCount > 0 || afterLineCount > 0)
	const shiftedHighlightLines = highlightLines.map(
		line => line + beforeLineCount
	)

	const copyToClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(displayCode)
			setIsCopied(true)
			onCopy?.(displayCode)
			setTimeout(() => setIsCopied(false), 2000)
		} catch (error) {
			console.error('Failed to copy:', error)
		}
	}, [displayCode, onCopy])

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const roundedClass = 'rounded-none'

	return (
		<div className={cn('relative my-5 group/code', className)}>
			<div
				className={cn(
					'relative overflow-hidden bg-[hsl(var(--sh-background))]/90 backdrop-blur shadow-xl transition-all duration-300 ring-1 ring-[hsl(var(--sh-border))] group-hover/code:ring-[hsl(var(--sh-border))]/80 group-hover/code:shadow-2xl',
					roundedClass
				)}
			>
				{!disableTopBar && (
					<header className="flex justify-between items-center px-4 py-3 bg-[hsl(var(--sh-background))]/80 backdrop-blur-md border-b border-[hsl(var(--sh-border))] z-10 relative">
						<div className="flex items-center gap-3 min-w-0">
							{showIcon && (
								<span className="text-muted-foreground/60">
									<SimpleIcon language={language} size={14} />
								</span>
							)}
							{fileName && (
								<span className="text-xs text-[hsl(var(--sh-text))] opacity-70 font-mono tracking-tight">
									{fileName}
								</span>
							)}
						</div>

						{!disableCopy && (
							<button
								onClick={copyToClipboard}
								className="text-muted-foreground/60 hover:text-[hsl(var(--sh-text))] transition-all duration-200 p-1.5 rounded-md hover:bg-[hsl(var(--sh-text))]/5"
								title="Copy code"
							>
								<AnimatePresence mode="wait" initial={false}>
									{isCopied ? (
										<motion.span
											key="check"
											initial={{ scale: 0, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											exit={{ scale: 0, opacity: 0 }}
											transition={{ duration: 0.2 }}
										>
											<Check
												size={14}
												className="text-emerald-500"
											/>
										</motion.span>
									) : (
										<motion.span
											key="copy"
											initial={{ scale: 0, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											exit={{ scale: 0, opacity: 0 }}
											transition={{ duration: 0.2 }}
										>
											<Copy size={14} />
										</motion.span>
									)}
								</AnimatePresence>
							</button>
						)}
					</header>
				)}

				<div
					className="relative overflow-x-auto max-w-full"
					style={{ maxHeight: maxHeight || 'none' }}
					ref={codeRef}
				>
					<div className="relative py-4">
						{isMounted ? (
							React.createElement(SyntaxHighlighter as any, {
								language: language.toLowerCase(),
								style: customTheme,
								customStyle: {
									margin: 0,
									padding: 0,
									background: 'transparent',
									fontSize: '0.8125rem',
									lineHeight: '1.7'
								},
								showLineNumbers: showLineNumbers,
								startingLineNumber,
								lineNumberStyle: {
									position: 'absolute',
									left: 0,
									width: '3rem',
									paddingRight: '0.75rem',
									color: 'hsl(var(--sh-comment))',
									textAlign: 'right',
									userSelect: 'none',
									fontSize: '0.75rem',
									opacity: 0.5
								},
								wrapLines: true,
								wrapLongLines: true,
								lineProps: lineNumber => {
									const isContextLine =
										hasContext &&
										(lineNumber <= beforeLineCount ||
											lineNumber >
												beforeLineCount + mainLineCount)

									return {
										style: {
											display: 'block',
											paddingLeft: '3.5rem',
											position: 'relative',
											backgroundColor:
												shiftedHighlightLines.includes(
													lineNumber
												)
													? 'rgba(163, 230, 53, 0.05)'
													: 'transparent',
											borderLeft:
												shiftedHighlightLines.includes(
													lineNumber
												)
													? '2px solid #a3e635'
													: '2px solid transparent',
											paddingRight: '1rem'
										},
										className: isContextLine
											? 'opacity-40 transition-opacity duration-200 group-hover/code:opacity-100'
											: undefined
									}
								},
								children: displayCode
							})
						) : (
							<pre className="m-0 overflow-x-auto bg-transparent text-[0.8125rem] leading-[1.7] text-[hsl(var(--sh-text))]">
								<code className="block font-mono">
									{displayLines.map((line, index) => {
										const lineNumber =
											startingLineNumber + index
										const visualLineNumber = index + 1
										const isContextLine =
											hasContext &&
											(visualLineNumber <=
												beforeLineCount ||
												visualLineNumber >
													beforeLineCount +
														mainLineCount)
										const isHighlighted =
											shiftedHighlightLines.includes(
												visualLineNumber
											)

										return (
											<span
												key={`${lineNumber}-${line}`}
												className={cn(
													'block pr-4',
													isContextLine &&
														'opacity-40 transition-opacity duration-200 group-hover/code:opacity-100'
												)}
												style={{
													paddingLeft: '3.5rem',
													position: 'relative',
													backgroundColor:
														isHighlighted
															? 'rgba(163, 230, 53, 0.05)'
															: 'transparent',
													borderLeft: isHighlighted
														? '2px solid #a3e635'
														: '2px solid transparent'
												}}
											>
												{showLineNumbers && (
													<span
														aria-hidden="true"
														className="absolute left-0 w-12 pr-3 text-right text-xs select-none opacity-50 text-[hsl(var(--sh-comment))]"
													>
														{lineNumber}
													</span>
												)}
												<span className="whitespace-pre-wrap break-words">
													{line || ' '}
												</span>
											</span>
										)
									})}
								</code>
							</pre>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default CodeBlock
