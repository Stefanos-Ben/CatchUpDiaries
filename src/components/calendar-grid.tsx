import Image from "next/image";
import Link from "next/link";
import { eachDayOfInterval, endOfMonth, format, isSameMonth, startOfMonth } from "date-fns";

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

  return (
    <section className="panel-pop rounded-[2.3rem] p-5">
      <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.28em] text-ink/45">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day} className="pb-2">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: startOfMonth(month).getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-[0.9]" />
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const summary = summaryMap.get(key);
          return (
            <Link
              key={key}
              href={`/app/day/${key}`}
              className={cn(
                "group flex aspect-[0.92] flex-col justify-between overflow-hidden rounded-[1.6rem] border-2 px-3 py-3 transition duration-300 hover:-translate-y-1",
                summary
                  ? "border-ink/10 bg-gradient-to-br from-white via-blush/45 to-mist/80 shadow-card odd:rotate-[-1.3deg] even:rotate-[1.2deg]"
                  : "border-white/40 bg-cloud/45 hover:border-white/70",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{format(day, "d")}</span>
                {summary ? (
                  <span className="sticker-badge px-2 py-0.5 text-[10px] font-medium text-ink/65">
                    {summary.momentCount}
                  </span>
                ) : null}
              </div>

              {summary ? (
                <div className="space-y-2">
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
                    "h-12 rounded-xl border border-dashed border-white/40",
                    isSameMonth(day, month) ? "bg-white/15" : "bg-transparent",
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
