export const focusable =
	'transition-colors focus-visible:bg-foreground/6 focus-visible:text-foreground focus-visible:outline-none'

export const caps =
	'font-mono font-medium uppercase tracking-[0.055em] text-muted-foreground'

export const iconButton = `inline-flex size-8 items-center justify-center rounded-md border border-border bg-background p-0 text-foreground [&_svg]:size-4 ${focusable}`

export const textButton = `inline-flex items-center gap-1.5 border-0 bg-transparent px-0 py-[7px] font-mono text-[10px] text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35 [&_svg]:size-[13px] ${focusable}`

export const ruleTop = 'border-0 border-t border-border/60'

export const ruleBottom = 'border-0 border-b border-border/60'

export const sectionClass = `scroll-mt-6 ${ruleBottom} px-4 py-7 md:px-5`
