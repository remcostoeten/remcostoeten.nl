import { ReactNode } from 'react'
import { TopicsSidebar } from '@/components/topics-sidebar'

export default function BlogLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative">
            <div className="w-full">
                {children}
            </div>
            <TopicsSidebar />
        </div>
    )
}
