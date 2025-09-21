'use client';

import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { S } from "./serif";

export const HeroSection = () => {
  return (
    <motion.h1 
      className="text-heading font-medium text-foreground"
      {...ANIMATION_CONFIGS.fadeInUp}
    >
      I, <S i>build</S> a lot<S i >.</S>
    </motion.h1>
  );
};
