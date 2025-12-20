'use client';

import { AnimatedNumber } from '../ui/animated-number';
import { ActivityContributionGraph } from './contribution-graph';
import { Section } from '../ui/section';
import { ActivityFeed } from './activity-feed';

import { ProjectHoverWrapper } from './hover-wrappers';

export function ActivitySection() {
  const year = new Date().getFullYear();

  return (
    <Section
      title="Activity &amp; Contributions"
      noHeaderMargin
      headerAction={
        <span className="text-muted-foreground/60 inline-flex items-baseline">
          <AnimatedNumber value={year} duration={800} />
        </span>
      }
    >
      <div className="space-y-4 pt-3">
        <p className="px-4 md:px-5 text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight">
          Building tools that solve my own problems. Usually spending my time on projects like{' '}
          <ProjectHoverWrapper repository="remcostoeten/skriuw" isPrivate={false}>
            <span className="text-foreground hover:text-brand-500 transition-colors cursor-pointer border-b border-brand-500/30">
              Skriuw
            </span>
          </ProjectHoverWrapper>
          , a privacy-first, local-first note manager, or{' '}
          <ProjectHoverWrapper repository="remcostoeten/dora" isPrivate={false}>
            <span className="text-foreground hover:text-brand-500 transition-colors cursor-pointer border-b border-brand-500/30">
              dora
            </span>
          </ProjectHoverWrapper>
          , a modern interface for Postgres and SQLite exploration. All while looping through a curated playlist.
        </p>
        <div className="px-4 md:px-5">
          <ActivityContributionGraph year={year} showLegend={false} />
        </div>
        <ActivityFeed activityCount={5} rotationInterval={6000} />
      </div>
    </Section>
  );
}
