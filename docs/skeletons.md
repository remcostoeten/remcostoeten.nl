# Skeleton Loaders

A collection of 11 reusable skeleton loader components for your Next.js application.

## Components

### 1. **Skeleton** (Base Component)
The foundation component with pulse animation.

```tsx
import { Skeleton } from '@/components/ui/skeletons'

<Skeleton className="h-4 w-full" />
```

### 2. **CardSkeleton**
Card layout with title and content lines.

```tsx
import { CardSkeleton } from '@/components/ui/skeletons'

<CardSkeleton />
```

### 3. **PostSkeleton**
Blog post layout with avatar, title, and content preview.

```tsx
import { PostSkeleton } from '@/components/ui/skeletons'

<PostSkeleton />
```

### 4. **TableSkeleton**
Table layout with configurable rows and columns.

```tsx
import { TableSkeleton } from '@/components/ui/skeletons'

<TableSkeleton rows={5} columns={4} />
```

### 5. **ListSkeleton**
List layout with icon and two-line items.

```tsx
import { ListSkeleton } from '@/components/ui/skeletons'

<ListSkeleton items={5} />
```

### 6. **AvatarSkeleton**
Avatar with configurable sizes (sm, md, lg, xl).

```tsx
import { AvatarSkeleton } from '@/components/ui/skeletons'

<AvatarSkeleton size="md" />
```

### 7. **ProfileSkeleton**
Profile layout with avatar, stats, and bio sections.

```tsx
import { ProfileSkeleton } from '@/components/ui/skeletons'

<ProfileSkeleton />
```

### 8. **ActivitySkeleton**
Activity timeline with connected events.

```tsx
import { ActivitySkeleton } from '@/components/ui/skeletons'

<ActivitySkeleton />
```

### 9. **GraphSkeleton**
GitHub-style contribution graph.

```tsx
import { GraphSkeleton } from '@/components/ui/skeletons'

<GraphSkeleton />
```

### 10. **FormSkeleton**
Form layout with configurable input fields and buttons.

```tsx
import { FormSkeleton } from '@/components/ui/skeletons'

<FormSkeleton fields={4} />
```

### 11. **DashboardSkeleton**
Full dashboard layout with header, stats, and content sections.

```tsx
import { DashboardSkeleton } from '@/components/ui/skeletons'

<DashboardSkeleton />
```

## Usage Example

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { PostSkeleton } from '@/components/ui/skeletons'

export default function BlogPosts() {
  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    )
  }

  return (
    <div>
      {data?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

## Customization

All skeleton components accept a `className` prop for custom styling:

```tsx
<CardSkeleton className="bg-blue-100" />
```

## Demo

Visit `/skeletons-demo` to see all skeleton loaders in action.
