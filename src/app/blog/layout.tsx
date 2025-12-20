import { ReactNode } from 'react'

export default function BlogLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative">
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}
