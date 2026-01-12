export type DemoMedia = {
  type: 'gif' | 'video'
  src: string
  width?: number
  height?: number
}

export type Demo = {
  id: string
  title: string
  media: DemoMedia
  description?: string
}

export const DEMOS: Record<string, Demo> = {
  'example-project': {
    id: 'example-project',
    title: 'Example Project Demo',
    media: {
      type: 'video',
      src: '/demos/example-project.mp4',
      width: 800,
      height: 450,
    },
    description: 'Interactive demo showcase',
  },
}

export function getDemo(id: string): Demo | null {
  return DEMOS[id] || null
}
