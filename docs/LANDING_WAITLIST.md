# Landing page waitlist

Notes for the **early-access waitlist** on the marketing homepage: what was built, how to configure it, and what is still left to do.

Cross-repo feature:

- **Landing UI:** `landingPage/`
- **API + storage:** `backend/` (FastAPI + PostgreSQL)

---

## What it does

- Collects **first name, last name, company name (optional), email** (+ optional “product updates” checkbox).
- Stores signups in **`waitlist_signups`** (platform-level, not workspace-scoped), including a **`status`** field (`PENDING` | `CONTACTED` | `ACCEPTED` | `DECLINED`) for manual follow-up tracking. Admins update it via `PATCH /api/v1/waitlist/{id}/status`.
- Protects public form with **Cloudflare Turnstile**, honeypot, and **5 req/min** rate limit.
- **Duplicate emails** get the same success message (no “already registered” leak).
- **No outbound email in v1** — you email people later manually or via a future job.

### UX placement (modal-only)

There is **no inline `#waitlist` deck panel**. All CTAs open the same morphing modal.

| Entry point | Behavior |
|-------------|----------|
| **Mobile nav** compact **Sign Up** (`md:hidden`) | Hidden on hero (hero CTA only); after scroll past hero, pops in at navbar slot (450ms scale expand in place, no hero→nav FLIP); section selector nudged left, CTA nudged right; morphs from nav button; source = `nav`. No bottom-right FAB on mobile. |
| Fixed bottom-right **Sign Up** FAB (desktop, after hero) | Hidden on hero and on mobile; fades in at bottom-right after scroll (450ms slide-up, no hero→FAB travel); morphs into modal; source = `waitlist_section`. Default style: rainbow pill (`pill_rainbow`). Dev tools can preview `fab_icon`, `glass_chip`, `mini_banner`. |
| Hero **Sign Up** | Opens modal from hero button rect; morph face matches hero label; source = `hero` |
| Pricing **Start free trial** (Starter/Pro) | Opens modal from tier CTA rect; morph face matches tier CTA label; source = `pricing` |
| Pricing **Contact sales** (Enterprise) | Still `#contact` (placeholder) |
| Tour right-bar **down** on last stop | Glides to **Capabilities** (unchanged) |

### Morph animation

CTAs pass `getBoundingClientRect()` plus trigger element. `openWaitlist` reads computed `borderRadius` from the trigger so the morph shell **starts at the exact button box** (not a scaled-down modal). FAB enter animation does **not** re-run after modal close (`freezeTravel` preserves completion). Pill-shaped triggers (`rounded-full` FAB) are clamped to a **12px rounded-rect** origin so expand never reads as an oval loader; `border-radius` eases faster (~40% of expand) than size/position. The shell animates `left`, `top`, `width`, `height`, and `border-radius` to the centered modal rect; dialog content mounts at ~70% of the expand. **`FabMorphFace` label shows on open travel only** (initial collapsed beat), not during close collapse.

### Panel slide reveal

After the shell reaches full size (`phase === 'open'`), the dialog runs a second beat:

1. **Covered** — purple brand panel fills the entire modal (form hidden behind); **center-aligned** column (dashboard-style Marker mark, Kolom, eyebrow, headline — no lead yet).
2. **Reveal** — column **transform-slides left** (420ms, synced with panel swipe); text snaps to left-aligned; lead + FAQ link stagger in after (0ms, 60ms). **Mobile:** 35/65 vertical stack; brand stays **top-left** (no center→left column shift); headline-only header (lead/FAQ hidden in strip); scrollable form. **Desktop (`md+`):** 47/53 side-by-side columns with full centered-cover choreography.

**Timing unchanged:** morph expand 480ms, collapse 420ms, panel reveal 420ms ([`waitlistFabMorph.js`](src/lib/waitlistFabMorph.js)). Brand choreography differs from earlier iterations (no logo-only FLIP; eyebrow/headline visible on cover without stagger).
3. **Close** — copy clears and purple re-covers instantly (no logo reverse travel), then the shell morphs back to the trigger button.

Timing: `useWaitlistPanelReveal` + `PANEL_REVEAL_DURATION_MS` (420ms). Skipped when `prefers-reduced-motion: reduce`.

---

```
Landing (Vercel)                    Backend (Railway)
─────────────────                   ─────────────────
WaitlistModal.jsx                   POST /api/v1/waitlist  (public)
  └─ WaitlistDialogLayout    ───►     └─ verify Turnstile
  └─ Turnstile widget                 └─ insert waitlist_signups
  └─ waitlistApi.js (source whitelist) GET /api/v1/waitlist   (admin allowlist)
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
| `src/components/waitlist/WaitlistFab.jsx` | Fixed bottom-right FAB (post-hero); fade-in enter |
| `src/components/waitlist/WaitlistFabFace.jsx` | FAB visual variants (pill, icon, glass, banner) |
| `src/lib/waitlistFabStyles.js` | FAB style registry + morph meta |
| `src/hooks/useWaitlistFabFadeEnter.js` | One-shot fade-in when FAB appears after hero |
| `src/components/waitlist/WaitlistModal.jsx` | Portal modal with FLIP morph + dialog layout |
| `src/components/waitlist/WaitlistDialogLayout.jsx` | Two-column modal shell (brand left, form right) |
| `src/components/waitlist/WaitlistForm.jsx` | Field stack + Turnstile |
| `src/components/waitlist/WaitlistSubmitButton.jsx` | Full-width pill submit CTA |
| `src/components/waitlist/FabMorphFace.jsx` | Label overlay on open travel only (matches origin size) |
| `src/hooks/useWaitlistForm.js` | Form state + submit logic |
| `src/hooks/useWaitlistPanelReveal.js` | Purple cover → slide reveal; reverse on close |
| `src/lib/waitlistFabMorph.js` | Rect morph frames (origin → modal), origin chrome helpers |
| `src/lib/waitlistApi.js` | `fetch` client + source whitelist |
| `src/pages/Home.jsx` | FAB, modal, CTA wiring, `waitlistSource` + `waitlistFabStyle` state |
| `src/components/Pricing.jsx` | Trial buttons → modal |
| `.env.example` | Frontend env template |

---

## Known TODOs

1. **`TODO(waitlist-source)`** — Add dedicated `fab` source literal on backend if FAB should be tracked separately from `waitlist_section`.

---

## Setup checklist

Use this when deploying or fixing “sign-up doesn’t work.”

### 1. Database migration (backend)

```bash
cd backend
alembic upgrade head
```

Confirms table `waitlist_signups` exists. Migration merges two Alembic heads (`064_waitlist_signups`).

### 2. Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | Landing `.env` / Vercel | Backend base, e.g. `https://backend-production-847f.up.railway.app/api/v1` |
| `VITE_TURNSTILE_SITE_KEY` | Landing | Cloudflare Turnstile site key (public widget) |
| `TURNSTILE_SECRET_KEY` | Backend Railway | Turnstile server verification |
| `WAITLIST_ADMIN_EMAILS` | Backend | Comma-separated admin emails for GET list |
| `WAITLIST_IP_HASH_SALT` | Backend optional | Extra salt for hashed IP |
| `BACKEND_CORS_ORIGINS` | Backend | Must include landing origin |

Dev bypass: when `import.meta.env.DEV` is true and Turnstile site key is unset, frontend sends `dev-bypass` token (backend must allow in dev).

---

## API

### Public — join waitlist

```
POST /api/v1/waitlist
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Doe",
  "company_name": "Acme Textiles",
  "email": "user@factory.com",
  "wants_product_updates": true,
  "turnstile_token": "...",
  "source": "hero",
  "website": ""
}
```

**Sources (backend-validated):** `waitlist_section` | `hero` | `pricing` | `nav` | `unknown`

Frontend normalizes unknown values to `unknown` via whitelist in `waitlistApi.js`.

### Admin — update follow-up status

```
PATCH /api/v1/waitlist/{signup_id}/status
Content-Type: application/json

{ "status": "CONTACTED" }
```

`status` is one of `PENDING` | `CONTACTED` | `ACCEPTED` | `DECLINED` (defaults to `PENDING` on signup). `GET /api/v1/waitlist` also accepts a `status` query param to filter the list. Both routes require the admin allowlist (`WAITLIST_ADMIN_EMAILS`).

---

## Manual smoke

1. Scroll past hero → bottom-right FAB fades in; click → modal opens crisp (no stretched text).
2. Submit with valid email → **200**, row in DB.
3. Hero / pricing / bottom-right FAB CTAs each open modal with correct label on morph face and correct `source`.
4. Scroll past FAQ — no waitlist deck panel.
5. Short viewport (~800px height) — form scrolls inside modal; submit + Turnstile reachable.
6. `prefers-reduced-motion: reduce` → instant modal, no travel.

---

## Tests

```bash
cd backend
python -m pytest tests/test_waitlist.py -q

cd landingPage
npm run build
npm run lint
```
