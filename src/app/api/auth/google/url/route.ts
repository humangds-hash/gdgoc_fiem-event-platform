import { NextResponse } from "next/server";
import { getGoogleOAuthUrl, isGoogleAuthCustomConfigured } from "@/lib/google-auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const origin = url.origin;

    if (!isGoogleAuthCustomConfigured()) {
      return NextResponse.json({
        configured: false,
        message: "Google Cloud Client ID and Secret not configured yet in .env.local",
      });
    }

    const authUrl = getGoogleOAuthUrl(origin);
    return NextResponse.json({ configured: true, url: authUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error generating Google Auth URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
