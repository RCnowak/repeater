import { access, mkdir, readFile, writeFile } from 'node:fs/promises';

const seedFile = new URL('../src/data/seed.ts', import.meta.url);
const outputDirectory = new URL('../data/hanzi/', import.meta.url);
const source = await readFile(seedFile, 'utf8');
const characters = new Set();

for (const match of source.matchAll(/\b(?:hanzi|measureWord|symbol):\s*['"]([^'"]+)['"]/g)) {
  for (const character of match[1]) characters.add(character);
}
for (const match of source.matchAll(/\bvariants:\s*\[([^\]]*)\]/g)) {
  for (const variant of match[1].matchAll(/['"]([^'"]+)['"]/g)) {
    for (const character of variant[1]) characters.add(character);
  }
}

await mkdir(outputDirectory, { recursive: true });
let existing = 0;
let added = 0;
const failures = [];

for (const character of [...characters].sort()) {
  const outputFile = new URL(`${character}.json`, outputDirectory);
  try {
    await access(outputFile);
    existing += 1;
    continue;
  } catch {}

  try {
    const url = `https://raw.githubusercontent.com/chanind/hanzi-writer-data/master/data/${encodeURIComponent(character)}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = JSON.parse(await response.text());
    if (!Array.isArray(data.strokes) || !Array.isArray(data.medians)) throw new Error('invalid HanziWriter data');
    await writeFile(outputFile, JSON.stringify(data));
    added += 1;
    console.log(`+ ${character}`);
  } catch (error) {
    failures.push(`${character}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`Hanzi sync: ${characters.size} required, ${existing} existing, ${added} added`);
if (failures.length) throw new Error(`Missing stroke data:\n${failures.join('\n')}`);
