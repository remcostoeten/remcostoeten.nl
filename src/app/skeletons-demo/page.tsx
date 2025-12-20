'use client'

import { useState } from 'react'
import {
    CardSkeleton,
    PostSkeleton,
    TableSkeleton,
    ListSkeleton,
    AvatarSkeleton,
    ProfileSkeleton,
    ActivitySkeleton,
    GraphSkeleton,
    FormSkeleton,
    DashboardSkeleton,
} from '@/components/ui/skeletons'

export default function SkeletonsDemo() {
    const [activeDemo, setActiveDemo] = useState<string>('card')

    const demos = [
        { id: 'card', name: 'Card', component: <CardSkeleton /> },
        { id: 'post', name: 'Post', component: <PostSkeleton /> },
        { id: 'table', name: 'Table', component: <TableSkeleton rows={5} columns={4} /> },
        { id: 'list', name: 'List', component: <ListSkeleton items={5} /> },
        {
            id: 'avatar', name: 'Avatar', component: (
                <div className="flex gap-4 items-center">
                    <AvatarSkeleton size="sm" />
                    <AvatarSkeleton size="md" />
                    <AvatarSkeleton size="lg" />
                    <AvatarSkeleton size="xl" />
                </div>
            )
        },
        { id: 'profile', name: 'Profile', component: <ProfileSkeleton /> },
        { id: 'activity', name: 'Activity', component: <ActivitySkeleton /> },
        { id: 'graph', name: 'Graph', component: <GraphSkeleton /> },
        { id: 'form', name: 'Form', component: <FormSkeleton fields={4} /> },
        { id: 'dashboard', name: 'Dashboard', component: <DashboardSkeleton /> },
    ]

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold">Skeleton Loaders</h1>
                    <p className="text-muted-foreground">
                        11 reusable skeleton loader components for your application
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {demos.map((demo) => (
                        <button
                            key={demo.id}
                            onClick={() => setActiveDemo(demo.id)}
                            className={`px-4 py-2 rounded-md transition-colors ${activeDemo === demo.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            {demo.name}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-border/50 p-8 bg-card">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">
                            {demos.find((d) => d.id === activeDemo)?.name} Skeleton
                        </h2>
                        <div className="pt-4">
                            {demos.find((d) => d.id === activeDemo)?.component}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-border/50 p-6 bg-card space-y-4">
                    <h3 className="text-xl font-semibold">Usage</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`import { ${demos.find((d) => d.id === activeDemo)?.name}Skeleton } from '@/components/ui/skeletons'

export default function MyComponent() {
  const { data, isLoading } = useQuery(...)
  
  if (isLoading) {
    return <${demos.find((d) => d.id === activeDemo)?.name}Skeleton />
  }
  
  return <div>{/* Your content */}</div>
}`}</code>
                    </pre>
                </div>
            </div>
        </div>
    )
}
