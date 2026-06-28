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
| Maps | **`@vis.gl/react-google-maps`** | Google Maps JS API React wrapper — map, marker, circle, Geocoder |
| Deploy | **Vercel** | Zero-config Next.js hosting |

Run dev server:
```bash
cd /Users/domgielar/Desktop/realtor-fit
npm run dev      # http://localhost:3000
npm run build    # production build
```

---

## Google Maps setup

- API key is in `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` ✅
- `Providers.tsx` wraps the whole app in `<APIProvider>` so `LocationPicker` can use `useMap` / `useMapsLibrary`
- **APIs that must be enabled in Google Cloud Console:**
  - **Maps JavaScript API** — loads the map
  - **Geocoding API** — powers the search box and click-to-pin reverse geocoding
  - ~~Places API~~ — NOT used; the code uses the Geocoder, not Places Autocomplete
- For production: restrict the key to the Vercel domain in Google Cloud Console

---

## Project structure (current)

```
realtor-fit/
├── app/
│   ├── (realtor)/
│   │   └── dashboard/
│   │       └── page.tsx        Realtor dashboard — auth-guarded, loads profile by user_id; shows stats,
│   │                           profile detail, buyer leads panel (from buyer_lead_matches), messages panel
│   │                           (conversations grouped by buyer, polls every 15s, inline MessageThread reply),
│   │                           SVG circular profile strength meter (real weights: bio 30, recentDeal 25,
│   │                           specialties 20, commStyles 15, personality 10 = 100 max), availability
│   │                           toggle (writes to DB live), EditProfileModal (opened via Edit profile btn);
│   │                           background: fixed divs, no scale/bg-fixed to prevent scroll blur
│   ├── api/
│   │   ├── buyer-leads/
│   │   │   └── route.ts        POST — reads auth user via server client to get user_id; inserts
│   │   │                       BuyerProfile into buyer_leads (with user_id) + fan-out match rows
│   │   │                       into buyer_lead_matches for each matched realtor (service-role key)
│   │   └── realtors/
│   │       ├── route.ts        GET list (id/name/created_at) · POST insert — service-role key, writes user_id
│   │       └── seed/
│   │           └── route.ts    GET — upserts the 8 REALTORS mock records (idempotent, run once)
│   ├── globals.css             Tailwind v4 base + shadcn tokens + brand CSS variables
│   ├── layout.tsx              Root layout — Inter + Fraunces fonts, metadata; wraps children in Providers
│   └── page.tsx                SPA home — view states: welcome / login / wizard / matches / realtor-wizard;
│                               on auth restore: loads saved buyer profile via getBuyerProfile(userId) and
│                               skips wizard if found; loginIntent tracks post-auth destination;
│                               View Transitions API for nav; passes userId + onSignOut to Matches
├── components/
│   ├── BuyerProfilePanel.tsx   LinkedIn-style messages popup — fixed bottom-right, controlled by open prop
│   │                           (no floating trigger button — triggered from Messages btn in Matches sidebar);
│   │                           shows conversation list (polls every 10s); click → opens MessageThread inline;
│   │                           back arrow returns to list; X closes the panel
│   ├── EditProfileModal.tsx    Full-screen overlay modal for realtors to edit all profile fields;
│   │                           body scroll lock on open; flex-col layout with shrink-0 header/footer
│   │                           and overflow-y-auto scrollable middle; saves via owner RLS
│   │                           (supabase.from('realtors').update(...).eq('user_id', userId));
│   │                           includes LocationPicker for service area; pre-populates all fields
│   │                           from current realtor state; calls onSave(updated) on success
│   ├── FitScore.tsx            Circular score meter (signature UI element)
│   ├── LocationPicker.tsx      Google Map + Geocoder + radius circle + slider;
│   │                           exports LocationSelection { label, lat, lng, radiusMi };
│   │                           click-to-pin with reverse geocoding to nearest town name;
│   │                           used in buyer wizard, realtor wizard, and EditProfileModal
│   ├── Login.tsx               Auth screen — email+password, role toggle (buyer/realtor), sign-in +
│   │                           create-account modes; accepts initialRole/initialMode for intent routing
│   ├── Matches.tsx             Ranked results grid + filter sidebar — fetches live from Supabase on mount,
│   │                           falls back to REALTORS if DB empty; posts top-10 match scores to
│   │                           /api/buyer-leads on first render (once, via leadPosted ref);
│   │                           sidebar has Refine filters + Your Profile section (budget/location/type/
│   │                           timeline/pre-approval/first-time) + Edit profile btn + Messages btn +
│   │                           Sign out link; Messages btn opens BuyerProfilePanel popup;
│   │                           accepts userId + onSignOut props
│   ├── MessageThread.tsx       Reusable buyer↔realtor chat thread — polls Supabase every 5s;
│   │                           bubble UI (clay = sender, white = receiver); Enter to send;
│   │                           takes { buyerId, realtorId, senderRole, otherName };
│   │                           used in RealtorDetail (buyer side), dashboard (realtor side),
│   │                           and BuyerProfilePanel (buyer messages popup)
│   ├── ProfileWizard.tsx       Multi-step buyer questionnaire → produces BuyerProfile; step 1 uses
│   │                           LocationPicker for region (Continue disabled until location pinned)
│   ├── Providers.tsx           Client wrapper around APIProvider from @vis.gl/react-google-maps;
│   │                           must wrap the whole app so LocationPicker can use useMap/useMapsLibrary
│   ├── RealtorCard.tsx         Summary card with fit score, shown in Matches list
│   ├── RealtorDetail.tsx       Full realtor profile sliding panel — accepts buyerUserId? prop;
│   │                           "Message" button toggles inline MessageThread below the profile;
│   │                           showMessages state resets when a different realtor is opened
│   ├── RealtorWizard.tsx       Multi-step realtor sign-up; step 2 uses LocationPicker for service area
│   │                           (5–100 mi radius); saves serviceLat/Lng/RadiusMi to DB
│   ├── Welcome.tsx             Landing / hero — buyer, realtor, and login entry points
│   └── ui/                     shadcn components — never hand-edit these
├── lib/
│   ├── matching.ts             Fit-score engine — BuyerProfile has regionLat/Lng/RadiusMi fields;
│   │                           location factor uses Haversine distance when both sides have coords,
│   │                           falls back to string match for legacy records
│   ├── realtors.ts             Realtor type (has serviceLat/Lng/RadiusMi optional fields) + 8 mock
│   │                           records + registerRealtor(realtor, userId?)
│   ├── utils.ts                cn() helper from shadcn
│   └── supabase/
│       ├── client.ts           Browser Supabase client (createBrowserClient)
│       ├── queries.ts          getRealtors() · getBuyerProfile(userId) → BuyerProfile | null ·
│       │                       getBuyerConversations(buyerId) → ConversationPreview[];
│       │                       ConversationPreview has realtorId/Name/Photo + lastMessage/At/SenderRole;
│       │                       all map snake_case → camelCase
│       └── server.ts           Server Supabase client (createServerClient + cookies)
├── supabase/
│   └── migrations/
│       ├── 001_create_realtors_and_buyer_leads.sql      ✅ Run
│       ├── 002_add_user_id_to_realtors.sql              ✅ Run
│       ├── 003_add_realtor_id_to_buyer_leads.sql        ⚠️  Superseded — do NOT run
│       ├── 003_create_buyer_lead_matches.sql            ✅ Run
│       ├── 004_add_location_fields.sql                  ✅ Run
│       ├── 005_create_messages.sql                      ⬜ Needs to be run
│       └── 006_add_user_id_to_buyer_leads.sql           ⬜ Needs to be run
├── .env.local                  NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY ·
│                               SUPABASE_SERVICE_ROLE_KEY · NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ✅
├── components.json             shadcn config
├── next.config.ts
└── tsconfig.json
```

---

## Supabase project

- **Project URL:** `https://lfmbczgohxgslaeiyhfy.supabase.co`
- **Project ID:** `lfmbczgohxgslaeiyhfy`
- **Credentials:** in `.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Note:** The Supabase MCP tool is connected to a different/older account. All Supabase work must be done via the SQL Editor in the dashboard or through app code calling the API.

---

## Database schema

**`realtors`** — mirrors `Realtor` interface in `lib/realtors.ts`:
```
id, name, photo, regions[], years_experience, homes_sold,
price_band_min, price_band_max, commission_rate, specialties[],
first_time_friendly, out_of_state_experienced, investment_experienced,
languages[], comm_styles[], available_this_week, avg_response_hours,
rating, review_count, license_verified, personality[], bio, recent_deal,
service_lat, service_lng, service_radius_mi,   ← map-based service area (migration 004)
user_id (uuid → auth.users), created_at
```
RLS: public read · service-role insert · owner can update own row (`auth.uid() = user_id`).
`user_id` is set at registration time — dashboard queries by it to load the logged-in realtor's profile.

**`buyer_leads`** — mirrors `BuyerProfile` interface in `lib/matching.ts`:
```
id, price_min, price_max, region,
region_lat, region_lng, region_radius_mi,  ← map-based buyer target area (migration 004)
in_state, first_time, home_type,
timeline, pre_approved, experience_pref, comm_style,
user_id (uuid → auth.users, nullable),     ← links lead to buyer account (migration 006)
created_at
```
RLS: anyone can insert (anonymous leads still work) · authenticated buyer can SELECT own rows (`auth.uid() = user_id`).
Profile persistence: on sign-in, app fetches the most recent `buyer_leads` row by `user_id` and restores
the profile in state, skipping the wizard entirely.

**`buyer_lead_matches`** — junction table: which realtors each buyer was shown and at what score.
Buyer fields denormalized so the dashboard doesn't need a cross-join into the private `buyer_leads` table:
```
id, buyer_lead_id, realtor_id (→ realtors.id), fit_score,
home_type, region, price_min, price_max, comm_style, first_time, timeline,
created_at · unique(buyer_lead_id, realtor_id)
```
RLS: authenticated realtor can SELECT rows where `realtor_id` is theirs · service-role INSERT only.

**`messages`** — direct messages between an authenticated buyer and a realtor (migration 005):
```
id, buyer_id (uuid → auth.users), realtor_id (text → realtors.id),
sender_role ('buyer' | 'realtor'), content, created_at
index on (realtor_id, buyer_id, created_at)
```
RLS: buyer reads/inserts own rows (`buyer_id = auth.uid()`) · realtor reads/inserts rows where
`realtor_id in (select id from realtors where user_id = auth.uid())`.
Both buyer and realtor must be authenticated.

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
| 6c | Save `BuyerProfile` to `buyer_leads` on wizard completion | ✅ Done |
| 7a | Auth UI — `Login.tsx` with role toggle, sign-in + create-account | ✅ Done |
| 7b | Run migration 002 (`user_id` on realtors) in Supabase SQL Editor | ✅ Done |
| 7c | Dashboard — auth-guarded, loads real profile by `user_id`, no mock data | ✅ Done |
| 7d | Gate `RealtorWizard` behind auth (require login before creating profile) | ✅ Done |
| 7e | `buyer_lead_matches` table + fan-out API route; dashboard buyer leads panel | ✅ Done |
| 7f | Run migration 003 (`buyer_lead_matches`) in Supabase SQL Editor | ✅ Done |
| 7g | Dashboard: profile strength meter + live availability toggle | ✅ Done |
| 7h | Intent-aware login routing + View Transitions API navigation | ✅ Done |
| 8a | Google Maps location picker — `LocationPicker.tsx` + `Providers.tsx`; both wizards updated | ✅ Done |
| 8b | Haversine distance scoring in `lib/matching.ts`; fallback to string match for legacy records | ✅ Done |
| 8c | Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local` | ✅ Done |
| 8d | Run migration 004 (location fields on realtors + buyer_leads) | ✅ Done |
| 9a | Buyer↔realtor messaging — `MessageThread.tsx`, `messages` table + RLS, inline thread in `RealtorDetail`, messages panel on dashboard | ✅ Done |
| 9b | Run migration 005 (`messages` table) in Supabase SQL Editor | ⬜ |
| 9c | Matches header readability — frosted-glass white card over house photo background | ✅ Done |
| 10a | `EditProfileModal.tsx` — all realtor profile fields editable, LocationPicker for service area | ✅ Done |
| 10b | Profile strength — SVG circle meter with real weights | ✅ Done |
| 10c | Dashboard background scroll blur fix | ✅ Done |
| 11a | Buyer profile persistence — `user_id` on `buyer_leads`, saved profile loads on sign-in, wizard skipped | ✅ Done |
| 11b | Buyer profile section in Matches sidebar — budget/location/type/timeline + Edit + Messages + Sign out | ✅ Done |
| 11c | LinkedIn-style messages popup (`BuyerProfilePanel`) — triggered from sidebar Messages btn, bottom-right | ✅ Done |
| 11d | Run migration 006 (`user_id` on `buyer_leads`) in Supabase SQL Editor | ⬜ |
| 12 | Deploy to Vercel with passcode gate (testing phase, not fully public) | ⬜ |

---

## Exact next steps

### Step 9b — Run migration 005 (messages table)

In the Supabase SQL Editor, run `supabase/migrations/005_create_messages.sql`.
Creates the `messages` table with RLS policies for buyers and realtors.
**Required before messaging works in production.**

### Step 11d — Run migration 006 (user_id on buyer_leads)

In the Supabase SQL Editor, run `supabase/migrations/006_add_user_id_to_buyer_leads.sql`.
Adds `user_id` column to `buyer_leads` and an RLS SELECT policy for authenticated buyers.
**Required for buyer profile persistence** — without this, sign-in always shows the wizard.

### Step 12 — Deploy to Vercel with a passcode gate

**Goal:** live URL for testing, restricted so only people with the code can access it.

**Approach — Next.js middleware passcode gate (free on any Vercel plan):**
1. Add `NEXT_PUBLIC_ACCESS_CODE=yourcode` to `.env.local` and Vercel environment variables
2. Create `middleware.ts` at the project root that checks for a cookie; if missing, redirects to `/gate`
3. Create `app/gate/page.tsx` — a simple form where the user enters the code; on match, sets a cookie and redirects to `/`

**What's needed in Vercel before deploying:**
- All env vars from `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` ← restrict to the Vercel domain in Google Cloud
  - `ACCESS_CODE` ← the secret passcode for the gate
- Run `npm run build` locally — must be zero errors

**Prompt:** *"Deploy RealtorFit to Vercel with a passcode gate for testing"*

---

## Future feature ideas (post-launch)

| Feature | Notes |
|---------|-------|
| Realtor photo upload | Replace the emoji avatar with a real headshot (Supabase Storage is already available) |
| Real-time messaging | Replace the 5s polling in `MessageThread` with Supabase Realtime subscriptions for instant delivery |
| Message notifications | Badge count on Messages button for unread messages; eventually email notification |
| Email notifications | When a new buyer lead matches a realtor above a threshold score, email the realtor |
| Review & rating system | Let buyers leave reviews after working with a realtor; feed into `rating` + `review_count` |
| Admin dashboard | View platform metrics: total buyers, total realtors, average match scores, leads per realtor |
| Remove seeded mock realtors | Once real realtors sign up, delete the 8 seeded demo records from Supabase `realtors` table |

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
- **Google Maps uses Geocoding API, not Places API.** `LocationPicker` uses
  `useMapsLibrary('geocoding')` for forward and reverse geocoding. Enabling Places API
  instead will not make the search work.
