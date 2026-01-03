const fs = require('fs');
const path = require('path');

// Simple SVG to PNG conversion script
// Run: npm install sharp && node convert-assets.js

async function convertSvgToPng() {
  try {
    const sharp = require('sharp');

    const conversions = [
      { input: 'asdf-logo.svg', output: 'icon-512.png', width: 512, height: 512 },
      { input: 'feature-graphic.svg', output: 'feature-graphic.png', width: 1024, height: 500 },
      { input: 'banner.svg', output: 'banner.png', width: 1200, height: 600 },
    ];

    for (const { input, output, width, height } of conversions) {
      const inputPath = path.join(__dirname, input);
      const outputPath = path.join(__dirname, output);

      if (fs.existsSync(inputPath)) {
        await sharp(inputPath)
          .resize(width, height)
          .png()
          .toFile(outputPath);
        console.log(`✅ Created: ${output} (${width}x${height})`);
      } else {
        console.log(`❌ Not found: ${input}`);
      }
    }

    console.log('\n🎉 All assets converted successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('❌ Sharp not installed. Run: npm install sharp');
      console.log('\nAlternative: Use online converter:');
      console.log('1. Go to https://cloudconvert.com/svg-to-png');
      console.log('2. Upload each SVG file');
      console.log('3. Download PNGs to assets/store/');
    } else {
      console.error('Error:', error.message);
    }
  }
}

convertSvgToPng();
