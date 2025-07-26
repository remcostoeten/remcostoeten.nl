import { Motion } from "@motionone/solid";

export function HeroSection() {
  return (
    <Motion.h1 
      class="text-xl font-medium text-foreground"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, easing: [0.4, 0.0, 0.2, 1] }}
    >
      I craft digital experiences.
    </Motion.h1>
  );
}
