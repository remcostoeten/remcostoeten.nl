---
title: 'I turned my rofi launcher into a config playground'
publishedAt: '2026-04-29'
updatedAt: '2026-04-29'
summary: 'I rebuilt my rofi launcher so it can handle app search, scoped file search, bang commands, and a config menu from inside the UI.'
tags: ['Personal', 'Tooling', 'Rofi', 'Workflow']
topic: 'Personal'
author: 'Remco Stoeten'
slug: 'rofi-launcher-power-user-mode'
draft: false
---

I keep ending up with the same kind of tool: something that starts as a launcher
and slowly becomes a small control surface for my machine.

This one started because I wanted a better rofi launcher for my dotfiles. It
ended up becoming a place where I can launch apps, search files, jump into
config, and define custom commands without opening a separate app.

## What it is

The launcher now does a few different jobs:

- normal app search as you type
- prefix-based file search after `Enter`
- bang commands like `!web` or `!shutdown`
- a `:config` menu for opening the launcher config files
- a visible settings entry so the options are obvious in the UI

It is still rofi, but it behaves more like a small command palette with a few
specific modes.

## How to get it

The source lives in my dotfiles repo once I push it:

- `bin/launcher`
- `configs/rofi/README.md`
- `configs/rofi/raycast.rasi`
- `configs/rofi/pinned-apps`
- `configs/rofi/bang-commands.lua`

The live files on the machine are in `~/.config/rofi/`.

## How it works

The main idea is simple:

- typing normally filters apps live
- entering a prefix switches to a different action
- pressing `Enter` tells the launcher to run that action

That matters because rofi script mode does not stream every keystroke back into
the script. So I made the UI spell that out instead of pretending it is live
search everywhere.

The current prefixes are:

- `:` for launcher commands
- `:config` for config files and editor shortcuts
- `/` for folder scopes
- `/path query` for scoped filename search
- `*.md` for filename search in home
- `**text` for content search in home
- `!bang args` for custom commands from Lua

## What I added

The part I like most is the `bang-commands.lua` file. That gives me a tiny,
data-driven way to map a shortcut to an action.

For example:

```lua
return {
  {
    bang = '!web',
    type = 'url',
    template = 'https://www.google.com/search?q={query}',
    description = 'Search the web',
  },
}
```

That means I can type:

```text
!web rofi script mode
```

and it turns into the configured command.

I also added `:config`, so I can do things like:

- `:config`
- `:config nvim`
- `:config code`
- `:config zed`

That keeps the config files close to the launcher itself, which is the whole
point of this kind of setup.

## The UI part

I wanted the launcher to stop hiding the important stuff.

So the UI now keeps a visible hint bar for the available modes, and there is a
settings row right in the main list. The point is not to be clever. The point is
to make the available paths obvious without making me remember them.

## Why I built it

Mostly because I wanted one place where I could:

- open apps quickly
- reach config files without hunting through paths
- define my own commands
- keep the whole thing inside the same launcher instead of splitting it into
  five tools

That is enough for me.

I like tools that become more useful the longer I use them, not tools that need
their own onboarding story.
