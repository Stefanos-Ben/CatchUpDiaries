# CatchUpDiaries

A private diary web app for sharing the shape of your days through photos, moments, reactions, and notes.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and Storage

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your Supabase project URL and anon key.
3. Add the invited emails to `ALLOWED_EMAILS`.
4. Run the SQL in [supabase/schema.sql](/Volumes/Steph/Dev/CatchUpDiaries/supabase/schema.sql).
5. Install dependencies with `npm install`.
6. Start the app with `npm run dev`.

If Supabase is not configured yet, the app falls back to a read-only demo mode so you can still explore the product and UI.

For the exact dashboard steps, see [supabase/SETUP.md](/Volumes/Steph/Dev/CatchUpDiaries/supabase/SETUP.md).
