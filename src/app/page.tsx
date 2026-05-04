import Link from "next/link";
import { ArrowRight, HeartHandshake, MessageCircleHeart, Sparkles } from "lucide-react";

import { signInAction, signUpAction } from "@/app/actions";
import { APP_NAME } from "@/lib/constants";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type LandingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : null;
  const tab = params.tab === "signup" ? "signup" : "signin";
  const demoMode = !hasSupabaseEnv();

  return (
    <main className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="doodle-orb left-6 top-10 h-16 w-16 bg-gold/40" />
      <div className="doodle-orb right-10 top-28 h-24 w-24 bg-mist/70 [animation-delay:-2s]" />
      <div className="doodle-orb bottom-16 left-[12%] h-20 w-20 bg-blush/55 [animation-delay:-4s]" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel-fizzy relative flex flex-col justify-between overflow-hidden rounded-[2.75rem] p-8 lg:p-10">
          <div className="absolute -right-8 top-10 h-36 w-36 rounded-[42%_58%_63%_37%/44%_40%_60%_56%] bg-mist/50" />
          <div className="absolute bottom-6 right-16 h-24 w-24 rounded-full bg-gold/30" />
          <div className="space-y-8">
            <div className="sticker-badge inline-flex w-fit rotate-[-2deg] items-center gap-2 px-4 py-2 text-sm font-medium text-ink/75">
              <Sparkles className="size-4 text-rose" />
              A private shared diary for close friends and small circles
            </div>

            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.35em] text-ink/45">{APP_NAME}</p>
              <h1 className="max-w-2xl font-display text-5xl font-black leading-[0.98] text-ink sm:text-6xl">
                Your days, but drawn like a playful little world.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/72">
                Save photos, tiny stories, moods, reactions, and notes inside each day. Think
                cartoon scrapbook, private social app, and illustrated calendar all mixed together.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: HeartHandshake,
                  title: "Invite-only private space",
                  copy: "Keep access limited to the people you choose.",
                },
                {
                  icon: MessageCircleHeart,
                  title: "Moments, reactions, notes",
                  copy: "A social layer without the noise of public feeds.",
                },
                {
                  icon: Sparkles,
                  title: "Dreamy scrapbook feel",
                  copy: "Moodier textures, playful motion, and a keepsake atmosphere.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="illustration-tile relative p-5 odd:rotate-[-2deg] even:rotate-[1.5deg]"
                >
                  <div className="inline-flex rounded-[1.1rem] bg-gradient-to-br from-white to-cloud p-3 shadow-card">
                    <item.icon className="size-5 text-rose" />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-bold text-ink">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/68">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-pop mt-8 grid gap-4 rounded-[2.3rem] p-5 sm:grid-cols-[0.95fr_1.05fr]">
            <div className="illustration-tile rotate-[-2deg] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Calendar playground</p>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-xl ${
                      [1, 4, 10, 13, 18, 19, 25].includes(index)
                        ? "rotate-[2deg] bg-gradient-to-br from-blush to-mist shadow-card"
                        : "bg-cloud/80"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="mesh-card illustration-tile relative overflow-hidden p-5">
              <div className="absolute right-4 top-4 h-14 w-14 rounded-full bg-gold/35" />
              <div className="absolute bottom-5 left-5 h-10 w-10 rounded-full bg-lagoon/25" />
              <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Inside a day</p>
              <h2 className="mt-3 max-w-sm font-display text-3xl font-black text-ink">
                Little illustrated moments with a social heartbeat
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink/70">
                Photos, moods, reactions, and notes stacked like stickers and story cards instead of
                a plain feed.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="panel-pop relative w-full overflow-hidden rounded-[2.75rem] p-8 lg:p-10">
            <div className="absolute -right-6 bottom-6 h-32 w-32 rounded-[39%_61%_57%_43%/45%_42%_58%_55%] bg-blush/40" />

            {demoMode ? (
              <>
                <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Preview mode</p>
                <h2 className="mt-4 max-w-md font-display text-4xl font-black text-ink">Explore the web MVP</h2>
                <p className="mt-4 text-sm leading-7 text-ink/68">
                  Supabase keys are not configured yet, so the app opens in a read-only dreamy demo.
                </p>
                <Link
                  href="/app"
                  className="button-pop mt-8 inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-medium text-white"
                >
                  Open demo app
                  <ArrowRight className="size-4" />
                </Link>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Your shared space</p>
                <h2 className="mt-4 max-w-md font-display text-4xl font-black text-ink">
                  {tab === "signup" ? "Create your account" : "Welcome back"}
                </h2>

                <div className="mt-6 flex gap-1 rounded-[1.4rem] bg-cloud/60 p-1">
                  <Link
                    href="/"
                    className={`flex-1 rounded-[1.1rem] py-2 text-center text-sm font-medium transition ${tab === "signin" ? "bg-white shadow-card text-ink" : "text-ink/50 hover:text-ink/75"}`}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/?tab=signup"
                    className={`flex-1 rounded-[1.1rem] py-2 text-center text-sm font-medium transition ${tab === "signup" ? "bg-white shadow-card text-ink" : "text-ink/50 hover:text-ink/75"}`}
                  >
                    Sign up
                  </Link>
                </div>

                {error ? (
                  <div className="mt-4 rounded-[1.4rem] border border-rose/25 bg-rose/10 px-4 py-3 text-sm text-rose">
                    {error === "invite-only"
                      ? "That email isn’t on the invite list for this space."
                      : error === "invalid-credentials"
                      ? "Wrong email or password."
                      : "Something went wrong. Try again."}
                  </div>
                ) : null}

                {tab === "signin" ? (
                  <form action={signInAction} className="mt-5 space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink/78">Email</span>
                      <input
                        type="email"
                        name="email"
                        placeholder="yourname@example.com"
                        required
                        className="w-full rounded-[1.4rem] border border-line bg-cloud/65 px-4 py-3 text-sm text-ink outline-none transition focus:border-rose"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink/78">Password</span>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        className="w-full rounded-[1.4rem] border border-line bg-cloud/65 px-4 py-3 text-sm text-ink outline-none transition focus:border-rose"
                      />
                    </label>
                    <button
                      type="submit"
                      className="button-pop inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-medium text-white"
                    >
                      Sign in
                      <ArrowRight className="size-4" />
                    </button>
                  </form>
                ) : (
                  <form action={signUpAction} className="mt-5 space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink/78">Email</span>
                      <input
                        type="email"
                        name="email"
                        placeholder="yourname@example.com"
                        required
                        className="w-full rounded-[1.4rem] border border-line bg-cloud/65 px-4 py-3 text-sm text-ink outline-none transition focus:border-rose"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink/78">Password</span>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full rounded-[1.4rem] border border-line bg-cloud/65 px-4 py-3 text-sm text-ink outline-none transition focus:border-rose"
                      />
                    </label>
                    <button
                      type="submit"
                      className="button-pop inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-medium text-white"
                    >
                      Create account
                      <ArrowRight className="size-4" />
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
