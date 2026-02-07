import { visit } from 'unist-util-visit'

export function rehypeExtractCodeMeta() {
	return (tree: any) => {
		visit(tree, 'element', (node: any) => {
			// Check pre > code structure
			if (
				node.tagName === 'pre' &&
				node.children &&
				node.children.length > 0
			) {
				const codeNode = node.children[0]
				if (codeNode && codeNode.tagName === 'code') {
					// Standard remark-rehype behavior puts meta in data.meta
					if (codeNode.data && codeNode.data.meta) {
						codeNode.properties.metastring = codeNode.data.meta
					}
					// Fallback: check if it's already in properties (some parsers)
					else if (codeNode.properties && codeNode.properties.title) {
						// Convert direct title property to metastring style if needed, or just let it pass
						// But mdx.tsx expects metastring parser
						codeNode.properties.metastring = `title="${codeNode.properties.title}"`
					}
				}
			}
		})
	}
}
