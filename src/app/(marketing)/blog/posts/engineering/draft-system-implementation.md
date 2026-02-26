---
title: 'Building a draft system for markdown files in Next.js'
publishedAt: '2025/12/16'
summary: "Running a blog through filesystem is great, although accidental commits of unfinished posts are bound to happen sooner or later. Here's how I implemented a draft system using MDX frontmatter"
tags: ["Engineering", "Next.js", "Guide", "Frontmatter"]
draft: false
---

As I am building a [Notion like app called Skriuw](https://skriuw.vercel.app) that has rich text editing capabilities I opted for Markdown files in my [repository](https://github.com/remcostoeten/remcostoeten.nl) so to change things up.

Works wonderfully, only downside being if you are neurodivergent you'll end up with dozens of unfinished posts in your repository which you don't want to lose nor want to publish so I decided to implement a draft system.

I had just implemented authentication, GitHub OAuth only for me to access a private admin route for analytics and metrics. I signed up, and added some logic in the _middleware_ proxy that simply checks `if (email === process.env.MY_EMAIL).. access granted`. Now for the easier task.

## The Goal

1. Mark a post as a draft via frontmatter.
2. Hide drafts from the public blog listing.
3. Allow me (the admin) to preview them while logged in.
4. Prevent direct access to draft URLs by unauthorized users.

## Step 1: Parsing the Frontmatter

The first step was updating my MDX parser to recognize a `draft` field.

```typescript title="src/utils/utils.ts"
case 'draft':
  metadata.draft = value.toLowerCase() === 'true'
  break
```

I also split my blog fetching logic into `getBlogPosts()` (public) and `getAllBlogPosts()` (admin/internal).

## Step 2: The Security Layer

I created a simple server only utility to check for admin status. Since I'm using the `better-auth` admin plugin, it's as simple as:

```typescript title="src/lib/auth.ts"
export async function isAdmin() {
	const session = await auth.api.getSession({ headers: await headers() })
	return (
		session?.user?.role === 'admin' ||
		session?.user?.email === process.env.MY_EMAIL
	)
}
```

## Step 3: Protecting the Routes

In my dynamic blog route `[...slug]`, I added a check before rendering. If the post is a draft and the user isn't an admin, they get a `404`.

I define the admin variable `const isAdmin = await isAdmin()` and use that to simply conditionally fetch either all posts or only public posts.

```typescript title="src/app/blog/[slug]/page.tsx"
let allPosts
if (isAdmin) {
	allPosts = getAllBlogPosts()
} else {
	allPosts = getBlogPosts()
}
```

Or if you prefer the ternary operator:

```typescript title="src/app/blog/[slug]/page.tsx"
const allPosts = isAdmin ? getAllBlogPosts() : getBlogPosts()
```

And then it's simply a matter of checking if the post exists and if it's a draft.

```typescript title="src/app/blog/[slug]/page.tsx"
const post = allPosts.find(p => p.slug === slug)

if (!post || (post.metadata.draft && !isAdmin)) {
	notFound()
}
```

### End result

Added [a banner](https://github.com/remcostoeten/remcostoeten.nl/blob/master/src/components/blog/posts-client.tsx) indicating the post is a draft and a "DRAFT" badge in the listing which only shows up when logged in.

![Draft system implementation](/images/draft.webp)

Full code can be found [here](https://github.com/remcostoeten/remcostoeten.nl/blob/master/src/components/blog/posts-client.tsx).

<Video src="/draft-demo.mp4" width="800" height="450" loop muted className="my-8" />
