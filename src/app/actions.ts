"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { MAX_NOTE_LENGTH } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, isInvitedEmail } from "@/lib/supabase/env";
import { noteSchema, reactionSchema } from "@/lib/validation";
import { getViewer } from "@/lib/data";

function requestOrigin(host: string | null, protocol: string | null) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  return `${protocol ?? "https"}://${host ?? "localhost:3000"}`;
}

export async function requestMagicLinkAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/app");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!isInvitedEmail(email)) {
    redirect("/?error=invite-only");
  }

  const supabase = await createServerSupabaseClient();
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const redirectTo = `${requestOrigin(host, protocol)}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    redirect("/?error=auth");
  }

  redirect("/?sent=1");
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
