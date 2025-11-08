# Ruler Pre-commit Hook

## Overview

A custom pre-commit hook has been installed to automatically detect changes in `.ruler/` files and ensure AI configurations stay synchronized.

## How It Works

1. **Detection**: When you commit changes, the hook checks if any files in `.ruler/` directory have been modified
2. **Prompting**: If changes are detected, it prompts you to run `ruler apply`
3. **Automation**: If you confirm, it automatically:
   - Runs `ruler apply` to update all AI configurations
   - Stages the generated files for commit
   - Completes the commit process

## Usage Examples

### Automatic Prompt (Recommended)
```bash
# Make changes to Ruler files
echo "New rule" >> .ruler/AGENTS.md

# Stage and commit - hook will prompt you automatically
git add .ruler/AGENTS.md
git commit -m "Update AI coding rules"
# 🔍 Checking for Ruler rule changes...
# ⚠️  Ruler rule files have been modified:
#    - .ruler/AGENTS.md
# 🤖 AI tool configurations need to be updated...
# Would you like to run 'ruler apply' now? (y/N): y
# ✅ Ruler configurations applied successfully!
```

### Manual Application
```bash
# Apply ruler manually after making changes
npm run ruler:apply
```

### Check Current Status
```bash
# Check if AI configs are up to date
npm run ruler:check
```

## Features

- **Smart Detection**: Only prompts when `.ruler/` files actually change
- **Interactive**: Gives you choice whether to apply changes
- **Automatic Staging**: Automatically adds generated AI config files to your commit
- **Safety Checks**: Verifies Ruler CLI is installed before attempting to apply
- **Colorful Output**: Clear, colored feedback for better user experience

## Pre-commit Hook Behavior

| Scenario | Hook Action |
|----------|-------------|
| No Ruler changes | ✅ Allows commit without interruption |
| Ruler changes detected | ⚠️ Prompts to run `ruler apply` |
| User confirms | 🔄 Runs `ruler apply` and stages generated files |
| User declines | ⚠️ Allows commit with warning to run manually |
| Ruler CLI missing | ❌ Blocks commit with installation instructions |


## NPM Scripts Added

```bash
npm run ruler:apply    # Run ruler apply
npm run ruler:check    # Run ruler apply and show git status
```

## Troubleshooting

### Hook Not Running
```bash
# Make sure hook is executable
chmod +x .git/hooks/pre-commit
```

### Ruler CLI Not Found
```bash
# Install Ruler globally
npm install -g @intellectronica/ruler
```

### Hook Bypass Needed
```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify -m "Commit message"
```

## Best Practices

1. **Always confirm** when the hook prompts to run `ruler apply`
2. **Review generated files** before committing to ensure they look correct
3. **Test AI tools** after major rule changes to verify they follow new guidelines
4. **Keep `.ruler/` files clean** and focused to minimize unnecessary updates

This hook ensures your AI assistants always have the latest coding guidelines, maintaining consistency across all development work!