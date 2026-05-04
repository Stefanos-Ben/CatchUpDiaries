import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";

import { MomentCard } from "@/components/moment-card";
import { getDayFeed, requireViewer } from "@/lib/data";
import { formatDisplayDate, slugDate } from "@/lib/utils";

type DayPageProps = {
  params: Promise<{
    date: string;
  }>;
};

export default async function DayPage({ params }: DayPageProps) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const viewer = await requireViewer();
  const dayFeed = await getDayFeed(date);
  const isToday = date === slugDate(new Date());

  return (
    <div className="space-y-6">
      <div className="panel-fizzy rounded-[2.5rem] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/app" className="inline-flex items-center gap-2 text-sm text-ink/60">
              <ChevronLeft className="size-4" />
              Back home
            </Link>
            <p className="mt-4 text-xs uppercase tracking-[0.28em] text-ink/45">Day view</p>
            <h1 className="mt-3 font-display text-5xl font-black text-ink">{formatDisplayDate(date)}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">
              A page for today’s details: photos, reactions, notes, and the small things worth
              keeping in one place.
            </p>
          </div>
          {isToday ? (
            <Link
              href={`/app/moment/new?date=${date}`}
              className="button-pop inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm font-medium text-white"
            >
              <Plus className="size-4" />
              Add moment
            </Link>
          ) : null}
        </div>
      </div>

      {dayFeed.moments.length ? (
        <div className="grid gap-5">
          {dayFeed.moments.map((moment) => (
            <MomentCard key={moment.id} moment={moment} viewer={viewer} />
          ))}
        </div>
      ) : (
        <section className="panel-pop rounded-[2.3rem] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Nothing saved yet</p>
          <h2 className="mt-3 font-display text-4xl font-black text-ink">This page is still waiting for a mood.</h2>
          <p className="mt-3 text-sm leading-7 text-ink/65">
            {isToday
              ? "Add the first moment for this day and give it a little texture."
              : "Nothing was saved for this day."}
          </p>
          {isToday ? (
            <Link
              href={`/app/moment/new?date=${date}`}
              className="button-pop mt-6 inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              <Plus className="size-4" />
              Start this day
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}
