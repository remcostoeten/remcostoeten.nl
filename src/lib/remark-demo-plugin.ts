import { visit } from 'unist-util-visit'

const DEMO_REGEX = /\[\[demo:\s*([^,\]]+)(?:,\s*(.+?))?\]\]/g

export function remarkDemoPlugin() {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index: number, parent: any) => {
      if (!node.value || typeof node.value !== 'string') return

      const matches: { index: number; length: number; id: string; attrs: string }[] = []
      let match

      while ((match = DEMO_REGEX.exec(node.value)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          id: match[1].trim(),
          attrs: match[2] || '',
        })
      }

      if (matches.length === 0) return

      const children: any[] = []
      let lastIndex = 0

      matches.forEach((m) => {
        if (m.index > lastIndex) {
          children.push({
            type: 'text',
            value: node.value.substring(lastIndex, m.index),
          })
        }

        const props: any = { id: m.id }

        if (m.attrs) {
          const titleMatch = m.attrs.match(/title=["']([^"']+)["']/)
          const triggerMatch = m.attrs.match(/trigger=["']([^"']+)["']/)
          if (titleMatch) props.title = titleMatch[1]
          if (triggerMatch) props.trigger = triggerMatch[1]
        }

        children.push({
          type: 'mdxJsxTextElement',
          name: 'DemoPopover',
          attributes: Object.entries(props).map(([name, value]) => ({
            type: 'mdxJsxAttribute',
            name,
            value: value as string,
          })),
          children: [
            {
              type: 'text',
              value: props.title || props.id,
            },
          ],
        })

        lastIndex = m.index + m.length
      })

      if (lastIndex < node.value.length) {
        children.push({
          type: 'text',
          value: node.value.substring(lastIndex),
        })
      }

      parent.children.splice(index, 1, ...children)
    })
  }
}
