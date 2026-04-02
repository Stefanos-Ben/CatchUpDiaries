import Link from "next/link";
import { CalendarDays, CircleUserRound, Plus, Sparkles } from "lucide-react";

import { signOutAction } from "@/app/actions";
import { APP_NAME } from "@/lib/constants";
import { requireViewer } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await requireViewer();

  return (
    <main className="relative min-h-screen px-5 py-5 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="panel-pop mb-6 rounded-[2.3rem] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="illustration-tile rotate-[-4deg] rounded-[1.3rem] bg-gradient-to-br from-blush to-mist p-3">
                <Sparkles className="size-5 text-ink" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/45">{APP_NAME}</p>
                <h1 className="font-display text-2xl font-black text-ink">Your playful diary space</h1>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              <Link
                href="/app"
                className="button-pop inline-flex items-center gap-2 bg-cloud/70 px-4 py-2 text-sm text-ink/75"
              >
                <CalendarDays className="size-4" />
                Home
              </Link>
              <Link
                href="/app/moment/new"
                className="button-pop inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm font-medium text-white"
              >
                <Plus className="size-4" />
                New moment
              </Link>
              <Link
                href="/app/profile"
                className="button-pop inline-flex items-center gap-2 bg-cloud/70 px-4 py-2 text-sm text-ink/75"
              >
                <CircleUserRound className="size-4" />
                Profile
              </Link>
              {viewer.mode === "live" ? (
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="button-pop bg-white/75 px-4 py-2 text-sm text-ink/70"
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <span className="sticker-badge rotate-[2deg] px-4 py-2 text-sm text-ink/70">
                  Demo mode
                </span>
              )}
            </nav>
          </div>
        </header>

        {viewer.mode === "demo" ? (
          <div className="mb-6 rounded-[1.6rem] border border-gold/25 bg-gold/10 px-4 py-3 text-sm text-ink/75">
            The app is rendering with sample data because Supabase environment variables are not set yet.
            Real auth, uploads, and writes activate as soon as you configure them.
          </div>
        ) : null}

        {children}
      </div>
    </main>
  );
}
