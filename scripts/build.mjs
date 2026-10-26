import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const files = ['index.html', 'script.js', 'CSS/site.css', 'CSS/intro.css', 'CSS/material-banner.css'];

// Publish only the page and its assets, never editor settings or local backups.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) {
  const source = await readFile(join(root, 'KARST', file), 'utf8');
  // The published page lives at / instead of /KARST/index.html.
  const content = source.replaceAll('../../image/', '../image/').replaceAll('../image/', '/image/');
  const destination = join(output, file);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content.replace(/^\uFEFF/, ''));
}
await cp(join(root, 'image'), join(output, 'image'), {
  recursive: true,
  filter: (source) => !source.split(/[\\/]/).at(-1).startsWith('.'),
});
console.log('Built dist/: index.html, JavaScript, CSS and images.');
