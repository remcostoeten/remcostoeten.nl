import { highlight } from 'sugar-high'
import React from 'react'

/**
 * @name Code
 * @description Code block component with syntax highlighting using sugar-high library. Renders highlighted code HTML directly into a code element.
 */
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
    children: string
}

export function Code({ children, ...props }: CodeProps) {
    let codeHTML = highlight(children)
    return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

