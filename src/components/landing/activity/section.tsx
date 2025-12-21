'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedNumber } from '../../ui/animated-number';
import { ActivityContributionGraph } from './contribution-graph';
import { Section } from '../../ui/section';
import { ActivityFeed } from './activity-feed';
import { ProjectHoverWrapper } from './hover-wrappers';
import Link from 'next/link';

const VERBS = [
  { text: 'shipping', color: 'text-green-500' },
  { text: 'breaking', color: 'text-red-500' },
  { text: 'fixing', color: 'text-amber-500' },
  { text: 'building', color: 'text-blue-500' },
  { text: 'tweaking', color: 'text-purple-500' },
  { text: 'over-engineering', color: 'text-pink-500' },
];

const ACTIVITIES = [
  'solving problems nobody asked me to',
  'building tools for myself',
  'pretending this is productive',
  'avoiding real responsibilities',
  'calling this "research"',
];

export function ActivitySection() {
  const year = new Date().getFullYear();
  const [verbIndex, setVerbIndex] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    const verbInterval = setInterval(() => {
      setVerbIndex((prev) => (prev + 1) % VERBS.length);
    }, 3000);

    const activityInterval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % ACTIVITIES.length);
    }, 5000);

    return () => {
      clearInterval(verbInterval);
      clearInterval(activityInterval);
    };
  }, []);

  // Memoize to prevent unnecessary re-renders
  const currentVerb = useMemo(() => VERBS[verbIndex], [verbIndex]);
  const currentActivity = useMemo(() => ACTIVITIES[activityIndex], [activityIndex]);

  return (
    <Section
      title="Activity &amp; Contributions"
      noHeaderMargin
      headerAction={
        <span className="text-muted-foreground/60 inline-flex items-baseline">
          <AnimatedNumber value={year} duration={600} />
        </span>
      }
    >
      <div className="space-y-4 pt-3">
        <p className="px-4 md:px-5 text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight">
          Besides my proffesional work, I also build a lot of open source, Primairly been working on <Link href="https://skriuw.vercel.app" target="_blank">
            <ProjectHoverWrapper repository="remcostoeten/skriuw" isPrivate={false}>
              <span className="text-foreground/80 underline decoration-dotted underline-offset-4">Skriuw</span>
            </ProjectHoverWrapper>
          </Link>. A Notion-like desktop application which is almost in beta for you to try!
        </p>

        <div className="px-4 md:px-5">
          <ActivityContributionGraph year={year} showLegend={false} />
        </div>

        <ActivityFeed activityCount={5} rotationInterval={6000} />
      </div>
    </Section >
  );
}
