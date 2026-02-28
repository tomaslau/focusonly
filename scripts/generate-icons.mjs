// Generate extension icons as SVG, then convert to PNG via sips (macOS)
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const PUBLIC_DIR = join(import.meta.dirname, '..', 'public', 'icon');
const TMP_DIR = join(import.meta.dirname, '..', '.tmp-icons');

if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });

const sizes = [16, 32, 48, 96, 128];

function svgTrafficLight(s) {
  const pad = s * 0.1;
  const bodyW = s * 0.52;
  const bodyH = s * 0.82;
  const bodyX = (s - bodyW) / 2;
  const bodyY = (s - bodyH) / 2;
  const r = s * 0.08;
  const cx = s / 2;
  const circR = s * 0.095;
  const yOff = [0.24, 0.5, 0.76];
  const colors = ['#ef4444', '#eab308', '#22c55e'];

  const circles = colors.map((c, i) =>
    `<circle cx="${cx}" cy="${bodyY + bodyH * yOff[i]}" r="${circR}" fill="${c}"/>`
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${r}" fill="#1f2937"/>
    ${circles}
  </svg>`;
}

function svgCircle(s, bgColor, letter) {
  const fontSize = s * 0.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <circle cx="${s/2}" cy="${s/2}" r="${s * 0.44}" fill="${bgColor}"/>
    <text x="${s/2}" y="${s/2}" text-anchor="middle" dominant-baseline="central"
          font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="${fontSize}" fill="#fff">${letter}</text>
  </svg>`;
}

const icons = {
  default: (s) => svgTrafficLight(s),
  read:    (s) => svgCircle(s, '#22c55e', 'R'),
  save:    (s) => svgCircle(s, '#eab308', 'S'),
  leave:   (s) => svgCircle(s, '#ef4444', 'L'),
  grey:    (s) => svgCircle(s, '#9ca3af', '?'),
};

for (const [name, genSvg] of Object.entries(icons)) {
  for (const s of sizes) {
    const svgPath = join(TMP_DIR, `${name}-${s}.svg`);
    const pngPath = name === 'default'
      ? join(PUBLIC_DIR, `${s}.png`)
      : join(PUBLIC_DIR, `${name}-${s}.png`);

    writeFileSync(svgPath, genSvg(s));

    // sips can't do SVG->PNG directly, use a different approach
    // Write as SVG and we'll handle conversion differently
    console.log(`Created SVG: ${svgPath}`);
  }
}

console.log('\nSVGs created. Converting to PNG...');

// Use resvg-js for conversion if available, otherwise try sips workaround
// Since sips doesn't support SVG, let's output the SVGs and use them directly
// Actually, let's create a tiny HTML converter

// Alternative: just output SVG files to public and use them as-is for the extension
// Chrome MV3 doesn't support SVG icons in manifest, so we need PNGs
// Let's write a Bun-compatible converter

const { Resvg } = await import('@aspect-build/resvg').catch(() => ({ Resvg: null }));

if (!Resvg) {
  // Fallback: try sharp
  const sharp = await import('sharp').catch(() => null);
  if (sharp) {
    for (const [name, genSvg] of Object.entries(icons)) {
      for (const s of sizes) {
        const svg = genSvg(s);
        const pngPath = name === 'default'
          ? join(PUBLIC_DIR, `${s}.png`)
          : join(PUBLIC_DIR, `${name}-${s}.png`);
        await sharp.default(Buffer.from(svg)).png().toFile(pngPath);
        console.log(`Created: ${pngPath}`);
      }
    }
  } else {
    console.log('No image converter available. Falling back to inline SVG data URLs.');
    // Create a JSON file with base64 SVG data for runtime use
    const iconData = {};
    for (const [name, genSvg] of Object.entries(icons)) {
      iconData[name] = {};
      for (const s of sizes) {
        iconData[name][s] = `data:image/svg+xml;base64,${Buffer.from(genSvg(s)).toString('base64')}`;
      }
    }
    writeFileSync(join(PUBLIC_DIR, 'icon-data.json'), JSON.stringify(iconData, null, 2));
    console.log('Created icon-data.json with SVG data URLs');
  }
} else {
  for (const [name, genSvg] of Object.entries(icons)) {
    for (const s of sizes) {
      const svg = genSvg(s);
      const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: s } });
      const png = resvg.render().asPng();
      const pngPath = name === 'default'
        ? join(PUBLIC_DIR, `${s}.png`)
        : join(PUBLIC_DIR, `${name}-${s}.png`);
      writeFileSync(pngPath, png);
      console.log(`Created: ${pngPath}`);
    }
  }
}

// Cleanup
execSync(`rm -rf "${TMP_DIR}"`);
console.log('Done!');
