export function getHanziCharacters(value: string) {
  return value.match(/[⺀-⿿㐀-鿿豈-﫿]/g) ?? [];
}

export function normalizeHanziAnswer(value: string) {
  return getHanziCharacters(value).join('');
}

export function hasHanziGap(value: string) {
  return /\.\.\.|…/.test(value);
}
