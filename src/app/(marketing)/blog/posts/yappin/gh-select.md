---
title: 'gh-select 2.5.0 has just been released'
publishedAt: '10-03-2026'
updatedAt: '10-03-2026'
summary: 'gh-select 2.5.0 is out. Smarter search, rate limits, clones found anywhere, a redesign and new themes.'
tags: ['Personal', 'CLI', 'Go', 'Open Source']
topic: 'Personal'
author: 'Remco Stoeten'
slug: 'gh-select'
draft: false
---

gh-select 2.5.0 has just been released.

<Video src="/gh-select-demo.mp4" loop muted autoPlay playsInline className="my-8" />

It's a `gh` extension that lists your repos, your starred repos and all of GitHub in one searchable list. Pick one to clone, open or pull it, read its releases, or browse its files without cloning. Mark folders and it clones only those.

Since 2.4.0 I've added:

- Search that takes `owner/repo`, `owner repo`, URLs, SSH remotes and whole `git clone` commands
- `gh select limits` to see your API rate limits
- Local clones found anywhere under your home dir
- A redesign with aligned columns and Nerd Font icons
- Five new themes plus custom themes
- Fork tags and every language a repo uses in the details
- Every command as `limits`, `-l` or `--limits`, with typo suggestions

## examples

```bash
cli lang:go is:mine
is:local is:fork
git clone https://github.com/charmbracelet/bubbletea
```

In the file browser: `space` marks, `c` partial clones, `s` saves without git, `b` switches branch or tag.

## usage

```bash
gh select doctor
gh select limits
gh select refresh
gh select -d ~/dev
gh select -p
```

`-p` prints the picked repo's path, so you can cd into any repo:

```bash
ghcd() { local dir; dir=$(gh select --print-path) && cd "$dir"; }
```

## install

```bash
gh extension install remcostoeten/gh-select
```

## links

- [Repo](https://github.com/remcostoeten/gh-select)
- [Release notes](https://github.com/remcostoeten/gh-select/releases/tag/v2.5.0)
- [Changelog](https://github.com/remcostoeten/gh-select/blob/master/CHANGELOG.md)

## all features

### finding repos

- One list of your own, org, collaborator and starred repos, plus all of GitHub
- Search by name, owner, `owner/repo`, URL, SSH remote or a pasted `git clone` command
- Filter with `lang:`, `is:public`, `is:private`, `is:fork`, `is:source`, `is:local` and `is:mine`
- Local clones found anywhere under your home dir, including worktrees and submodules
- A cached repo list with a configurable TTL

### working with a repo

- Clone, open or pull from the action menu
- Browse any public repo's files, with previews and rendered markdown
- Clone only the folders you mark, or save files without git
- Copy file contents, permalinks or raw URLs
- Switch branch or tag
- Read releases and their notes. The build for your machine is preselected, checksummed and unpacked
- Delete repos you own, one at a time or in bulk, after retyping to confirm

### look and keys

- `ctrl+s` sorts, `ctrl+t` switches themes, `?` shows every key and your rate limits
- Ten built-in themes in light and dark, or your own as JSON
- Borders, transparency and Nerd Font icons

### commands and install

- `doctor`, `limits`, `refresh`, `version` and `help` work as words or flags, with typo suggestions
- `--print-path` lets you cd into any repo with one shell function
- Set your clone dir once in the config
- Runs as a `gh` extension, a standalone binary or via `go install`
- Works on macOS, Linux, Windows and FreeBSD
