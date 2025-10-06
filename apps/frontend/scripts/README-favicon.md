# Favicon Generator

This directory contains scripts to programmatically generate favicons using your theme's accent color.

## Scripts

### `generate-favicon.js`

Basic favicon generator that creates simple SVG favicons with your accent color.

**Usage:**

```bash
bun run favicon
# or
node scripts/generate-favicon.js
```

### `generate-favicon-advanced.js`

Comprehensive favicon generator that creates a complete favicon set including:

- Multiple sizes (16x16, 32x32, 180x180, 192x192, 512x512)
- Apple touch icons
- Web app manifest
- Proper SVG optimization

**Usage:**

```bash
bun run favicon:advanced
# or
node scripts/generate-favicon-advanced.js
```

### `update-favicon-theme.js`

Automatically extracts the current accent color from your CSS and regenerates all favicons.

**Usage:**

```bash
bun run favicon:update
# or
node scripts/update-favicon-theme.js
```

## Generated Files

The scripts generate the following files in `src/app/`:

- `icon.svg` - Main favicon (32x32)
- `favicon-16x16.svg` - Small favicon (16x16)
- `favicon-32x32.svg` - Medium favicon (32x32)
- `apple-icon.svg` - Apple touch icon (180x180)
- `icon-192x192.svg` - Web app manifest icon (192x192)
- `icon-512x512.svg` - Large web app icon (512x512)
- `manifest.json` - Web app manifest

## Design

The favicon features:

- **Background**: Your theme's accent color (currently HSL(85, 100%, 75%) - bright green)
- **Icon**: Stylized "R" letter for "Remco"
- **Style**: Modern, minimal design with subtle gradients and shadows
- **Format**: SVG for scalability and small file size

## Integration

The favicons are automatically integrated into your Next.js app via:

1. Files in `src/app/` (Next.js automatically serves these)
2. Explicit links in `layout.tsx` for better control
3. Web app manifest for PWA support

## Customization

To change the design:

1. Edit the SVG generation functions in the scripts
2. Modify the accent color extraction logic
3. Run `bun run favicon:update` to regenerate

## Color Reference

Current accent color: **HSL(85, 100%, 75%)** → **RGB(202, 255, 128)**

This is extracted from your CSS variable `--accent: 85 100% 75%`.
