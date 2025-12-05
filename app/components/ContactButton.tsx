'use client';

import React from 'react';

interface ContactButtonProps {
  children: React.ReactNode;
  className?: string;
}

export const ContactButton: React.FC<ContactButtonProps> = ({ children, className = '' }) => {
  const handleClick = () => {
    const email = 'remcostoeten@gmail.com';
    const subject = 'Hello from your portfolio!';
    const body = 'Hi Remco,\n\nI found your portfolio and wanted to reach out about...\n\nBest regards';
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <button
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
};
