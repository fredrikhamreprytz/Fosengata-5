"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function loginWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("host")!;
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const redirectTo = `${protocol}://${host}/auth/callback`;

  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (data.url) redirect(data.url);
}
