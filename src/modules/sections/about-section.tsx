import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { Text } from '@/components/ui/text';

export function AboutSection() {
  return (
    <motion.p 
      className="text-foreground leading-relaxed text-base"
      {...ANIMATION_CONFIGS.staggered(0.1)}
    >
      With extensive experience in{" "}
      <Text highlight>
        TypeScript and React & Next.js
      </Text>
      {" "}I specialize in building scalable web applications, from Magento shops to modern SaaS platforms. Currently working on an{" "}
      <Text highlight>
        LMS system for Dutch MBO students
      </Text>
      .
    </motion.p>
  );
}
