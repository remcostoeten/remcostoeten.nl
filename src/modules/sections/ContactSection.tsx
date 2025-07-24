import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { SOCIAL_LINKS } from "@/modules/contact";

export const ContactSection = () => {
  return (
    <motion.p 
      className="text-foreground leading-relaxed text-base"
      {...ANIMATION_CONFIGS.staggered(0.3)}
    >
      Find me on{" "}
      <a 
        href={SOCIAL_LINKS.x} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium"
      >
        X ↗
      </a>{" "}
      and{" "}
      <a 
        href={SOCIAL_LINKS.github} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium"
      >
        GitHub ↗
      </a>{" "}
      or contact me using{" "}
      <a 
        href="mailto:" 
        className="text-accent hover:underline font-medium"
      >
        E-Mail ↗
      </a>{" "}
      or{" "}
      <a 
        href={SOCIAL_LINKS.telegram} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium"
      >
        Telegram ↗
      </a>
      .
    </motion.p>
  );
};