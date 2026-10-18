'use client'

import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark'

SyntaxHighlighter.registerLanguage('tsx', tsx)

export function LazyCode({ code }: { code: string }) {
	return (
		<SyntaxHighlighter
			language="tsx"
			style={oneDark}
			customStyle={{
				margin: 0,
				minHeight: '100%',
				borderRadius: 0,
				background: '#111',
				fontSize: 11,
				lineHeight: 1.55
			}}
			wrapLongLines={false}
		>
			{code}
		</SyntaxHighlighter>
	)
}
