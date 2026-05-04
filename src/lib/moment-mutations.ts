import { revalidatePath } from "next/cache";

import { STORAGE_BUCKET } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, isInvitedEmail } from "@/lib/supabase/env";
import { momentSchema, validatePhotoCount } from "@/lib/validation";
import { slugDate } from "@/lib/utils";

type SaveMomentInput = {
  id?: string;
  entryDate: string;
  text: string;
  mood: string | null;
  files: File[];
  removePhotoIds?: string[];
};

function fileExtension(file: File) {
  const lastSegment = file.name.split(".").pop();
  return lastSegment?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
}

async function requireLiveViewer() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase is not configured yet.");
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email || !isInvitedEmail(user.email)) {
    throw new Error("Please sign in with one of the invited accounts.");
  }

  return { supabase, user };
}

async function uploadPhotos(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  authorId: string,
  momentId: string,
  files: File[],
) {
  const uploaded: Array<{
    storage_path: string;
    sort_order: number;
    width: null;
    height: null;
  }> = [];

  for (const [index, file] of files.entries()) {
    if (!file.size) {
      continue;
    }

    const ext = fileExtension(file);
    const storagePath = `${authorId}/${momentId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    uploaded.push({
      storage_path: storagePath,
      sort_order: index,
      width: null,
      height: null,
    });
  }

  return uploaded;
}

export async function saveMoment(input: SaveMomentInput) {
  const parsed = momentSchema.safeParse({
    entryDate: input.entryDate,
    text: input.text,
    mood: input.mood,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "This moment needs a little more detail.");
  }

  const { supabase, user } = await requireLiveViewer();
  validatePhotoCount(input.files.length);

  if (!input.id && parsed.data.entryDate !== slugDate(new Date())) {
    throw new Error("New moments can only be added for today.");
  }

  if (input.id) {
    const { data: existing } = await supabase
      .from("moments")
      .select("id, author_id")
      .eq("id", input.id)
      .single();

    if (!existing || existing.author_id !== user.id) {
      throw new Error("You can only edit your own moments.");
    }

    await supabase
      .from("moments")
      .update({
        entry_date: parsed.data.entryDate,
        text: parsed.data.text,
        mood: parsed.data.mood ?? null,
      })
      .eq("id", input.id);

    if (input.removePhotoIds?.length) {
      const { data: removableRows } = await supabase
        .from("moment_photos")
        .select("id, storage_path")
        .eq("moment_id", input.id)
        .in("id", input.removePhotoIds);

      const storagePaths = (removableRows ?? []).map((row: { storage_path: string }) => row.storage_path);
      if (storagePaths.length) {
        await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);
      }

      await supabase.from("moment_photos").delete().in("id", input.removePhotoIds);
    }

    if (input.files.length) {
      const { count } = await supabase
        .from("moment_photos")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", input.id);

      validatePhotoCount((count ?? 0) + input.files.length);
      const uploaded = await uploadPhotos(supabase, user.id, input.id, input.files);
      if (uploaded.length) {
        await supabase.from("moment_photos").insert(
          uploaded.map((photo, index) => ({
            moment_id: input.id,
            storage_path: photo.storage_path,
            sort_order: (count ?? 0) + index,
            width: photo.width,
            height: photo.height,
          })),
        );
      }
    }

    revalidatePath("/app");
    revalidatePath(`/app/day/${parsed.data.entryDate}`);
    revalidatePath(`/app/moment/${input.id}/edit`);
    return { id: input.id, entryDate: parsed.data.entryDate };
  }

  const { data: insertedMoment, error: insertError } = await supabase
    .from("moments")
    .insert({
      author_id: user.id,
      entry_date: parsed.data.entryDate,
      text: parsed.data.text,
      mood: parsed.data.mood ?? null,
    })
    .select("id")
    .single();

  if (insertError || !insertedMoment?.id) {
    throw new Error(insertError?.message ?? "The moment could not be saved.");
  }

  const uploaded = await uploadPhotos(supabase, user.id, insertedMoment.id, input.files);
  if (uploaded.length) {
    await supabase.from("moment_photos").insert(
      uploaded.map((photo) => ({
        moment_id: insertedMoment.id,
        ...photo,
      })),
    );
  }

  revalidatePath("/app");
  revalidatePath(`/app/day/${parsed.data.entryDate}`);
  return { id: insertedMoment.id, entryDate: parsed.data.entryDate };
}

export async function deleteMoment(momentId: string) {
  const { supabase, user } = await requireLiveViewer();
  const { data: moment } = await supabase
    .from("moments")
    .select("id, author_id, entry_date")
    .eq("id", momentId)
    .single();

  if (!moment || moment.author_id !== user.id) {
    throw new Error("You can only delete your own moments.");
  }

  const { data: photoRows } = await supabase
    .from("moment_photos")
    .select("storage_path")
    .eq("moment_id", momentId);

  const storagePaths = (photoRows ?? []).map((row: { storage_path: string }) => row.storage_path);
  if (storagePaths.length) {
    await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);
  }

  await supabase.from("moments").delete().eq("id", momentId);

  revalidatePath("/app");
  revalidatePath(`/app/day/${moment.entry_date}`);
}
