import { Text } from "~/components/primitives/text";
import { ArrowLink } from "~/components/ui/arrow-link";

export function ProjectsSection() {
  return (
    <div>
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
    </div>
  );
}
