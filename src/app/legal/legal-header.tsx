'use client'

import { useEffect, useRef, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { LegalLanguage } from './legal-language'

interface HeaderProps {
  language: LegalLanguage
  onLanguageChange: (language: LegalLanguage) => void
}

export function LegalHeader({ language, onLanguageChange }: HeaderProps) {
  const [isHidden, setIsHidden] = useState(false)
  const lastScroll = useRef(0)

  useEffect(function handleScrollDirection() {
    function handleScroll() {
      const current = window.scrollY
      const isMobile = window.innerWidth < 768
      if (!isMobile) {
        setIsHidden(false)
        lastScroll.current = current
        return
      }

      if (current > lastScroll.current && current > 32) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }
      lastScroll.current = current
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return function cleanup() {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={`sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur transition-transform duration-200 ${
        isHidden ? '-translate-y-full md:translate-y-0' : 'translate-y-0'
      }`}
    >
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-6">
        <Breadcrumbs params={{ lang: language }} showRootIcon={false} rootLabel="Home" />
        <div className="flex items-center gap-2 sm:self-start">
          <LanguageToggle
            label="EN"
            isActive={language === 'en'}
            onClick={handleEnglish}
          />
          <LanguageToggle
            label="NL"
            isActive={language === 'nl'}
            onClick={handleDutch}
          />
        </div>
      </div>
    </div>
  )

  function handleEnglish() {
    onLanguageChange('en')
  }

  function handleDutch() {
    onLanguageChange('nl')
  }
}

interface ToggleProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function LanguageToggle({ label, isActive, onClick }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
        isActive
          ? 'border-primary/70 bg-primary text-primary-foreground shadow-sm'
          : 'border-border/70 bg-background hover:border-primary/50 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}
