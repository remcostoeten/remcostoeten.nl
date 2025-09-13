"use client";

import React, { memo, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ProfileSectionProps, SocialLink } from './types';

const defaultSocialLinks: SocialLink[] = [
  { label: 'Medium', href: 'https://medium.com/' },
  { label: 'Substack', href: 'https://substack.com/' },
  { label: 'Twitter', href: 'https://twitter.com/' },
];

const ProfileSection = memo(function ProfileSection({
  welcomeIcon = 'https://framerusercontent.com/images/0NWA2Q1DyXpeppofffRfzD6hkgQ.png',
  name = 'Frank',
  title = 'product designer',
  company = 'Random Solutions',
  description = 'Here, I share my thoughts on design, engineering, AI, and the random sparks of inspiration that keep me going.',
  portfolioLink = {
    text: 'intuitive user experiences',
    href: 'https://www.framer.com/@akim-perminov/'
  },
  socialLinks = defaultSocialLinks,
  logoImage = 'https://framerusercontent.com/images/I7EkrYNs1exXfH3WBMmoHA7GHEM.png?scale-down-to=1024',
  className = ''
}: ProfileSectionProps) {
  const memoizedSocialLinks = useMemo(() => socialLinks, [socialLinks]);
  return (
    <section className={`flex flex-col gap-12 max-w-[680px] w-full py-16 relative z-10 transition-all duration-500 ${className}`}>
      <div className="flex flex-col gap-5 w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-white">Welcome</h2>
          <div className="relative w-[26px] h-[27px] flex-shrink-0 filter brightnes=0 invert">
          🎉
          </div>
        </div>
        
        <p className="text-base text-[#aba9a7] leading-[1.7]">
          Hi, I'm {name}, a {title} by day and a curious writer by night. 
          I work at {company}, crafting{' '}
          <Link
            href={portfolioLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-transparent hover:decoration-current transition-all duration-300 cursor-pointer"
          >
            {portfolioLink.text}
          </Link>
          . {description}
        </p>
      </div>

      {/* Links Section */}
      <div className="flex flex-col gap-5 w-full">
        <h2 className="text-2xl font-semibold text-white">Links</h2>
        <div className="flex flex-col gap-2">
          {memoizedSocialLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group transition-colors duration-200 text-base text-[#aba9a7] leading-[1.7] no-underline"
            >
              <span>{link.label}</span>
              <ArrowUpRight 
                className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 text-[#aba9a7]"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div className="w-[127px] h-[88px] relative filter brightness-0 invert opacity-80">
        <Image
          src={logoImage}
          alt="Logo"
          fill
          className="object-contain"
          sizes="127px"
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </div>
    </section>
  );
});

export { ProfileSection };