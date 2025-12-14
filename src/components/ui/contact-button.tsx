'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
}

export function ContactButton({ children, className }: Props) {
  const handleClick = function () {
    const email = process.env.NEXT_PUBLIC_EMAIL
    const subject = 'Remcostoeten.nl - Footer contact submission';
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
