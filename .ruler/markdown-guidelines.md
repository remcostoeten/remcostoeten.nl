# Markdown Content Guidelines

## Writing Guidelines

The following guidelines are for writing content in Markdown and MDX format:

- Use frontmatter to define the title and description.
- The first heading on the page should be an `<h1>` tag that matches the title in the frontmatter.
- Use Fumadocs components (if applicable) for enhanced UI elements (refer to <http://fumadocs.vercel.app/docs/ui/markdown>).
- Use standard Markdown code fences for code examples and specify the language for syntax highlighting.
- Use Markdown links for internal and external navigation: `\[Link Text](url)`.
- Place images in the `/public` directory and reference them using relative paths.
- Use `Note`, `Tip`, `Important`, `Warning`, and `Danger` components to highlight important information.

## Frontmatter Structure

When creating markdown files, include this frontmatter structure:

```yaml
---
title: 'Your Content Title'
description: 'Brief description of the content'
publishedAt: '2024-04-09'
summary: 'Brief summary for blog posts'
---
```

## Code Examples

When including code examples:

1. Always specify the language for syntax highlighting
2. Use descriptive filenames for multi-file examples
3. Include comments for complex logic
4. Show import/export patterns clearly
5. Demonstrate both the "what" and "why" of the code

## Content Organization

- Start with a clear introduction explaining what the content covers
- Use headers (`##`, `###`) to structure content logically
- Include practical examples whenever possible
- End with a summary or key takeaways
- Cross-reference related content when relevant
