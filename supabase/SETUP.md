# Supabase Setup

## 1. Create the project

Create a new Supabase project in the dashboard and wait for it to finish provisioning.

## 2. Add local environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ALLOWED_EMAILS`

`ALLOWED_EMAILS` can contain any comma-separated list of invited people.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
ALLOWED_EMAILS=friend1@example.com,friend2@example.com,friend3@example.com
```

## 3. Configure Auth URLs

In Supabase Dashboard:

- Go to `Authentication` -> `URL Configuration`
- Set `Site URL` to `http://127.0.0.1:3000`
- Add `http://127.0.0.1:3000/auth/callback` to redirect URLs

If you deploy later, add your production URL and production callback there too.

## 4. Enable email sign-in

In `Authentication` -> `Providers`:

- Enable `Email`
- Keep magic link / OTP sign-in available

## 5. Run the schema

Open the SQL Editor and run the contents of [schema.sql](/Volumes/Steph/Dev/CatchUpDiaries/supabase/schema.sql).

This creates:

- `profiles`
- `moments`
- `moment_photos`
- `reactions`
- `notes`
- row-level security policies
- the `moment-images` storage bucket

## 6. Start the app

Run:

```bash
npm run dev
```

Then open `http://127.0.0.1:3000`, enter one of the invited emails, and sign in with the magic link.

## Notes

- No service role key is needed for local development.
- If Supabase env vars are missing, the app falls back to demo mode automatically.
- The invite gate is enforced by the `ALLOWED_EMAILS` list in your app config.
