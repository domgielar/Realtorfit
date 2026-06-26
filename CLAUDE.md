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

The score is a weighted blend of factors (will live in `lib/matching.ts`):

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

## Tech stack (target)

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

## Project structure (active — `/Users/domgielar/Desktop/realtor-fit/`)

```
realtor-fit/
├── app/
│   ├── globals.css         Tailwind v4 base + shadcn tokens + brand CSS variables
│   ├── layout.tsx          Root layout — Inter + Fraunces fonts, metadata
│   └── page.tsx            Home page (placeholder now, will be Welcome view)
├── components/
│   └── ui/                 shadcn components (auto-added with `npx shadcn add …`)
│       └── button.tsx
├── lib/
│   └── utils.ts            cn() helper from shadcn
├── components.json         shadcn config
├── next.config.ts
├── tailwind.config.ts      (v4 — config is CSS-based, not file-based)
└── tsconfig.json
```

**Planned additions (not yet created):**
```
├── lib/
│   ├── matching.ts         Fit-score engine with TypeScript types
│   └── realtors.ts         Typed mock realtor records
└── components/
    ├── FitScore.tsx        Circular score meter (signature UI element)
    ├── Welcome.tsx         Landing / hero
    ├── ProfileWizard.tsx   Multi-step buyer questionnaire
    ├── RealtorCard.tsx     Summary card with fit score
    ├── Matches.tsx         Ranked results + filter sidebar
    └── RealtorDetail.tsx   Full realtor profile panel
```

---

## Design direction

- **Feel:** warm, trustworthy, human — a calm advisor, not cold proptech. Avoid the
  Zillow-blue / corporate look and the luxury-serif cliché.
- **Palette** (defined as CSS variables in `app/globals.css` and available as
  Tailwind utilities like `bg-[--color-clay]`, `text-[--color-ink]`):

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

- **Type:** `--font-display` = Fraunces (headings only, used sparingly) /
  `--font-sans` = Inter (everything else). Both loaded via `next/font/google`.
- **The Fit Score meter is the one bold element.** Keep everything around it quiet.

---

## Migration status

This is an 8-step migration from the old Vite prototype to the new Next.js stack.
Each step leaves the app in a fully runnable state.

| Step | Task | Status |
|------|------|--------|
| 1 | Scaffold Next.js + Tailwind v4 + shadcn/ui | ✅ Done |
| 2 | Port `matching.ts` + `realtors.ts` with TypeScript types | ⬜ Next |
| 3 | Port all components to `.tsx` + wire up buyer flow in `app/page.tsx` | ⬜ |
| 4 | Replace all remaining styles with Tailwind + shadcn components | ⬜ |
| 5 | Set up Supabase client, schema, env vars | ⬜ |
| 6 | Replace mock data with Supabase queries + TanStack Query | ⬜ |
| 7 | Add Supabase Auth + React Hook Form + Zod on the wizard | ⬜ |
| 8 | Deploy to Vercel | ⬜ |

**Do not skip steps.** Each one unlocks the next.

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
- When adding a backend, the `Realtor` shape in `lib/realtors.ts` is the schema
  contract. The Supabase table must match it exactly.
