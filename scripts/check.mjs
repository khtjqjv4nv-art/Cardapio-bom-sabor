import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { root, loadData } from './data.mjs';

const { restaurant, menu, images } = await loadData();
for (const image of images) await access(path.join(root, 'assets/originals', image.source));
console.log(`Dados válidos: ${menu.categories.length} seção de valores, ${menu.categories.flatMap(c => c.items).length} produtos, ${menu.dishes.length} pratos, ${menu.sides.length} acompanhamentos.`);
if (!restaurant.brand.fonts) {
  const message = 'Pendente: fonte oficial do restaurante. O protótipo usa o fallback do sistema.';
  if (process.argv.includes('--release')) throw new Error(message);
  console.warn(message);
}
try {
  const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
  if (/<!-- (HEAD|MENU) -->/.test(html)) throw new Error('O HTML final contém marcadores não processados.');
  if (/<script\b/i.test(html)) throw new Error('O cardápio estático não deve depender de scripts no cliente.');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
  for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(anchor)) throw new Error(`Âncora ausente: #${anchor}`);
  }
  for (const [, file] of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) {
    await access(path.join(root, 'dist', file));
  }
  console.log('HTML estático, âncoras e arquivos locais verificados.');
} catch (error) {
  if (error.code === 'ENOENT' && error.path === path.join(root, 'dist/index.html')) {
    console.log('Execute npm run build para validar também a saída estática.');
  } else throw error;
}
