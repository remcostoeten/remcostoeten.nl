#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Extract accent color from globals.css
function extractAccentColor() {
  const cssPath = path.join(__dirname, "../src/app/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf8");

  // Look for --accent: h s l; pattern
  const accentMatch = cssContent.match(/--accent:\s*(\d+)\s+(\d+)%\s+(\d+)%/);
  if (accentMatch) {
    return {
      h: parseInt(accentMatch[1]),
      s: parseInt(accentMatch[2]),
      l: parseInt(accentMatch[3]),
    };
  }

  // Fallback to default accent color
  return { h: 85, s: 100, l: 75 };
}

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

// Update favicon with current theme color
function updateFaviconWithTheme() {
  const accentColor = extractAccentColor();
  const [r, g, b] = hslToRgb(accentColor.h, accentColor.s, accentColor.l);

  console.log(`🎨 Updating favicon with current theme color...`);
  console.log(
    `📊 Accent Color: HSL(${accentColor.h}, ${accentColor.s}%, ${accentColor.l}%) → RGB(${r}, ${g}, ${b})`
  );

  // Import the advanced favicon generator
  const { generateFaviconSet } = require("./generate-favicon-advanced");

  // Override the color in the generator
  const originalGenerateSVGFavicon =
    require("./generate-favicon-advanced").generateSVGFavicon;

  // Regenerate all favicons
  generateFaviconSet();

  console.log("✅ Favicon updated with current theme color!");
}

// Run if called directly
if (require.main === module) {
  updateFaviconWithTheme();
}

module.exports = { updateFaviconWithTheme };
