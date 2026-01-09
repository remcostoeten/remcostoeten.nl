import type { ExperienceItemType } from "@/components/ui/work-experience"
import { WorkExperience } from "@/components/ui/work-experience"
import { Section } from "@/components/ui/section"

const WORK_EXPERIENCE: ExperienceItemType[] = [
  {
    id: "brainstud",
    companyName: "Brainstud / Allyoucanlearn",
    positions: [
      {
        id: "brainstud-frontend",
        title: "Front End Developer",
        employmentPeriod: "2025 — present",
        employmentType: "Full-time",
        icon: "education",
        description: `
- Building a modern e-learning platform with Next.js, TypeScript and React Query.
- Working under the Shape Up methodology delivering scoped and iterative features.
- Collaborating with a Laravel backend team through a custom REST layer.`,
        skills: ['Next.js', 'TypeScript', 'React Query', 'REST API', 'Shape Up'],
        isExpanded: true,
      },
    ],
    isCurrentEmployer: true,
  },
  {
    id: "pleio",
    companyName: "Pleio",
    positions: [
      {
        id: "pleio-frontend",
        title: "Front End Developer",
        employmentPeriod: "2023 — 2025",
        employmentType: "Full-time",
        icon: "business",
        description: `
- Developed fully open source government platforms using React, GraphQL and Django.
- Rebuilt the FSV fraud detection platform in JavaScript, SCSS and Django.
- Improved reliability and maintainability of a core intranet site builder used across government institutions.
- Implemented WCAG AA compliance and accessibility standards for government applications.`,
        skills: ['React', 'GraphQL', 'Django', 'SCSS', 'Vanilla JS', 'WCAG AA'],
      },
    ],
  },
  {
    id: "lasaulec",
    companyName: "Lasaulec / Distil",
    positions: [
      {
        id: "lasaulec-frontend",
        title: "Front End Developer",
        employmentPeriod: "2022 — 2023",
        employmentType: "Full-time",
        icon: "design",
        description: `
- Rebuilt the complete webshop front-end using Razor, SCSS and JavaScript.
- Delivered production features autonomously for React-based internal applications.`,
        skills: ['React', 'Razor', 'JavaScript', 'SCSS'],
      },
    ],
  },
  {
    id: "tickles",
    companyName: "Tickles",
    positions: [
      {
        id: "tickles-developer",
        title: "Front End Developer",
        employmentPeriod: "2016 — 2022",
        employmentType: "Full-time",
        icon: "code",
        description: `
- Built custom Magento 2 webshops for B2B and B2C clients using PHTML, BEM SCSS and JavaScript.`,
        skills: ['Magento 2', 'PHTML', 'BEM SCSS', 'JavaScript'],
      },
    ],
  },
  {
    id: "education",
    companyName: "ROC Friese Poort",
    positions: [
      {
        id: "education-graphic-design",
        title: "Graphic Design - Web Development",
        employmentPeriod: "2012 — 2016",
        employmentType: "Education",
        icon: "education",
        description: `Focused on the intersection of visual communication and technical implementation, covering everything from advanced UI/UX principles and accessibility to full-cycle web design and development.`,
        skills: ['Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Web Design & Development', "Accessibility", "UI/UX"],
      },
    ],
  },
]

export default function WorkExperienceDemo() {
  return (
    <Section title="Experience">
      <WorkExperience experiences={WORK_EXPERIENCE} />
    </Section>
  )
}