import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { MomentForm } from "@/components/moment-form";
import { requireViewer } from "@/lib/data";
import { slugDate } from "@/lib/utils";

type NewMomentPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewMomentPage({ searchParams }: NewMomentPageProps) {
  const viewer = await requireViewer();
  const today = slugDate(new Date());
  const params = (await searchParams) ?? {};
  const initialDate = typeof params.date === "string" ? params.date : today;

  return (
    <div className="space-y-6">
      <div className="panel-fizzy rounded-[2.5rem] p-6">
        <Link href={`/app/day/${initialDate}`} className="inline-flex items-center gap-2 text-sm text-ink/60">
          <ChevronLeft className="size-4" />
          Back to day
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.28em] text-ink/45">Compose</p>
        <h1 className="mt-3 font-display text-5xl font-black text-ink">Capture a moment before it fades.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">
          Write a small memory, add photos, and leave enough room for the other person to react and
          respond.
        </p>
      </div>

      <MomentForm mode="create" initialDate={initialDate} demoMode={viewer.mode === "demo"} />
    </div>
  );
}
