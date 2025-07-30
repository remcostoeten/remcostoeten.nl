import { Text } from "~/components/primitives/text";
import { ArrowLink } from "~/components/ui/arrow-link";

export function ContactSection() {
  return (
    <div>
      <Text as="p" variant="body">
        Feel free to explore my work and{" "}
        <ArrowLink href="mailto:remco@remcostoeten.nl" external={false}>
          contact me
        </ArrowLink>
        or check out my{" "}
        <ArrowLink href="https://remcostoeten.nl">
          website
        </ArrowLink>
        if you'd like to collaborate on interesting projects or discuss technology and development practices.
      </Text>
    </div>
  );
}

