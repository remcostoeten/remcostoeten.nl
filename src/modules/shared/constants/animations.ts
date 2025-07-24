export const ANIMATION_CONFIGS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] as [number, number, number, number] }
  },
  staggered: (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.4, 0.0, 0.2, 1] as [number, number, number, number] }
  })
};