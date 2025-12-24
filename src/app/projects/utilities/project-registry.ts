import type { Project, ProjectFilter, ProjectStatus } from '../types/project'

const projectList: Project[] = [
  {
    slug: 'edge-commerce',
    title: 'Edge Commerce',
    summary: 'Edge-first storefront with streaming discovery, real-time cart sync, and resilient checkout.',
    description:
      'Edge Commerce is a production storefront that keeps product discovery instant even on constrained networks. It streams above-the-fold content from the edge, hydrates filters progressively, and keeps carts in sync with optimistic updates backed by idempotent webhooks. The experience pairs enterprise-grade observability with a dark, neutral interface tuned for long browsing sessions.',
    categories: ['ecommerce', 'edge', 'performance'],
    status: 'finished',
    dates: {
      start: '2023-11-01',
      updated: '2024-08-12',
      year: 2024,
      end: '2024-08-12',
    },
    stack: ['Next.js', 'Tailwind', 'Vercel Edge', 'Postgres', 'Stripe'],
    links: {
      live: 'https://commerce-demo.vercel.store',
      repo: 'https://github.com/vercel/commerce',
      docs: 'https://vercel.com/commerce',
    },
    github: {
      owner: 'vercel',
      repo: 'commerce',
    },
    media: {
      kind: 'image',
      src: '/projects/edge-commerce.svg',
      alt: 'Edge Commerce product detail view with dark glassmorphism accents.',
    },
    sandbox: {
      key: 'commerce',
      note: 'Preview of the resilient checkout steps running fully on the client sandbox.',
      source: 'https://github.com/vercel/commerce',
      star: 'https://github.com/vercel/commerce',
    },
  },
  {
    slug: 'spatial-canvas',
    title: 'Spatial Canvas',
    summary: 'Collaborative canvas focused on latency-resilient diagramming and multiplayer cursors.',
    description:
      'Spatial Canvas powers distributed whiteboarding with deterministic state and peer-to-peer failovers. It keeps cursors fluid at 200ms latency budgets, applies vector snapping on the server, and ships a gesture-led interface that respects keyboard navigation. The experience is tuned for designers who expect premium motion without sacrificing accessibility.',
    categories: ['collaboration', 'design', 'realtime'],
    status: 'in progress',
    dates: {
      start: '2024-02-15',
      updated: '2024-10-04',
      year: 2024,
    },
    stack: ['Next.js', 'Tailwind', 'WebRTC', 'Framer Motion', 'Zustand'],
    links: {
      live: 'https://tldraw.com',
      repo: 'https://github.com/tldraw/tldraw',
      docs: 'https://tldraw.dev',
    },
    github: {
      owner: 'tldraw',
      repo: 'tldraw',
    },
    media: {
      kind: 'image',
      src: '/projects/spatial-canvas.svg',
      alt: 'Spatial Canvas collaborative drawing session with multiple cursors.',
      poster: '/projects/spatial-canvas-poster.svg',
    },
    sandbox: {
      key: 'canvas',
      note: 'A constrained canvas interaction showcasing the latency budget and keyboard support.',
      source: 'https://github.com/tldraw/tldraw',
      star: 'https://github.com/tldraw/tldraw',
    },
  },
  {
    slug: 'personal-portfolio',
    title: 'Personal Portfolio',
    summary: 'The core site you are browsing: SSR-first portfolio with analytics, auth, and MDX content.',
    description:
      'This portfolio runs on the App Router with streaming MDX, structured data, and privacy-aware analytics. It is tuned for instant navigation with prefetching, predictable focus management, and hardened layout primitives. Every section is responsive, keyboard friendly, and optimized for a dark neutral palette.',
    categories: ['portfolio', 'content', 'performance'],
    status: 'finished',
    dates: {
      start: '2023-06-01',
      updated: '2024-12-15',
      year: 2024,
      end: '2024-12-15',
    },
    stack: ['Next.js', 'Tailwind', 'MDX', 'PostHog', 'Vercel'],
    links: {
      live: 'https://remcostoeten.nl',
      docs: 'https://remcostoeten.nl/blog',
    },
    media: {
      kind: 'image',
      src: '/projects/personal-portfolio.svg',
      alt: 'Portfolio homepage hero with dark monochrome typography.',
    },
    sandbox: {
      key: 'portfolio',
      note: 'Typography, motion, and navigation shell extracted from the live site.',
      source: 'https://remcostoeten.nl',
    },
  },
]

export function getProjects(): Project[] {
  return projectList
}

export function getSortedProjects(): Project[] {
  return [...projectList].sort((first, second) => new Date(second.dates.updated).getTime() - new Date(first.dates.updated).getTime())
}

export function getProject(slug: string): Project | undefined {
  return projectList.find((entry) => entry.slug === slug)
}

export function getAdjacent(slug: string): { previous?: Project; next?: Project } {
  const sorted = getSortedProjects()
  const index = sorted.findIndex((entry) => entry.slug === slug)

  if (index === -1) {
    return {}
  }

  return {
    previous: sorted[index - 1],
    next: sorted[index + 1],
  }
}

export function filterProjects(list: Project[], filter: ProjectFilter): Project[] {
  const { category, status, year, sort = 'recent' } = filter

  const filtered = list.filter((entry) => {
    const categoryMatch = category ? entry.categories.includes(category) : true
    const statusMatch = status && status !== 'all' ? entry.status === status : true
    const yearMatch = year ? entry.dates.year === year : true

    return categoryMatch && statusMatch && yearMatch
  })

  if (sort === 'oldest') {
    return filtered.sort((first, second) => new Date(first.dates.start).getTime() - new Date(second.dates.start).getTime())
  }

  return filtered.sort((first, second) => new Date(second.dates.updated).getTime() - new Date(first.dates.updated).getTime())
}

export function getCategories(): string[] {
  const set = new Set<string>()

  projectList.forEach((entry) => {
    entry.categories.forEach((category) => set.add(category))
  })

  return Array.from(set).sort()
}

export function getYears(): number[] {
  const set = new Set<number>()

  projectList.forEach((entry) => set.add(entry.dates.year))

  return Array.from(set).sort((first, second) => second - first)
}

export function getStatuses(): ProjectStatus[] {
  const set = new Set<ProjectStatus>()

  projectList.forEach((entry) => set.add(entry.status))

  return Array.from(set)
}
