import { Text } from "~/components/primitives/text";

export function AboutSection() {
  return (
    <div>
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
    </div>
  );
}
