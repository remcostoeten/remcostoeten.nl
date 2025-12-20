import { getAllBlogPosts, getBlogPosts } from '@/utils/utils'
import { isAdmin } from '@/utils/is-admin'
import { SearchBar } from './search-bar'

type SearchResult = {
  slug: string
  title: string
  summary?: string
  categories?: string[]
  tags?: string[]
}

type SearchBarServerProps = {
  placeholder?: string
  className?: string
}

export async function SearchBarServer({ placeholder, className }: SearchBarServerProps) {
  const userIsAdmin = await isAdmin()

  const allPosts = userIsAdmin ? getAllBlogPosts() : getBlogPosts()

  const posts: SearchResult[] = allPosts.map((post) => ({
    slug: post.slug,
    title: post.metadata.title,
    summary: post.metadata.summary,
    categories: post.metadata.categories,
    tags: post.metadata.tags,
  }))

  return <SearchBar placeholder={placeholder} className={className} posts={posts} />
}
