# CLAUDE.md

Context file for the **RealtorFit** project. Read this before touching any code.

---

## What this is

A web platform that matches **homebuyers** with **realtors** based on fit —
budget, location, experience level, commission expectations, communication style,
and home-buying goals — instead of buyers picking an agent at random or defaulting
to big-name brokerages.

**Core thesis:** most real estate sites ask "what house do you want?" This one asks
"what kind of buying *experience* do you want?" The product is about the
buyer–realtor relationship, not the listings.

**Tagline:** "Find the realtor that fits your budget, goals, and style."

**Mission:** make finding the right realtor as personal as finding the right home.

---

## Project locations

| Path | Status | Notes |
|------|--------|-------|
| `/Users/domgielar/Desktop/realtor-fit/` | **Active** | Next.js rewrite — work here |
| `/Users/domgielar/Desktop/RealtorFit/_old_prototype/` | Archived | Old Vite/React prototype — reference only |
| `/Users/domgielar/Downloads/realtor-match/` | Archived | Same old prototype in a different location |

**All new work goes in `/Users/domgielar/Desktop/realtor-fit/`.**

---

## Signature feature: the Realtor Fit Score

Every realtor shown to a buyer gets a 0–100 **Fit Score** computed from the buyer's
profile. It is the heart of the product and the thing to protect/polish above all.

Example: *"Maria is a 92% match — specializes in first-time buyers, works in your
price range, lower commission, available this week."*

The score is a weighted blend of factors (lives in `lib/matching.ts`):

| Factor                        | Why it matters                              |
|-------------------------------|---------------------------------------------|
| Price-range overlap           | Agent should routinely work in buyer's range|
| Location served               | Must cover the buyer's city/region          |
| Specialty match               | Starter / luxury / condo / multi / land / investment |
| First-time-buyer experience   | Big factor for nervous first-timers         |
| Out-of-state experience       | Relevant for relocating buyers              |
| Investment experience         | Relevant for investor buyers                |
| Commission preference         | Newer+cheaper vs experienced+pricier        |
| Communication style           | Text / call / video / in-person             |
| Availability / timeline       | Can they start when the buyer needs?        |

Each match returns a **`reasons` array** (human-readable breakdown). Never show a
bare score with no reasons.

The `FitScore` component maps score to a visual tier:

| Score | Tier label    | Color token      |
|-------|---------------|------------------|
| 85+   | Excellent fit | `--color-gold`   |
| 70+   | Strong fit    | `--color-sage`   |
| 50+   | Decent fit    | `--color-clay`   |
| <50   | Loose fit     | `--color-muted`  |

---

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 16** (App Router, TypeScript) | Frontend + API in one project |
| Styling | **Tailwind CSS v4** + **shadcn/ui** | Utility-first + ready-made components |
| Database / Auth | **Supabase** | Postgres + auth + file storage in one |
| Data fetching | **TanStack Query** | Loading/error states, caching, background sync |
| Forms | **React Hook Form + Zod** | Type-safe forms, schema-driven validation |
| Deploy | **Vercel** | Zero-config Next.js hosting |

Run dev server:
```bash
cd /Users/domgielar/Desktop/realtor-fit
npm run dev      # http://localhost:3000
npm run build    # production build
```

---

## Project structure (current)

```
realtor-fit/
├── app/
│   ├── (realtor)/
│   │   └── dashboard/
│   │       └── page.tsx        Realtor dashboard — auth-guarded, loads profile by user_id, real data only
│   ├── api/
│   │   └── realtors/
│   │       ├── route.ts        GET list (id/name/created_at) · POST insert — service-role key, writes user_id
│   │       └── seed/
│   │           └── route.ts    GET — upserts the 8 REALTORS mock records (idempotent, run once)
│   ├── globals.css             Tailwind v4 base + shadcn tokens + brand CSS variables
│   ├── layout.tsx              Root layout — Inter + Fraunces fonts, metadata
│   └── page.tsx                SPA home — view state: welcome / login / wizard / matches / realtor-wizard
├── components/
│   ├── FitScore.tsx            Circular score meter (signature UI element)
│   ├── Login.tsx               Auth screen — email+password, role toggle (buyer/realtor), sign-in + create-account modes
│   ├── Matches.tsx             Ranked results grid + filter sidebar — fetches live from Supabase on mount, falls back to REALTORS if DB empty
│   ├── ProfileWizard.tsx       Multi-step buyer questionnaire → produces BuyerProfile
│   ├── RealtorCard.tsx         Summary card with fit score, shown in Matches list
│   ├── RealtorDetail.tsx       Full realtor profile panel (dialog)
│   ├── RealtorWizard.tsx       Multi-step realtor sign-up → captures auth.uid → POSTs to /api/realtors
│   ├── Welcome.tsx             Landing / hero — buyer, realtor, and login entry points
│   └── ui/                     shadcn components — never hand-edit these
├── lib/
│   ├── matching.ts             Fit-score engine — pure functions, no component logic
│   ├── realtors.ts             Realtor type + 8 mock records + registerRealtor(realtor, userId?)
│   ├── utils.ts                cn() helper from shadcn
│   └── supabase/
│       ├── client.ts           Browser Supabase client (createBrowserClient)
│       ├── queries.ts          getRealtors() — fetches public.realtors, maps snake_case → Realtor camelCase
│       └── server.ts           Server Supabase client (createServerClient + cookies)
├── supabase/
│   └── migrations/
│       ├── 001_create_realtors_and_buyer_leads.sql   ✅ Run
│       └── 002_add_user_id_to_realtors.sql           ⚠️ Needs to be run in SQL Editor
├── .env.local                  Supabase credentials (filled in, correct URL)
├── components.json             shadcn config
├── next.config.ts
└── tsconfig.json
```

---

## Supabase project

- **Project URL:** `https://lfmbczgohxgslaeiyhfy.supabase.co`
- **Project ID:** `lfmbczgohxgslaeiyhfy`
- **Credentials:** in `.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Note:** The Supabase MCP tool is connected to a different/older account. All Supabase work must either be done via the SQL Editor in the dashboard or through app code calling the API.

---

## Database schema

Two tables — both created by `supabase/migrations/001_create_realtors_and_buyer_leads.sql`.

**`realtors`** — mirrors `Realtor` interface in `lib/realtors.ts`:
```
id, name, photo, regions[], years_experience, homes_sold,
price_band_min, price_band_max, commission_rate, specialties[],
first_time_friendly, out_of_state_experienced, investment_experienced,
languages[], comm_styles[], available_this_week, avg_response_hours,
rating, review_count, license_verified, personality[], bio, recent_deal,
user_id (uuid → auth.users), created_at
```
RLS: public read · service-role insert · owner can update own row (`auth.uid() = user_id`).
`user_id` is set at registration time — dashboard queries by it to load the logged-in realtor's profile.

**`buyer_leads`** — mirrors `BuyerProfile` interface in `lib/matching.ts`:
```
id, price_min, price_max, region, in_state, first_time, home_type,
timeline, pre_approved, experience_pref, comm_style, created_at
```
RLS: anyone can insert (anonymous), no reads (privacy).

---

## Design direction

- **Feel:** warm, trustworthy, human — a calm advisor, not cold proptech. Avoid the
  Zillow-blue / corporate look and the luxury-serif cliché.
- **Palette** (defined as CSS variables in `app/globals.css`):

| Token | Value | Use |
|-------|-------|-----|
| `--color-ink` | `#1f2e3d` | Primary text (slate-navy) |
| `--color-ink-soft` | `#3c4b5a` | Secondary text |
| `--color-paper` | `#f6f3ec` | Page background (warm off-white) |
| `--color-paper-deep` | `#efeadd` | Slightly deeper background |
| `--color-clay` | `#bd5d3d` | Primary accent (brick/warmth of home) |
| `--color-clay-deep` | `#9f4a2e` | Hover state for clay |
| `--color-gold` | `#c79235` | Excellent fit indicator |
| `--color-sage` | `#5d8a68` | Strong fit / secondary |
| `--color-muted` | `#797f87` | Placeholder / disabled text |
| `--color-line` | `#e6dfd2` | Borders and dividers |

- **Type:** `--font-display` = Fraunces (headings only) / `--font-sans` = Inter (everything else).
- **The Fit Score meter is the one bold element.** Keep everything around it quiet.

---

## Migration / build status

| Step | Task | Status |
|------|------|--------|
| 1 | Scaffold Next.js 16 + Tailwind v4 + shadcn/ui | ✅ Done |
| 2 | Port `matching.ts` + `realtors.ts` with TypeScript types | ✅ Done |
| 3 | Port all components to `.tsx` + wire up buyer/realtor flows | ✅ Done |
| 4 | Replace all styles with Tailwind + shadcn components | ✅ Done |
| 5a | Install `@supabase/supabase-js` + `@supabase/ssr` | ✅ Done |
| 5b | Create `lib/supabase/client.ts` + `lib/supabase/server.ts` | ✅ Done |
| 5c | Write DB migration SQL (`001_create_realtors_and_buyer_leads.sql`) | ✅ Done |
| 5d | Run migration 001 in Supabase SQL Editor | ✅ Done |
| 6a | Replace `localStorage` with Supabase insert in `RealtorWizard` | ✅ Done |
| 6b | Replace mock `REALTORS` array with live Supabase query | ✅ Done |
| 6c | Save `BuyerProfile` to `buyer_leads` on wizard completion | ⬜ |
| 7a | Auth UI — `Login.tsx` with role toggle, sign-in + create-account | ✅ Done |
| 7b | Run migration 002 (`user_id` on realtors) in Supabase SQL Editor | ⚠️ Needs you |
| 7c | Dashboard — auth-guarded, loads real profile by `user_id`, no mock data | ✅ Done |
| 7d | Gate `RealtorWizard` behind auth (require login before creating profile) | ⬜ |
| 7e | Link buyer leads to the matched realtor's profile | ⬜ |
| 8 | Deploy to Vercel | ⬜ |

---

## Exact next steps

### Step 7b — Run migration 002 (you do this once)

1. Go to Supabase dashboard → project `lfmbczgohxgslaeiyhfy` → SQL Editor
2. Open `supabase/migrations/002_add_user_id_to_realtors.sql`, copy all, paste and **Run**

This adds `user_id uuid references auth.users` to the `realtors` table and an RLS policy so realtors can update their own row (used by the "Accepting clients" toggle on the dashboard).

---

### Step 6c — "Save buyer profile to buyer_leads"

**Context:** buyer data lives only in React state and is discarded after the session — no leads are captured.

**What changes:**
- New API route `app/api/buyer-leads/route.ts` — POST using the anon key (RLS allows anonymous insert)
- `app/page.tsx` — fire-and-forget POST when buyer transitions from wizard to matches; no need to block on the response
- `BuyerProfile` in `lib/matching.ts` maps directly to `buyer_leads` columns

**Prompt:** *"Save buyer profiles to Supabase when they complete the wizard"*

---

### Step 7d — Gate RealtorWizard behind auth

**Context:** anyone can currently hit "Sell to every client" and create a realtor profile without an account, leaving `user_id = null` and no way to claim the dashboard.

**What changes:**
- `Welcome.tsx` — "Sell to every client" button checks for a session first; if none, redirects to `Login.tsx` with mode pre-set to `signup` and role pre-set to `realtor`
- After successful sign-up, continue into the `RealtorWizard` flow
- `RealtorWizard.tsx` — if `user_id` is null at submit time, block with an error (belt-and-suspenders)

**Prompt:** *"Gate the realtor wizard behind Supabase Auth so profiles always have a user_id"*

---

### Step 7e — Link buyer leads to matched realtors

**Context:** `buyer_leads` has no `realtor_id` column — the dashboard shows an empty leads panel.

**What changes:**
- Add `realtor_id text references public.realtors(id)` to `buyer_leads` (new migration `003_...`)
- When scoring matches in `Matches.tsx`, fire-and-forget a POST that records the top-N matched realtor IDs on each `buyer_lead` row
- Dashboard queries `buyer_leads` where `realtor_id = realtor.id` and renders real buyer cards

**Prompt:** *"Link buyer leads to matched realtors so the dashboard shows real leads"*

---

### Step 8 — Deploy to Vercel

**What's needed before deploying:**
- All `.env.local` variables added to Vercel project environment (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Confirm `next.config.ts` has no local-only assumptions
- Run `npm run build` locally one final time — must be zero errors

**Prompt:** *"Deploy RealtorFit to Vercel"*

---

## Conventions

- **Matching logic stays pure.** `lib/matching.ts` takes a buyer profile + realtor
  and returns `{ score: number, reasons: Reason[] }`. No component logic inside it.
- **Types flow from `lib/`.** `Realtor` and `BuyerProfile` interfaces are defined
  in `lib/realtors.ts` and `lib/matching.ts` respectively. Import them everywhere —
  never redefine them inline.
- **Brand colors via CSS variables.** Use `text-[--color-clay]` / `bg-[--color-paper]`
  in Tailwind classes. Do not hardcode hex values in components.
- **shadcn components live in `components/ui/`.** Add them with
  `npx shadcn@latest add <component>` — never hand-edit them.
- **This is a two-sided marketplace.** Most features need a buyer view AND a realtor
  view — note which side a request is for before building.
- **Real estate is regulated.** Fair housing, license verification, commission
  disclosure — flag anything touching those areas rather than guessing.
- **The `Realtor` shape in `lib/realtors.ts` is the schema contract.** The Supabase
  `realtors` table must match it exactly — `price_band_min`/`price_band_max` are the
  DB columns for the `priceBand: [number, number]` tuple in TypeScript.
- **API routes use the service-role key** (`SUPABASE_SERVICE_ROLE_KEY`) for writes.
  Client components use the anon key via `lib/supabase/client.ts`.
