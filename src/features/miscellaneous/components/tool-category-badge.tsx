import { Badge } from '@/components/ui/badge'
import { TOOL_CATEGORY_LABELS } from '../constants/tools'
import type { TToolCategory } from '../types'

type Props = {
	category: TToolCategory
}

export function ToolCategoryBadge({ category }: Props) {
	return (
		<Badge variant="secondary" className="rounded-sm font-normal">
			{TOOL_CATEGORY_LABELS[category]}
		</Badge>
	)
}
