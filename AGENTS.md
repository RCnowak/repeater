# AGENTS.md

## Project overview

`repeater-v2` is a mobile-first Russian-language PWA for personal study of Chinese vocabulary. It is a client-only, single-user/single-device application with no backend or authentication. The dictionary, handwriting recognition, stroke-order quizzes, and review history work offline after the first load.

## Technology stack

- React 19, strict TypeScript, TSX, Vite 7.
- React Router with `HashRouter` so routes work on static GitHub Pages hosting.
- React Hook Form for training settings.
- Dexie + `dexie-react-hooks` for IndexedDB and reactive queries.
- SCSS and CSS Modules; global tokens and shared controls are in `src/styles/global.scss`.
- `lucide-react` for interface icons.
- HanziLookupJS for handwriting recognition and HanziWriterJS for stroke-order exercises.
- `vite-plugin-pwa`/Workbox for the manifest, service worker, and precaching.

## Commands

- `npm install` — install dependencies.
- `npm run sync:hanzi` — scan seed words, keys, measure words, and key variants; download only missing HanziWriter source data and rebuild the pack.
- `npm run pack:hanzi` — pack `data/hanzi/*.json` into one minified `public/data/hanzi-writer.json`.
- `npm run dev` — pack Hanzi data and start Vite.
- `npm run typecheck` — run strict TypeScript checks.
- `npm run build` — pack Hanzi data, typecheck, and build the PWA into `dist/`.
- `npm run preview` — serve the production build.
- `VITE_BASE_PATH=/repeater-v2/ npm run build` — build for this repository's GitHub Pages path.

There is no automated test file suite or lint command. Browser smoke checks have covered all four exercise types, search normalization, IndexedDB persistence, handwriting recognition, local HanziWriter data, and offline reload.

## Data architecture

- `src/types.ts` defines content, personal data, settings, SRS, and review log contracts.
- `src/data/seed.ts` contains the static starter content: words, keys, modules, and tags.
- `src/db/database.ts` owns the Dexie schema, idempotent seed initialization, Leitner-lite updates, and review log writes.
- IndexedDB tables: `words`, `wordData`, `keys`, `modules`, `tags`, `reviews`.
- Static content is deliberately separated from `wordData` (associations, examples, notes, SRS), so a future shared server content base can remain read-only.
- Training settings are stored in localStorage under `repeater-settings` via `src/hooks/useLocalStorage.ts`.
- `src/components/DictionaryProvider.tsx` initializes and exposes the reactive merged dictionary.

## Screens and routes

Hash-based routes:

- `#/` — dictionary, 250ms debounced search, HSK/tag filters, handwriting input. Modules remain in the data model but are hidden until their feature is ready.
- `#/words/:wordId` — word details, keys, associations, examples, measure word, related words/parts, sequential character animations.
- `#/keys` and `#/keys/:keyId` — keys, optional alternative `variants`, nested keys, related words, animations for every form.
- `#/training` — four exercise types with icons, optional tag/SRS filters, warm-up keys ordered recursively before words, hidden associations, forget/exclude actions, and completion state. Blind writing shows completed characters, an optional grid, and a configurable mistake threshold. Phrase gaps such as `听...说` ignore dots in answers and are excluded from writing/animation sequences.
- `#/stats` — last 7 days, words with errors, consecutive training-day streak, recent answers.
- `#/settings` — persisted default limit, exercise types, HSK levels (including unspecified), tags, SRS mode, order, warm-up, grid, and writing mistake threshold. Training is the centered third of five bottom-navigation items. Suspended words can be restored from their detail page. Results include an animated stroke-order grid.

Pinyin utilities are in `src/utils/pinyin.ts`. Preserve support for diacritics, numbered tones, toneless search, and `v`/`u:` for `ü`.

## Offline assets

- `public/vendor/hanzilookup.min.js` and `public/data/mmah.json` are the local HanziLookupJS runtime/model.
- `data/hanzi/<character>.json` files are build-time sources, not public endpoints. They cover seed words, keys, key variants, and measure words.
- `public/data/hanzi-writer.json` is the single minified HanziWriter pack. It is precached with the shell so every character works offline after service worker installation; there are no per-character HTTP requests.
- `src/utils/hanziData.ts` deduplicates pack reads and serves character data to both animation and quiz components.
- `src/assets/fonts/noto-sans-sc.ttf` is a small local subset covering the current Chinese UI/content glyphs. Extend this subset when adding characters.
- Keep third-party license files with their assets.
- Workbox precaches JS, CSS, HTML, SVG, PNG, JSON, WOFF2, and TTF assets; the 20MB asset limit accommodates future growth of the Hanzi pack.

## GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on pushes to `master` or manual dispatch. It sets `VITE_BASE_PATH` from the repository name. Keep Vite `base`, PWA `start_url`/`scope`, and Workbox `navigateFallback` derived from that variable. Do not replace `HashRouter` with `BrowserRouter` unless static-host 404 handling is also added.

## Development conventions

- Use TSX, explicit domain/props types, strict checks, and co-located SCSS Modules.
- Reuse global design tokens and shared buttons/page classes.
- Preserve safe-area padding and the centered 480px mobile shell.
- Do not add editing/import/export, audio, synchronization, authentication, or backend behavior unless requested; these are outside the current MVP.
- Update this file when commands, storage, routes, deployment, or asset-generation requirements change.
