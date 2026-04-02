import { addHours, addMinutes, parseISO } from "date-fns";

import type {
  CalendarDaySummary,
  DayFeedResponse,
  MomentDetail,
  ProfileSummary,
  RecentMomentCard,
  ReactionSummary,
} from "@/types/app";
import { clipText } from "@/lib/utils";

const profiles: ProfileSummary[] = [
  {
    id: "9f9c80de-3c72-457d-a7a2-958ac0f13ca1",
    displayName: "Stefanos",
    avatarUrl: null,
    invited: true,
    active: true,
    email: "stefanos@example.com",
  },
  {
    id: "af72670d-7298-4fb8-a7c0-7951f43cc531",
    displayName: "Konstantina",
    avatarUrl: null,
    invited: true,
    active: true,
    email: "konstantina@example.com",
  },
];

function reactionSet(overrides: Partial<Record<ReactionSummary["type"], number>>): ReactionSummary[] {
  return [
    { type: "heart", count: overrides.heart ?? 0, reactedByViewer: true },
    { type: "spark", count: overrides.spark ?? 0, reactedByViewer: false },
    { type: "hug", count: overrides.hug ?? 0, reactedByViewer: false },
    { type: "laugh", count: overrides.laugh ?? 0, reactedByViewer: false },
  ];
}

export const demoMoments: MomentDetail[] = [
  {
    id: "b8bd33ea-3416-45d8-8ffc-06b67df13857",
    entryDate: "2026-04-02",
    createdAt: addMinutes(parseISO("2026-04-02T09:00:00.000Z"), 4).toISOString(),
    updatedAt: addMinutes(parseISO("2026-04-02T09:00:00.000Z"), 11).toISOString(),
    text: "Found a tiny bakery after class and it felt like opening a postcard. The corner window looked exactly like the kind of place you would point out first.",
    mood: "Easy joy",
    author: profiles[0],
    photos: [
      {
        id: "9c1004d6-c577-425f-8733-64da73c32bf2",
        imageUrl: "/demo/dawn-window.svg",
        sortOrder: 0,
      },
    ],
    reactions: reactionSet({ heart: 2, spark: 1 }),
    notes: [
      {
        id: "bb8a5cc0-b826-4302-ab0d-ea9d3d1a7b09",
        body: "That light is absurdly pretty. Strong postcard energy.",
        createdAt: addHours(parseISO("2026-04-02T09:00:00.000Z"), 1).toISOString(),
        author: profiles[1],
      },
    ],
  },
  {
    id: "58afb03a-f7d5-4d4a-af3e-c6145d47fc21",
    entryDate: "2026-04-02",
    createdAt: addHours(parseISO("2026-04-02T09:00:00.000Z"), 5).toISOString(),
    updatedAt: addHours(parseISO("2026-04-02T09:00:00.000Z"), 5).toISOString(),
    text: "Walked home through violet clouds and the whole sky looked edited by hand.",
    mood: "Dreamy",
    author: profiles[1],
    photos: [
      {
        id: "92039539-0860-4210-9981-414d8b90f0ab",
        imageUrl: "/demo/twilight-walk.svg",
        sortOrder: 0,
      },
      {
        id: "eb0c6a06-69ef-447c-8e72-e6914bd859c9",
        imageUrl: "/demo/moon-note.svg",
        sortOrder: 1,
      },
    ],
    reactions: reactionSet({ heart: 1, hug: 1, spark: 2 }),
    notes: [
      {
        id: "c76cf39b-1087-4838-a236-62d3aa791cd8",
        body: "That line belongs in a song.",
        createdAt: addHours(parseISO("2026-04-02T09:00:00.000Z"), 5.5).toISOString(),
        author: profiles[0],
      },
    ],
  },
  {
    id: "55057185-6a97-4b8b-9081-d0133238dccd",
    entryDate: "2026-04-01",
    createdAt: addHours(parseISO("2026-04-01T08:00:00.000Z"), 10).toISOString(),
    updatedAt: addHours(parseISO("2026-04-01T08:00:00.000Z"), 10).toISOString(),
    text: "Spent the afternoon building this private space online. It already feels like a memory box.",
    mood: "Hopeful",
    author: profiles[0],
    photos: [],
    reactions: reactionSet({ heart: 2, hug: 1 }),
    notes: [],
  },
  {
    id: "924ff8ea-f54a-4168-a6f4-e523cc6ef0b0",
    entryDate: "2026-03-29",
    createdAt: addHours(parseISO("2026-03-29T12:00:00.000Z"), 3).toISOString(),
    updatedAt: addHours(parseISO("2026-03-29T12:00:00.000Z"), 4).toISOString(),
    text: "Sunday felt stitched together with laundry, playlists, and the kind of quiet that makes a room feel cinematic.",
    mood: "Reflective",
    author: profiles[1],
    photos: [
      {
        id: "6ed21077-f778-4529-b8f4-f4801dbc148b",
        imageUrl: "/demo/laundry-afternoon.svg",
        sortOrder: 0,
      },
    ],
    reactions: reactionSet({ heart: 2, laugh: 1 }),
    notes: [],
  },
];

export function getDemoProfiles() {
  return profiles;
}

export function getDemoViewer() {
  return profiles[0];
}

export function getDemoDayFeed(date: string): DayFeedResponse {
  return {
    date,
    moments: demoMoments
      .filter((moment) => moment.entryDate === date)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

export function getDemoRecentMoments(limit = 6): RecentMomentCard[] {
  return demoMoments
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((moment) => ({
      id: moment.id,
      entryDate: moment.entryDate,
      createdAt: moment.createdAt,
      textPreview: clipText(moment.text, 110),
      photoPreview: moment.photos[0]?.imageUrl ?? null,
      author: moment.author,
      reactionCount: moment.reactions.reduce((sum, reaction) => sum + reaction.count, 0),
      noteCount: moment.notes.length,
    }));
}

export function getDemoCalendarDaySummaries(monthKey: string): CalendarDaySummary[] {
  const map = new Map<string, CalendarDaySummary>();

  for (const moment of demoMoments.filter((item) => item.entryDate.startsWith(monthKey))) {
    const existing = map.get(moment.entryDate);

    if (!existing) {
      map.set(moment.entryDate, {
        date: moment.entryDate,
        momentCount: 1,
        photoCount: moment.photos.length,
        authors: [moment.author.displayName],
        previewImage: moment.photos[0]?.imageUrl ?? null,
      });
      continue;
    }

    existing.momentCount += 1;
    existing.photoCount += moment.photos.length;
    existing.previewImage = existing.previewImage ?? moment.photos[0]?.imageUrl ?? null;
    if (!existing.authors.includes(moment.author.displayName)) {
      existing.authors.push(moment.author.displayName);
    }
  }

  return [...map.values()];
}

export function getDemoMomentById(id: string) {
  return demoMoments.find((moment) => moment.id === id) ?? null;
}
