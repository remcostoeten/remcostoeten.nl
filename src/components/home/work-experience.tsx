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
        location: "Zwolle (Hybrid)",
        icon: "education",
        description: `
- Building a modern e-learning platform for Dutch students in Next.js, TypeScript with a custom REST layer on TanStack Query.
- Self driven development under Shape Up methodology collaboration with a Laravel backend team.
- Implementing scoped and iterative features without a dedicated product owner.`,
        skills: ['Next.js', 'TypeScript', 'React Query', 'REST API', 'Shape Up', 'CSS modules'],
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
        location: "Remote",
        icon: "business",
        description: `
- Developed fully open source intranet builder using React, GraphQL and Styled Components.
- Kanban flow with weekly releases in collaboration with backend (django) and devops (k8s, self-hosted).
- Rebuilt the FSV fraud detection platform in JavaScript, SCSS for the Belastingdienst.
- Implemented WCAG AA compliance and accessibility standards for government applications.
- Operated exclusively for non profit & government institutions.
- Continued developing for pdfchecker.nl which allows users to check PDF files for accessibility compliance.`,
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
        location: "Remote",
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
        location: "Lemmer / Joure (Office)",
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
        title: "College - Interactive Graphic Design",
        employmentPeriod: "2012 — 2016",
        employmentType: "Graduated",
        location: "Sneek",
        icon: "education",
        description: "Studied the intersection of visual communication and technical implementation, with a strong focus on UI/UX, human-centered design, art history, and filmmaking. The final two years and internships were dedicated full time to interactive web design.",
        skills: ['Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Web Design & Development', "Accessibility", "UI/UX", "Photography", "Art History",],
      },
    ],
  },
]

export default function WorkExperienceDemo() {
  return (
    <Section title="Professional Experience">
      <WorkExperience experiences={WORK_EXPERIENCE} />
    </Section>
  )
}