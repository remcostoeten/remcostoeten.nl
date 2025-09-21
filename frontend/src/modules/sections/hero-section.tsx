'use client';

import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";

export const HeroSection = () => {
  return (
    <motion.h1 
      className="text-heading font-medium text-foreground"
      {...ANIMATION_CONFIGS.fadeInUp}
    >
      I <i className="font-serif">build</i> digital things.
    </motion.h1>
  );
};