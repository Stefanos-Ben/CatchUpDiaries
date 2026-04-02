"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

import type { MomentPhoto } from "@/types/app";

export function PhotoGallery({ photos }: { photos: MomentPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  if (!photos.length) {
    return null;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {photos.map((photo, index) => (
          <button
            type="button"
            key={photo.id}
            onClick={() => setActiveIndex(index)}
            className="group relative overflow-hidden rounded-[1.5rem] border border-white/50 bg-white/70 text-left shadow-card transition duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={photo.imageUrl}
                alt=""
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </button>
        ))}
      </div>

      {activePhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 px-4 py-10 backdrop-blur-sm">
          <button
            type="button"
            className="absolute right-5 top-5 rounded-full border border-white/25 bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={() => setActiveIndex(null)}
          >
            <X className="size-5" />
          </button>
          <div className="relative h-full w-full max-w-4xl">
            <Image
              src={activePhoto.imageUrl}
              alt=""
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
