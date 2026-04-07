'use client'

import {
	forwardRef,
	useState,
	useRef,
	useEffect,
	useId,
	KeyboardEvent
} from 'react'
import { cn } from '@/shared/lib/cn'

const DOMAINS = [
	'gmail.com',
	'hotmail.com',
	'outlook.com',
	'icloud.com',
	'yahoo.com',
	'protonmail.com',
	'live.nl',
	'hotmail.nl'
]

interface EmailAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
	onValueChange: (value: string) => void
	value: string
}

export const EmailAutocomplete = forwardRef<
	HTMLInputElement,
	EmailAutocompleteProps
>(function EmailAutocomplete(
	{ className, onValueChange, value, ...props },
	forwardedRef
) {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const [query, setQuery] = useState('')
	const listboxId = useId()

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		onValueChange(newValue)

		const atIndex = newValue.lastIndexOf('@')
		if (atIndex !== -1) {
			setQuery(newValue.slice(atIndex + 1))
			setIsOpen(true)
			setSelectedIndex(0)
		} else {
			setIsOpen(false)
		}
	}

	const filteredDomains = DOMAINS.filter(domain =>
		domain.startsWith(query.toLowerCase())
	)

	useEffect(() => {
		if (filteredDomains.length === 0 || !value.includes('@')) {
			setIsOpen(false)
		}
	}, [filteredDomains.length, value])

	useEffect(() => {
		if (selectedIndex >= filteredDomains.length) {
			setSelectedIndex(0)
		}
	}, [filteredDomains.length, selectedIndex])

	const handleSelect = (domain: string, focusInput = true) => {
		const atIndex = value.lastIndexOf('@')
		if (atIndex !== -1) {
			const newValue = value.slice(0, atIndex + 1) + domain
			onValueChange(newValue)
			setIsOpen(false)
			if (focusInput) {
				inputRef.current?.focus()
			}
		}
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen || filteredDomains.length === 0) return

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setSelectedIndex(prev => (prev + 1) % filteredDomains.length)
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setSelectedIndex(
				prev =>
					(prev - 1 + filteredDomains.length) % filteredDomains.length
			)
		} else if (e.key === 'Enter') {
			e.preventDefault()
			handleSelect(filteredDomains[selectedIndex])
		} else if (e.key === 'Tab') {
			if (isOpen) {
				handleSelect(filteredDomains[selectedIndex], false)
				setIsOpen(false)
			}
		} else if (e.key === 'Escape') {
			e.preventDefault()
			setIsOpen(false)
		}
	}

	return (
		<div className="relative w-full">
			<input
				ref={node => {
					inputRef.current = node
					if (typeof forwardedRef === 'function') {
						forwardedRef(node)
					} else if (forwardedRef) {
						;(
							forwardedRef as React.MutableRefObject<HTMLInputElement | null>
						).current = node
					}
				}}
				type="email"
				role="combobox"
				aria-autocomplete="list"
				aria-haspopup="listbox"
				aria-expanded={isOpen && filteredDomains.length > 0}
				aria-controls={
					isOpen && filteredDomains.length > 0 ? listboxId : undefined
				}
				aria-activedescendant={
					isOpen && filteredDomains.length > 0
						? `${listboxId}-option-${selectedIndex}`
						: undefined
				}
				className={cn(
					'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				value={value}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				autoComplete={props.autoComplete ?? 'email'}
				{...props}
			/>
			{isOpen && filteredDomains.length > 0 && (
				<div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md overflow-hidden animate-in fade-in-0 zoom-in-95 bg-white dark:bg-zinc-950">
					<ul
						id={listboxId}
						role="listbox"
						aria-label="Suggested email domains"
						className="max-h-[200px] overflow-auto py-1"
					>
						{filteredDomains.map((domain, index) => (
							<li
								key={domain}
								id={`${listboxId}-option-${index}`}
								role="option"
								aria-selected={index === selectedIndex}
								className={cn(
									'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm',
									index === selectedIndex
										? 'bg-accent/10 text-accent-foreground bg-zinc-100 dark:bg-zinc-800'
										: 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
								)}
								onClick={() => handleSelect(domain)}
								onMouseEnter={() => setSelectedIndex(index)}
							>
								<span className="text-muted-foreground mr-1">
									@
								</span>
								{domain}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
})

EmailAutocomplete.displayName = 'EmailAutocomplete'
