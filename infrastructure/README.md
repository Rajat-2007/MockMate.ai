# Infrastructure notes

Phase 1 ships local containerisation and CI. This folder holds deployment
guidance; actual cloud resources are provisioned in Phase 12.

## What exists today

- `backend/Dockerfile` — Python 3.12 slim, non-root user, healthcheck on
  `/api/v1/health/live`.
- `frontend/Dockerfile` — multi-stage Node 22 build, `output: "standalone"`
  runner, non-root user.
- `docker-compose.yml` — Postgres 16, Redis 7, API (runs migrations first), web.
- `.github/workflows/ci.yml` — lint, typecheck, unit tests, production build,
  plus both Docker images.

## Target topology (Phase 12)

| Component | Placement | Why |
| --- | --- | --- |
| Next.js | CDN edge + Node runtime | Global delivery, ISR for marketing pages |
| FastAPI | Container in Mumbai (`ap-south-1`) | Lowest latency for Indian users; websockets stay regional |
| PostgreSQL | Managed, same region as API | Single-digit ms queries, private networking |
| Redis | Same region | Session state and hot caches |
| Object storage | Private bucket, same region | Resumes and generated reports |
| LLM | Ollama on a GPU worker (dev), managed API (prod) | Provider interface keeps both possible |

## Environment separation

| Variable | local | staging | production |
| --- | --- | --- | --- |
| `ENVIRONMENT` | `local` | `staging` | `production` |
| `DEBUG` | `true` | `false` | `false` |
| `SECRET_KEY` | dev value | generated | 32+ random, rotated on incident |
| `BACKEND_CORS_ORIGINS` | `http://localhost:3000` | staging domain | production domains only |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `https://api.staging…` | `https://api.mockmate.ai` |

`NEXT_PUBLIC_*` values are baked in at image build time — build per environment,
do not reuse a single image across environments.

## Deploy order

1. Build and push both images tagged with the commit SHA.
2. Run `alembic upgrade head` against the target database (one-off task).
3. Roll the API container; wait for the healthcheck.
4. Roll the web container.
4. Smoke test: `/`, `/pricing`, `/api/v1/health`, and one authenticated flow
   once Phase 2 lands.

## Backups and recovery

- Managed Postgres: daily automated snapshot, 7-day retention minimum, point-in-time recovery enabled.
- Test a restore into a scratch database before launch, and after any migration
  that changes types or drops columns.
- Object storage: versioning on the resumes bucket; lifecycle rule for deleted
  accounts.

## Gaps to close before production

- Reverse proxy / ingress with TLS and HSTS.
- Centralised logs and error tracking (request ids are already emitted).
- Uptime alerting on `/api/v1/health` (5xx and `status: "degraded"`).
- Rate limiting at the edge, plus per-route limits in the API (Phase 2).
- Secret manager instead of `.env` files on hosts.
- Documented RPO/RTO for the database and object storage.
