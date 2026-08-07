# Swify — client

React + Vite + Tailwind CSS frontend for the `swify-server` backend.

## Setup

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` if your backend isn't at `http://localhost:3000`.

## Structure

Flat, one file per concern — same style as the backend's `controllers/`,
`routes/`, `services/` folders (no nested per-feature subfolders):

```
src/
  api/            one file per backend route group (auth, wallet, transfer, mpin, kyc, ...)
  config/         axios instance + socket.io client (mirrors backend's config/db.js)
  constants/      notification.types.js, socket.events.js — mirror backend's constants/ exactly
  context/        AuthContext, NotificationContext
  utils/          formatters (mirrors backend's utils/)
  components/     Sidebar, Topbar, WalletCard, MpinPad, MpinModal, Button, Field, etc. — all flat
  pages/          Login, Register, Dashboard, Transfer, TransactionHistory, TransactionDetail,
                  Kyc, Mpin, Notifications, Profile — one file per page, all flat
  App.jsx         routes
  main.jsx        entry point
  index.css       Tailwind import + design tokens (@theme block)
```

## Styling

Tailwind CSS v4 (via `@tailwindcss/vite`, no separate config file needed —
tokens live in `src/index.css`'s `@theme` block). Custom design tokens:

- `bg-ink`, `bg-panel`, `bg-panel-2`, `bg-panel-3` — the dark "vault" surfaces
- `text-brass`, `text-brass-soft`, `bg-brass` — the foil-card accent
- `text-signal` / `text-coral` — credit (money in) / debit (money out)
- `font-mono` — JetBrains Mono, used for balances, reference codes, swifyIds
- `font-display` (default body font) — Urbanist

GSAP still drives the `WalletCard`'s pointer-tilt/foil-shine and balance
counter; Framer Motion still handles page/modal transitions. Both are
independent of the styling layer, so switching to Tailwind didn't touch
that logic.

## Connecting to the backend

Same as before — your backend's CORS must allow credentials from this app's
origin specifically (not `*`), since auth is an httpOnly cookie. See the
`swify-server` README/notes for the two-line CORS fix if you haven't
applied it yet.
