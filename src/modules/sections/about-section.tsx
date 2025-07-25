import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";

export function AboutSection() {
  return (
    <motion.p 
      className="text-foreground leading-relaxed text-base"
      {...ANIMATION_CONFIGS.staggered(0.1)}
    >
      With extensive experience in{" "}
      <span 
        className="font-medium px-1 py-0.5 rounded"
        style={{ backgroundColor: 'hsl(var(--highlight-frontend) / 0.2)', color: 'hsl(var(--highlight-frontend))' }}
      >
        TypeScript and React & Next.js
      </span>{" "}
      I specialize in building scalable web applications, from Magento shops to modern SaaS platforms. Currently working on an{" "}
      <span 
        className="font-medium px-1 py-0.5 rounded"
        style={{ backgroundColor: 'hsl(var(--highlight-product) / 0.2)', color: 'hsl(var(--highlight-product))' }}
      >
        LMS system for Dutch MBO students
      </span>
      .
    </motion.p>
  );
}
