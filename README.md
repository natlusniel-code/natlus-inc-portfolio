# Natlus Inc. — Software Developer Portfolio Website

A production-ready portfolio website for **Natlus Inc.**, built to the 28-section
specification. It has two parts on one domain:

| Path | What it is |
|------|------------|
| `/` | The public portfolio site (hero, about, services, portfolio, process, pricing, testimonials, FAQ, contact) |
| `/natlus` | The owner's admin panel — **opens directly, no login** |

The public site and the admin panel read and write the **same Postgres content
store**, so an edit in the admin panel appears on the public site immediately and
survives redeploys.

---

## Tech stack

- **React 18 + TypeScript + Vite** — two entry points (public site, admin panel)
- **Tailwind CSS** — light mode by default, optional dark mode
- **Postgres** (Neon / Supabase / any Postgres) — the content store
- **Vercel** — serverless API + static hosting

No CMS, no auth provider, no external service is required.

---

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env
#    then edit .env and set DATABASE_URL

# 3. Create the schema and load the starting content
npm run db:migrate
npm run db:seed

# 4. Run the API and the site (two terminals)
npm run dev:api     # http://localhost:3001
npm run dev         # http://localhost:5173
```

Open <http://localhost:5173> for the public site and
<http://localhost:5173/natlus/> for the admin panel.

> `npm run dev` proxies `/api/*` to `http://localhost:3001`, so both must be running.

---

## Environment variables

Every variable is listed in `.env.example`. Only one is required to run:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | **Yes** | Postgres connection string. Use the **pooled** URL on serverless. |
| `CONTACT_TO` | No | Where contact-form notifications are sent. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | No | SMTP credentials. Without them the contact form still saves every message to the admin inbox — it just does not email. |

**The contact form is honest about this.** If SMTP is not configured, the form
says the message was received and saved (which is true — it is in the admin
inbox) and never claims an email was sent.

---

## Deploying to Vercel

1. **Import the repository** into Vercel. No code changes are needed — `vercel.json`
   already routes `/api/*` to the serverless function and everything else to the
   static build.

   > **Do not add a `runtime` field to the function config.** `api/index.ts`
   > deliberately omits it so Vercel auto-detects the Node.js runtime. Versioned
   > strings such as `"nodejs20.x"` are rejected by current Vercel CLI versions
   > with `unsupported "runtime" value in config`. The handler supports both the
   > Node `(req, res)` and the Web `(request) -> Response` calling conventions, so
   > it works whichever runtime Vercel picks.
   >
   > The build runs **once**: `vercel.json` sets `buildCommand` to `npm run build`
   > (typecheck + `vite build`). There is no separate `vercel-build` script, which
   > would otherwise make Vercel build the project a second time.

2. **Set the environment variables** in *Settings → Environment Variables* for
   **Production and Preview**:
   - `DATABASE_URL` (required)
   - `CONTACT_TO`, `SMTP_*` (optional, for contact-form email)
3. **Create the schema and seed the content** against the production database,
   from your machine:

   ```bash
   DATABASE_URL="<your production DATABASE_URL>" npm run db:migrate
   DATABASE_URL="<your production DATABASE_URL>" npm run db:seed
   ```

   The seed is **idempotent** — re-running it updates the seeded rows and never
   duplicates them. Rows you created in the admin panel are never touched.
4. **Deploy.** Then check `https://<your-domain>/api/health` — it should return
   `{"ok":true,...}`. If a variable is missing it returns `503` and names the
   missing variables (names only, never values).

---

## The admin panel (`/natlus`)

Per the specification, the admin panel has **no login, no password and no
sign-up** — anyone who knows the path can edit the site. It is deliberately
**not linked anywhere** on the public site (no navbar, footer or sitemap entry).

> **Security note:** because there is no authentication, treat `/natlus` as a
> private URL. If you later want it protected, put it behind Vercel's password
> protection or a proxy — the app itself intentionally has no gate.

### What you can edit

Everything in the specification's section 5:

- **Company details** — name, tagline, description, logo, favicon, email, phone,
  WhatsApp number, address, currency, business hours
- **CEO / founder profile** — name, title, bio, photo, email, phone, LinkedIn
- **Hero section** — headline, subheadline, both CTAs, hero image, trust indicators
- **Services** — all 12, with title, description, deliverables, starting price, icon
- **Pricing packages** — all 3, with audience, price, included features, CTA text
- **Portfolio projects** — title, category, descriptions, technologies, features,
  images, and the full case-study fields
- **Portfolio categories** — the filter list
- **Process steps** — the 7 steps
- **Why-choose-us cards** — the 8 benefit cards
- **Testimonials** — name, role, company, message, photo
- **FAQs** — the 10 questions and answers
- **Contact details** — email, phone, WhatsApp, address, hours, map embed
- **WhatsApp templates** — the number and all four message templates
- **Social links** — label + URL (empty URL hides the link)
- **Footer & policies** — footer text, copyright, policy links
- **Pricing note** — the disclaimer shown under the pricing table
- **SEO settings** — meta title, description, keywords, OG image, canonical URL
- **Colors, fonts & theme** — primary color, font family, light/dark default

Every list supports **add, edit, delete (with a confirmation dialog) and
reorder**. Every save shows a success or error message. Images can be uploaded
(stored in Postgres, so they survive redeploys) or referenced by URL.

---

## The WhatsApp request flow

Every service card, pricing package, portfolio project and major CTA opens a
modal that asks for **the visitor's name only** — never email, phone or password.

- An empty or whitespace-only name is rejected with a friendly message.
- The name is trimmed and safely URL-encoded.
- WhatsApp opens in a new tab at `https://wa.me/<number>?text=<message>`.

The number and all message templates are editable in the admin panel
(**WhatsApp templates**). The three formats are:

```
Service:  Hello Natlus Inc., my name is [NAME]. I am interested in your
          [SELECTED SERVICE] service. The displayed starting price is [PRICE].
          I would like to discuss my project requirements, timeline, and final
          quotation.

Package:  Hello Natlus Inc., my name is [NAME]. I am interested in the
          [PACKAGE NAME] package, starting from [PRICE]. I would like to discuss
          my project requirements, timeline, included features, and final
          quotation.

Project:  Hello Natlus Inc., my name is [NAME]. I am interested in a project
          similar to [PROJECT NAME]. I would like to discuss the features,
          timeline, and estimated price.
```

---

## Honesty rules built into the content

The specification requires that nothing invented is presented as real:

- **Testimonials** ship as clearly-marked sample content (`isSample`), shown with
  a "sample" badge on the public site. Uncheck the badge only for a real,
  permission-granted testimonial.
- **Portfolio projects** ship as sample concepts, each badged "sample concept".
- **Trust indicators** in the hero are service names, not invented statistics.
- **All prices** are labelled as starting prices / estimates, with a pricing note.
- **The contact form** never claims an email was sent when SMTP is unconfigured.

---

## Project structure

```
api/                     Serverless API (Vercel function)
  index.ts               Router
  _core/                 db, content store, validation, schemas, images, http
  _routes/               content, messages, contact, images, info
db/
  schema.sql             Tables
  migrate.mjs            Applies schema.sql
  seed-data.mjs          The starting content (exact spec copy)
  seed.mjs               Idempotent seed
src/                     Public site
  components/            Navbar, sections, WhatsApp modal, logo
  pages/                 Home, CaseStudy, Legal
  lib/                   api, theme, whatsapp, seo, useContent
  admin/                 Admin panel (separate entry point)
shared/types.ts          Shared content model
natlus/index.html        Admin panel HTML entry
dev-server.mjs           Local API server
```

---

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Public site + admin panel (Vite) |
| `npm run dev:api` | Local API server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | TypeScript check only |
| `npm run db:migrate` | Create/update the schema |
| `npm run db:seed` | Load the starting content (idempotent) |

---

## Accessibility & performance

- Semantic landmarks, labelled form fields, visible focus rings
- Modals trap focus, close on Escape, and restore focus
- The FAQ accordion is keyboard-operable with `aria-expanded`
- `prefers-reduced-motion` is respected
- Images are lazy-loaded; the bundle is code-split between the public site and
  the admin panel, so visitors never download the admin code

---

© 2026 Natlus Inc. All rights reserved.
