import { Metadata } from 'next'
import { PlaygroundContent } from './content'

export const metadata: Metadata = {
    title: 'Playground',
    description: 'Code snippets, UI experiments, and package builds',
}

export default function PlaygroundPage() {
    return <PlaygroundContent />
}
