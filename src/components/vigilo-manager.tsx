'use client'

import Vigilo from '@remcostoeten/vigilo'
import { todoCategories } from '@/todos'

export function VigiloManager({ category = "code-audit" }: { category?: string }) {
    return <Vigilo category={category as any} categories={todoCategories} enabled={true} />
}
