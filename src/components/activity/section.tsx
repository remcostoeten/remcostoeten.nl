'use client';

import { Calendar } from 'lucide-react';
import { AnimatedNumber } from '../ui/animated-number';
import { ActivityContributionGraph } from './contribution-graph';
import { Section } from '../ui/section';
import { ActivityFeed } from './activity-feed';

export function ActivitySection() {
  const year = new Date().getFullYear();

  return (
    <Section
      title="Activity & Contributions"
      headerAction={
        <span className="text-muted-foreground/60 inline-flex items-baseline">
          <span className="-translate-y-px">
            <AnimatedNumber value={year} duration={800} />
          </span>
        </span>
      }
    >
      <div className="space-y-4">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Contribution Graph</span>
          </div>
          <ActivityContributionGraph year={year} showLegend={true} />
        </div>

        <ActivityFeed activityCount={5} rotationInterval={6000} />
      </div>
    </Section>
  );
}
