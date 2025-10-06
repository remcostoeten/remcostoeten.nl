# Favicon Generator (Image-Based)

This script generates a complete favicon set from your custom `new_favicon.png` image.

## Usage

```bash
bun run favicon:from-image
# or
node scripts/generate-favicon-from-image.js
```

## What it does

1. **Reads your image**: Looks for `new_favicon.png` in the project root
2. **Generates multiple formats**: Creates PNG and SVG versions for different use cases
3. **Multiple sizes**: Generates all required sizes for different platforms
4. **Web manifest**: Creates a manifest.json for PWA support

## Generated Files

The script generates the following files in `src/app/`:

### Main Icons

- `icon.png` & `icon.svg` (32x32) - Main favicon
- `favicon-16x16.png` & `.svg` (16x16) - Small favicon
- `favicon-32x32.png` & `.svg` (32x32) - Standard favicon

### Apple Touch Icons

- `apple-icon.png` & `.svg` (180x180) - iOS home screen icon

### Web App Icons

- `icon-192x192.png` & `.svg` (192x192) - Android home screen
- `icon-512x512.png` & `.svg` (512x512) - Large web app icon

### Manifest

- `manifest.json` - Web app manifest for PWA support

## Requirements

- **Source image**: `new_favicon.png` in the project root
- **Optional**: Sharp library for better image processing (falls back to basic operations if not available)

## Integration

The favicons are automatically integrated into your Next.js app via:

1. Files in `src/app/` (Next.js automatically serves these)
2. Links in `layout.tsx` for explicit control
3. Web app manifest for PWA support

## Customization

To change the favicon:

1. Replace `new_favicon.png` in the project root with your new image
2. Run `bun run favicon:from-image`
3. All favicon files will be regenerated with your new image

## Notes

- The script embeds your PNG image as base64 in SVG files for perfect quality
- PNG files are resized using Sharp (if available) or copied as-is
- All files are optimized for web use
- The manifest uses PNG files for better compatibility across devices
