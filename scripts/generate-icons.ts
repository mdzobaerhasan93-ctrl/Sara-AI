import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('./public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const svgIcon = (size: number, isMaskable = false) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2a0845" />
      <stop offset="60%" stop-color="#140727" />
      <stop offset="100%" stop-color="#05050f" />
    </radialGradient>
    <linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff2e93" />
      <stop offset="50%" stop-color="#b026ff" />
      <stop offset="100%" stop-color="#00f2fe" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${size * 0.03}" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)" rx="${isMaskable ? 0 : size * 0.22}" />
  <!-- Neon Orb Outer Rings -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.35}" fill="none" stroke="url(#neon)" stroke-width="${size * 0.02}" opacity="0.6" filter="url(#glow)" />
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.25}" fill="none" stroke="#ff2e93" stroke-width="${size * 0.015}" opacity="0.8" />
  <!-- Inner Heart / Core -->
  <path d="M${size * 0.5} ${size * 0.65}
           C${size * 0.35} ${size * 0.52} ${size * 0.3} ${size * 0.42} ${size * 0.35} ${size * 0.35}
           C${size * 0.4} ${size * 0.28} ${size * 0.48} ${size * 0.32} ${size * 0.5} ${size * 0.38}
           C${size * 0.52} ${size * 0.32} ${size * 0.6} ${size * 0.28} ${size * 0.65} ${size * 0.35}
           C${size * 0.7} ${size * 0.42} ${size * 0.65} ${size * 0.52} ${size * 0.5} ${size * 0.65} Z"
        fill="url(#neon)" filter="url(#glow)" />
  <!-- Sparkles -->
  <circle cx="${size * 0.68}" cy="${size * 0.32}" r="${size * 0.02}" fill="#00f2fe" filter="url(#glow)" />
  <circle cx="${size * 0.32}" cy="${size * 0.65}" r="${size * 0.015}" fill="#ff2e93" filter="url(#glow)" />
</svg>
`;

async function buildIcons() {
  await sharp(Buffer.from(svgIcon(192)))
    .png()
    .toFile(path.join(outDir, 'icon-192.png'));

  await sharp(Buffer.from(svgIcon(512)))
    .png()
    .toFile(path.join(outDir, 'icon-512.png'));

  await sharp(Buffer.from(svgIcon(512, true)))
    .png()
    .toFile(path.join(outDir, 'icon-maskable-512.png'));

  console.log('Icons generated successfully!');
}

buildIcons();
