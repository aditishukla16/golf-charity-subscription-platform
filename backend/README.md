# Backend (Node.js + Express)

Production-oriented API for the Golf Charity Subscription Platform.

## Frontend page to backend API mapping

- `AuthPage` (`LoginForm`, `SignupForm`)
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
- `PricingPage`
  - `POST /api/subscriptions/checkout`
  - `GET /api/subscriptions/me`
  - `POST /api/webhooks/stripe`
- `CharitiesPage`
  - `GET /api/charities?search=&category=`
- `UserDashboard`
  - Scores: `GET /api/scores/me`, `POST /api/scores/me`
  - Charity selection: `PUT /api/charities/me/selection`
  - Winnings: `GET /api/winnings/me`
  - Winner proof upload metadata: `POST /api/winnings/proofs`
- `AdminDashboard`
  - User management: `GET /api/admin/users`, `PATCH /api/admin/users/:userId`
  - Draw execution/publish: `POST /api/draws/run`, `PATCH /api/draws/:drawResultId/publish`
  - Winner proof verification: `PATCH /api/admin/winner-proofs/:proofId`
  - Mark payout complete: `PATCH /api/admin/payouts/:payoutId/complete`
  - Analytics summary: `GET /api/admin/analytics/summary`

## Run locally

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Notes

- JWT auth with role claims (`user`, `admin`).
- Subscription guard middleware checks active/trialing subscriptions.
- Draw scheduler runs monthly via cron (`DRAW_SCHEDULE_CRON`).
- Weighted draw uses score-based weight exponent (`WEIGHTED_DRAW_POWER`).
- Score retention is enforced in both API logic and SQL trigger.
