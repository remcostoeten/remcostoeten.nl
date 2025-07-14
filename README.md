## remcostoeten.nl

My personal site. After about 50 iterations over the past few years, I’ve come to the conclusion that minimalism is the way to go for personal websites.

From an engineering perspective, I may have over-engineered it a little—but that’s never hurt anyone, right?

Both the front-end and back-end are built with Next.js for confidence.  
**Back-end?** For those couple of paragraphs on the front page?  
Yes. I could’ve finished this site in a few hours, but I chose to roll my own CMS—because why not?

It’s protected by [nextjs-15-roll-your-own-authentication](https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication), which I also built from scratch.

The front-end includes a small survey/contact form (accessible via the contact link), which displays inside the CMS.

I'm also in the process of building my own analytics system with a long-term goal of releasing an SDK. This data will also be queried and displayed inside the CMS/admin panel.

Lastly—and maybe the best part—is [Fync](https://github.com/remcostoeten/fync), a package that provides most of the methods you’d need when working with the GitHub and Spotify APIs. It’s still under construction, and I plan to add support for additional providers like GitLab, Notion, Vercel, Jira, and more.

_Someday I’ll insert a video demo of the CMS here._

### Stack

- Next.js 15 / React 19
- LibSQL (SQLite via Turso) with API routes
- `jose` (JWT), `bcrypt` (encryption), `drizzle` (ORM), [`fync`](https://github.com/remcostoeten/fync) (GitHub & Spotify API provider)

xxx,

Remco stoeten
