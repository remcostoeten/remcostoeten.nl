---
title: 'I rewrote gh-select in Go'
publishedAt: '10-06-2026'
updatedAt: '10-06-2026'
summary: 'gh-select started as a 600 line Bash script that needed fzf and jq. It is now a precompiled Go binary with a file tree browser, partial clones, releases, themes and a one command install.'
tags: ['CLI', 'Go', 'Open Source', 'GitHub']
topic: 'Engineering'
author: 'Remco Stoeten'
slug: 'gh-select-go-rewrite'
draft: true
---

gh-select is now a Go program, and the install is one command: `gh extension install remcostoeten/gh-select`. It no longer needs `fzf` or `jq`, and it does a lot more than the Bash script it replaces.

<Video src="/gh-select-install-clone.mp4" loop muted autoPlay playsInline className="my-8" />

## Why I built it

I have dozens of repos, and `gh` has one way to clone them: `gh repo clone owner/repo`. I never remember the exact repo name, so I'd open GitHub, find it, copy it, go back to the terminal and paste it. That's a lot of steps for a clone.

The other annoyance is big repos. Sometimes I only want one folder, like the examples of some library. You can do that with `git clone --filter=blob:none --sparse` and a sparse checkout, but I never remember the flags either, so I cloned the whole thing and deleted the rest.

`gh` supports extensions, programs called `gh-something` that you run as `gh something`. `gh extension browse` lists them, and so does the [gh-extension topic page](https://github.com/topics/gh-extension). None of them fixed this, so I wrote gh-select.

## What it does

`gh select` opens one searchable list of your repositories, your starred repos or all of GitHub. Pick a repo to clone it, open it, read its releases or browse its files without cloning. Mark folders and it clones only those.

The first version, 1.0.0, was a Bash script that piped `gh` output through `jq` into `fzf`. It could pick a repo, clone it, copy its URL and open it in the browser. That was the whole feature set.

## Why Bash stopped working

The script grew to 604 lines, and every feature needed another shell trick.

- **Dependencies**: you needed `fzf`, `jq`, `gh` and `git` installed before the first run.
- **Installation**: the script came with its own installer and uninstaller, which copied files around instead of using `gh extension install`.
- **Interface**: `fzf` draws a list. A tree browser with key hints, a details panel and a confirmation screen for deleting repos is a different kind of program.

I could keep stacking `fzf` flags or write a real interface. I picked the second.

## What changed in the rewrite

The Go version talks to GitHub through `go-gh`, which reuses your `gh auth login` session, and draws the interface with Bubble Tea. Releases ship a binary for macOS, Linux, Windows and FreeBSD, so `gh extension install` downloads a finished executable and nothing compiles on your machine.

Three features exist because a real interface made them possible:

- **File tree browser**: one recursive tree API call loads the whole repo. You preview files, with markdown rendered, before cloning anything.
- **Partial clone**: mark folders with `space`, press `c`, and gh-select runs `git clone --filter=blob:none --sparse` followed by a cone mode sparse checkout.
- **Always on search**: the search box is focused from the first frame, and `tab` switches between your repos, your starred repos and GitHub search.

## Speed

The list now renders from a cache on startup and refreshes in the background. This is a stale-while-revalidate cache, so you see your repos before the network answers.

The biggest measured gain came from the query, not the language. Fetching `defaultBranchRef` on every repo cost about 3.5 s per page of results. Dropping that field brought it to about 1.4 s per page. Tree browsing and cloning use `HEAD` instead of the default branch name. I haven't benchmarked Go against the old Bash script end to end, so I won't put a number on that.

## What I added after the rewrite

The releases since the rewrite added the features that now fill most of the README:

- **Starred repos**, with sort and filter tokens such as `lang:go is:mine`.
- **Branches and tags** in the tree browser, plus links to the file on github.com, a permalink pinned to the current commit, and the raw URL.
- **Releases**: notes, assets, a preselected build for your OS and CPU, checksum verification and unpacking of `.tar.gz`, `.tgz`, `.tar.bz2` and `.zip` archives.
- **Local clones** found anywhere under your home directory, including worktrees and submodules, with open in editor and pull in their menu.
- **Bulk delete** for repos you own, behind a retyped confirmation.
- **Search** that takes `owner/repo`, URLs, SSH remotes and whole `git clone` commands.
- **API rate limits** with `gh select limits`.
- **Ten built in themes** and custom themes in `~/.config/gh-select/themes/`.
- **`--print-path`**, which prints the picked repo's path so a shell function can `cd` into it.

## Install

You need [GitHub CLI](https://cli.github.com/) logged in with `gh auth login`, and `git`.

```bash
gh extension install remcostoeten/gh-select
gh select
```

Upgrade with `gh extension upgrade gh-select`. If you don't use `gh` extensions, download the binary for your platform from the [latest release](https://github.com/remcostoeten/gh-select/releases/latest) or run `go install github.com/remcostoeten/gh-select@latest`.

To jump into a repo after picking it, add this to your shell config:

```bash
ghcd() { local dir; dir=$(gh select --print-path) && cd "$dir"; }
```

Quitting without a pick exits with status 130, so `cd` never runs on an empty path.

The source and the full changelog are in the [gh-select repository](https://github.com/remcostoeten/gh-select).
