import sharp from 'sharp';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { root, loadData } from './data.mjs';

// Conversão determinística: sem IA, filtros, retoques ou ampliação.
// crop é opcional e só isola fotos/logos das artes enviadas pelo restaurante.
const { images } = await loadData();
const output = path.join(root, 'public/images');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await mkdir(path.join(root, 'src/generated'), { recursive: true });
const manifest = {};
const report = [];

for (const image of images) {
  const source = path.join(root, 'assets/originals', image.source);
  const sourceMetadata = await sharp(source).metadata();
  if (sourceMetadata.pages > 1) throw new Error(`${image.id}: use uma imagem estática.`);
  // Normaliza apenas a orientação EXIF e o espaço de cor, sem alterar o prato.
  const oriented = await sharp(source).rotate().toColourspace('srgb').png().toBuffer();
  const prepared = image.crop ? await sharp(oriented).extract(image.crop).png().toBuffer() : oriented;
  const metadata = await sharp(prepared).metadata();
  const maximum = Math.min(metadata.width, image.kind === 'logo' ? 480 : 1200);
  const widths = [...new Set([320, 640, 960, maximum].filter((value) => value <= maximum))].sort((a,b) => a-b);
  const variants = [];
  for (const width of widths) {
    const filename = `${image.id}-${width}.webp`;
    const info = await sharp(prepared)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 84, alphaQuality: 100, effort: 5, lossless: image.kind === 'logo' })
      .toFile(path.join(output, filename));
    variants.push({ src: `./images/${filename}`, width: info.width, height: info.height, bytes: info.size });
    report.push({ image: image.id, file: filename, width: info.width, height: info.height, bytes: info.size });
    if (info.size > 250 * 1024) console.warn(`Atenção: ${filename} supera 250 KB; revisar visualmente antes de comprimir mais.`);
  }
  const fallback = variants.find((variant) => variant.width >= 640) ?? variants.at(-1);
  manifest[image.id] = { ...fallback, variants };
}

await writeFile(path.join(root, 'src/generated/images.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(path.join(root, 'src/generated/image-report.json'), JSON.stringify(report, null, 2) + '\n');
console.table(report.map(({ file, width, height, bytes }) => ({ arquivo: file, tamanho: `${width}×${height}`, KB: (bytes/1024).toFixed(1) })));
