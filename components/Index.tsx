"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

import { ProjectCard } from "@/components/ProjectCard"
import { ContactForm } from "@/components/ContactForm"

export const Index = () => {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [isContactHovered, setIsContactHovered] = useState(false)
  const [shouldOpenAbove, setShouldOpenAbove] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      // Convert to UTC+1 timezone
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000
      const utcPlus1 = new Date(utcTime + 1 * 3600000)

      const timeString = utcPlus1.toTimeString().split(" ")[0]
      setCurrentTime(timeString)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleContactHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom
    const formHeight = 400 // Approximate form height

    setShouldOpenAbove(spaceBelow < formHeight)
    setIsContactHovered(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Main heading */}
        <motion.h1
          className="text-xl font-medium text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          I build digital things.
        </motion.h1>

        {/* Introduction paragraph */}
        <motion.p
          className="text-foreground leading-relaxed text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          I'm a{" "}
          <span
            className="font-medium px-1 py-0.5 rounded"
            style={{ backgroundColor: "hsl(var(--highlight-frontend) / 0.2)", color: "hsl(var(--highlight-frontend))" }}
          >
            Frontend Developer
          </span>{" "}
          focused on creating efficient and maintainable web applications. I work remotely from Lemmer, Netherlands.
        </motion.p>

        {/* Projects paragraph */}
        <motion.p
          className="text-foreground leading-relaxed text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          Recently I've been working on{" "}
          <ProjectCard
            title="Roll Your Own Authentication"
            description="A comprehensive Next.js 15 authentication system showcasing how to implement JWT-based auth without external services like Lucia, NextAuth, or Clerk. Features secure PostgreSQL storage, admin roles, onboarding flows, and more."
            url="https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication"
            demoUrl="https://ryoa.vercel.app/"
            stars={0}
            branches={34}
            technologies={["Next.js 15", "TypeScript", "PostgreSQL", "JWT", "Tailwind CSS"]}
            lastUpdated="recently"
            highlights={[
              "JWT authentication without external services",
              "Secure PostgreSQL user storage",
              "Admin role management system",
              "Configurable onboarding flows",
              "Modern Next.js 15 features",
            ]}
          />{" "}
          and{" "}
          <ProjectCard
            title="Turso DB Creator CLI"
            description="A powerful CLI tool for Turso (turso.tech) that automates SQLite database creation and credential management. Automatically copies URLs and auth tokens to clipboard with .env syntax, includes --overwrite flag for seamless credential updates."
            url="https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials"
            stars={1}
            branches={5}
            technologies={["CLI", "Node.js", "Turso", "SQLite", "Shell Scripts"]}
            lastUpdated="recently"
            highlights={[
              "One-command database creation",
              "Automatic credential management",
              "Clipboard integration with .env format",
              "Smart credential overwriting",
              "Sub-10 second deployment workflow",
            ]}
          />
          . You can explore more of my work on{" "}
          <a
            href="https://github.com/remcostoeten"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            GitHub ↗
          </a>
          .
        </motion.p>

        {/* Contact paragraph */}
        <motion.p
          className="text-foreground leading-relaxed text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          Connect with me on{" "}
          <a
            href="https://nl.linkedin.com/in/remco-stoeten"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            LinkedIn ↗
          </a>{" "}
          or through{" "}
          <div
            className="relative inline-block"
            onMouseEnter={handleContactHover}
            onMouseLeave={() => setIsContactHovered(false)}
          >
            <button className="text-accent font-medium border-b border-dotted border-accent/30 hover:border-accent/60 transition-colors duration-200">
              my website
            </button>
            <ContactForm isVisible={isContactHovered} openAbove={shouldOpenAbove} />
          </div>
          . I'm currently working at{" "}
          <span
            className="font-medium px-1 py-0.5 rounded"
            style={{ backgroundColor: "hsl(var(--highlight-product) / 0.2)", color: "hsl(var(--highlight-product))" }}
          >
            @exactonoline
          </span>
          .
        </motion.p>

        {/* Timezone paragraph */}
        <motion.p
          className="text-foreground leading-relaxed text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          My current timezone is <span className="font-medium">UTC+1</span> which includes countries like{" "}
          <span className="font-medium">Ireland</span>, <span className="font-medium">Morocco</span> and{" "}
          <span className="font-medium">Portugal</span>. Right now it is{" "}
          <motion.span
            className="font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            {currentTime}
          </motion.span>
          .
        </motion.p>
      </div>
    </div>
  )
}
