import { BlogPosts } from '@/components/blog/posts';
import { Intro } from '@/components/home/hero';
import { ActivitySection } from '@/components/activity/section';
import { SearchBar } from '@/components/search/search-bar';
import { homeMetadata } from '@/core/metadata'
import dynamic from 'next/dynamic'

// Lazy load non-critical components
const WorkExperienceDemo = dynamic(() => import('@/components/home/work-experience'), {
  loading: () => null // Don't show loading state - appears instantly usually
})

const VigiloManager = dynamic(() => import('@/components/vigilo-manager'), {
  ssr: false
})

export const dynamic = 'force-dynamic'

export { homeMetadata as metadata }

export default function Page() {
  return (
    <>
      <div className="space-y-6">
        <Intro />

        {/* Search Section */}
        <div className="px-4 md:px-0">
          <SearchBar placeholder="Search for posts, topics, or categories..." />
        </div>

        <div className="space-y-4">
          <div>
            <ActivitySection />
            <WorkExperienceDemo />
          </div>
          <BlogPosts />
        </div>
      </div>
      <VigiloManager />
    </>
  )
}
