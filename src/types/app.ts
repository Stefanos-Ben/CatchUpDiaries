export type ReactionType = "heart" | "spark" | "hug" | "laugh";

export type ProfileSummary = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  invited: boolean;
  active: boolean;
  email?: string | null;
};

export type MomentPhoto = {
  id: string;
  imageUrl: string;
  storagePath?: string;
  sortOrder: number;
  width?: number | null;
  height?: number | null;
};

export type ReactionSummary = {
  type: ReactionType;
  count: number;
  reactedByViewer: boolean;
};

export type NoteDetail = {
  id: string;
  body: string;
  createdAt: string;
  author: ProfileSummary;
};

export type MomentDetail = {
  id: string;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  text: string;
  mood: string | null;
  author: ProfileSummary;
  photos: MomentPhoto[];
  reactions: ReactionSummary[];
  notes: NoteDetail[];
};

export type RecentMomentCard = {
  id: string;
  entryDate: string;
  createdAt: string;
  textPreview: string;
  photoPreview: string | null;
  author: ProfileSummary;
  reactionCount: number;
  noteCount: number;
};

export type CalendarDaySummary = {
  date: string;
  momentCount: number;
  photoCount: number;
  authors: string[];
  previewImage: string | null;
};

export type DayFeedResponse = {
  date: string;
  moments: MomentDetail[];
};

export type ViewerContext = {
  mode: "demo" | "live";
  profile: ProfileSummary;
  email: string | null;
};

export type CreateMomentInput = {
  entryDate: string;
  text: string;
  mood?: string | null;
};

export type UpdateMomentInput = {
  id: string;
  entryDate: string;
  text: string;
  mood?: string | null;
};

export type AddReactionInput = {
  momentId: string;
  reactionType: ReactionType;
};

export type AddNoteInput = {
  momentId: string;
  body: string;
};
