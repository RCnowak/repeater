import { access, mkdir, readFile, writeFile } from 'node:fs/promises';

const sourceFiles = ['seed.ts', 'keys.ts', 'words.ts', 'hsk1/words.ts', 'hsk2/words.ts'];
const outputDirectory = new URL('../data/hanzi/', import.meta.url);
const sources = await Promise.all(sourceFiles.map((file) => readFile(new URL(`../src/data/${file}`, import.meta.url), 'utf8')));
const source = sources.join('\n');
const characters = new Set();
const fallbackCharacters = {
  '⺁': '丿', '⺉': '刂', '⺙': '攵', '⺣': '灬', '⺤': '爪', '⺧': '牛', '⺩': '王',
  '⺷': '羊', '⺹': '老', '⻂': '衤', '⻐': '钅', '⻠': '饣', '朩': '木', '龵': '手', '⻊': '足', '龷': '井',
};
const addCharacters = (value) => {
  for (const character of value.matchAll(/[⺀-⿿㐀-鿿豈-﫿]/g)) characters.add(character[0]);
};

for (const match of source.matchAll(/\b(?:hanzi|measureWord|symbol):\s*['"]([^'"]+)['"]/g)) addCharacters(match[1]);
for (const match of source.matchAll(/\bvariants:\s*\[([^\]]*)\]/g)) {
  for (const variant of match[1].matchAll(/['"]([^'"]+)['"]/g)) addCharacters(variant[1]);
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
    const sourceCharacter = fallbackCharacters[character] || character;
    const url = `https://raw.githubusercontent.com/chanind/hanzi-writer-data/master/data/${encodeURIComponent(sourceCharacter)}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = JSON.parse(await response.text());
    if (!Array.isArray(data.strokes) || !Array.isArray(data.medians)) throw new Error('invalid HanziWriter data');
    await writeFile(outputFile, JSON.stringify(data));
    added += 1;
    console.log(`+ ${character}${sourceCharacter === character ? '' : ` (via ${sourceCharacter})`}`);
  } catch (error) {
    failures.push(`${character}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`Hanzi sync: ${characters.size} required, ${existing} existing, ${added} added`);
if (failures.length) throw new Error(`Missing stroke data:\n${failures.join('\n')}`);
