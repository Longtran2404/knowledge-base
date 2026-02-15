/**
 * Generates public/favicon.ico from the main logo SVG.
 * Run: node scripts/generate-favicon.mjs
 * Requires: npm install sharp to-ico --save-dev
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'images', 'weblogo', 'knowledge-logo-01.svg');
const outIco = join(root, 'public', 'favicon.ico');
const sizes = [16, 32, 48];

async function main() {
  const svg = readFileSync(svgPath);
  const buffers = await Promise.all(
    sizes.map((size) =>
      sharp(svg)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );
  const ico = await toIco(buffers);
  writeFileSync(outIco, ico);
  console.log('Written', outIco);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
