export const siteConfig = {
  name: "Remco Stoeten",
  description: "Portfolio and blog of Remco Stoeten",
  url: "https://remcostoeten.nl",
  me: {
    name: "Remco Stoeten",
    social: {
      github: "https://github.com/remcostoeten",
      x: "https://twitter.com/remcostoeten",
      // Add other social links as needed
    },
  },
} as const

export type SiteConfig = typeof siteConfig