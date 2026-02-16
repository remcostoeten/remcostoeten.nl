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
- Building a modern e-learning platform in Next.js, TypeScript & React Query.
- Self-driven development using Shape Up methodology in a hybrid team.`,
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
- Developed an open-source intranet builder (React/GraphQL) and rebuilt the FSV fraud detection platform.
- Implemented rigid WCAG AA accessibility standards for government applications.
- Collaborated in a Kanban flow with backend/devops on weekly releases.`,
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
- Co-architected and built features for a SaaS inspection & compliance platform.
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
- Built 30+ custom Magento 2 webshops for B2B and B2C clients (equestrian, fashion, industrial).
- Developed with PHTML, BEM SCSS, and JavaScript (Vanilla, jQuery, Knockout.js).`,
        skills: ['Magento 2', 'PHTML', 'BEM SCSS', 'JavaScript', 'jQuery', 'Knockout.js'],
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
        skills: ['UI/UX', 'Web Design & Development', 'Accessibility', 'After Effects', 'Photoshop'],
      },
    ],
  },
]

export function WorkExperienceSection() {
  return (
    <Section title="Professional Experience">
      <WorkExperience experiences={WORK_EXPERIENCE} />
    </Section>
  )
}