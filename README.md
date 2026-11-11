# MockMate AI

AI-powered interview preparation with generated questions, voice or text
practice, and answer-by-answer feedback.

> **Status: Core workflows in progress.** The app includes public pages,
> authentication/profile APIs, AI-generated interview questions, and
> AI-evaluated reports. Interview reports are currently stored in the browser;
> database-backed interview history, resume upload, adaptive follow-ups, and
> resume/coding rounds are not implemented yet. Razorpay UPI checkout, paid
> plans, monthly interview quotas, and server-verified payment activation are
> available after merchant configuration.

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
│   ├── src/app/
│   │   ├── (marketing)/      public pages: /, /features, /how-it-works, /pricing, /faq, /contact
│   │   ├── layout.tsx        fonts, metadata, providers
│   │   ├── robots.ts         robots.txt
│   │   └── sitemap.ts        sitemap.xml
│   ├── src/components/       ui/ (shadcn), layout/, marketing/, motion/, typography/
│   ├── src/config/           site nav, footer, metadata
│   ├── src/lib/              api client, marketing content, utils, env
│   ├── e2e/                  Playwright specs
│   └── Dockerfile
├── backend/                  FastAPI service
│   ├── app/
│   │   ├── api/v1/           versioned health, auth, profile, interview routers
│   │   ├── core/             settings, logging, middleware
│   │   ├── db/               async session, declarative base
│   │   ├── models/           SQLAlchemy models
│   │   ├── schemas/          Pydantic payloads
│   │   └── services/         domain logic
│   ├── alembic/              migrations (0001 = users)
│   ├── tests/                pytest suite
│   └── Dockerfile
├── docs/                     architecture and runbook
├── infrastructure/           deployment notes
├── scripts/                  local helper scripts
└── docker-compose.yml        db, redis, api, web
```

## Quick start

### Option A — Docker (everything)

```bash
cp .env.example .env
# AI uses local Ollama by default; add Razorpay keys to enable paid checkout.
docker compose up --build
# web:    http://localhost:3000
# api:    http://localhost:8000/docs
```

The backend container runs `alembic upgrade head` before starting the server.

### Option B — local processes (hot reload)

```powershell
# 1. infrastructure only
docker compose up -d db redis

# 2. backend
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1            # macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
Copy-Item .env.example .env             # Set SECRET_KEY and optional provider/payment credentials
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 3. frontend (new terminal)
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev                              # http://localhost:3000
```

Full command reference, migrations and troubleshooting: [docs/RUNBOOK.md](docs/RUNBOOK.md).

## Verification

```bash
# frontend
cd frontend
npm run lint
npm run typecheck
npm run test          # Vitest: content integrity, score consistency, no fake claims
npm run build         # 6 static routes + robots + sitemap
npm run test:e2e      # Playwright (needs `npx playwright install`)

# backend
cd backend
ruff check .
pytest
alembic upgrade head --sql    # renders migration SQL without a database
```

## API (implemented today)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | service metadata |
| `GET` | `/api/v1/health` | readiness: probes Postgres and Redis when configured |
| `GET` | `/api/v1/health/live` | liveness only, never touches a dependency |
| `POST` | `/api/v1/interviews/questions` | generate a tailored question set (authenticated) |
| `POST` | `/api/v1/interviews/evaluate` | evaluate submitted answers (authenticated) |
| `GET` | `/api/v1/billing/status` | current plan and monthly interview quota (authenticated) |
| `POST` | `/api/v1/billing/orders` | create a server-priced Razorpay order (authenticated) |
| `POST` | `/api/v1/billing/verify` | verify a captured UPI payment and activate a plan (authenticated) |
| `POST` | `/api/v1/billing/webhook` | verify Razorpay `payment.captured` webhooks |
| `GET` | `/docs` | OpenAPI UI (disabled in production) |

Interview API calls use `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL` from the
backend environment when a hosted provider is configured. Without a hosted API
key, the backend uses Ollama at `OLLAMA_BASE_URL` with `OLLAMA_MODEL` (default
`llama3.2:3b`). Install the model with `ollama pull llama3.2:3b`; for Docker,
Ollama must be reachable from the backend container at `host.docker.internal`.
Never add a hosted API key to a `NEXT_PUBLIC_*` variable. Speech recognition
and synthesis depend on browser support and permissions.

Paid checkout uses Razorpay-hosted UPI checkout; BHIM, Paytm, PhonePe, and
other UPI options are presented by the gateway when available. Set
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` only in
the backend environment, and configure the Razorpay webhook URL as
`/api/v1/billing/webhook` for `payment.captured` events. The backend verifies
the payment signature, captured status, amount, and order before activating a
30-day subscription. Never accept a static UPI screenshot as automated proof.
Set `FOUNDER_EMAIL` to the owner's account. After signing up with that account,
run `cd backend` then `python -m scripts.grant_founder_access` to explicitly
grant it verified admin status and unlimited founder access. Founder access
requires both the configured email and the database admin role; email alone is
not sufficient.

Plans: Free (4 interviews/month), Starter (₹149/month, 20 interviews), and Pro
(₹499/month, 60 interviews). The 4/20/60 monthly quotas are enforced by the
backend. The founder account bypasses paid plan limits.

Health behaviour: with `DATABASE_URL` empty the response still returns `200`
and reports `configured: false` — the API boots without infrastructure instead
of pretending a database exists. A configured but unreachable dependency
returns `503` with `status: "degraded"`.

## Environment

Never commit secrets. `.env.example` at the root and `backend/.env.example`
list every variable with placeholder values. Production refuses to boot when
`SECRET_KEY` is the default, CORS allows `*`, or `DEBUG` is on.

## Not implemented yet

- Persistent, database-backed interview sessions and report history
- Resume upload, parsing, and resume-grounded question generation
- Adaptive in-session follow-up questions
- Hosted speech-to-text / text-to-speech
- Monaco editor and isolated code execution
- Razorpay checkout and webhooks
- Admin panel and CMS
- Privacy policy, terms and cookie policy pages (legal review pending)

Marketing links point only at routes that exist; anything else returns the 404
page rather than a thin placeholder.
