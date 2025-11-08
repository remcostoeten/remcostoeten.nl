# Code Examples - Following Your Strict Standards

## ✅ Correct Examples

### Function Definitions
```typescript
// ✅ Regular function - ALWAYS use this syntax
async function getUserById(id: string) {
  return await db.query.users.findFirst({ where: eq(users.id, id) })
}

// ✅ Arrow const only for memoization/callbacks
const MemoizedComponent = React.memo(function UserProfileComponent(props: UserProfile) {
  return <div>{props.name}</div>
})

// ✅ Arrow const for callback
const handleSubmit = useCallback(async (data: FormData) => {
  await createNewUser(data)
}, [])
```

### Type Definitions
```typescript
// ✅ Type only - NEVER interface
type UserProfile = {
  name: string
  email: string
}

// ✅ Props types - max 2 words, self-explanatory
type ComponentProps = {
  title: string
  description: string
}

// ✅ Single props file - MUST be named 'props'
function BlogPostComponent(props: ComponentProps) {
  return <article>{props.title}</article>
}
```

### File Structure
```
src/
├── shared/
│   ├── components/ui/
│   │   ├── button.tsx
│   │   └── index.ts          # Barrel file for 'ui' alias
│   └── utilities/
│       ├── cn.ts
│       └── index.ts          # Barrel file for 'utilities' alias
├── modules/
│   └── blog/
│       ├── repositories/
│       │   └── blog-repository.ts    # kebab-case
│       └── models/
│           └── blog-post.ts          # kebab-case
```

### Import Patterns
```typescript
// ✅ Correct imports
import { Button } from 'ui'                    // Shadcn from barrel
import { cn } from 'utilities'                 // Utility from barrel
import { BlogPostComponent } from '@/components/blog-post'
import { getAllBlogPosts } from '@/modules/blog/repositories/blog-repository'
```

### Comments (Only When Absolutely Necessary)
```typescript
/**
 * @name User Authentication Check
 * @description Verifies user session and permissions
 */
async function checkUserAuth(session: Session): Promise<boolean> {
  // Complex logic that genuinely needs explanation
  return session.isValid && session.hasPermissions
}
```

## ❌ NEVER DO These Examples

### Function Definitions
```typescript
// ❌ NEVER arrow functions for regular operations
const getUserById = async (id: string) => { ... }

// ❌ NEVER classes
class UserService { ... }

// ❌ NEVER interfaces
interface UserProfile { ... }
```

### Props Naming
```typescript
// ❌ NEVER name props anything other than 'props' for single type
function UserProfileComponent(userProps: UserProfile) { ... }
function BlogPostComponent(postData: ComponentProps) { ... }
```

### File Naming
```typescript
// ❌ NEVER camelCase files
getUserData.ts
UserProfileComponent.tsx

// ❌ NEVER use lib/ helpers/ utilities/
lib/utils.ts
helpers/format.ts
```

### Comments
```typescript
// ❌ NEVER regular comments
// This function gets user data
async function getUserData() { ... }

/**
 * ❌ NEVER JSDoc format - only @name/@description allowed
 * Gets user data from database
 * @param {string} id - User ID
 * @returns {Promise<User>} User object
 */
async function getUserData(id: string) { ... }
```

## 🚫 Forbidden Files After Feature Completion

```bash
# ❌ NEVER create these after completing features
user-profile-documentation.mdx
api-endpoint-notes.md
feature-summary.txt
component-guide.md
```

If documentation feels needed, refactor the code to be self-explanatory instead.