import { NextResponse } from "next/server";
import { getGoogleUserFromCode } from "@/lib/google-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=no_code_provided`);
  }

  try {
    const user = await getGoogleUserFromCode(code, origin);
    
    // Redirect back to home with verified Google user data encoded
    const targetUrl = new URL(origin);
    targetUrl.searchParams.set("google_auth", "success");
    targetUrl.searchParams.set("google_name", user.fullName);
    targetUrl.searchParams.set("google_email", user.email);
    if (user.avatarUrl) {
      targetUrl.searchParams.set("google_avatar", user.avatarUrl);
    }

    return NextResponse.redirect(targetUrl.toString());
  } catch (err: unknown) {
    console.error("Custom Google OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/?error=google_auth_failed`);
  }
}
