---
title: 'I shipped the perfect keyboard shortcut hook'
publishedAt: '2024/12/24'
updatedAt: '2026/02/21'
summary: 'Keyboard shortcuts should read like intent, not config. I built @remcostoeten/use-shortcut to make that happen with a fluent, chainable, type-safe API.'
tags: ['Engineering', 'Open Source', 'React', 'DX']
author: 'Remco Stoeten'
canonicalUrl: 'https://remcostoeten.nl/blog/engineering/use-shortcut-release'
slug: 'use-shortcut-release'
draft: false
---

I am a keyboard centered user, and in pretty much every project I build I rely on shortcuts to move faster.

Writing shortcut logic is not hard. Writing shortcut logic that stays readable after a few months is the hard part.

A lot of libs pushed me toward string parsing or config objects. I wanted syntax that reads like intent.

So I built [`@remcostoeten/use-shortcut`](https://www.npmjs.com/package/@remcostoeten/use-shortcut): a React hook with a fluent, chainable API.

## quick start

```bash
bun add @remcostoeten/use-shortcut
# or: npm i @remcostoeten/use-shortcut
# or: pnpm add @remcostoeten/use-shortcut
```

```tsx
import { useShortcut } from '@remcostoeten/use-shortcut'

function Editor() {
	const $ = useShortcut()

	$.mod.key('s').on(saveDocument)
	$.mod.key('k').on(openSearch)
	$.shift.key('/').on(toggleHelp)

	return null
}
```

That is basically the whole idea: short, readable chains.

## try it live

You can test the shortcuts below directly in this post:

<UseShortcutSyntaxLab />

## why I built this

### 1) fluent, explicit syntax

I wanted shortcut code to be obvious at a glance.

```tsx
// common pattern
useHotkeys('cmd+k', toggleSearch)

// this library
$.cmd.key('k').on(toggleSearch)
```

It is explicit about modifiers and key, and TypeScript guides you through each step.

### 2) cross platform `.mod`

`Command` on Mac vs `Control` on Windows/Linux is always a pain.

`.mod` handles that automatically:

- macOS -> `cmd`
- Windows/Linux -> `ctrl`

```tsx
$.mod.key('s').on(e => {
	e.preventDefault()
	saveDocument()
})
```

### 3) smart exceptions

Global shortcuts are great until users are typing in an input.

```tsx
$.key('/').except('typing').on(focusSearch)
```

Built in presets:

- `'input'` for `input`, `textarea`, `select`
- `'editable'` for `contentEditable`
- `'typing'` for input + editable
- `'modal'` when a modal/dialog is open
- `'disabled'` for disabled focused targets

You can also pass multiple presets or a custom predicate:

```tsx
$.key('/').except(['input', 'modal']).on(handler)
$.key('k').except(e => e.target?.classList?.contains('no-shortcuts') === true).on(handler)
```

## syntax reference

### Modifiers

```tsx
$.ctrl.key('s')
$.shift.key('enter')
$.alt.key('n')
$.cmd.key('k')
$.mod.key('k')
$.ctrl.shift.key('p')
$.cmd.shift.alt.key('a')
```

### Supported keys

- Letters: `'a'` to `'z'`
- Numbers: `'0'` to `'9'`
- Function keys: `'f1'` to `'f12'`
- Navigation: `'up'`, `'down'`, `'left'`, `'right'`, `'arrowup'`, `'arrowdown'`, `'arrowleft'`, `'arrowright'`, `'home'`, `'end'`, `'pageup'`, `'pagedown'`
- Special: `'enter'`, `'return'`, `'escape'`, `'esc'`, `'space'`, `'tab'`, `'backspace'`, `'delete'`, `'del'`, `'insert'`
- Symbols: `'minus'`, `'plus'`, `'equal'`, `'equals'`, `'bracketleft'`, `'bracketright'`, `'backslash'`, `'slash'`, `'/'`, `'comma'`, `'period'`, `'semicolon'`, `'quote'`, `'backtick'`

### Handler APIs

```tsx
$.mod.key('s').on(save, {
	preventDefault: true,
	stopPropagation: false,
	delay: 100,
	disabled: false,
	description: 'Save doc',
	except: 'typing'
})

$.mod.key('k').handle({
	handler: openSearch,
	preventDefault: true,
	except: ['input', 'modal']
})
```

### Return value from `.on()`

```tsx
const save = $.mod.key('s').on(saveDocument)

save.display
save.combo
save.isEnabled
save.enable()
save.disable()
save.trigger()
save.unbind()
save.onAttempt?.((matched, event) => {
	// optional feedback/debug hook
})
```

### `useShortcut()` options

```tsx
const $ = useShortcut({
	debug: true,
	delay: 0,
	ignoreInputs: true,
	disabled: false,
	eventType: 'keydown', // or 'keyup'
	target: window
})
```

## also works outside React

```tsx
import { createShortcut } from '@remcostoeten/use-shortcut'

const $ = createShortcut()
const save = $.mod.key('s').on(saveDocument)

save.unbind()
```

## final note

This package started as a DX itch: shortcuts should be easy to read and hard to mess up.

If that sounds like your thing, give it a spin:

[Check it out on NPM](https://www.npmjs.com/package/@remcostoeten/use-shortcut)
