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

// Generate SVG favicon
function generateSVGFavicon(accentColor) {
  const [r, g, b] = hslToRgb(85, 100, 75); // Your accent color

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="16" cy="16" r="15" fill="rgb(${r}, ${g}, ${b})" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
  
  <!-- R letter -->
  <path d="M10 8 L10 24 M10 8 L18 8 Q22 8 22 12 Q22 16 18 16 L10 16 M18 16 L22 24" 
        fill="none" 
        stroke="rgba(0,0,0,0.9)" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
  
  <!-- Subtle highlight -->
  <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
</svg>`;
}

// Generate ICO favicon (simplified version)
function generateICOFavicon(accentColor) {
  const [r, g, b] = hslToRgb(85, 100, 75);

  // Create a simple 16x16 pixel data for ICO
  const size = 16;
  const data = Buffer.alloc(size * size * 4); // RGBA

  // Fill with accent color
  for (let i = 0; i < size * size; i++) {
    const offset = i * 4;
    data[offset] = r; // Red
    data[offset + 1] = g; // Green
    data[offset + 2] = b; // Blue
    data[offset + 3] = 255; // Alpha
  }

  // Simple "R" pattern (white pixels on accent background)
  const rPattern = [
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [7, 2],
    [8, 2],
    [9, 2],
    [10, 2],
    [11, 2],
    [12, 2],
    [13, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [2, 6],
    [2, 7],
    [2, 8],
    [2, 9],
    [2, 10],
    [2, 11],
    [2, 12],
    [2, 13],
    [2, 14],
    [9, 3],
    [10, 3],
    [11, 3],
    [12, 3],
    [13, 3],
    [9, 4],
    [9, 5],
    [9, 6],
    [9, 7],
    [9, 8],
    [9, 9],
    [9, 10],
    [9, 11],
    [9, 12],
    [9, 13],
    [9, 14],
    [13, 4],
    [13, 5],
    [13, 6],
    [13, 7],
    [13, 8],
    [13, 9],
    [13, 10],
    [13, 11],
    [13, 12],
    [13, 13],
    [13, 14],
    [10, 7],
    [11, 7],
    [12, 7],
    [13, 7],
    [10, 8],
    [11, 8],
    [12, 8],
    [13, 8],
  ];

  // Apply R pattern
  rPattern.forEach(([x, y]) => {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const offset = (y * size + x) * 4;
      data[offset] = 255; // White
      data[offset + 1] = 255; // White
      data[offset + 2] = 255; // White
      data[offset + 3] = 255; // Alpha
    }
  });

  return data;
}

// Generate PNG favicon using canvas (Node.js version)
function generatePNGFavicon(accentColor) {
  const [r, g, b] = hslToRgb(85, 100, 75);

  // Create a simple PNG-like structure
  // This is a simplified version - in a real scenario you'd use a library like sharp or canvas

  // For now, we'll create an SVG that can be converted to PNG
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with gradient -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(${Math.round(
        r * 1.1
      )}, ${Math.round(g * 1.1)}, ${Math.round(b * 1.1)});stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(${r}, ${g}, ${b});stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.2)"/>
    </filter>
  </defs>
  
  <!-- Background circle -->
  <circle cx="96" cy="96" r="88" fill="url(#bg)" filter="url(#shadow)"/>
  
  <!-- R letter -->
  <path d="M60 48 L60 144 M60 48 L108 48 Q132 48 132 72 Q132 96 108 96 L60 96 M108 96 L132 144" 
        fill="none" 
        stroke="rgba(0,0,0,0.9)" 
        stroke-width="15" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
  
  <!-- Subtle inner highlight -->
  <circle cx="96" cy="96" r="80" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
</svg>`;
}

// Main function
function generateFavicon() {
  const accentColor = [85, 100, 75]; // HSL values from your theme
  const outputDir = path.join(__dirname, "../src/app");

  console.log("🎨 Generating favicon with accent color...");
  console.log(
    `📊 Color: HSL(${accentColor[0]}, ${accentColor[1]}%, ${accentColor[2]}%)`
  );

  // Generate SVG favicon
  const svgFavicon = generateSVGFavicon(accentColor);
  fs.writeFileSync(path.join(outputDir, "icon.svg"), svgFavicon);
  console.log("✅ Generated icon.svg");

  // Generate PNG favicon (as SVG for now, can be converted later)
  const pngFavicon = generatePNGFavicon(accentColor);
  fs.writeFileSync(path.join(outputDir, "icon.png"), pngFavicon);
  console.log("✅ Generated icon.png (SVG format)");

  // Generate Apple touch icon
  const appleIcon = generatePNGFavicon(accentColor);
  fs.writeFileSync(path.join(outputDir, "apple-icon.svg"), appleIcon);
  console.log("✅ Generated apple-icon.svg");

  console.log("🎉 Favicon generation complete!");
  console.log(
    "💡 Note: SVG files can be converted to ICO/PNG using online tools or sharp library"
  );
}

// Run if called directly
if (require.main === module) {
  generateFavicon();
}

module.exports = { generateFavicon };
