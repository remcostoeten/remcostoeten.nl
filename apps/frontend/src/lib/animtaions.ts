"use client"

export const CLEAN_ANIMATIONS = {
  // Subtle fade in with minimal movement
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" },
  },

  // Gentle slide up
  slideUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },

  // Minimal stagger for lists
  stagger: (delay = 0.1) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 0.3,
      staggerChildren: delay,
      ease: "easeOut",
    },
  }),

  // Clean hover effect
  hover: {
    whileHover: { x: 2 },
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

// Sequential animation hook for cleaner component usage
export const useSequentialAnimation = (type: keyof typeof CLEAN_ANIMATIONS) => {
  return CLEAN_ANIMATIONS[type]
}
