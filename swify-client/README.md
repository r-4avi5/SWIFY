# Swify — client

React + Vite frontend for the `swify-server` backend (Express/MongoDB UPI-style
wallet API). Built with React Router, GSAP, Framer Motion, and lucide-react —
matching the dependencies already declared in the backend's `package.json`.

## Setup

```bash
npm install
npm run dev
```

By default the app talks to `http://localhost:3000`. Change
`VITE_API_BASE_URL` in `.env` if your backend runs elsewhere.

Your backend's CORS setup must allow credentials and the client's origin
specifically (not `*`), since every request is sent with
`withCredentials: true` — the auth cookie won't work otherwise.

## Structure

File names mirror the backend's `routes/` and `constants/` folders:

```
src/
  api/                     one file per backend route group
    auth.api.js            -> routes/auth.routes.js
    user.api.js             -> routes/user.routes.js
    wallet.api.js            -> routes/wallet.route.js
    transaction.api.js       -> routes/transaction.routes.js
    transfer.api.js          -> routes/transfer.routes.js
    mpin.api.js               -> routes/mpin.routes.js
    kyc.api.js                 -> routes/kyc.routes.js
    notification.api.js        -> routes/notification.routes.js
    paymentIdentity.api.js      -> routes/paymentIdentity.routes.js
  constants/
    notification.types.js  -> mirrors backend constants/notification.types.js
    socket.events.js       -> mirrors backend constants/socket.events.js
  context/                  AuthContext (session) + NotificationContext (socket.io)
  lib/                       axios instance, socket.io client, formatters
  components/
    layout/                  Sidebar, Topbar, AppShell, ProtectedRoute
    wallet/                   WalletCard (signature tilt/foil card), ReceiveModal
    transactions/              TransactionRow (ledger-style list item)
    mpin/                       MpinPad, MpinModal (payment confirmation gate)
    notifications/               NotificationBell (dropdown)
    common/                       Button, Field, StatusBadge, EmptyState, Loader
  pages/
    auth/                    Login, Register
    dashboard/                Dashboard (wallet overview)
    transfer/                  Transfer (send-money flow: recipient -> amount -> MPIN -> done)
    transactions/                TransactionHistory, TransactionDetail
    kyc/                           Kyc (Aadhaar/PAN submission)
    mpin/                           Mpin (create/change flow)
    notifications/                   Notifications (full page)
    profile/                          Profile (identity + own QR)
```

## Design

Dark "vault" theme: deep navy panels with a brass-foil accent (evoking a
premium payment card), Urbanist for display type, JetBrains Mono for money
figures, reference codes, and swifyIds — the way a real bank statement
distinguishes prose from numbers. The `WalletCard` component is the signature
piece: a GSAP-driven, pointer-tilted card with a slot-counter balance
animation.

## A few backend issues found while wiring this up

These live in `swify-server` and are worth a look:

- `admin.routes.js` imports `approveKYC` but calls an undefined `reviewKYC`.
- `transferMoney` (transfer controller) calls an undefined `transferService`
  — it likely should call `transferMoneyService`.
- `transferByQRService` also calls the undefined `transferService`.
- `scanQRService` references `receiver` before it's assigned.
- There's no `GET` endpoint to fetch a user's own KYC status after
  submission, so the KYC page here can only show the status returned by the
  submit call itself, not on a later visit.
- Registration doesn't set the login cookie, so the frontend routes users to
  `/login` after signup rather than logging them in directly.
