import { BlogPosts } from '@/components/blog/posts';
import { Intro } from '@/components/home/hero';
import { ActivitySection } from '@/components/activity/section';
import { GithubContributionGraph } from '@/components/home/contribution-graph-wrapper';
import WorkExperienceDemo from '@/components/home/work-experience';
import { homeMetadata } from '@/services/metadata'

export { homeMetadata as metadata }

export default function Page() {
  return (
    <div className="space-y-6">
      <Intro />

      <div className="space-y-4">
        <GithubContributionGraph />
        <ActivitySection />
        <WorkExperienceDemo />
        <div className="screen-border" />
        <BlogPosts />
      </div>
    </div>
  )
}
