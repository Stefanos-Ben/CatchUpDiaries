import Link from "next/link";
import { MessageCircleHeart, PenLine } from "lucide-react";

import { addNoteAction, toggleReactionAction } from "@/app/actions";
import { REACTION_OPTIONS } from "@/lib/constants";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { MomentDetail, ViewerContext } from "@/types/app";
import { PhotoGallery } from "@/components/photo-gallery";

export function MomentCard({
  moment,
  viewer,
}: {
  moment: MomentDetail;
  viewer: ViewerContext;
}) {
  const canEdit = viewer.profile.id === moment.author.id && viewer.mode === "live";

  return (
    <article className="panel-pop space-y-5 rounded-[2.4rem] p-6 odd:rotate-[-0.7deg] even:rotate-[0.7deg]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-ink/45">{moment.author.displayName}</p>
          <h3 className="mt-2 font-display text-3xl font-black text-ink">
            {moment.mood ? `${moment.mood} today` : "Little slice of the day"}
          </h3>
          <p className="mt-2 text-sm text-ink/55">{formatRelativeTime(moment.createdAt)}</p>
        </div>

        {canEdit ? (
          <Link
            href={`/app/moment/${moment.id}/edit`}
            className="button-pop inline-flex items-center gap-2 bg-cloud/75 px-4 py-2 text-sm text-ink/75"
          >
            <PenLine className="size-4" />
            Edit
          </Link>
        ) : null}
      </div>

      <p className="text-base leading-8 text-ink/80">{moment.text}</p>

      <PhotoGallery photos={moment.photos} />

      <div className="flex flex-wrap gap-2">
        {REACTION_OPTIONS.map((option) => {
          const summary = moment.reactions.find((item) => item.type === option.type);
          const Icon = option.icon;
          return (
            <form key={option.type} action={toggleReactionAction}>
              <input type="hidden" name="momentId" value={moment.id} />
              <input type="hidden" name="reactionType" value={option.type} />
              <input type="hidden" name="entryDate" value={moment.entryDate} />
              <button
                type="submit"
                disabled={viewer.mode === "demo"}
                className={cn(
                  "button-pop inline-flex items-center gap-2 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60",
                  summary?.reactedByViewer
                    ? "border-rose/40 bg-blush/70 text-ink"
                    : "border-line bg-cloud/70 text-ink/75",
                )}
              >
                <Icon className={cn("size-4", option.colorClass)} />
                {option.label}
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-ink/60">
                  {summary?.count ?? 0}
                </span>
              </button>
            </form>
          );
        })}
      </div>

      <div className="illustration-tile rounded-[1.8rem] bg-cloud/60 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <MessageCircleHeart className="size-4 text-rose" />
          Notes
        </div>

        <div className="space-y-3">
          {moment.notes.length ? (
            moment.notes.map((note) => (
              <div key={note.id} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-xs text-ink/50">
                  <span>{note.author.displayName}</span>
                  <span>{formatRelativeTime(note.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/75">{note.body}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/55">No notes yet. Leave the first note underneath.</p>
          )}
        </div>

        <form action={addNoteAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="momentId" value={moment.id} />
          <input type="hidden" name="entryDate" value={moment.entryDate} />
          <input
            type="text"
            name="body"
            maxLength={240}
            placeholder={viewer.mode === "demo" ? "Demo mode is read-only" : "Add a note..."}
            disabled={viewer.mode === "demo"}
            className="min-w-0 flex-1 rounded-full border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-rose disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={viewer.mode === "demo"}
            className="button-pop bg-ink px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </article>
  );
}
