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
- `npm run dev` — start Vite.
- `npm run typecheck` — run strict TypeScript checks.
- `npm run build` — typecheck and build the PWA into `dist/`.
- `npm run preview` — serve the production build.
- `VITE_BASE_PATH=/repeater-v2/ npm run build` — build for this repository's GitHub Pages path.

There is no automated test file suite or lint command. Browser smoke checks have covered all five exercise types, search normalization, IndexedDB persistence, handwriting recognition, local HanziWriter data, and offline reload.

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

- `#/` — dictionary, 250ms debounced search, HSK/module/tag filters, handwriting input.
- `#/words/:wordId` — word details, keys, associations, examples, measure word, related words/parts.
- `#/keys` and `#/keys/:keyId` — keys, nested keys, related words.
- `#/training` — settings, five exercise types, SRS-aware sessions, completion state.
- `#/stats` — last 7 days, words with errors, consecutive training-day streak, recent answers.

Pinyin utilities are in `src/utils/pinyin.ts`. Preserve support for diacritics, numbered tones, toneless search, and `v`/`u:` for `ü`.

## Offline assets

- `public/vendor/hanzilookup.min.js` and `public/data/mmah.json` are the local HanziLookupJS runtime/model.
- `public/hanzi/<character>.json` contains local HanziWriter data for every character used by seed words and measure words.
- `src/assets/fonts/noto-sans-sc.ttf` is a small local subset covering the current Chinese UI/content glyphs. Extend this subset and the HanziWriter JSON assets when adding characters.
- Keep third-party license files with their assets.
- Workbox precaches JS, CSS, HTML, SVG, PNG, JSON, WOFF2, and TTF assets.

## GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on pushes to `master` or manual dispatch. It sets `VITE_BASE_PATH` from the repository name. Keep Vite `base`, PWA `start_url`/`scope`, and Workbox `navigateFallback` derived from that variable. Do not replace `HashRouter` with `BrowserRouter` unless static-host 404 handling is also added.

## Development conventions

- Use TSX, explicit domain/props types, strict checks, and co-located SCSS Modules.
- Reuse global design tokens and shared buttons/page classes.
- Preserve safe-area padding and the centered 480px mobile shell.
- Do not add editing/import/export, audio, synchronization, authentication, or backend behavior unless requested; these are outside the current MVP.
- Update this file when commands, storage, routes, deployment, or asset-generation requirements change.
