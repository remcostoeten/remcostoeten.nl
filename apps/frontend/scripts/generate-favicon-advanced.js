#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// HSL to RGB conversion
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r, g, b;
  if (h < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

// Generate multiple favicon sizes
function generateFaviconSet() {
  const [r, g, b] = hslToRgb(85, 100, 75); // Your accent color
  const outputDir = path.join(__dirname, "../src/app");

  console.log("🎨 Generating comprehensive favicon set...");
  console.log(`📊 Accent Color: HSL(85, 100%, 75%) → RGB(${r}, ${g}, ${b})`);

  // Generate 16x16 favicon
  const favicon16 = generateSVGFavicon(16, r, g, b);
  fs.writeFileSync(path.join(outputDir, "favicon-16x16.svg"), favicon16);

  // Generate 32x32 favicon
  const favicon32 = generateSVGFavicon(32, r, g, b);
  fs.writeFileSync(path.join(outputDir, "favicon-32x32.svg"), favicon32);

  // Generate main icon (32x32)
  fs.writeFileSync(path.join(outputDir, "icon.svg"), favicon32);

  // Generate Apple touch icon (180x180)
  const appleIcon = generateSVGFavicon(180, r, g, b);
  fs.writeFileSync(path.join(outputDir, "apple-icon.svg"), appleIcon);

  // Generate manifest icon (192x192)
  const manifestIcon = generateSVGFavicon(192, r, g, b);
  fs.writeFileSync(path.join(outputDir, "icon-192x192.svg"), manifestIcon);

  // Generate large icon (512x512)
  const largeIcon = generateSVGFavicon(512, r, g, b);
  fs.writeFileSync(path.join(outputDir, "icon-512x512.svg"), largeIcon);

  // Generate web app manifest
  const manifest = generateWebAppManifest();
  fs.writeFileSync(
    path.join(outputDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log("✅ Generated favicon set:");
  console.log("  📱 favicon-16x16.svg (16x16)");
  console.log("  📱 favicon-32x32.svg (32x32)");
  console.log("  📱 icon.svg (32x32 main)");
  console.log("  🍎 apple-icon.svg (180x180)");
  console.log("  📱 icon-192x192.svg (192x192)");
  console.log("  📱 icon-512x512.svg (512x512)");
  console.log("  📄 manifest.json (Web App Manifest)");

  console.log("\n🎉 Favicon generation complete!");
  console.log("💡 To use these icons, add the following to your HTML head:");
  console.log('   <link rel="icon" type="image/svg+xml" href="/icon.svg">');
  console.log('   <link rel="apple-touch-icon" href="/apple-icon.svg">');
  console.log('   <link rel="manifest" href="/manifest.json">');
}

function generateSVGFavicon(size, r, g, b) {
  const strokeWidth = Math.max(1, size / 12);
  const letterSize = size * 0.6;
  const offset = (size - letterSize) / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(${Math.min(
        255,
        Math.round(r * 1.1)
      )}, ${Math.min(255, Math.round(g * 1.1))}, ${Math.min(
    255,
    Math.round(b * 1.1)
  )});stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(${r}, ${g}, ${b});stop-opacity:1" />
    </linearGradient>
    <filter id="shadow-${size}" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="${Math.max(
        1,
        size / 24
      )}" stdDeviation="${Math.max(
    1,
    size / 16
  )}" flood-color="rgba(0,0,0,0.2)"/>
    </filter>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${
    size / 2 - 2
  }" fill="url(#bg-${size})" filter="url(#shadow-${size})"/>
  
  <!-- R letter -->
  <path d="M${offset} ${offset} L${offset} ${
    offset + letterSize
  } M${offset} ${offset} L${offset + letterSize * 0.5} ${offset} Q${
    offset + letterSize * 0.75
  } ${offset} ${offset + letterSize * 0.75} ${offset + letterSize * 0.25} Q${
    offset + letterSize * 0.75
  } ${offset + letterSize * 0.5} ${offset + letterSize * 0.5} ${
    offset + letterSize * 0.5
  } L${offset} ${offset + letterSize * 0.5} M${offset + letterSize * 0.5} ${
    offset + letterSize * 0.5
  } L${offset + letterSize * 0.75} ${offset + letterSize}" 
        fill="none" 
        stroke="rgba(0,0,0,0.9)" 
        stroke-width="${strokeWidth}" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
  
  <!-- Subtle inner highlight -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${
    size / 2 - 4
  }" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
</svg>`;
}

function generateWebAppManifest() {
  return {
    name: "Remco Stoeten",
    short_name: "RS",
    description: "Portfolio, projects, and blog by Remco Stoeten",
    icons: [
      {
        src: "/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
    theme_color: "hsl(85, 100%, 75%)",
    background_color: "hsl(0, 0%, 100%)",
    display: "standalone",
    start_url: "/",
  };
}

// Run if called directly
if (require.main === module) {
  generateFaviconSet();
}

module.exports = { generateFaviconSet };
