---
title: 'How I keep track of my tasks since conventional methods don't work for me'
publishedAt: '05-01-2026'
summary: "Conventional methods for keeping track of your tasks don't work for me so I invented two systems which make it impossible to forget"
tags: ["Engineering", "Blog", "Personal", "Productivity"]
---

Todo lists (literal) seem to hate me. I've tried loads of methods to keep track of the things I need to get done, whether it's for my job or in my personal life.

At my previous jobs I've worked with Jira (still recovering), later went fully autonomous, then kanban boards and as of the latter semi autonomous with a Linear board.
e
Tools like Jira make it easy to get overwhelmed due to the enormous amount of bloat being present and often a poorly written scope. Also have used Kanban which definitely is a step up, but the core problems remain.

Two out of the four jobs I've worked at us (the devs) were fully autonomous which is great, but you still have to document things as (at least my brain) is not capable of remembering the full scope.

## Solution one

I spent a lot of time in the shell. Nearly 50% off the code (or post like this) I write in (neo)vim. I also tinker A LOT with my [dotfiles](https://github.com/remcostoeten/dotfiles). Dozens of custom scripts and tooling tailored to me. So I decided to make a system that allows me to enter tasks through my CLI

The script is written in JavaScript/Bun and provides a simple but powerful interface for managing tasks. When you run it without arguments, you get a nice ASCII-art menu:

```
█████████████╗
╚══██╔═██╔═══╝
   ██║  ║   
   ██║  ║   
   ██║  ║   
   ╚═══╝   

████████╗ ║
██╔════██╔╗║
██║    ██║║║
██║    ██║║║
╚███████╔═╝║
 ╚═════╝   ║

██████████╗  ║
██║╔═══██╔╗║ ║
██║  ══██║║║ ║
██║    ██║║║ ║
██████████╔╝║ 
╚════════╝   

 ████████╗ ║
██╔══════╝ ║
██║        
██║        
███████╗ ║
╚══════╝   

(1) Create todo
(2) Delete todo
(3) Edit todo
(4) Help
(5) Exit
```

What makes this system work for me is the frictionless entry. I can create a task in seconds:

```bash
todo "Write blog post about todo system" 2pm --r 10,30,60
```

This creates a task with a due time of 2pm and sets up reminders at 10, 30, and 60 minutes before the due time. The script uses `notify-send` to show system notifications when tasks are due or about to be due.

The time parsing is flexible - you can use relative times like `1h`, `30min`, `1d`, `1w`, or specific times like `2pm`, `14:30`, or even `tomorrow`.

Tasks are stored in `~/.dotfiles/todo/tasks.json` as plain JSON, making them easy to backup, sync, or even edit manually if needed.

### CLI Commands

The script supports several commands for quick task management:

- `todo "Task" 3pm` - Create a task due at 3pm
- `todo "Task" 3pm --r 10,30` - Create with reminders at 10 and 30 minutes before
- `todo list` - List all pending tasks
- `todo list --overdue` - Show only overdue tasks
- `todo list --upcoming` - Show tasks due in less than 30 minutes
- `todo done <id>` - Mark a task as completed
- `todo edit <id> "New description"` - Edit a task
- `todo count` - Show the number of pending tasks

When I start my shell, the script automatically shows the first 5 pending tasks, color-coded by urgency. Overdue tasks show in red, upcoming tasks in yellow, and the rest in a neutral color.

### Why This Works

The key insight is that the system integrates with my existing workflow rather than requiring me to switch contexts. I'm already in the terminal, so adding a task is just a quick command away. The visual feedback in my shell prompt and the system notifications ensure tasks stay top-of-mind without requiring me to constantly check a separate app.

## Part Two: When CLI Isn't Enough - Enter btwfyi

While my CLI todo system works beautifully for terminal-based workflows, I found myself facing a new problem: **What about tasks that need to stay visible while I'm working in the browser or other GUI applications?**

The terminal is great for quick capture and reminders, but when I'm deep in code on VS Code, debugging in the browser, or designing in Figma, I'm not looking at my terminal. I needed something that would keep my tasks persistently visible, regardless of what application I'm using.

That's when I built [**btwfyi**](https://github.com/remcostoeten/btwfyi).

### What is btwfyi?

**btwfyi** (pronounced "bit-wai-fai") stands for "by the way, for your information" - and it's exactly that. A lightweight task awareness overlay designed specifically for development environments.

Think of it as your persistent sticky note layer that sits on top of your interface, keeping your tasks always in view without being intrusive. No more alt-tabbing to check your todo list, no more forgetting what you were supposed to work on next.

<BtwfyiDemo />

### The Problem It Solves

As a neurodivergent developer, I struggle with:
- **Task switching amnesia** - Start working on something, get distracted, completely forget what I was doing
- **Out of sight, out of mind** - If my todo list isn't visible, it might as well not exist
- **Context switching overhead** - The mental cost of switching between my code editor and a separate todo app

btwfyi solves all of these by making tasks an integrated part of your development interface.

### Core Features

#### 1. **Persistent Overlay**
Tasks float above your interface, always visible but never in the way. You can position them wherever makes sense for your workflow.

```tsx
import { Btwfyi } from "@remcostoeten/btwfyi/react";

function App() {
  return (
    <div>
      <Btwfyi 
        category="current-sprint" 
        categories={categories}
        enabled={true} 
      />
    </div>
  );
}
```

#### 2. **Smart Syntax Parsing**
Natural language task entry with automatic parsing. No need to manually set tags, priorities, or dates - just type naturally:

- `"Fix login bug tomorrow #auth !high"` → Automatically parses:
  - Text: "Fix login bug"
  - Due date: tomorrow
  - Tags: ["auth"]
  - Priority: high

The system understands:
- **Dates**: "tomorrow", "next friday", "dec 31"
- **Tags**: #bug, #feature, #urgent
- **Priority**: !high, !medium, !low

#### 3. **Bulk Import**
Got a bunch of tasks from a meeting or brainstorming session? Just paste them as a Markdown list:

```markdown
- Fix login bug #auth
- Add dark mode #ui !medium
- Update docs
```

btwfyi will parse and import all of them automatically.

#### 4. **AI Enhancement**
This is where it gets really cool. btwfyi supports two AI modes:

- **Local AI**: Uses Chrome's `window.ai` (Gemini Nano) for offline task enhancement. Your data never leaves your machine.
- **Cloud AI**: Optional Grok integration for smarter parsing and task suggestions.

The AI can help break down vague tasks into actionable steps, suggest priorities based on context, and even organize related tasks together.

#### 5. **Command Palette**
Press `Alt + K` anywhere in your app to open the global command palette. Search across every task, jump directly to what you need, or manage your overlays:

- Show/hide specific overlays
- Clear completed tasks
- Reset task statuses globally
- Search across all categories

#### 6. **Import/Export Everything**
Your data, your format:
- **Export**: Copy tasks as Markdown, JSON, or even Slack-formatted messages
- **Import**: Paste JSON arrays or Markdown lists directly

No vendor lock-in. Your tasks are just data.

### Framework Support

Currently supporting:
- **React** - Full TypeScript support with hooks and context
- **Vue** - Composition API with full reactivity

More frameworks coming soon.

### Why I Built This

Traditional todo apps are designed for project managers and productivity gurus. They're packed with features I don't need and missing the ones I do.

I needed something that:
- ✅ Works with my development workflow, not against it
- ✅ Stays visible without requiring app switching
- ✅ Is fast to capture thoughts (CLI speed with GUI persistence)
- ✅ Doesn't require internet or cloud sync
- ✅ Respects my data ownership
- ✅ Integrates with AI without being dependent on it

btwfyi is that tool.

### The Two-System Approach

Now I use both systems in tandem:

1. **CLI todo** (from Part One) - For quick capture, time-based reminders, and terminal-first workflows
2. **btwfyi** - For persistent awareness, GUI-based work, and complex task organization

When a task is time-sensitive or needs a notification, it goes into the CLI system. When a task needs to stay visible while I work, it goes into btwfyi.

Sometimes tasks exist in both places, and that's okay. The redundancy actually helps - if I forget to check one, the other catches me.

### Installation

```bash
npm install @remcostoeten/btwfyi
# or
pnpm add @remcostoeten/btwfyi
# or
yarn add @remcostoeten/btwfyi
```

### Real-World Usage

Here's how I actually use it day-to-day:

```tsx
const workCategories: CategoryConfig[] = [
  {
    id: "today",
    displayName: "Today's Focus",
    items: [
      { text: "Finish blog post #writing !high", action: "add" },
      { text: "Review PR #347 #code-review", action: "review" },
      { text: "Fix Vigilo positioning bug #bugfix !urgent", action: "fix" },
    ],
  },
  {
    id: "this-week",
    displayName: "This Week",
    items: [
      { text: "Refactor auth flow #refactor", action: "refactor" },
      { text: "Set up CI/CD for new project #devops", action: "setup" },
    ],
  },
];

function DevLayout() {
  return (
    <>
      <Btwfyi 
        category="today"
        categories={workCategories}
        enabled={process.env.NODE_ENV === 'development'} 
        position="top-right"
      />
      {/* Rest of your app */}
    </>
  );
}
```

The overlay sits in the top-right corner of my screen, always showing me what I should be working on. When I complete a task, one click marks it done. When I think of a new task, `Alt + K` opens the command palette and I can add it instantly.

### The Bottom Line

If you're neurodivergent, have ADHD, or just struggle with keeping track of tasks across multiple contexts - give btwfyi a try. It's designed by someone who gets it, for people who get it.

The source code is on [GitHub](https://github.com/remcostoeten/btwfyi), and the package is on npm as `@remcostoeten/btwfyi`.

No tracking, no telemetry, no cloud dependency. Just a tool that helps you remember what you need to do, when you need to remember it.

Because sometimes, the best productivity system is the one that meets you where you already are.
