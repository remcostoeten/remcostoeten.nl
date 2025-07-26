import { Motion } from "@motionone/solid";

export function ContactSection() {
  return (
    <Motion.p 
      class="text-foreground leading-relaxed text-base"
      data-section="contact"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, easing: [0.4, 0.0, 0.2, 1] }}
    >
      Feel free to explore my work and{" "}
      <a 
        href="mailto:remco@remcostoeten.nl" 
        class="theme-link with-arrow"
      >
        contact me
      </a>
      or check out my{" "}
      <a 
        href="https://remcostoeten.nl" 
        target="_blank" 
        rel="noopener noreferrer"
        class="theme-link with-arrow"
      >
        website
      </a>
      if you'd like to collaborate on interesting projects or discuss technology and development practices.
    </Motion.p>
  );
}
