import { createClient } from "@/lib/supabase/server";
import { processHouseholdOnboarding } from "@/lib/onboarding";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const displayName =
          (user.user_metadata?.full_name as string | undefined)?.trim() ||
          (user.user_metadata?.name as string | undefined)?.trim() ||
          user.email?.split("@")[0] ||
          "Ukjent";
        await supabase
          .from("profiles")
          .upsert({ id: user.id, display_name: displayName }, { onConflict: "id", ignoreDuplicates: true });
        await processHouseholdOnboarding();
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=` + encodeURIComponent("Noe gikk galt, prøv igjen")
  );
}
