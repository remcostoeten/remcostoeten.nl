import { Motion } from "@motionone/solid";

export function ProjectsSection() {
  return (
    <Motion.p 
      class="text-foreground leading-relaxed text-base"
      data-section="projects"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, easing: [0.4, 0.0, 0.2, 1] }}
    >
      Recently I've been building{" "}
      <a 
        href="https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication" 
        target="_blank"
        rel="noopener noreferrer"
        class="theme-link with-arrow"
      >
        Roll Your Own Authentication
      </a>
      and{" "}
      <a 
        href="https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials" 
        target="_blank"
        rel="noopener noreferrer"
        class="theme-link with-arrow"
      >
        Turso DB Creator CLI
      </a>
      and various{" "}
      <span class="highlight">
        CLI tools & automation scripts
      </span>
      . More projects and experiments can be found on{" "}
      <a 
        href="https://github.com/remcostoeten" 
        target="_blank" 
        rel="noopener noreferrer"
        class="theme-link with-arrow"
      >
        GitHub
      </a>
      .
    </Motion.p>
  );
}
