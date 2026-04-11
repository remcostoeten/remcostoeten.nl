import { Intro } from "@/components/home/hero";
import { Section } from "@/components/ui/section";
import nextDynamic from "next/dynamic";
import { HomeBlogPosts } from "@/components/blog/home-blog-posts";
import {
  TechStackSkeleton,
  WorkExperienceSkeleton,
} from "@/components/ui/skeletons/section-skeletons";
import { ProjectsView } from "../projects";

const TechStackCloud = nextDynamic(
  () =>
    import("@/components/landing/tech-stack-cloud").then((m) => ({
      default: m.TechStackCloud,
    })),
  { loading: () => <TechStackSkeleton /> },
);

const WorkExperienceSection = nextDynamic(
  () =>
    import("@/components/home/work-experience-section").then((m) => ({
      default: m.WorkExperienceSection,
    })),
  { loading: () => <WorkExperienceSkeleton /> },
);

const ActivitySectionClient = nextDynamic(
  () =>
    import("@/components/landing/activity/activity-section-client").then(
      (m) => ({
        default: m.ActivitySectionClient,
      }),
    ),
  { loading: () => <div className="h-48 animate-pulse bg-muted/20" /> },
);

export function HomeView() {
  return (
    <>
      <div className="space-y-6">
        <Intro />

        <div className="space-y-4">
          <Section
            animatedStripes
            title="Tech Stack"
            noHeaderMargin
            className="!mb-0 border-b-0"
          >
            <div className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight px-4 md:px-5">
                These are the tools I know best, but I'm not tied to them.
                I've also been exploring lower-level languages like Go and
                newer frameworks such as ElysiaJS.
              </p>
              <TechStackCloud />
            </div>
          </Section>

          <WorkExperienceSection />
          <ProjectsView />
          <ActivitySectionClient />

          <HomeBlogPosts />
        </div>
      </div>
    </>
  );
}
