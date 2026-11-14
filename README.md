# MockMate AI

AI-powered interview preparation with generated questions, voice or text practice, and answer-by-answer feedback.

> **Status: Core workflows in progress.** The app includes public pages, authentication/profile APIs, AI-generated interview questions, and AI-evaluated reports. Interview reports are currently stored in the browser. Cashfree-hosted UPI checkout, paid plans, monthly interview quotas, and server-verified payment activation are available after merchant configuration.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), Motion, TanStack Query |
| Backend | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2 (async), Alembic, psycopg 3 |
| Data | PostgreSQL 16, Redis 7 |
| AI | Server-side OpenAI-compatible chat completions API |
| Tests | Vitest + Testing Library, Playwright, Pytest |
| Infra | Docker, Docker Compose, GitHub Actions |

## Layout

```
.
├── frontend/                 Next.js app
├── backend/                  FastAPI service
├── docs/                     architecture and runbook
├── infrastructure/           deployment notes
└── docker-compose.yml        db, redis, api, web
```

## Quick start

### Option A — Docker

```bash
cp .env.example .env
docker compose up --build
```

### Option B — local processes

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
Copy-Item .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

In a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

## Billing and Cashfree setup

Paid plans are Starter (₹149/month, 20 interviews) and Pro (₹499/month, 60 interviews). The backend owns plan prices and verifies successful payment status and amount before activating a 30-day subscription.

1. Create a Cashfree merchant account and complete the onboarding/KYC steps required for your business profile and settlement bank account.
2. Use Cashfree **sandbox** credentials first. Put `CASHFREE_CLIENT_ID` and `CASHFREE_CLIENT_SECRET` in the backend environment only; never put secrets in frontend variables or commit them.
3. Set `CASHFREE_BASE_URL=https://sandbox.cashfree.com/pg`, `CASHFREE_API_VERSION=2023-08-01`, and `FRONTEND_BASE_URL` to the public frontend origin.
4. Configure the Cashfree payment webhook to `POST https://YOUR_API_HOST/api/v1/billing/webhook` and subscribe to payment success events. Keep the webhook secret/client secret private.
5. Ensure the user has a valid 10-digit mobile number saved in their profile before checkout.
6. Test successful, failed, and abandoned UPI payments in sandbox. Switch to production credentials and `https://api.cashfree.com/pg` only after merchant activation and end-to-end testing.

Cashfree checkout may offer UPI apps such as BHIM, Paytm, PhonePe, and Google Pay depending on merchant activation, device, and availability. A frontend redirect alone never activates a plan: the backend queries Cashfree and checks the signed webhook before applying the subscription. Do not treat a static UPI QR screenshot as automated payment proof.

For local development, the API callback URL will be localhost and Cashfree cannot send a public webhook to it directly. Use a public HTTPS development tunnel for webhook testing, or test the authenticated order-verification return flow in sandbox. Do not expose the backend without appropriate safeguards.

## API billing routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/billing/status` | Current plan and monthly quota |
| POST | `/api/v1/billing/orders` | Create a server-priced Cashfree order |
| POST | `/api/v1/billing/verify` | Query Cashfree and activate only a successful payment |
| POST | `/api/v1/billing/webhook` | Verify Cashfree signed payment webhooks |

## Verification

```powershell
cd backend
ruff check .
pytest
```

```powershell
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
```

Never commit secrets. Production also requires a strong `SECRET_KEY`, restricted CORS origins, and `DEBUG=false`.
