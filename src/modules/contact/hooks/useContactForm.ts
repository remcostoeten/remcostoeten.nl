import { useState } from "react";

export const useContactForm = () => {
  const [isContactHovered, setIsContactHovered] = useState(false);
  const [shouldOpenAbove, setShouldOpenAbove] = useState(false);

  const handleContactHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const formHeight = 400; // Approximate form height
    
    setShouldOpenAbove(spaceBelow < formHeight);
    setIsContactHovered(true);
  };

  const handleContactLeave = () => {
    setIsContactHovered(false);
  };

  return {
    isContactHovered,
    shouldOpenAbove,
    handleContactHover,
    handleContactLeave
  };
};