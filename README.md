# Moroccan Company Directory — live dashboard

Next.js dashboard reading directly from Supabase (via the public anon key,
read-only thanks to Row Level Security). Shows the crawl's live progress and
a searchable table of every company scraped so far.

## Local development

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# (Project Settings -> API in Supabase - the "anon public" key, NOT service_role)

npm install
npm run dev
```

## Deploy to Vercel

1. Push this folder to a GitHub repo (or run `vercel` from inside it directly
   via the Vercel CLI - `npm i -g vercel && vercel`)
2. Import the repo at vercel.com/new
3. Add the two environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy - you'll get a `your-project.vercel.app` link you can open from
   anywhere, live, while the scraper runs on your GCP VM.

## What's on the page

- **Crawl progress**: live-updating (via Supabase Realtime) bar showing
  keywords crawled, companies found/fetched, keyword merges, and errors.
  Updates the moment the VM's scraper writes a new row - no refresh needed.
- **Companies table**: search by name, filter by city, paginated. Click a
  row to expand full details (legal form, capital, RC/ICE, phones, website,
  rating, and every keyword that matched this company).

## Notes

- This dashboard is read-only by design - it only ever uses the anon key,
  which Supabase's Row Level Security restricts to `SELECT`. The scraper on
  your VM is the only thing with write access (via the separate, secret
  service_role key).
- If `npm run build` fails locally with a Google Fonts fetch error, that's a
  network/sandbox quirk, not a code issue - Vercel's build servers fetch
  fonts fine.
