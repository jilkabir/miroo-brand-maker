# Miroo Brand Maker

Miroo Brand Maker is a Vercel-ready Next.js app that turns a website URL into a starter brand strategy report. It suggests color direction, audience positioning, social content pillars, and caption ideas.

## What it does

- accepts a website URL
- generates a mock or AI-powered brand report
- suggests current and improved color directions
- proposes social tone, content ideas, and caption samples
- keeps the codebase simple so future updates with Claude are easy

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI Responses API with a mock fallback when no API key is set

## Local setup

1. Install Node.js 20 or newer.
2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file:

```bash
cp .env.example .env.local
```

4. Add your API key in `.env.local`.
5. Start the dev server:

```bash
npm run dev
```

## Deploy to Vercel

1. Push this repo to GitHub as `Miroo Brand Maker` or `miroo-brand-maker`.
2. Import the repository into Vercel.
3. Add these environment variables in Vercel:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` optional
4. Deploy.

## Important note

Right now the app uses a strong mock report when no API key is available. That keeps the product demo-friendly even before you connect a real AI or website scraping workflow.

## Good next updates

- scrape homepage text and metadata before generating the report
- extract real brand colors from screenshots or logos
- store previous analyses in a database
- export PDF brand guides
- compare two competitors side by side

## Suggested future architecture

- `lib/brand-analysis.ts`: AI orchestration
- `lib/mock-report.ts`: safe fallback for demo mode
- `lib/site-intel.ts`: future scraping and preprocessing layer
- `app/api/analyze/route.ts`: server entry for future frontend upgrades
- `components/`: reusable cards and form blocks

This structure is intentionally simple so Claude can extend features later without untangling the app first.
