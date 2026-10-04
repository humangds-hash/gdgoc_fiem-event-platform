import { OAuth2Client } from "google-auth-library";

export function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  return { clientId, clientSecret };
}

export function getOAuth2Client(origin?: string) {
  const { clientId, clientSecret } = getGoogleCredentials();
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    (origin ? `${origin}/api/auth/google/callback` : "http://localhost:3000/api/auth/google/callback");

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export function isGoogleAuthCustomConfigured(): boolean {
  const { clientId, clientSecret } = getGoogleCredentials();
  return Boolean(
    clientId &&
    clientSecret &&
    !clientId.includes("placeholder") &&
    !clientId.includes("your-")
  );
}

/**
 * Generate Google OAuth 2.0 authorization URL
 */
export function getGoogleOAuthUrl(origin?: string): string {
  const client = getOAuth2Client(origin);
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
    ],
    prompt: "select_account",
  });
}

/**
 * Exchange code for user profile
 */
export async function getGoogleUserFromCode(code: string, origin?: string) {
  const client = getOAuth2Client(origin);
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  if (!tokens.id_token) {
    throw new Error("No ID token returned from Google");
  }

  const { clientId } = getGoogleCredentials();
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid Google token payload");
  }

  return {
    id: payload.sub,
    email: payload.email || "",
    fullName: payload.name || "Google User",
    avatarUrl: payload.picture || "",
  };
}
