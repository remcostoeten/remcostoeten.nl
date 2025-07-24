import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { SOCIAL_LINKS } from "@/modules/contact";
import { SIMPLE_PROJECTS } from "@/modules/projects";

export function ProjectsSection() {
  return (
    <motion.p 
      className="text-foreground leading-relaxed text-base"
      {...ANIMATION_CONFIGS.staggered(0.2)}
    >
      Lately I have been building{" "}
      {SIMPLE_PROJECTS.map((project, index) => (
        <span key={project.name}>
          <a 
            href={project.url} 
            className="text-accent hover:underline font-medium"
          >
            {project.name} ↗
          </a>
          {index < SIMPLE_PROJECTS.length - 1 && (
            index === SIMPLE_PROJECTS.length - 2 ? " and " : ", "
          )}
        </span>
      ))}
      . Additional projects are on{" "}
      <a 
        href={SOCIAL_LINKS.behance} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium"
      >
        Behance ↗
      </a>
      .
    </motion.p>
  );
}
