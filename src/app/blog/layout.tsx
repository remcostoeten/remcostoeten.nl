import { ReactNode } from 'react'
import { TopicsSidebar } from 'src/components/topics-sidebar'

export default function BlogLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex gap-12">
            <div className="flex-1 min-w-0">
                {children}
            </div>
            <TopicsSidebar />
        </div>
    )
}
