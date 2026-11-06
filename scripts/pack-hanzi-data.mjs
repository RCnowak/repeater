import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';

const sourceDirectory = new URL('../data/hanzi/', import.meta.url);
const outputFile = new URL('../public/data/hanzi-writer.json', import.meta.url);
const entries = await readdir(sourceDirectory, { withFileTypes: true });
const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json')).map((entry) => entry.name).sort();
const pack = {};

for (const file of files) {
  const character = file.slice(0, -5);
  pack[character] = JSON.parse(await readFile(new URL(file, sourceDirectory), 'utf8'));
}

await mkdir(new URL('../public/data/', import.meta.url), { recursive: true });
await writeFile(outputFile, JSON.stringify(pack));
console.log(`Packed ${files.length} HanziWriter characters into one offline asset`);
