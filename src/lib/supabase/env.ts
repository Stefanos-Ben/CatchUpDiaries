import { readEnvList } from "@/lib/utils";

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getAllowedEmails() {
  return readEnvList(process.env.ALLOWED_EMAILS ?? process.env.NEXT_PUBLIC_ALLOWED_EMAILS);
}

export function isInvitedEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  const allowed = getAllowedEmails();
  if (!allowed.length) {
    return true;
  }

  return allowed.includes(email.toLowerCase());
}
