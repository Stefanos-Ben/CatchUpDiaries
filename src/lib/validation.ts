import { z } from "zod";

import { MAX_NOTE_LENGTH, MAX_PHOTOS_PER_MOMENT, MAX_TEXT_LENGTH } from "@/lib/constants";

export const momentSchema = z
  .object({
    entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    text: z.string().trim().max(MAX_TEXT_LENGTH),
    mood: z.string().trim().max(32).optional().nullable(),
  })
  .superRefine((value: { entryDate: string; text: string; mood?: string | null }, ctx: z.RefinementCtx) => {
    if (!value.text && !value.mood) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add a few words or a mood so the moment feels complete.",
        path: ["text"],
      });
    }
  });

export const noteSchema = z.object({
  momentId: z.string().uuid(),
  body: z.string().trim().min(1).max(MAX_NOTE_LENGTH),
});

export const reactionSchema = z.object({
  momentId: z.string().uuid(),
  reactionType: z.enum(["heart", "spark", "hug", "laugh"]),
});

export function validatePhotoCount(count: number) {
  if (count > MAX_PHOTOS_PER_MOMENT) {
    throw new Error(`You can attach up to ${MAX_PHOTOS_PER_MOMENT} photos to one moment.`);
  }
}
