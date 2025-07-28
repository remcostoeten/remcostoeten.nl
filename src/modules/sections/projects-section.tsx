import { Motion } from "@motionone/solid";
import { Text } from "~/components/ui/Text";
import { ArrowLink } from "~/components/ui/ArrowLink";

export function ProjectsSection() {
  return (
    <Motion.div
      data-section="projects"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, easing: [0.4, 0.0, 0.2, 1] }}
    >
      <Text as="p" variant="body">
        Recently I've been building{" "}
        <ArrowLink href="https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication">
          Roll Your Own Authentication
        </ArrowLink>
        and{" "}
        <ArrowLink href="https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials">
          Turso DB Creator CLI
        </ArrowLink>
        and various{" "}
        <Text as="span" variant="highlight">
          CLI tools & automation scripts
        </Text>
        . More projects and experiments can be found on{" "}
        <ArrowLink href="https://github.com/remcostoeten">
          GitHub
        </ArrowLink>
        .
      </Text>
    </Motion.div>
  );
}
