const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="115" fill="#090D0F"/>
  <rect x="8" y="8" width="496" height="496" rx="107" stroke="url(#border_grad)" stroke-width="6" opacity="0.6"/>
  
  <!-- Subtle dark teal background glow -->
  <circle cx="256" cy="256" r="180" fill="url(#glow_grad)" opacity="0.25"/>
  
  <defs>
    <linearGradient id="border_grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00A8B5"/>
      <stop offset="0.5" stop-color="#007782"/>
      <stop offset="1" stop-color="#0F2B30"/>
    </linearGradient>
    <radialGradient id="glow_grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(256 256) rotate(90) scale(180)">
      <stop stop-color="#00A8B5"/>
      <stop offset="1" stop-color="#007782" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="brand_grad" x1="120" y1="120" x2="390" y2="390" gradientUnits="userSpaceOnUse">
      <stop stop-color="#33C6D0"/>
      <stop offset="0.6" stop-color="#007782"/>
      <stop offset="1" stop-color="#00535B"/>
    </linearGradient>
    <linearGradient id="sparkle_grad" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#66D4DC"/>
    </linearGradient>
  </defs>

  <!-- Stylish stylized "V" with Camera lens / Sparkle center -->
  <g filter="drop-shadow(0px 8px 24px rgba(0, 119, 130, 0.45))">
    <!-- Stylized V for Vinted -->
    <path d="M140 148 L224 372 C236 404 276 404 288 372 L372 148 C378 132 366 116 348 116 C336 116 326 124 322 136 L256 312 L190 136 C186 124 176 116 164 116 C146 116 134 132 140 148 Z" fill="url(#brand_grad)"/>
    
    <!-- AI Studio Star 1 -->
    <path d="M370 170 C370 185 385 195 400 195 C385 195 370 205 370 220 C370 205 355 195 340 195 C355 195 370 185 370 170 Z" fill="url(#sparkle_grad)"/>
    
    <!-- AI Studio Star 2 (small) -->
    <path d="M150 240 C150 250 160 258 170 258 C160 258 150 266 150 276 C150 266 140 258 130 258 C140 258 150 250 150 240 Z" fill="url(#sparkle_grad)" opacity="0.85"/>
  </g>
</svg>
`;

async function generate() {
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(svgIcon);

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

  console.log('Icons generated successfully in /public');
}

generate().catch(console.error);
