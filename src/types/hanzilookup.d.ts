export {};

declare global {
  interface Window {
    HanziLookup?: {
      init: (name: string, url: string, callback: (success: boolean) => void) => void;
      AnalyzedCharacter: new (strokes: [number, number][][]) => unknown;
      Matcher: new (name: string) => {
        match: (character: unknown, limit: number, callback: (matches: { character: string }[]) => void) => void;
      };
    };
  }
}
