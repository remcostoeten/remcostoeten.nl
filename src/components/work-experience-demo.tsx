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
        description: `Building modern learning platforms and educational tools with scalable frontend architecture.`,
        skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
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
        description: `Developed accessible government collaboration platforms with modern frontend practices.`,
        skills: ["React", "TypeScript", "GraphQL", "Accessibility"],
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
        description: `Created custom e-commerce and marketing web solutions for diverse clients.`,
        skills: ["JavaScript", "React", "CSS", "E-commerce"],
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
        description: `Grew from junior to senior developer, building numerous web applications.`,
        skills: ["PHP", "JavaScript", "Laravel", "WordPress"],
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
        description: `Completed MBO-level education in Application Development.`,
        skills: ["Programming", "Software Development", "Database Design"],
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