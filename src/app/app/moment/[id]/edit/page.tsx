import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { MomentForm } from "@/components/moment-form";
import { getMomentById, requireViewer } from "@/lib/data";

type EditMomentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMomentPage({ params }: EditMomentPageProps) {
  const viewer = await requireViewer();
  const { id } = await params;
  const moment = await getMomentById(id);

  if (!moment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2.2rem] border border-white/60 bg-gradient-to-br from-white/78 via-mist/55 to-blush/70 p-6 shadow-float">
        <Link href={`/app/day/${moment.entryDate}`} className="inline-flex items-center gap-2 text-sm text-ink/60">
          <ChevronLeft className="size-4" />
          Back to day
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.28em] text-ink/45">Edit moment</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Refine the feeling, keep the memory.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">
          Update the text, shift the mood, add more photos, or remove the ones that no longer fit.
        </p>
      </div>

      <MomentForm
        mode="edit"
        initialDate={moment.entryDate}
        initialMoment={moment}
        demoMode={viewer.mode === "demo"}
      />
    </div>
  );
}
