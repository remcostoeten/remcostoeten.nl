import { Sparkles } from "lucide-react";
import { S } from "./serif";
import { CategorizedProjects } from "@/modules/projects/components/categorized-projects";
import { getProjects } from "@/modules/projects/api/get-projects";
import { TSimpleProject } from "@/modules/projects/types";

export async function ProjectsSection() {
  const { featuredProjects, simpleProjects } = await getProjects();

  const allProjects: TSimpleProject[] = [
    ...simpleProjects,
    ...featuredProjects.map(fp => ({
      name: fp.title,
      url: fp.url,
      category: fp.category,
      gitInfo: {
        stars: fp.stars,
        forks: fp.forks,
        lastCommit: fp.lastUpdated,
        language: fp.language,
        contributors: fp.contributors,
        description: fp.description
      },
      packageInfo: fp.packageInfo,
      originLabel: fp.originLabel
    }))
  ];

  return (
    <section
      aria-label="Featured Projects"
      itemScope
      itemType="https://schema.org/CollectionPage"
    >
      <header>
        <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span id="projects-heading" className="text-xs font-medium uppercase tracking-wider">
            Projects
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          I <S i>built</S> a lot. Over <S i>200</S>{" "}repos on my Github. Loads of learning, <S i>trial and error</S>, endless rewrites and reinventing the weel. All <S>fun</S> tho. Most recent projects where <S i>Drizzleasy</S> and <S i>Fync</S> have been built soley for this site.
        </p>
      </header>

      <div className="mt-3">
        <CategorizedProjects projects={allProjects} />
      </div>
    </section>
  );
}