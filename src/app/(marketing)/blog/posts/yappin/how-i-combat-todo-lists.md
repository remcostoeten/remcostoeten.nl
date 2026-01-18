---
title: "How I keep track of tasks when todo apps do not work for me"
publishedAt: "05-01-2026"
summary: "Conventional todo apps assume you will open them. I do not, so I built systems that force tasks into my workflow instead."
tags: ["Engineering", "Personal", "Productivity"]
---
I have tried more than enough in all sizes and shapes and have finally accepted that traditional todo apps do not work for me. I start very excited configuring for hours and finally adding tasks. And right when that task is done, things break for me.

My brain runs on a F1 car engine with a busdriver license. I want to do too much at once. There have been days where I have five IDE's open and at the same time writing out a spec for a new project. On those days I do A LOT, but too little of what I had planned. I like writing on physical paper, but I do not like reading it. Post-its fall off easily so I got to thinking and came up with methods that force me to keep getting reminded.

**Since I spend half my day in the CLI tweaking dotfiles anyway, I realized that's the one place I can't ignore.** Why can't I render my tasks every time I load my shell? So I wrote a JS script that allowed me to simply do:

```bash title="/home/$USER/.config/dotfiles/scripts/todo.js"
todo "Some text goes here"
```

And it would add a task to a JSON file written via FS.

### Options

This obviously is not a lot. Some more options regarding due dates, reminders, importance would be viable. It has grown to have quite some features.

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

As you can see it can be as simple as just typing `todo "Buy milk"` or as complex as `todo "Meeting with the team" 10am --r 15 !`. which effectively means "Meeting with the team" at 10am with a reminder 15 minutes before and mark it as important.

If I launch my shell the first thing I see is:

```bash
Tasks (2)
[IMPORTANT] Meeting with the team  · 10:00 AM  · ⏰ 15m   (56ac0a60)
Buy milk                                             (b2744f62)
────────────────────────────────────────────────────────────────
2 open tasks · 1 important

```

Time passes, whether I interact with the system or not. And the tasks age with it.

When something slips, it does not scream at me with notifications or badges. It simply becomes overdue.

```bash
Tasks (2)
Tasks (2)
[IMPORTANT][OVERDUE] Meeting with the team  · 10:00 AM  · due 3d ago   (56ac0a60)
Buy milk                                                   (b2744f62)

────────────────────────────────────────────────────────────────
2 open tasks · 1 important · 1 overdue
```

**On the desktop, it's simple:** I get an OS notification with an optional sound.

**Mobile was trickier.** I needed a way to be reminded when I'm away from the keyboard. I successfully implemented a workaround using an iPhone app that subscribes to public channels, effectively pushing my CLI tasks to my phone. It works, but the 'public' aspect makes me nervous, so I'm still scouting for more private options.

If that wasn't enough, **I built a tool specifically for my frontend work.** It's an NPM package that renders a development overlay, drawing a literal flowchart line from a task to the specific UI element in the DOM it belongs to. It points right at the bug or feature I need to build, so I truly can't miss it.

Obviously it got way out of  hand with instead of some local storage I provide database adapters for teams who want to use it in a team setting. More on that in the future or check out the [Btwfyi](https://github.com/remcostoeten/btwfyi)
