import { Mail, ShieldCheck, Sparkles } from "lucide-react";

import { requireViewer } from "@/lib/data";

export default async function ProfilePage() {
  const viewer = await requireViewer();

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[2.2rem] border border-white/60 bg-white/75 p-6 shadow-float">
        <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Profile</p>
        <h1 className="mt-3 font-display text-5xl text-ink">{viewer.profile.displayName}</h1>
        <div className="mt-6 space-y-4">
          <div className="rounded-[1.5rem] border border-white/60 bg-cloud/60 p-4">
            <div className="flex items-center gap-3 text-sm text-ink/75">
              <Mail className="size-4 text-rose" />
              {viewer.email ?? "Hidden in demo mode"}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/60 bg-cloud/60 p-4">
            <div className="flex items-center gap-3 text-sm text-ink/75">
              <ShieldCheck className="size-4 text-lagoon" />
              {viewer.mode === "demo" ? "Demo mode preview" : "Invite-only private access"}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2.2rem] border border-white/60 bg-gradient-to-br from-white/78 via-blush/48 to-mist/68 p-6 shadow-float">
        <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Settings-lite</p>
        <h2 className="mt-3 font-display text-4xl text-ink">A quiet space on purpose.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70">
          v1 keeps the app intentionally focused: invite-only accounts, one private diary space,
          expressive reactions, and notes underneath each moment. More profile customization can
          land once the daily ritual itself feels right.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.6rem] border border-white/60 bg-white/70 p-5 shadow-card">
            <Sparkles className="size-5 text-gold" />
            <h3 className="mt-4 font-display text-2xl text-ink">Future friendly</h3>
            <p className="mt-2 text-sm leading-6 text-ink/68">
              The web MVP is built on a backend that can carry forward into a future mobile app.
            </p>
          </div>
          <div className="rounded-[1.6rem] border border-white/60 bg-white/70 p-5 shadow-card">
            <ShieldCheck className="size-5 text-lagoon" />
            <h3 className="mt-4 font-display text-2xl text-ink">Private by default</h3>
            <p className="mt-2 text-sm leading-6 text-ink/68">
              The app avoids public discovery, public profiles, and audience pressure entirely.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
