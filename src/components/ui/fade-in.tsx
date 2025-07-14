import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

type TProps = {
  children: ReactNode;
};

export function FadeIn({ children }: TProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
