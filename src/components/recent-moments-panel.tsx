import Image from "next/image";
import Link from "next/link";
import { Camera, MessageCircleHeart } from "lucide-react";

import type { RecentMomentCard } from "@/types/app";
import { formatDisplayDate, formatRelativeTime } from "@/lib/utils";

export function RecentMomentsPanel({ moments }: { moments: RecentMomentCard[] }) {
  return (
    <section className="panel-pop rounded-[2.3rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Recent moments</p>
          <h2 className="mt-2 font-display text-2xl font-black text-ink">A replay of the week</h2>
        </div>
      </div>

      <div className="space-y-4">
        {moments.map((moment) => (
          <Link
            key={moment.id}
            href={`/app/day/${moment.entryDate}`}
            className="illustration-tile flex gap-4 p-3 transition duration-300 odd:rotate-[-1deg] even:rotate-[1deg] hover:-translate-y-1"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.3rem] bg-gradient-to-br from-mist to-blush shadow-card">
              {moment.photoPreview ? (
                <Image
                  src={moment.photoPreview}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Camera className="size-5 text-ink/35" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">{moment.author.displayName}</p>
                <p className="text-xs text-ink/50">{formatRelativeTime(moment.createdAt)}</p>
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink/45">
                {formatDisplayDate(moment.entryDate)}
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/75">{moment.textPreview}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-ink/55">
                <span>{moment.reactionCount} reactions</span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircleHeart className="size-3.5" />
                  {moment.noteCount} notes
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
