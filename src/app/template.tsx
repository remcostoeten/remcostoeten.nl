import { ViewTransitionWrapper } from '@/modules/view-transitions/view-transition-wrapper'

export default function Template({ children }: { children: React.ReactNode }) {
    return <ViewTransitionWrapper>{children}</ViewTransitionWrapper>
}

