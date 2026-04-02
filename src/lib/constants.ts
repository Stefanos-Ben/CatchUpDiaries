import { Heart, Laugh, Sparkles, Stars } from "lucide-react";

import type { ReactionType } from "@/types/app";

export const APP_NAME = "CatchUpDiaries";
export const STORAGE_BUCKET = "moment-images";
export const MAX_PHOTOS_PER_MOMENT = 6;
export const MAX_TEXT_LENGTH = 1200;
export const MAX_NOTE_LENGTH = 240;

export const REACTION_OPTIONS: Array<{
  type: ReactionType;
  label: string;
  icon: typeof Heart;
  colorClass: string;
}> = [
  {
    type: "heart",
    label: "Heart",
    icon: Heart,
    colorClass: "text-rose",
  },
  {
    type: "spark",
    label: "Spark",
    icon: Sparkles,
    colorClass: "text-gold",
  },
  {
    type: "hug",
    label: "Hug",
    icon: Stars,
    colorClass: "text-lagoon",
  },
  {
    type: "laugh",
    label: "Laugh",
    icon: Laugh,
    colorClass: "text-plum",
  },
];

export const DEMO_ALLOWED_EMAILS = [
  "stefanos@example.com",
  "konstantina@example.com",
];
