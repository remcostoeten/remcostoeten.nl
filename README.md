# SolidStart Project

Everything you need to build a Solid project, powered by [`solid-start`](https://start.solidjs.com);

## Project Structure

This project includes comprehensive component documentation and testing:

- **Components**: `src/components/ui/`
- **Documentation**: `docs/components/`
- **Tests**: Comprehensive test coverage with Vitest
- **Storybook**: Ready-to-use Storybook configuration

## Components

### ButtonLink
A versatile button/link component with comprehensive accessibility features.

**Documentation:**
- [Main Documentation](./docs/components/ButtonLink.md)
- [Usage Examples](./docs/components/ButtonLink-Examples.md)
- [Accessibility Guide](./docs/components/ButtonLink-Accessibility.md)

**Features:**
- Dual rendering (button/anchor)
- 5 variants, 3 sizes
- Loading and disabled states
- Full accessibility support
- Comprehensive test coverage

## Quick Start

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Solid apps are built with _presets_, which optimise your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.

## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)
