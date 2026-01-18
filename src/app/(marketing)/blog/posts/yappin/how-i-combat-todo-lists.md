---
title: 'How I keep track of my tasks since conventional methods do not work for me'
publishedAt: '05-01-2026'
summary: "Conventional methods for keeping track of your tasks don't work for me so I invented a system which makes it impossible to forget"
tags: ["Engineering", "Blog", "Personal", "Productivity"]
---
Todo lists seem to hate me. I've tried everything—Jira (still recovering from that), GitLab, Linear, Kanban—but they all add friction or feel bloated. My first five professional years caused real harm due to having to use Jira. I needed something that actually worked with how I operate.

I spend nearly 50% of my time in the shell using Neovim, and I'm obsessed with optimizing my [dotfiles](https://github.com/remcostoeten/dotfiles). So instead of forcing myself to use a GUI tool I hate, I decided to build a system that lives where I do: the CLI.

The script is written in JavaScript/Bun and provides a simple but powerful interface for managing tasks. When you run it without arguments, you get a nice ASCII-art menu:

```shell
remcostoeten.nl on  blog [$] via 🥟 v1.3.3 
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
```

Every time I open a new shell, it shows me my tasks. I created three examples and this is how it looks upon opening a new shell (the ascii intro is not part of the script):

```bash
 ██████╗ ███████╗███╗   ███╗ ██████╗ ██████╗
  ██╔══██╗██╔════╝████╗ ████║██╔════╝██╔═══██╗
  ██████╔╝█████╗  ██╔████╔██║██║     ██║   ██║
  ██╔══██╗██╔══╝  ██║╚██╔╝██║██║     ██║   ██║
  ██║  ██║███████╗██║ ╚═╝ ██║╚██████╗╚██████╔╝
  ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝

  └─ updated 5 days ago ·26·01·07  │ launch[df] →dotfiles menu  │ 
ð Tasks (3)
  [IMPORTANT] This is  a task comming up - due in 58m (56ac0a60) (1/12/2026 12:33 AM)
  Something for tomorrow - due in 23h 58m (31850611) (1/12/2026 12:33 AM)
  A example todo (0fc11439) (1/12/2026 12:33 AM)

dotfiles on  master [!?⇕] is 📦 v1.0.0 via 🥟 v1.3.
```

The simplest form of a task creation is simply typing `todo "Some text goes here"`. Some tasks do need due dates so I have a flexible argument as well. We could add onto it `todo "Some text goes here" 3pm` or `todo "Some text goes here" tomorrow` 

You can specify due times in whatever format feels natural - relative times like `1h` or `2d`, clock times like `3pm` or `15:30`, full date-time stamps like `2025-12-25 14:00`, or even keywords like `tomorrow` or `this week`. Add `--r 10,30` to set reminders at 10 and 30 minutes before the task is due.

Tasks are stored in `~/.dotfiles/todo/tasks.json` as plain JSON, making them easy to backup, sync, or even edit manually if needed. `.dotfiles` is just a location where I personally store all temporary or cache data coming from scripts and tooling. I debated going for SQLite but figured JSON was easy, fast and good enough for this usecase.

Check out this [[demo: example-project, title="CLI Demo Preview", trigger="hover"]] to see how it works in practice! 

### Example Usage

Let's create a task with different time formats:

```bash
$ todo "Review pull request #347" 2h --r 10,30
Task created: Review pull request #347
```

This creates a task due in 2 hours with reminders at 10 and 30 minutes before. When we list our tasks:

```bash
$ todo list
[IMPORTANT] This is a task coming up - due in 51m (56ac0a60)
Review pull request #347 - due in 1h 59m (e53327a6)
Something for tomorrow - due in 23h 51m (31850611)
A example todo (0fc11439)
create test (5e0ceea6)
```

The tasks are color-coded by urgency (overdue in red, upcoming in yellow) and show the remaining time until they're due.

### CLI Commands

The script supports several commands for quick task management:

* `todo "Task" 3pm` - Create a task due at 3pm
* `todo "Task" 3pm --r 10,30` - Create with reminders at 10 and 30 minutes before
* `todo list` - List all pending tasks
* `todo list --overdue` - Show only overdue tasks
* `todo list --upcoming` - Show tasks due in less than 30 minutes
* `todo done <id>` - Mark a task as completed
* `todo edit <id> "New description"` - Edit a task
* `todo count` - Show the number of pending tasks

When I start my shell, the script automatically shows the first 5 pending tasks, color-coded by urgency. Overdue tasks show in red, upcoming tasks in yellow, and the rest in a neutral color.

### Why This Works

The key insight is that the system integrates with my existing workflow rather than requiring me to switch contexts. I'm already in the terminal, so adding a task is just a quick command away. The visual feedback in my shell prompt and the system notifications ensure tasks stay top-of-mind without requiring me to constantly check a separate app.

![07-30 60fps demo](../../../../public/07-30_60fps_cropped.gif)

![07-30 demo](../../../../public/07-30_cropped.gif)
