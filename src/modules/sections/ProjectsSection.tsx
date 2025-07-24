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
      Recently I've been building{" "}
      <a 
        href="https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication" 
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium"
      >
        Roll Your Own Authentication ↗
      </a>{" "}
      and{" "}
      <a 
        href="https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials" 
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium"
      >
        Turso DB Creator CLI ↗
      </a>{" "}
      and various{" "}
      <span 
        className="font-medium px-1 py-0.5 rounded"
        style={{ backgroundColor: 'hsl(var(--highlight-frontend) / 0.2)', color: 'hsl(var(--highlight-frontend))' }}
      >
        CLI tools & automation scripts
      </span>
      . More projects and experiments can be found on{" "}
      <a 
        href={SOCIAL_LINKS.github} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium"
      >
        GitHub ↗
      </a>
      .
    </motion.p>
  );
}
