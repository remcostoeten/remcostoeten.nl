import { useState } from "react";

export function useContactForm() {
  const [isContactHovered, setIsContactHovered] = useState(false);
  const [shouldOpenAbove, setShouldOpenAbove] = useState(false);

  function handleContactHover(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const formHeight = 400;
    
    setShouldOpenAbove(spaceBelow < formHeight);
    setIsContactHovered(true);
  }

  function handleContactLeave() {
    setIsContactHovered(false);
  }

  return {
    isContactHovered,
    shouldOpenAbove,
    handleContactHover,
    handleContactLeave
  };
};