import type { CategoryConfig } from '@remcostoeten/vigilo'

export const todoCategories: CategoryConfig[] = [
    {
        id: "code-audit",
        displayName: "Code Audit Tasks",
        items: [
            {
                text: "Check font(family/size)",
            },
            {
                text: "On load sequence animations",
            },
            {
                text: "rm usage of arrow constants",
            },
            {
                text: "rm useless comments",
            },
            {
                text: "rm non-descriptive fnc/const/type names",
            },
            {
                text: "Use types and call local Props",
            },
            {
                text: "Make pages have only metadata and import a view",
            },
            {
                text: "make server form",
            }
        ],
    },
    {
        id: "blog-tasks",
        displayName: "Blog Improvements",
        items: [
            {
                text: "Refactor Table of Contents",
                action: "refactor",
                tags: ["blog", "ui"]
            },
            {
                text: "Dynamic OG Image generation",
                action: "feat",
                tags: ["seo"]
            }
        ]
    }
]
