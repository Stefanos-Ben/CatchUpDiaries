import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { redirect } from "next/navigation";

import { getDemoCalendarDaySummaries, getDemoDayFeed, getDemoMomentById, getDemoRecentMoments, getDemoViewer } from "@/lib/demo-data";
import { DEMO_ALLOWED_EMAILS, STORAGE_BUCKET } from "@/lib/constants";
import { clipText } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, isInvitedEmail } from "@/lib/supabase/env";
import type {
  CalendarDaySummary,
  DayFeedResponse,
  MomentDetail,
  NoteDetail,
  ProfileSummary,
  RecentMomentCard,
  ReactionSummary,
  ViewerContext,
} from "@/types/app";

type MomentRow = {
  id: string;
  author_id: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
  text: string;
  mood: string | null;
};

type PhotoRow = {
  id: string;
  moment_id: string;
  storage_path: string;
  sort_order: number;
  width: number | null;
  height: number | null;
};

type ReactionRow = {
  moment_id: string;
  user_id: string;
  reaction_type: ReactionSummary["type"];
};

type NoteRow = {
  id: string;
  moment_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  invited: boolean;
  active: boolean;
  email: string | null;
};

function mapProfile(row: ProfileRow): ProfileSummary {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    invited: row.invited,
    active: row.active,
    email: row.email,
  };
}

async function ensureViewerProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email || !isInvitedEmail(user.email)) {
    return null;
  }

  const fallbackDisplayName =
    user.user_metadata?.display_name ??
    user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      display_name: fallbackDisplayName,
      invited: true,
      active: true,
    },
    {
      onConflict: "id",
    },
  );

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, invited, active, email")
    .eq("id", user.id)
    .single<ProfileRow>();

  if (!profileRow) {
    return null;
  }

  return {
    supabase,
    user,
    profile: mapProfile(profileRow),
  };
}

export async function getViewer(): Promise<ViewerContext | null> {
  if (!hasSupabaseEnv()) {
    return {
      mode: "demo",
      profile: getDemoViewer(),
      email: DEMO_ALLOWED_EMAILS[0],
    };
  }

  const liveViewer = await ensureViewerProfile();
  if (!liveViewer) {
    return null;
  }

  return {
    mode: "live",
    profile: liveViewer.profile,
    email: liveViewer.user.email ?? null,
  };
}

export async function requireViewer() {
  const viewer = await getViewer();

  if (!viewer && hasSupabaseEnv()) {
    redirect("/");
  }

  if (!viewer) {
    throw new Error("Viewer context is unavailable.");
  }

  return viewer;
}

async function getProfilesMap(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, ids: string[]) {
  if (!ids.length) {
    return new Map<string, ProfileSummary>();
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, invited, active, email")
    .in("id", ids);

  return new Map(((data ?? []) as ProfileRow[]).map((row: ProfileRow) => [row.id, mapProfile(row)]));
}

async function getPhotosMap(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, momentIds: string[]) {
  if (!momentIds.length) {
    return new Map<string, MomentDetail["photos"]>();
  }

  const { data } = await supabase
    .from("moment_photos")
    .select("id, moment_id, storage_path, sort_order, width, height")
    .in("moment_id", momentIds)
    .order("sort_order", { ascending: true });

  const photoRows = (data ?? []) as PhotoRow[];
  const storagePaths = photoRows.map((row) => row.storage_path);
  const { data: signedUrlData } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(storagePaths, 60 * 60);
  const signedUrlMap = new Map(storagePaths.map((path, index) => [path, signedUrlData?.[index]?.signedUrl ?? ""]));

  const photoMap = new Map<string, MomentDetail["photos"]>();

  for (const row of photoRows) {
    const list = photoMap.get(row.moment_id) ?? [];
    list.push({
      id: row.id,
      imageUrl: signedUrlMap.get(row.storage_path) ?? "",
      storagePath: row.storage_path,
      sortOrder: row.sort_order,
      width: row.width,
      height: row.height,
    });
    photoMap.set(row.moment_id, list);
  }

  return photoMap;
}

async function getReactionsMap(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, momentIds: string[], viewerId: string) {
  const reactionMap = new Map<string, ReactionSummary[]>();

  for (const momentId of momentIds) {
    reactionMap.set(momentId, [
      { type: "heart", count: 0, reactedByViewer: false },
      { type: "spark", count: 0, reactedByViewer: false },
      { type: "hug", count: 0, reactedByViewer: false },
      { type: "laugh", count: 0, reactedByViewer: false },
    ]);
  }

  if (!momentIds.length) {
    return reactionMap;
  }

  const { data } = await supabase
    .from("reactions")
    .select("moment_id, user_id, reaction_type")
    .in("moment_id", momentIds);

  for (const row of (data ?? []) as ReactionRow[]) {
    const list = reactionMap.get(row.moment_id);
    const target = list?.find((item) => item.type === row.reaction_type);

    if (!target) {
      continue;
    }

    target.count += 1;
    if (row.user_id === viewerId) {
      target.reactedByViewer = true;
    }
  }

  return reactionMap;
}

async function getNotesMap(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, momentIds: string[]) {
  if (!momentIds.length) {
    return new Map<string, NoteDetail[]>();
  }

  const { data } = await supabase
    .from("notes")
    .select("id, moment_id, user_id, body, created_at, updated_at")
    .in("moment_id", momentIds)
    .order("created_at", { ascending: true });

  const noteRows = (data ?? []) as NoteRow[];
  const profileIds = [...new Set(noteRows.map((note) => note.user_id))];
  const profilesMap = await getProfilesMap(supabase, profileIds);
  const noteMap = new Map<string, NoteDetail[]>();

  for (const row of noteRows) {
    const list = noteMap.get(row.moment_id) ?? [];
    list.push({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      author:
        profilesMap.get(row.user_id) ??
        ({
          id: row.user_id,
          displayName: "Someone",
          avatarUrl: null,
          invited: true,
          active: true,
        } as ProfileSummary),
    });
    noteMap.set(row.moment_id, list);
  }

  return noteMap;
}

async function hydrateMoments(rows: MomentRow[], viewerId: string) {
  const supabase = await createServerSupabaseClient();
  const authorIds = [...new Set(rows.map((row) => row.author_id))];
  const momentIds = rows.map((row) => row.id);
  const [profilesMap, photosMap, reactionsMap, notesMap] = await Promise.all([
    getProfilesMap(supabase, authorIds),
    getPhotosMap(supabase, momentIds),
    getReactionsMap(supabase, momentIds, viewerId),
    getNotesMap(supabase, momentIds),
  ]);

  return rows.map((row): MomentDetail => ({
    id: row.id,
    entryDate: row.entry_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    text: row.text,
    mood: row.mood,
    author:
      profilesMap.get(row.author_id) ??
      ({
        id: row.author_id,
        displayName: "Someone",
        avatarUrl: null,
        invited: true,
        active: true,
      } as ProfileSummary),
    photos: photosMap.get(row.id) ?? [],
    reactions: reactionsMap.get(row.id) ?? [],
    notes: notesMap.get(row.id) ?? [],
  }));
}

export async function getRecentMoments(limit = 6): Promise<RecentMomentCard[]> {
  const viewer = await requireViewer();

  if (viewer.mode === "demo") {
    return getDemoRecentMoments(limit);
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("moments")
    .select("id, author_id, entry_date, created_at, updated_at, text, mood")
    .order("created_at", { ascending: false })
    .limit(limit);

  const moments = await hydrateMoments((data ?? []) as MomentRow[], viewer.profile.id);
  return moments.map((moment): RecentMomentCard => ({
    id: moment.id,
    entryDate: moment.entryDate,
    createdAt: moment.createdAt,
    textPreview: clipText(moment.text, 115),
    photoPreview: moment.photos[0]?.imageUrl ?? null,
    author: moment.author,
    reactionCount: moment.reactions.reduce((sum, reaction) => sum + reaction.count, 0),
    noteCount: moment.notes.length,
  }));
}

export async function getCalendarDaySummaries(monthDate: Date): Promise<CalendarDaySummary[]> {
  const viewer = await requireViewer();
  const monthKey = format(startOfMonth(monthDate), "yyyy-MM");

  if (viewer.mode === "demo") {
    return getDemoCalendarDaySummaries(monthKey);
  }

  const supabase = await createServerSupabaseClient();
  const monthStart = format(startOfMonth(monthDate), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(monthDate), "yyyy-MM-dd");
  const { data } = await supabase
    .from("moments")
    .select("id, author_id, entry_date, created_at, updated_at, text, mood")
    .gte("entry_date", monthStart)
    .lte("entry_date", monthEnd)
    .order("entry_date", { ascending: true });

  const moments = await hydrateMoments((data ?? []) as MomentRow[], viewer.profile.id);
  const map = new Map<string, CalendarDaySummary>();

  for (const moment of moments) {
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

export async function getDayFeed(date: string): Promise<DayFeedResponse> {
  const viewer = await requireViewer();

  if (viewer.mode === "demo") {
    return getDemoDayFeed(date);
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("moments")
    .select("id, author_id, entry_date, created_at, updated_at, text, mood")
    .eq("entry_date", date)
    .order("created_at", { ascending: true });

  const moments = await hydrateMoments((data ?? []) as MomentRow[], viewer.profile.id);

  return {
    date,
    moments: moments as MomentDetail[],
  };
}

export async function getMomentById(id: string): Promise<MomentDetail | null> {
  const viewer = await requireViewer();

  if (viewer.mode === "demo") {
    return getDemoMomentById(id);
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("moments")
    .select("id, author_id, entry_date, created_at, updated_at, text, mood")
    .eq("id", id)
    .single();

  if (!data) {
    return null;
  }

  const [moment] = await hydrateMoments([data as MomentRow], viewer.profile.id);
  return moment ?? null;
}

export async function canEditMoment(momentId: string, viewerId: string) {
  if (!hasSupabaseEnv()) {
    const moment = getDemoMomentById(momentId);
    return moment?.author.id === viewerId;
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("moments").select("author_id").eq("id", momentId).single();

  return data?.author_id === viewerId;
}

export async function getInitialMonthDate() {
  const viewer = await getViewer();

  if (!viewer || viewer.mode === "demo") {
    return parseISO("2026-04-01");
  }

  return new Date();
}
