import Link from "next/link";
import { CalendarDays, ChevronRight, Plus } from "lucide-react";

import { CalendarGrid } from "@/components/calendar-grid";
import { RecentMomentsPanel } from "@/components/recent-moments-panel";
import { getCalendarDaySummaries, getInitialMonthDate, getRecentMoments, requireViewer } from "@/lib/data";
import { formatMonthLabel, slugDate } from "@/lib/utils";

export default async function AppHomePage() {
  const viewer = await requireViewer();
  const monthDate = await getInitialMonthDate();
  const [summaries, recentMoments] = await Promise.all([
    getCalendarDaySummaries(monthDate),
    getRecentMoments(6),
  ]);
  const todayLink = slugDate(new Date());

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6">
        <div className="panel-fizzy relative overflow-hidden rounded-[2.5rem] p-6">
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-gold/30" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/45">Shared home</p>
              <h2 className="mt-3 font-display text-4xl font-black text-ink">
                Hi {viewer.profile.displayName}, let&apos;s keep today.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">
                The calendar holds the shape of your days, while the right rail keeps the latest
                little memories close. Open a date or add something new before the feeling fades.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/app/day/${todayLink}`}
                className="button-pop inline-flex items-center gap-2 bg-white/80 px-4 py-2 text-sm text-ink"
              >
                <CalendarDays className="size-4" />
                Today
              </Link>
              <Link
                href="/app/moment/new"
                className="button-pop inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm font-medium text-white"
              >
                <Plus className="size-4" />
                Add moment
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Calendar</p>
              <h2 className="mt-2 font-display text-3xl font-black text-ink">{formatMonthLabel(monthDate)}</h2>
            </div>
            <Link href={`/app/day/${todayLink}`} className="inline-flex items-center gap-2 text-sm text-ink/60">
              Open today
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <CalendarGrid month={monthDate} summaries={summaries} />
        </div>
      </section>

      <RecentMomentsPanel moments={recentMoments} />
    </div>
  );
}
