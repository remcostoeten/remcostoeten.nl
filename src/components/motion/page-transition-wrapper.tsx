"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

type TProps = {
  children: ReactNode;
  mode?: "wait" | "sync" | "popLayout";
  initial?: boolean;
};

export function PageTransitionWrapper({ children, mode = "wait", initial = false }: TProps) {
  return (
    <AnimatePresence mode={mode} initial={initial}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
