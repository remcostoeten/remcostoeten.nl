import { ClientMotion } from "~/components/ui/client-motion";
import { Text } from "~/components/primitives/text";

export function HeroSection() {
  return (
    <ClientMotion
      as="div"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, easing: [0.4, 0.0, 0.2, 1] }}
    >
      <Text as="h1" variant="hero">
        I craft digital experiences.
      </Text>
    </ClientMotion>
  );
}
