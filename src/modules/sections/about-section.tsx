import { Motion } from "@motionone/solid";

export function AboutSection() {
  return (
    <Motion.p 
      class="text-foreground leading-relaxed text-base"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, easing: [0.4, 0.0, 0.2, 1] }}
    >
      With extensive experience in{" "}
      <span class="highlight">
        TypeScript and React & Next.js
      </span>
      {" "}I specialize in building scalable web applications, from Magento shops to modern SaaS platforms. Currently working on an{" "}
      <span class="highlight">
        LMS system for Dutch MBO students
      </span>
      .
    </Motion.p>
  );
}
