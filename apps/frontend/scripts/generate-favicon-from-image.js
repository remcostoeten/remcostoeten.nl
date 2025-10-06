#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Check if sharp is available for image processing
let sharp;
try {
  sharp = require("sharp");
} catch (error) {
  console.log("⚠️  Sharp not available, using basic file operations");
}

// Generate SVG favicon from PNG
function generateSVGFromPNG(pngPath, outputPath, size) {
  if (!fs.existsSync(pngPath)) {
    console.error(`❌ Source image not found: ${pngPath}`);
    return false;
  }

  try {
    // Create SVG wrapper with embedded PNG as base64
    const pngBuffer = fs.readFileSync(pngPath);
    const base64PNG = pngBuffer.toString("base64");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <image width="${size}" height="${size}" href="data:image/png;base64,${base64PNG}"/>
</svg>`;

    fs.writeFileSync(outputPath, svg);
    return true;
  } catch (error) {
    console.error(`❌ Error generating SVG: ${error.message}`);
    return false;
  }
}

// Generate resized PNG using sharp (if available)
async function generateResizedPNG(inputPath, outputPath, size) {
  if (!sharp) {
    console.log(`⚠️  Sharp not available, copying original to ${outputPath}`);
    try {
      fs.copyFileSync(inputPath, outputPath);
      return true;
    } catch (error) {
      console.error(`❌ Error copying file: ${error.message}`);
      return false;
    }
  }

  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`❌ Error resizing image: ${error.message}`);
    return false;
  }
}

// Generate ICO file (basic implementation)
function generateICO(inputPath, outputPath, sizes = [16, 32, 48]) {
  if (!sharp) {
    console.log(`⚠️  Sharp not available, skipping ICO generation`);
    return false;
  }

  try {
    // For now, we'll create a simple ICO by copying the 32x32 version
    // A full ICO implementation would require more complex binary format handling
    const temp32Path = path.join(path.dirname(outputPath), "temp_32x32.png");

    sharp(inputPath)
      .resize(32, 32, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(temp32Path)
      .then(() => {
        fs.copyFileSync(temp32Path, outputPath.replace(".ico", ".png"));
        fs.unlinkSync(temp32Path);
      });

    return true;
  } catch (error) {
    console.error(`❌ Error generating ICO: ${error.message}`);
    return false;
  }
}

// Generate web app manifest
function generateWebAppManifest() {
  return {
    name: "Remco Stoeten",
    short_name: "RS",
    description: "Portfolio, projects, and blog by Remco Stoeten",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#000000",
    background_color: "#ffffff",
    display: "standalone",
    start_url: "/",
  };
}

// Main function
async function generateFaviconSet() {
  const sourceImage = path.join(__dirname, "../../../new_favicon.png");
  const outputDir = path.join(__dirname, "../src/app");

  console.log("🎨 Generating favicon set from new_favicon.png...");
  console.log(`📁 Source: ${sourceImage}`);
  console.log(`📁 Output: ${outputDir}`);

  if (!fs.existsSync(sourceImage)) {
    console.error(`❌ Source image not found: ${sourceImage}`);
    console.log("💡 Please make sure new_favicon.png is in the project root");
    return;
  }

  // Define all the sizes we need
  const sizes = [
    { size: 16, name: "favicon-16x16" },
    { size: 32, name: "favicon-32x32" },
    { size: 180, name: "apple-icon" },
    { size: 192, name: "icon-192x192" },
    { size: 512, name: "icon-512x512" },
  ];

  let successCount = 0;
  const totalOperations = sizes.length * 2 + 2; // PNG + SVG for each size, plus manifest and main icon

  // Generate PNG and SVG for each size
  for (const { size, name } of sizes) {
    const pngPath = path.join(outputDir, `${name}.png`);
    const svgPath = path.join(outputDir, `${name}.svg`);

    console.log(`📱 Generating ${name} (${size}x${size})...`);

    // Generate PNG
    if (await generateResizedPNG(sourceImage, pngPath, size)) {
      console.log(`  ✅ Generated ${name}.png`);
      successCount++;
    } else {
      console.log(`  ❌ Failed to generate ${name}.png`);
    }

    // Generate SVG
    if (generateSVGFromPNG(sourceImage, svgPath, size)) {
      console.log(`  ✅ Generated ${name}.svg`);
      successCount++;
    } else {
      console.log(`  ❌ Failed to generate ${name}.svg`);
    }
  }

  // Generate main icon (32x32)
  const mainIconPNG = path.join(outputDir, "icon.png");
  const mainIconSVG = path.join(outputDir, "icon.svg");

  console.log("📱 Generating main icon...");
  if (await generateResizedPNG(sourceImage, mainIconPNG, 32)) {
    console.log("  ✅ Generated icon.png");
    successCount++;
  }

  if (generateSVGFromPNG(sourceImage, mainIconSVG, 32)) {
    console.log("  ✅ Generated icon.svg");
    successCount++;
  }

  // Generate web app manifest
  const manifest = generateWebAppManifest();
  const manifestPath = path.join(outputDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("📄 Generated manifest.json");
  successCount++;

  console.log(`\n🎉 Favicon generation complete!`);
  console.log(
    `✅ Successfully generated ${successCount}/${totalOperations} files`
  );

  if (successCount === totalOperations) {
    console.log("🎯 All favicon files generated successfully!");
  } else {
    console.log("⚠️  Some files failed to generate. Check the errors above.");
  }

  console.log("\n💡 Generated files:");
  console.log("  📱 icon.png & icon.svg (32x32 main)");
  console.log("  📱 favicon-16x16.png & .svg (16x16)");
  console.log("  📱 favicon-32x32.png & .svg (32x32)");
  console.log("  🍎 apple-icon.png & .svg (180x180)");
  console.log("  📱 icon-192x192.png & .svg (192x192)");
  console.log("  📱 icon-512x512.png & .svg (512x512)");
  console.log("  📄 manifest.json (Web App Manifest)");
}

// Run if called directly
if (require.main === module) {
  generateFaviconSet().catch(console.error);
}

module.exports = { generateFaviconSet };
