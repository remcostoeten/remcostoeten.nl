import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { SOCIAL_LINKS } from "@/modules/contact";

export function ProjectsSection() {
  return (
    <motion.p 
      className="text-foreground leading-relaxed text-base"
      data-section="projects"
      {...ANIMATION_CONFIGS.staggered(0.2)}
    >
      Recently I've been building{" "}
      <a 
        href="https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication" 
        target="_blank"
        rel="noopener noreferrer"
        className="theme-link with-arrow"
      >
        Roll Your Own Authentication
      </a>
      and{" "}
      <a 
        href="https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials" 
        target="_blank"
        rel="noopener noreferrer"
        className="theme-link with-arrow"
      >
        Turso DB Creator CLI
      </a>
      and various{" "}
      <span className="highlight">
        CLI tools & automation scripts
      </span>
      . More projects and experiments can be found on{" "}
      <a 
        href={SOCIAL_LINKS.github} 
        target="_blank" 
        rel="noopener noreferrer"
        className="theme-link with-arrow"
      >
        GitHub
      </a>
      .
    </motion.p>
  );
}
