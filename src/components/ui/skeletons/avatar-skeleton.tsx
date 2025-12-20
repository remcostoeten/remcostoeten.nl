import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'

interface AvatarSkeletonProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
}

export function AvatarSkeleton({ size = 'md', className }: AvatarSkeletonProps) {
    return (
        <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />
    )
}
