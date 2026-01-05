'use client';

import { useState } from 'react';
import { ActivityContributionGraph } from './contribution-graph';
import { Section } from '../../ui/section';
import { Heading } from '../../ui/heading';
import { ActivityFeed } from './activity-feed';
import { ProjectHoverWrapper } from './hover-wrappers';
import Link from 'next/link';
import { Button } from '../../ui/button';
import { ChevronDown } from 'lucide-react';

export function ActivitySection() {
  const year = new Date().getFullYear();
  const [activityCount, setActivityCount] = useState(5);

  return (
    <Section noPadding contentPadding={true} className="mb-0">
      <Heading
        title="Activity & Contributions"
        noMargin
        bgDirection="diagonal"
        colorPattern="light"
        headerAction={
          <time dateTime={`${year}`} className="text-muted-foreground/60 inline-flex items-baseline">
            {year}
          </time>
        }
      />
      <div className="space-y-4 pt-3">
        <p className="px-4 md:px-5 text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight">
          Besides my professional work, I also build a lot of open source. Primarily I've been working on <Link href="https://skriuw.vercel.app" target="_blank">
            <ProjectHoverWrapper repository="remcostoeten/skriuw" isPrivate={false}>
              <span className="text-foreground/80 underline decoration-dotted underline-offset-4">Skriuw</span>
            </ProjectHoverWrapper>
          </Link>. A Notion-like desktop application which is almost in beta for you to try!
        </p>

        <div>
          <ActivityContributionGraph year={year} showLegend={true} />
        </div>

        <ActivityFeed activityCount={activityCount} rotationInterval={6000} />

        <div className="flex justify-center pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivityCount(prev => prev + 25)}
            className="text-muted-foreground hover:text-foreground text-xs gap-2"
          >
            Load more activity
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Section>
  );
}
