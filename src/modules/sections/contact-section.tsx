import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { SOCIAL_LINKS } from "@/modules/contact";

export function ContactSection() {
  return (
    <motion.p 
      className="text-foreground leading-relaxed text-base"
      data-section="contact"
      {...ANIMATION_CONFIGS.staggered(0.3)}
    >
      Feel free to explore my work and{" "}
      <a 
        href="mailto:remco@remcostoeten.nl" 
        className="theme-link with-arrow"
      >
        contact me
      </a>
      or check out my{" "}
      <a 
        href="https://remcostoeten.nl" 
        target="_blank" 
        rel="noopener noreferrer"
        className="theme-link with-arrow"
      >
        website
      </a>
      if you'd like to collaborate on interesting projects or discuss technology and development practices.
    </motion.p>
  );
}
