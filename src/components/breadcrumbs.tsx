import Link from 'next/link'
import { baseUrl } from '@/lib/config'

type item = {
    name: string
    url: string
}

type props = {
    items: item[]
}

export function Breadcrumbs(props: props) {
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: props.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.url}`,
        })),
    }

    return (
        <>
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema),
                }}
            />
            <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {props.items.map((item, index) => (
                        <li key={item.url} className="flex items-center">
                            {index > 0 && (
                                <span className="mx-2 text-neutral-400 dark:text-neutral-600">
                                    /
                                </span>
                            )}
                            {index === props.items.length - 1 ? (
                                <span className="text-neutral-800 dark:text-neutral-200">
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    href={item.url}
                                    className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    )
}

