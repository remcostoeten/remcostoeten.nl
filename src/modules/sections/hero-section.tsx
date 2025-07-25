import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";

export function HeroSection() {
  return (
    <motion.h1 
      className="text-xl font-medium text-foreground"
      {...ANIMATION_CONFIGS.fadeInUp}
    >
      I craft digital experiences.
    </motion.h1>
  );
}
