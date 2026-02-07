---
<<<<<<< HEAD
title: "How I keep track of tasks when todo apps do not work for me"
publishedAt: "05-01-2026"
summary: "Conventional todo apps assume you will open them. I do not, so I built systems that force tasks into my workflow instead."
tags: ["Engineering", "Personal", "Productivity"]
---
I have tried more than enough in all sizes and shapes and have finally accepted that traditional todo apps do not work for me. I start very excited configuring for hours and finally adding tasks. And right when that task is done, things break for me.
=======
title: 'How I keep track of my tasks since conventional methods do not work for me'
publishedAt: '05-01-2026'
summary: "Conventional methods for keeping track of your tasks don't work for me so I invented a system which makes it impossible to forget"
tags: ['Engineering', 'Blog', 'Personal', 'Productivity']
---

Todo lists seem to hate me. I've tried everything—Jira (still recovering from that), GitLab, Linear, Kanban—but they all add friction or feel bloated. My first five professional years caused real harm due to having to use Jira. I needed something that actually worked with how I operate.
>>>>>>> 7056ada (chore: add prettier formatting and format entire codebase)

My brain runs on a F1 car engine with a busdriver license. I want to do too much at once. There have been days where I have five IDE's open and at the same time writing out a spec for a new project. On those days I do A LOT, but too little of what I had planned. I like writing on physical paper, but I do not like reading it. Post-its fall off easily so I got to thinking and came up with methods that force me to keep getting reminded.

**Since I spend half my day in the CLI tweaking dotfiles anyway, I realized that's the one place I can't ignore.** Why can't I render my tasks every time I load my shell? So I wrote a JS script that allowed me to simply do:

<<<<<<< HEAD
```bash title="/home/$USER/.config/dotfiles/scripts/todo.js"
todo "Some text goes here"
=======
```shell:terminal
remcostoeten.nl on  blog [$] via 🥟 v1.3.3
❯ todo
########    ######   ######     ######    ######
   ##      ##    ##  ##   ##   ##    ##  ##
   ##      ##    ##  ##    ##  ##    ##   #####
   ##      ##    ##  ##    ##  ##    ##       ##
   ##      ##    ##  ##   ##   ##    ##  ##   ##
   ##       ######   ######     ######    #####

 ▶ (1) Create todo
   (2) Delete todo
   (3) Edit todo
   (4) Search tasks
   (5) View deleted
   (6) Restore task
   (7) Purge deleted
   (8) Help
   (9) Exit

 Use arrow keys or number keys (1-9) to navigate
>>>>>>> 7056ada (chore: add prettier formatting and format entire codebase)
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

<<<<<<< HEAD
As you can see it can be as simple as just typing `todo "Buy milk"` or as complex as `todo "Meeting with the team" 10am --r 15 !`. which effectively means "Meeting with the team" at 10am with a reminder 15 minutes before and mark it as important.
=======
The simplest form of a task creation is simply typing `todo "Some text goes here"`. Some tasks do need due dates so I have a flexible argument as well. We could add onto it `todo "Some text goes here" 3pm` or `todo "Some text goes here" tomorrow`
>>>>>>> 7056ada (chore: add prettier formatting and format entire codebase)

If I launch my shell the first thing I see is:

```bash
Tasks (2)
[IMPORTANT] Meeting with the team  · 10:00 AM  · ⏰ 15m   (56ac0a60)
Buy milk                                             (b2744f62)
────────────────────────────────────────────────────────────────
2 open tasks · 1 important

<<<<<<< HEAD
=======
Check out this [[demo: example-project, title="CLI Demo Preview", trigger="hover"]] to see how it works in practice!

### Example Usage

Let's create a task with different time formats:

```bash:terminal
$ todo "Review pull request #347" 2h --r 10,30
Task created: Review pull request #347
>>>>>>> 7056ada (chore: add prettier formatting and format entire codebase)
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

<<<<<<< HEAD
Obviously it got way out of  hand with instead of some local storage I provide database adapters for teams who want to use it in a team setting. More on that in the future or check out the [Btwfyi](https://github.com/remcostoeten/btwfyi)
=======
- `todo "Task" 3pm` - Create a task due at 3pm
- `todo "Task" 3pm --r 10,30` - Create with reminders at 10 and 30 minutes before
- `todo list` - List all pending tasks
- `todo list --overdue` - Show only overdue tasks
- `todo list --upcoming` - Show tasks due in less than 30 minutes
- `todo done <id>` - Mark a task as completed
- `todo edit <id> "New description"` - Edit a task
- `todo count` - Show the number of pending tasks

When I start my shell, the script automatically shows the first 5 pending tasks, color-coded by urgency. Overdue tasks show in red, upcoming tasks in yellow, and the rest in a neutral color.

The key insight is that the system integrates with my existing workflow rather than requiring me to constantly check a separate app. I'm already in the terminal, so adding a task is just a quick command away. The visual feedback in my shell prompt and the system notifications ensure tasks stay top-of-mind without requiring me to constantly check a separate app.

### The GUI Counterpart: btwfyi

While my CLI todo system works beautifully for terminal-based workflows, I found myself asking how to make it even more obvious. Right, in your face on the frontend. As that is where I spend a lot of my time. Now I can't miss a task!

That's when I built [**btwfyi**](https://github.com/remcostoeten/btwfyi). It's a lightweight task awareness overlay designed specifically for development environments. Think of it as a persistent sticky note layer that sits on top of your interface, helping to prevent "out of sight, out of mind" amnesia.

Whilst by default only renders in dev, I have built a database adapter allowing it to integrate in any database sharing tasks, and state position of where the user left off with team members.

The idea is simple, you call the <Btwfyi /> and pass an array of tasks to it. It will render the element with tasks. It has options on the frontend to minimize, hide and change all UI behavior. You can freeroam drag and drop the element to your liking. If right click is pressed, it will attach a connector line to your cursor, allowing you to drag and drop the element to your liking which then will create a connector line between the task and the element. Handy for if you have visual cues. This also works perfectly with moving tasks to other positions.

Furthermore there is a detail view and cmd + k. And loads more. I've provided a llm.txt file in the package so your AI will one shot it and get up to speed. `bun install btwfyi` and view the docs and repository here: [btwfyi](https://github.com/remcostoeten/btwfyi)

<Video src="/fyidemo.webm"  height="450" loop muted autoPlay className="my-8" />
>>>>>>> 7056ada (chore: add prettier formatting and format entire codebase)
