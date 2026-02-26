---
title: "How I keep track of tasks when todo apps do not work for me"
publishedAt: "05-01-2026"
summary: "Conventional todo apps assume you will open them. I do not, so I built systems that force tasks into my workflow instead."
tags: ["Engineering", "Blog", "Personal", "Productivity"]
---

Todo lists seem to hate me. I've tried everything: Jira (still recovering from that), GitLab, Linear, and Kanban boards. They either add friction or feel bloated. I needed something that actually worked with how I operate.

My brain runs on an F1 car engine with a bus driver license. I want to do too much at once. There have been days where I have five IDEs open while writing specs for a new project. On those days I get a lot done, but too little of what I planned.

I like writing on physical paper, but I do not like reading it. Post-its fall off. So I ended up building systems that force reminders into places I cannot ignore.

Since I spend half my day in the CLI tweaking dotfiles anyway, I realized that is the one place I always look. Why not show tasks every time my shell loads?

### CLI Workflow

The simplest task creation is:

```bash title="/home/$USER/.config/dotfiles/scripts/todo.js"
todo "Some text goes here"
```

It writes tasks to JSON and supports richer scheduling and reminders:

```bash title="/home/$USER/.config/dotfiles/scripts/todo.js"
❯ todo --help

┌──────────────────────────────────────────────────────────────┐
│                          TODO MANAGER                        │
└──────────────────────────────────────────────────────────────┘

QUICK START
────────────────────────────────────────────────────────────────
  todo                                Show upcoming tasks
  todo interactive                    Launch interactive menu
  todo "Buy milk" 5pm                 Quick create task

CREATE
────────────────────────────────────────────────────────────────
  todo <task> [time] [flags]          Create a new task

  Flags:
    !, --important                    Mark as important
    --r <mins>                        Reminder offset in minutes

  Examples:
    todo "Meeting" tomorrow 10am      Standard task
    todo !"Important" 5pm             Important task

MANAGEMENT
────────────────────────────────────────────────────────────────
  todo list                           List pending tasks
  todo list --overdue                 Show overdue tasks
  todo list --upcoming                Show upcoming tasks
  todo search <keyword>               Search tasks
  todo done <id>                      Mark task as completed
  todo edit <id> "new desc"           Edit description

  Trash:
    todo deleted [keyword]            List or search deleted tasks
    todo restore <id>                 Restore deleted task
    todo purge-deleted                Empty trash permanently

  Cleanup:
    todo delete <id>                  Delete specific task
    todo delete --all                 Delete all except important
    todo delete --overdue             Delete overdue tasks

  Stats:
    todo count                        Show pending task count

TIME FORMATS
────────────────────────────────────────────────────────────────
  Relative        1h, 20m, 2d, in 3h
  Clock           3pm, 15:30, 09:00
  Date            2025-12-25 14:00
  Keywords        tomorrow, this week
  Reminders       --r 10,30            Minutes before due time

Tip: run `todo interactive` for the full TUI experience.
```

A task can be as simple as `todo "Buy milk"` or as specific as `todo "Meeting with the team" 10am --r 15 !`.

When my shell starts, the first thing I see is:

```bash
Tasks (2)
[IMPORTANT] Meeting with the team  · 10:00 AM  · ⏰ 15m   (56ac0a60)
Buy milk                                             (b2744f62)
────────────────────────────────────────────────────────────────
2 open tasks · 1 important
```

Time passes whether I interact with the system or not, and tasks age with it.

When something slips, it does not scream with notifications or badges. It simply becomes overdue.

```bash
Tasks (2)
[IMPORTANT][OVERDUE] Meeting with the team  · 10:00 AM  · due 3d ago   (56ac0a60)
Buy milk                                                   (b2744f62)
────────────────────────────────────────────────────────────────
2 open tasks · 1 important · 1 overdue
```

On desktop, I get optional OS notifications with sound. Mobile was trickier. I implemented a workaround on iPhone by subscribing to public channels to mirror CLI tasks to push notifications. It works, but I still want a more private setup.

### CLI Examples

- `todo "Task" 3pm` creates a task due at 3pm
- `todo "Task" 3pm --r 10,30` creates reminders 10 and 30 minutes before
- `todo list` lists pending tasks
- `todo list --overdue` shows only overdue tasks
- `todo list --upcoming` shows tasks due soon
- `todo done <id>` marks a task as completed
- `todo edit <id> "New description"` edits a task
- `todo count` shows pending task count

### GUI Counterpart: btwfyi

I also built a tool for frontend work: [**btwfyi**](https://github.com/remcostoeten/btwfyi).

It is a lightweight task awareness overlay for development environments. Think sticky notes, but tied to actual UI elements. The idea is simple: render `<Btwfyi />` with tasks, then position, minimize, and connect task items directly to interface elements.

By default it renders in dev mode, and it also supports database adapters for team workflows.

`bun install btwfyi` to try it.

<Video src="/fyidemo.webm" height="450" loop muted autoPlay className="my-8" />
