import { Motion } from "@motionone/solid";
import { Text } from "~/components/ui/Text";

export function AboutSection() {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, easing: [0.4, 0.0, 0.2, 1] }}
    >
      <Text as="p" variant="body">
        With extensive experience in{" "}
        <Text as="span" variant="highlight">
          TypeScript and React & Next.js
        </Text>
        {" "}I specialize in building scalable web applications, from Magento shops to modern SaaS platforms. Currently working on an{" "}
        <Text as="span" variant="highlight">
          LMS system for Dutch MBO students
        </Text>
        .
      </Text>
    </Motion.div>
  );
}
