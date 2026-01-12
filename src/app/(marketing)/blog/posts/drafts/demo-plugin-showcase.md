---
title: 'MDX Demo Plugin Showcase'
publishedAt: '12-01-2026'
summary: "A showcase of the new interactive demo popover plugin for our blog."
tags: ["Engineering", "Demo", "Internal"]
draft: false
---

This post demonstrates the new MDX demo plugin functionality. We can now easily embed interactive demos inline with our text.

## Basic Usage

The simplest way to use it is to just reference the demo ID:

Check out the [[demo: example-project]] here.

## Custom Title

You can override the title shown in the popover:

Here looks at the [[demo: example-project, title="Custom Project Title"]].

## Click Trigger

By default, the popover opens on hover. You can change this to click:

This one requires a click: [[demo: example-project, trigger="click"]].

## How it works

The system uses a custom remark plugin to parse the `[[demo: ...]]` syntax and transforms it into a `DemoPopover` React component. This component lazy-loads the media content only when the user interacts with the trigger, keeping our initial page load fast.

### Syntax

```markdown
[[demo: demo-id]]
[[demo: demo-id, title="Custom Title"]]
[[demo: demo-id, trigger="click"]]
```

### Adding New Demos

1. Add your GIF/Video to `public/demos/`
2. Register it in `src/lib/demos/index.ts`
3. Reference it by ID in your markdown
