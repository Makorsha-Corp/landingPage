# Landing page waitlist

Notes for the **early-access waitlist** on the marketing homepage: what was built, how to configure it, and what is still left to do.

Cross-repo feature:

- **Landing UI:** `landingPage/`
- **API + storage:** `backend/` (FastAPI + PostgreSQL)

---

## What it does

- Collects **email only** (+ optional “product updates” checkbox).
- Stores signups in **`waitlist_signups`** (platform-level, not workspace-scoped).
- Protects public form with **Cloudflare Turnstile**, honeypot, and **5 req/min** rate limit.
- **Duplicate emails** get the same success message (no “already registered” leak).
- **No outbound email in v1** — you email people later manually or via a future job.

### UX placement

| Entry point | Behavior |
|-------------|----------|
| New deck panel **after FAQ** | Full sign-up form (`#waitlist`) |
| Top nav **Join waitlist** | Glides to sign-up section; source = `nav` |
| Hero **Purchase** | Glides to sign-up; source = `hero` |
| Pricing **Start free trial** (Starter/Pro) | Glides to sign-up; source = `pricing` |
| Pricing **Contact sales** (Enterprise) | Still `#contact` (placeholder) |
| Tour right-bar **down** on last stop | Glides to **Capabilities** (unchanged) |

---

## Architecture

```
Landing (Vercel)                    Backend (Railway)
─────────────────                   ─────────────────
SignUpSection.jsx                   POST /api/v1/waitlist  (public)
  └─ Turnstile widget        ───►     └─ verify Turnstile
  └─ waitlistApi.js                   └─ insert waitlist_signups
                                      GET /api/v1/waitlist   (admin allowlist)
```

---

## Files to know

### Backend (`backend/`)

| File | Role |
|------|------|
| `alembic/versions/064_waitlist_signups.py` | Migration — run before prod |
| `app/models/waitlist_signup.py` | SQLAlchemy model |
| `app/schemas/waitlist.py` | Request/response DTOs |
| `app/dao/waitlist.py` | DB access |
| `app/services/waitlist_service.py` | Turnstile verify, duplicate handling |
| `app/core/waitlist_admin.py` | Admin allowlist dependency |
| `app/api/v1/endpoints/waitlist.py` | HTTP routes |
| `app/api/v1/router.py` | Registers `/waitlist` |
| `app/core/config.py` | Env vars |
| `tests/test_waitlist.py` | Unit tests |

### Landing (`landingPage/`)

| File | Role |
|------|------|
| `src/components/SignUpSection.jsx` | Form UI |
| `src/lib/waitlistApi.js` | `fetch` client |
| `src/components/LandingPostTourSections.jsx` | Deck panel after FAQ |
| `src/pages/Home.jsx` | Nav, refs, CTA wiring, `waitlistSource` state |
| `src/components/Pricing.jsx` | Trial buttons → waitlist |
| `.env.example` | Frontend env template |

---

## Setup checklist

Use this when deploying or fixing “sign-up doesn’t work.”

### 1. Database migration (backend)

```bash
cd backend
alembic upgrade head
```

Confirms table `waitlist_signups` exists. Migration merges two Alembic heads (`064_waitlist_signups`).

### 2. Backend environment (Railway / `.env`)

| Variable | Required | Notes |
|----------|----------|-------|
| `TURNSTILE_SECRET_KEY` | **Prod yes** | From Cloudflare Turnstile |
| `WAITLIST_ADMIN_EMAILS` | For admin API | Comma-separated, e.g. `you@marker.io,cofounder@marker.io` |
| `WAITLIST_IP_HASH_SALT` | Optional | Extra salt for hashed IP; defaults to `SECRET_KEY` |
| `BACKEND_CORS_ORIGINS` | **Yes for landing** | Must include landing origin(s) |

Example CORS (adjust to your landing URL):

```env
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:4173","https://your-landing.vercel.app"]
```

See `backend/.env.example`.

### 3. Landing environment (Vercel / `.env.local`)

| Variable | Required | Notes |
|----------|----------|-------|
| `VITE_API_URL` | **Yes** | e.g. `https://backend-production-847f.up.railway.app/api/v1` |
| `VITE_TURNSTILE_SITE_KEY` | **Prod yes** | Public site key (pair with secret above) |

See `landingPage/.env.example`.

### 4. Cloudflare Turnstile

1. Cloudflare dashboard → Turnstile → Add site.
2. Domains: production landing URL + `localhost` for dev.
3. Copy **site key** → landing `VITE_TURNSTILE_SITE_KEY`.
4. Copy **secret key** → backend `TURNSTILE_SECRET_KEY`.

### 5. Dev without Turnstile keys

If `TURNSTILE_SECRET_KEY` is **empty** and `ENVIRONMENT=development`:

- Backend **skips** Turnstile verification.
- Frontend sends token `dev-bypass` when no site key is set.

**Do not rely on this in production** — set both keys before go-live.

---

## API reference

### Public — join waitlist

```http
POST /api/v1/waitlist
Content-Type: application/json

{
  "email": "user@factory.com",
  "wants_product_updates": false,
  "turnstile_token": "<token from widget>",
  "source": "waitlist_section",
  "website": null
}
```

**Sources:** `waitlist_section` | `hero` | `pricing` | `nav` | `unknown`

**Honeypot:** if `website` is non-empty, returns success without saving.

**Response (always 200 on success/duplicate):**

```json
{
  "ok": true,
  "message": "You're on the list — we'll be in touch."
}
```

**Rate limit:** 5 requests/minute per IP.

### Admin — list signups

```http
GET /api/v1/waitlist?skip=0&limit=100&search=&wants_product_updates=
Authorization: Bearer <JWT>
```

- Caller must be logged-in ERP user whose **email** is in `WAITLIST_ADMIN_EMAILS`.
- Not limited to workspace owners globally — **platform allowlist only**.

Example:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://backend-production-847f.up.railway.app/api/v1/waitlist?limit=50"
```

---

## Database schema

**Table:** `waitlist_signups`

| Column | Type | Notes |
|--------|------|-------|
| `id` | int | PK |
| `email` | string(320) | Unique, lowercased on insert |
| `wants_product_updates` | bool | Default false |
| `source` | string(64) | Nullable — analytics |
| `ip_hash` | string(64) | Nullable — SHA-256(IP + salt) |
| `created_at` | timestamptz | Server default now |

---

## Manual QA checklist

- [ ] Submit from **Join waitlist** section → row in DB, success UI
- [ ] Submit **same email again** → success UI, no duplicate row
- [ ] **Hero Purchase** → scrolls to form; submit with source `hero` in DB
- [ ] **Pricing Start free trial** → source `pricing`
- [ ] **Nav Join waitlist** → source `nav`
- [ ] Checkbox on/off saved as `wants_product_updates`
- [ ] Turnstile failure shows error, widget resets
- [ ] Admin GET works for allowlisted email; **403** for others
- [ ] CORS: form works from localhost and deployed landing URL

---

## Out of scope (v1) — future work

Track these if you come back to “finish” the feature:

- [ ] **Send confirmation / welcome email** (Resend, SMTP, etc.)
- [ ] **Mailchimp / newsletter sync** cron
- [ ] **In-app ERP admin UI** for waitlist (today: API + curl/SQL)
- [ ] **Edit-mode / DevTools** copy editing for waitlist (like FAQ)
- [ ] **Privacy policy** real URL (form links to `#faq` placeholder)
- [ ] **Enterprise “Contact sales”** — `#contact` target does not exist yet
- [ ] **CSV export** endpoint (JSON list is enough for now)
- [ ] **Double opt-in** email flow (optional checkbox only, no confirm email)

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| CORS error in browser | Landing origin not in `BACKEND_CORS_ORIGINS` | Add Vercel URL to Railway env |
| “Verification failed” | Turnstile keys mismatch or wrong domain | Re-check site/secret pair and Turnstile hostnames |
| Form submits but 503 | `TURNSTILE_SECRET_KEY` missing in prod | Set secret on Railway |
| Admin GET 403 | Email not in `WAITLIST_ADMIN_EMAILS` | Add your login email to env |
| Admin GET 503 | Allowlist env empty | Set `WAITLIST_ADMIN_EMAILS` |
| 500 on submit | Migration not applied | `alembic upgrade head` |
| Turnstile widget blank | Missing `VITE_TURNSTILE_SITE_KEY` on Vercel | Set env + redeploy landing |

---

## Tests

**Backend:**

```bash
cd backend
python -m pytest tests/test_waitlist.py -q
```

---

## Design decisions (from planning)

- **Backend storage** over Mailchimp/Vercel-only — you own data; admin API fits ERP stack.
- **Silent duplicate success** — privacy / no email enumeration.
- **Platform admin allowlist** — not every workspace `owner` (marketing data).
- **Section after FAQ** — full deck panel; Pricing section kept on page.
- **Hero + Pricing CTAs** redirect to waitlist instead of login2.

Original plan: `.cursor/plans/landing_waitlist_signup_479cf5d5.plan.md` (do not edit plan file; this doc is the living ops note).

---

## Quick deploy reminder

1. `alembic upgrade head` on Railway DB  
2. Set backend: `TURNSTILE_SECRET_KEY`, `WAITLIST_ADMIN_EMAILS`, `BACKEND_CORS_ORIGINS`  
3. Set landing on Vercel: `VITE_API_URL`, `VITE_TURNSTILE_SITE_KEY`  
4. Smoke-test one signup + one admin list call  

Last updated: 2026-07-29 (implementation session).
