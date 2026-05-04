import Image from "next/image";
import Link from "next/link";
import { eachDayOfInterval, endOfMonth, format, isAfter, isBefore, isSameDay, isSameMonth, startOfDay, startOfMonth } from "date-fns";

import type { CalendarDaySummary } from "@/types/app";
import { cn } from "@/lib/utils";

type CalendarGridProps = {
  month: Date;
  summaries: CalendarDaySummary[];
};

export function CalendarGrid({ month, summaries }: CalendarGridProps) {
  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });
  const summaryMap = new Map(summaries.map((summary) => [summary.date, summary]));
  const todayStart = startOfDay(new Date());

  return (
    <section className="panel-pop rounded-[2.3rem] p-3 sm:p-5">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.28em] text-ink/45">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <span key={i} className="pb-1 sm:pb-2 hidden sm:block">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
          </span>
        ))}
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <span key={`m-${i}`} className="pb-1 sm:hidden">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: startOfMonth(month).getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square sm:aspect-[0.9]" />
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const summary = summaryMap.get(key);
          const dayStart = startOfDay(day);
          const isToday = isSameDay(dayStart, todayStart);
          const isPast = isBefore(dayStart, todayStart);
          const isFuture = isAfter(dayStart, todayStart);

          return (
            <Link
              key={key}
              href={`/app/day/${key}`}
              className={cn(
                "group flex flex-col overflow-hidden border-2 transition duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1",
                /* mobile: compact square */
                "aspect-square rounded-xl px-1 py-1.5 sm:aspect-[0.92] sm:rounded-[1.6rem] sm:px-3 sm:py-3 sm:justify-between",
                isToday && "border-rose/50 bg-gradient-to-br from-white via-blush/60 to-gold/30 shadow-card ring-2 ring-rose/20",
                isPast && summary && "border-ink/10 bg-gradient-to-br from-white via-blush/45 to-mist/80 shadow-card opacity-80 sm:odd:rotate-[-1.3deg] sm:even:rotate-[1.2deg]",
                isPast && !summary && "border-white/30 bg-cloud/30 opacity-50 hover:border-white/50",
                isFuture && summary && "border-ink/10 bg-gradient-to-br from-white via-blush/45 to-mist/80 shadow-card sm:odd:rotate-[-1.3deg] sm:even:rotate-[1.2deg]",
                isFuture && !summary && "border-white/25 bg-cloud/20 opacity-35 hover:border-white/40",
              )}
            >
              {/* Date number — centered on mobile, top-left on desktop */}
              <div className="flex items-start justify-between sm:items-center">
                <span
                  className={cn(
                    "block w-full text-center text-[11px] font-semibold leading-none sm:w-auto sm:text-left sm:text-sm sm:font-medium",
                    isToday ? "font-black text-rose" : isPast ? "text-ink/55" : "text-ink",
                  )}
                >
                  {format(day, "d")}
                </span>
                {/* Desktop-only badges */}
                <span className="hidden sm:block">
                  {isToday ? (
                    <span className="rounded-full bg-rose/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose">
                      Today
                    </span>
                  ) : summary ? (
                    <span className="sticker-badge px-2 py-0.5 text-[10px] font-medium text-ink/65">
                      {summary.momentCount}
                    </span>
                  ) : null}
                </span>
              </div>

              {/* Mobile dot indicator */}
              {summary ? (
                <div className="mt-1 flex justify-center sm:hidden">
                  <span className={cn("h-1 w-1 rounded-full", isToday ? "bg-rose/60" : "bg-ink/30")} />
                </div>
              ) : null}

              {/* Desktop rich content */}
              {summary ? (
                <div className="hidden sm:block sm:space-y-2">
                  <div className="line-clamp-2 text-[11px] leading-4 text-ink/65">
                    {summary.authors.join(" + ")}
                  </div>
                  {summary.previewImage ? (
                    <div className="relative h-12 w-full overflow-hidden rounded-xl">
                      <Image
                        src={summary.previewImage}
                        alt=""
                        fill
                        className="object-cover opacity-95"
                        sizes="96px"
                      />
                    </div>
                  ) : (
                    <div className="h-12 rounded-xl bg-gradient-to-br from-blush/60 to-mist/80" />
                  )}
                </div>
              ) : (
                <div
                  className={cn(
                    "hidden h-12 rounded-xl border border-dashed sm:block",
                    isToday ? "border-rose/30 bg-rose/5" : isSameMonth(day, month) ? "border-white/40 bg-white/15" : "border-white/20 bg-transparent",
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
