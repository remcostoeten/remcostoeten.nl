export type BlogPostMetadata = {
    title: string
    publishedAt: string
    summary: string
    image?: string
    keywords?: string
}

export type BlogPost = {
    metadata: BlogPostMetadata
    slug: string
    content: string
}
