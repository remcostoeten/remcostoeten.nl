---
title: 'I turned my rofi launcher into a simple control center'
publishedAt: '2026-04-29'
updatedAt: '2026-04-29'
summary: 'I rebuilt my rofi launcher so it works as one place to open apps, search files, run commands, and jump into settings.'
tags: ['Personal', 'Tooling', 'Rofi', 'Workflow']
topic: 'Personal'
author: 'Remco Stoeten'
slug: 'rofi-launcher-power-user-mode'
draft: false
---

I was looking for something similar to Raycast or Spotlight, came across rofi, but rofi never quite fit that role out of the box.

So I adjusted it until it did.

![Rofi Launcher Power User Mode](/images/rofi-power-user-mode.png)
*My rofi setup showing the different available modes and commands right in the UI.*

## What it does

The launcher now handles a few common tasks:

- search and open apps as you type
- search for files
- run quick commands like opening a website or shutting down
- open config files directly from a menu
- show available options clearly in the UI

You can think of it like a mix between Spotlight, Raycast, and a settings panel, but built on top of rofi.

## How it works

The idea is simple:

- you type something
- you can add a small prefix to tell it what you mean
- press Enter to run it

Some examples:

- typing normally searches apps
- `!web cats` searches the web
- `/documents report` searches inside a folder
- `:config` opens config shortcuts

Instead of trying to guess everything, the launcher makes these options visible so you do not have to remember them.

## Custom commands

One of the more useful parts is a small file where I define my own commands.

Example:

~~~lua
return {
  {
    bang = '!web',
    type = 'url',
    template = 'https://www.google.com/search?q={query}',
    description = 'Search the web',
  },
}
~~~

This lets me type:

~~~text
!web rofi script mode
~~~

and it automatically turns that into a Google search.

You can add your own commands the same way.

## The UI

I changed the interface to make things more obvious:

- there is a hint bar showing what you can do
- there is a visible settings option in the list

The goal is not to be clever, but to make it clear what is possible without needing to remember shortcuts.

## Why I built it

Mostly to keep everything in one place:

- open apps quickly
- find files without digging through folders
- access configs without thinking about paths
- run small custom commands

Instead of using multiple tools, this keeps it all inside one launcher.

You can find the code and configs for this setup in my [dotfiles](https://github.com/remcostoeten/dotfiles/tree/master/configs/rofi).

That is enough for me.