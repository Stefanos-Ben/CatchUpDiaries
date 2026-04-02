"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";

import { MAX_PHOTOS_PER_MOMENT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { MomentDetail } from "@/types/app";

type MomentFormProps = {
  mode: "create" | "edit";
  initialDate: string;
  initialMoment?: MomentDetail | null;
  demoMode: boolean;
};

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const longestSide = Math.max(image.width, image.height);
  const scale = longestSide > 1800 ? 1800 / longestSide : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.84),
  );

  if (!blob) {
    return file;
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.webp`, {
    type: "image/webp",
  });
}

export function MomentForm({ mode, initialDate, initialMoment, demoMode }: MomentFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [removePhotoIds, setRemovePhotoIds] = useState<string[]>([]);

  async function handleSubmit(formData: FormData) {
    if (demoMode) {
      setError("Demo mode is read-only. Add Supabase keys to save real moments.");
      return;
    }

    const selectedFiles = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (selectedFiles.length > MAX_PHOTOS_PER_MOMENT) {
      setError(`You can add up to ${MAX_PHOTOS_PER_MOMENT} photos at a time.`);
      return;
    }

    formData.delete("photos");
    for (const file of selectedFiles) {
      formData.append("photos", await compressImage(file));
    }
    removePhotoIds.forEach((id) => formData.append("removePhotoIds", id));

    const endpoint = mode === "create" ? "/api/moments" : `/api/moments/${initialMoment?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const response = await fetch(endpoint, {
      method,
      body: formData,
    });

    const payload = (await response.json()) as { error?: string; entryDate?: string; id?: string };
    if (!response.ok) {
      setError(payload.error ?? "The moment did not save. Try again in a second.");
      return;
    }

    router.push(`/app/day/${payload.entryDate ?? initialDate}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!initialMoment) {
      return;
    }

    if (!window.confirm("Delete this moment?")) {
      return;
    }

    const response = await fetch(`/api/moments/${initialMoment.id}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "The delete did not go through.");
      return;
    }

    router.push(`/app/day/${initialMoment.entryDate}`);
    router.refresh();
  }

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await handleSubmit(formData);
        })
      }
      className="panel-pop space-y-6 rounded-[2.4rem] p-6"
    >
      <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink/75">Date</span>
          <input
            type="date"
            name="entryDate"
            defaultValue={initialMoment?.entryDate ?? initialDate}
            className="w-full rounded-2xl border border-line bg-cloud/70 px-4 py-3 text-sm text-ink outline-none ring-0 transition focus:border-rose"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink/75">Mood</span>
          <input
            type="text"
            name="mood"
            placeholder="Soft joy, dreamy, electric..."
            defaultValue={initialMoment?.mood ?? ""}
            className="w-full rounded-2xl border border-line bg-cloud/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-rose"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink/75">Your moment</span>
        <textarea
          name="text"
          defaultValue={initialMoment?.text ?? ""}
          rows={7}
          maxLength={1200}
          placeholder="What felt vivid today?"
          className="w-full rounded-[1.75rem] border border-line bg-cloud/70 px-4 py-4 text-sm leading-7 text-ink outline-none transition focus:border-rose"
        />
      </label>

      {initialMoment?.photos.length ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink/75">Existing photos</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {initialMoment.photos.map((photo) => {
              const removing = removePhotoIds.includes(photo.id);
              return (
                <label
                  key={photo.id}
                  className={cn(
                    "group illustration-tile flex cursor-pointer items-center gap-3 p-3 transition",
                    removing
                      ? "border-rose/60 bg-rose/10"
                      : "border-white/65 bg-white/70 hover:-translate-y-0.5",
                  )}
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-card">
                    <Image
                      src={photo.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">
                      {removing ? "Marked for removal" : "Keep this photo"}
                    </p>
                    <p className="text-xs text-ink/60">
                      Tap to {removing ? "restore it" : "remove it from the moment"}.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="size-4 accent-rose"
                    checked={removing}
                    onChange={(event) => {
                      setRemovePhotoIds((current) =>
                        event.target.checked
                          ? [...current, photo.id]
                          : current.filter((id) => id !== photo.id),
                      );
                    }}
                  />
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <label className="illustration-tile block rounded-[2rem] border-dashed border-rose/40 bg-blush/45 p-5 transition hover:border-rose">
        <div className="flex items-center gap-3 text-sm text-ink/80">
          <div className="rounded-2xl bg-white/80 p-3 shadow-card">
            <ImagePlus className="size-5 text-rose" />
          </div>
          <div>
            <p className="font-medium text-ink">Add up to six photos</p>
            <p className="text-ink/60">They are previewed here and compressed before upload.</p>
          </div>
        </div>
        <input
          type="file"
          name="photos"
          multiple
          accept="image/*"
          className="mt-4 block w-full text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            setPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
            setError(null);
          }}
        />
      </label>

      {photoPreviews.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {photoPreviews.map((src) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-card">
              <Image
                src={src}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="button-pop inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {mode === "create" ? "Save moment" : "Update moment"}
        </button>
        {mode === "edit" && initialMoment ? (
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await handleDelete();
              })
            }
            className="button-pop inline-flex items-center gap-2 border border-rose/35 bg-white/75 px-5 py-3 text-sm font-medium text-rose"
          >
            <Trash2 className="size-4" />
            Delete moment
          </button>
        ) : null}
      </div>
    </form>
  );
}
