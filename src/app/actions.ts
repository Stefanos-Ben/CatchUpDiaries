"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { MAX_NOTE_LENGTH } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { noteSchema, reactionSchema } from "@/lib/validation";
import { getViewer } from "@/lib/data";


export async function signInAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/app");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/?error=invalid-credentials");
  }

  redirect("/app");
}

export async function signUpAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/app");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect("/?tab=signup&error=auth");
  }

  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      redirect("/?error=invalid-credentials");
    }
  }

  redirect("/app");
}

export async function signOutAction() {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function toggleReactionAction(formData: FormData) {
  const viewer = await getViewer();
  if (!viewer || viewer.mode === "demo") {
    redirect("/app?demo=1");
  }

  const parsed = reactionSchema.safeParse({
    momentId: String(formData.get("momentId") ?? ""),
    reactionType: String(formData.get("reactionType") ?? ""),
  });

  if (!parsed.success) {
    redirect("/app?error=reaction");
  }

  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("moment_id", parsed.data.momentId)
    .eq("user_id", viewer.profile.id)
    .eq("reaction_type", parsed.data.reactionType)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    await supabase.from("reactions").insert({
      moment_id: parsed.data.momentId,
      user_id: viewer.profile.id,
      reaction_type: parsed.data.reactionType,
    });
  }

  const entryDate = String(formData.get("entryDate") ?? "");
  revalidatePath("/app");
  revalidatePath(`/app/day/${entryDate}`);
}

export async function addNoteAction(formData: FormData) {
  const viewer = await getViewer();
  if (!viewer || viewer.mode === "demo") {
    redirect("/app?demo=1");
  }

  const parsed = noteSchema.safeParse({
    momentId: String(formData.get("momentId") ?? ""),
    body: String(formData.get("body") ?? "").trim().slice(0, MAX_NOTE_LENGTH),
  });

  if (!parsed.success) {
    redirect("/app?error=note");
  }

  const supabase = await createServerSupabaseClient();
  await supabase.from("notes").insert({
    moment_id: parsed.data.momentId,
    user_id: viewer.profile.id,
    body: parsed.data.body,
  });

  const entryDate = String(formData.get("entryDate") ?? "");
  revalidatePath("/app");
  revalidatePath(`/app/day/${entryDate}`);
}
