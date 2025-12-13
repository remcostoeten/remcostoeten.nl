import type { ExperienceItemType } from "@/registry/work-experience"
import { WorkExperience } from "@/registry/work-experience"
import { Section } from "@/components/ui/section"
import { Briefcase } from "lucide-react"

const WORK_EXPERIENCE: ExperienceItemType[] = [
  {
    id: "brainstud",
    companyName: "Brainstud / Allyoucanlearn",
    positions: [
      {
        id: "brainstud-frontend",
        title: "Frontend Developer",
        employmentPeriod: "2025 — present",
        employmentType: "Full-time",
        icon: "code",
        description: `- Building modern learning platforms and educational tools
- Developing scalable frontend architecture with React and Next.js
- Collaborating with cross-functional teams to deliver user-centric solutions`,
        skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Frontend Architecture"],
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
        title: "Frontend Developer",
        employmentPeriod: "2023 — 2025",
        employmentType: "Full-time",
        icon: "code",
        description: `- Developed and maintained government-focused collaboration platforms
- Built accessible and performant web applications
- Implemented modern frontend practices and design systems`,
        skills: ["React", "TypeScript", "GraphQL", "Accessibility", "Design Systems"],
      },
    ],
  },
  {
    id: "lasaulec",
    companyName: "Lasaulec / Distil",
    positions: [
      {
        id: "lasaulec-frontend",
        title: "Frontend Developer",
        employmentPeriod: "2022 — 2023",
        employmentType: "Full-time",
        icon: "code",
        description: `- Created custom web solutions for diverse clients
- Worked on e-commerce and marketing websites
- Collaborated with designers to implement pixel-perfect interfaces`,
        skills: ["JavaScript", "React", "CSS", "WordPress", "E-commerce"],
      },
    ],
  },
  {
    id: "tickles",
    companyName: "Tickles",
    positions: [
      {
        id: "tickles-developer",
        title: "Web Developer",
        employmentPeriod: "2016 — 2022",
        employmentType: "Full-time",
        icon: "code",
        description: `- Started career as junior developer and grew to senior role
- Built numerous websites and web applications for clients
- Gained expertise in full-stack development and project delivery`,
        skills: ["PHP", "JavaScript", "Laravel", "WordPress", "MySQL", "Frontend Development"],
      },
    ],
  },
  {
    id: "education",
    companyName: "ROC Friese Poort Sneek",
    positions: [
      {
        id: "education-mbo",
        title: "MBO Application Development",
        employmentPeriod: "2012 — 2016",
        employmentType: "Education",
        icon: "education",
        description: `- Completed MBO-level education in Application Development
- Learned fundamentals of programming and software development
- Built foundation for professional development career`,
        skills: ["Programming Fundamentals", "Software Development", "Database Desig"],
      },
    ],
  },
]

export default function WorkExperienceDemo() {
  return (
    <Section title="Experience" noPadding>
      <WorkExperience experiences={WORK_EXPERIENCE} />
    </Section>
  )
}