import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Section } from '@/components/ui/section'
import { BreadcrumbStructuredData, PersonStructuredData } from '@/components/seo/structured-data'
import { baseUrl } from '@/app/sitemap'
import { GithubIcon, LinkedinIcon, MailIcon, MapPinIcon, BriefcaseIcon, GraduationCapIcon, CodeIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Remco Stoeten',
  description: 'Learn more about Remco Stoeten, a Dutch frontend engineer with 8 years of experience in React, TypeScript, Next.js, and modern web development.',
  keywords: [
    'Remco Stoeten',
    'Remco',
    'Stoeten',
    'About Remco Stoeten',
    'Frontend Engineer Netherlands',
    'React Developer',
    'TypeScript Developer',
    'Next.js Developer',
  ],
  openGraph: {
    title: 'About Remco Stoeten - Frontend Engineer',
    description: 'Learn more about Remco Stoeten, a Dutch frontend engineer with 8 years of experience.',
    url: `${baseUrl}/about`,
    type: 'profile',
    images: [{ url: '/og?title=About%20Remco%20Stoeten', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: `${baseUrl}/about`,
  },
}

const skills = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Node.js',
  'PostgreSQL', 'Drizzle ORM', 'GraphQL', 'REST APIs', 'Git', 'Docker',
  'Framer Motion', 'Figma', 'Vercel', 'Linux'
]

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/remcostoeten', icon: GithubIcon },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/remco-stoeten/', icon: LinkedinIcon },
  { name: 'Email', href: 'mailto:remcostoeten@gmail.com', icon: MailIcon },
]

export default function AboutPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
        ]}
      />
      <PersonStructuredData />

      <div className="space-y-6">
        <header className="px-4 md:px-5">
          <div className="flex items-start gap-4 mb-6">
            <Image
              src="/images/remco-stoeten.webp"
              alt="Remco Stoeten - Frontend Engineer"
              width={224}
              height={224}
              sizes="80px"
              priority
              className="w-20 h-20 rounded-full border-2 border-border/50 shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Remco Stoeten
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <BriefcaseIcon className="size-3.5" />
                Frontend Engineer
              </p>
              <p className="text-sm text-muted-foreground/70 mt-0.5 flex items-center gap-1.5">
                <MapPinIcon className="size-3.5" />
                Netherlands
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 rounded-none hover:bg-muted/50 transition-colors"
              >
                <link.icon className="size-3.5" />
                {link.name}
              </Link>
            ))}
          </div>
        </header>

        <Section title="About Me" noHeaderMargin>
          <div className="px-4 pt-4 pb-6 space-y-4">
            <p className="text-sm text-muted-foreground/90 leading-relaxed">
              I'm <strong className="text-foreground">Remco Stoeten</strong>, a Dutch software engineer focused on front-end development with a degree in graphic design. With <strong className="text-foreground">8 years</strong> of professional experience, I've worked across e-commerce, SaaS, government, and e-learning projects.
            </p>
            <p className="text-sm text-muted-foreground/90 leading-relaxed">
              I specialize in building modern, performant web applications using React, TypeScript, and Next.js. I'm passionate about creating intuitive user experiences, writing clean code, and continuously learning new technologies.
            </p>
            <p className="text-sm text-muted-foreground/90 leading-relaxed">
              Currently working at <strong className="text-foreground">Brainstud</strong>, where I help build educational platforms and tools. Outside of work, I enjoy tinkering with side projects, exploring new frameworks, and contributing to open source.
            </p>
          </div>
        </Section>

        <Section title="Education" noHeaderMargin>
          <div className="px-4 pt-4 pb-6">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary border border-primary/20 mt-0.5">
                <GraduationCapIcon className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Graphic Design</h3>
                <p className="text-xs text-muted-foreground/70 mt-0.5">Bachelor's Degree</p>
                <p className="text-xs text-muted-foreground/50 mt-0.5">
                  Combining design thinking with technical implementation
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Skills & Technologies" noHeaderMargin>
          <div className="px-4 pt-4 pb-6">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground bg-secondary/30 border border-transparent hover:border-border/50 rounded-md transition-colors"
                >
                  <CodeIcon className="size-3" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Get In Touch" noHeaderMargin>
          <div className="px-4 pt-4 pb-6 space-y-3">
            <p className="text-sm text-muted-foreground/90 leading-relaxed">
              Interested in working together or just want to say hi? Feel free to reach out through any of the channels above, or check out my work on{' '}
              <Link href="https://github.com/remcostoeten" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                GitHub
              </Link>.
            </p>
            <p className="text-sm text-muted-foreground/90 leading-relaxed">
              You can also explore my{' '}
              <Link href="/blog" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                blog
              </Link>{' '}
              where I write about frontend development, React, TypeScript, and other tech topics.
            </p>
          </div>
        </Section>
      </div>
    </>
  )
}
