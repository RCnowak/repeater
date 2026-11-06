import type { CharacterJson } from 'hanzi-writer';

type HanziDataPack = Record<string, CharacterJson>;

let dataPackPromise: Promise<HanziDataPack> | null = null;

function loadDataPack() {
  if (!dataPackPromise) {
    dataPackPromise = fetch(`${import.meta.env.BASE_URL}data/hanzi-writer.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Hanzi data pack: ${response.status}`);
        return response.json() as Promise<HanziDataPack>;
      })
      .catch((error: unknown) => {
        dataPackPromise = null;
        throw error;
      });
  }
  return dataPackPromise;
}

export async function loadHanziCharacter(character: string) {
  const dataPack = await loadDataPack();
  const data = dataPack[character];
  if (!data) throw new Error(`Character data not found: ${character}`);
  return data;
}
