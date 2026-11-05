const toneMarks: Record<string, string[]> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

const plainVowels: Record<string, string> = Object.entries(toneMarks).reduce<Record<string, string>>((result, [plain, marks]) => {
  marks.forEach((marked) => { result[marked] = plain; });
  return result;
}, {});

function markSyllable(syllable: string, tone: number) {
  const plain = syllable.replace(/v|u:/g, 'ü');
  if (tone === 5) return plain;
  const vowels = Array.from(plain);
  let index = vowels.findIndex((vowel) => vowel === 'a' || vowel === 'e');
  if (index === -1 && plain.includes('ou')) index = vowels.indexOf('o');
  if (index === -1) {
    for (let position = vowels.length - 1; position >= 0; position -= 1) {
      if ('iouü'.includes(vowels[position])) {
        index = position;
        break;
      }
    }
  }
  if (index === -1) return plain;
  vowels[index] = toneMarks[vowels[index]][tone - 1];
  return vowels.join('');
}

export function normalizePinyin(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/u:/g, 'v')
    .replace(/([a-zv]+)([1-5])/g, (_match, syllable: string, tone: string) => ` ${markSyllable(syllable, Number(tone))} `)
    .split(/[\s'-]+/)
    .filter(Boolean)
    .map((syllable) => {
      const numbered = syllable.match(/^([a-zvüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)([1-5])$/);
      if (!numbered) return syllable.replace(/v/g, 'ü');
      return markSyllable(numbered[1], Number(numbered[2]));
    })
    .join(' ');
}

export function pinyinSearchKey(value: string) {
  return Array.from(normalizePinyin(value).toLowerCase())
    .map((character) => plainVowels[character] || character)
    .join('')
    .replace(/ü/g, 'v')
    .replace(/[1-5\s'-]/g, '');
}

export function isPinyinCorrect(answer: string, expected: string) {
  return pinyinSearchKey(answer) === pinyinSearchKey(expected) && normalizePinyin(answer).replace(/[\s']/g, '') === normalizePinyin(expected).replace(/[\s']/g, '');
}
