Custody Clarity – prototype PWA for custody and contact rights in Germany. Mobile‑first, i18n, rules‑driven interview, and PDF stubs.

Key features
- Home + interview flow (EN/DE)
- Rules engine evaluating JSON rules (`src/lib/rules.ts`, `src/data/rules.json`)
- Result screen with citations and next steps
- PDF endpoints (serverless) and simple client forms
- Directory (Berlin sample) with postcode search (`/directory`)
- Vault for notes/files with local export (`/vault`)
- Settings with language switch (`/settings`)

Getting started
- Install: `npm install`
- Dev: `npm run dev` → http://localhost:3000
- Test rules: `npm test`

Structure
- `src/i18n/` – i18n provider + EN/DE dictionaries
- `src/store/app.ts` – Zustand store with persistence
- `src/lib/rules.ts` – JSON logic evaluator (minimal)
- `src/data/` – rules + sample directory data
- `src/app/api/pdf/*` – PDF generation stubs using `pdf-lib`

Notes
- Information only. Not individualized legal advice.
- Data is local‑first; no external tracking. PWA/service worker TBD.
