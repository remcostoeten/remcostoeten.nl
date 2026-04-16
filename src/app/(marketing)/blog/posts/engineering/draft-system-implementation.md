---
title: 'Building a draft system for markdown files in Next.js'
publishedAt: '2025/12/16'
summary: "Running a blog through filesystem is great, although accidental commits of unfinished posts are bound to happen sooner or later. Here's how I implemented a draft system using MDX frontmatter"
tags: ['Engineering', 'Next.js', 'Guide', 'Frontmatter']
draft: false
---

Once you start writing more often, unfinished posts start piling up in the repo. I wanted to keep those drafts around without risking that they would accidentally show up in the public blog, so I added a simple draft system around my filesystem-based blog.

Here's what the final experience looks like — the admin can toggle between viewing all posts (including drafts) or just the published ones:

<Video src="/draft-demo.mp4" width="800" height="450" loop muted className="my-8" />

I already had GitHub OAuth in place for a private admin area, plus a server-side admin check based on role and email. That made the draft flow fairly small to implement.

## Requirements

This setup assumes you already have:

- markdown or MDX posts with frontmatter
- some form of authentication
- a way to distinguish a specific user from a regular visitor, for example by role, email address, or username

I use GitHub OAuth through `better-auth`. Admin access is then determined server-side based on role or a configured email match.

## What The System Should Do

1. Mark a post as a draft via frontmatter.
2. Hide drafts from the public blog listing.
3. Allow me (the admin) to preview them while logged in.
4. Prevent direct access to draft URLs by unauthorized users.

That breaks down into four small pieces:

- parse a `draft` field from frontmatter
- keep separate public and internal post queries
- check whether the current user is allowed to see drafts
- return `404` when a draft is requested by anyone else

## Step 1: Parse `draft` From Frontmatter

The first thing I needed was a way to mark a post as private at the content level. Since the blog already runs on Markdown files with frontmatter, the most direct option was adding a `draft` field there.

That meant teaching the frontmatter parser to recognize and store that value.

```typescript title="src/lib/blog/frontmatter.ts"
switch (trimmedKey) {
	case 'title':
		metadata.title = value
		break
	case 'summary':
		metadata.summary = value
		break
	case 'draft':
		metadata.draft = value.toLowerCase() === 'true'
		break
	case 'slug':
		metadata.slug = value
		break
	case 'updatedAt':
		metadata.updatedAt = value
		break
}
```

With that in place, a post can be marked directly in the file:

```md
---
title: 'Some unfinished post'
draft: true
---
```

_Not required, but I put all my draft MDX files in a `drafts` directory inside the root of my blog folder, following the Next.js file-based routing approach._

- set `draft: true` in frontmatter
- move the file into a drafts folder

## Step 2: Split Public And Internal Post Queries

Once the metadata existed, I split the read path into two functions:

File: [`src/lib/blog/posts.ts`](https://github.com/remcostoeten/remcostoeten.nl/blob/master/src/lib/blog/posts.ts)

- `getBlogPosts()` for public pages
- `getAllBlogPosts()` for admin-aware pages

The public version filters out drafts, while the internal version keeps everything.

This separation matters because it keeps the rest of the app simple. Pages that should never expose drafts do not need to remember how to filter them manually every time.

## Step 3: Check Whether The User Is Admin

I use a small server-side helper for this. In my case, a user counts as admin if they either:

File: [`src/utils/is-admin.ts`](https://github.com/remcostoeten/remcostoeten.nl/blob/master/src/utils/is-admin.ts)

- have the `admin` role
- match one of the configured admin email addresses

The helper looks roughly like this:

```typescript title="src/utils/is-admin.ts"
export async function isAdmin() {
	const session = await getServerSession()

	if (!session?.user) return false

	const isEmailMatch = isAdminEmail(session.user.email)
	const isRoleAdmin = session.user.role === 'admin'

	return isRoleAdmin || isEmailMatch
}
```

One small but important distinction: my `proxy.ts` only protects the `/admin` area itself. Draft protection for blog posts happens inside the blog route, not in middleware.

Related file: [`src/proxy.ts`](https://github.com/remcostoeten/remcostoeten.nl/blob/master/src/proxy.ts)

<small class="small-title">proxy.ts === middleware.ts since next.js > v16</small>

## Step 4: Protect The Blog Route

In the dynamic blog route, I fetch the post and then check whether the current user is allowed to see it. If the post is a draft and the user is not admin, they get a `404`.

The important part is that the route uses the admin-aware post source first, then performs authorization explicitly.

File: [`src/app/(marketing)/blog/[...slug]/page.tsx`](https://github.com/remcostoeten/remcostoeten.nl/blob/master/src/app/%28marketing%29/blog/%5B...slug%5D/page.tsx)

```typescript title="src/app/(marketing)/blog/[...slug]/page.tsx"
const isAdminUser = await checkAdminStatus()
const allPosts = getAllBlogPosts()
const post = allPosts.find(p => p.slug === slug)

if (!post) {
	notFound()
}

if (post.metadata.draft && !isAdminUser) {
	notFound()
}
```

This keeps the behavior predictable:

- admins can preview draft URLs directly
- non-admin users cannot tell whether a draft exists
- public blog pages still use the filtered post list

## Result

The final system is small, but it covers the whole flow:

- drafts stay in the repository
- the public listing stays clean
- admins can preview unfinished work in production-like conditions
- direct links to draft posts stay private

![Draft system implementation](/images/draft.webp)

I also added a visible draft badge in the blog listing so I can immediately tell which entries are still private when browsing as admin.

Related file: [`src/components/blog/posts-client.tsx`](https://github.com/remcostoeten/remcostoeten.nl/blob/master/src/components/blog/posts-client.tsx)
