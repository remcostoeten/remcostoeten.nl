import { ClientMotion } from "~/components/ui/client-motion";
import { Text } from "~/components/primitives/text";
import { ArrowLink } from "~/components/ui/ArrowLink";

export function ContactSection() {
  return (
    <ClientMotion
      as="div"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, easing: [0.4, 0.0, 0.2, 1] }}
    >
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
    </ClientMotion>
  );
}
