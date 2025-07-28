import { Motion } from "@motionone/solid";
import { Text } from "~/components/ui/Text";

export function HeroSection() {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, easing: [0.4, 0.0, 0.2, 1] }}
    >
      <Text as="h1" variant="hero">
        I craft digital experiences.
      </Text>
    </Motion.div>
  );
}
