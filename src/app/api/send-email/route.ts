import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName, ticketId, eventTitle, displayDate, displayTime, hallOrRoom, venue, avatarUrl } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Missing required email or fullName parameter" },
        { status: 400 }
      );
    }

    const attendeeAvatar =
      avatarUrl ||
      `https://api.dicebear.com/7.x/notionists/png?seed=${encodeURIComponent(fullName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=${encodeURIComponent(
      ticketId || "PASS-TINYGD-2026"
    )}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Digital Entry Pass · TinyGD</title>
      </head>
      <body style="margin: 0; padding: 24px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 2px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);">
          
          <!-- Google 4-Color Accent Strip -->
          <div style="height: 6px; display: flex; width: 100%; background: linear-gradient(90deg, #4285F4 25%, #EA4335 25% 50%, #FBBC04 50% 75%, #34A853 75%);"></div>
          
          <!-- Header Banner -->
          <div style="padding: 28px 28px 20px 28px; text-align: center; border-bottom: 1px solid #f1f5f9;">
            <div style="display: inline-block; padding: 4px 14px; background: #d7f5e4; color: #0f5132; font-size: 11px; font-weight: 800; border-radius: 9999px; border: 1px solid #b0ecc4; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
              ✓ RSVP Confirmed · Seat Reserved
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
              ${eventTitle || "Google Cloud Study Jams 2026–27"}
            </h1>
            <p style="margin: 6px 0 0 0; color: #64748b; font-size: 13px;">
              TinyGD Developer Ecosystem · Kolkata
            </p>
          </div>

          <!-- Ticket Card Body -->
          <div style="padding: 24px 28px;">
            <!-- Attendee Info & Avatar -->
            <div style="display: flex; align-items: center; gap: 14px; padding: 16px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <img src="${attendeeAvatar}" alt="${fullName}" width="52" height="52" style="border-radius: 14px; border: 2px solid #ffffff; background: #ffffff; object-fit: cover; display: block;" />
              <div style="flex: 1; min-width: 0;">
                <span style="display: block; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-family: monospace;">
                  Registered Attendee
                </span>
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 2px 0 1px 0;">
                  ${fullName}
                </div>
                <div style="font-size: 12px; color: #64748b; font-family: monospace;">
                  ${email}
                </div>
              </div>
            </div>

            <!-- Scannable QR Pass Section -->
            <div style="text-align: center; padding: 24px 16px; background: #fafafa; border: 2px dashed #cbd5e1; border-radius: 20px; margin-bottom: 20px;">
              <div style="display: inline-block; padding: 12px; background: #ffffff; border-radius: 16px; border: 2px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
                <img src="${qrImageUrl}" alt="Event Pass QR Code" width="160" height="160" style="display: block; margin: 0 auto;" />
              </div>
              <div style="margin-top: 12px; font-family: monospace; font-size: 12px; font-weight: 800; color: #334155; letter-spacing: 1px;">
                PASS ID: ${ticketId || "PASS-TINYGD-2026"}
              </div>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                Show this QR pass or save this email for check-in at the registration desk.
              </p>
            </div>

            <!-- Event Details Specs -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 12px;">
              <div style="padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <span style="display: block; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; font-family: monospace;">
                  Date & Time
                </span>
                <span style="display: block; font-weight: 700; color: #0f172a; margin-top: 2px;">
                  ${displayDate || "Friday, Oct 9, 2026"}
                </span>
                <span style="display: block; color: #64748b; font-size: 11px;">
                  ${displayTime || "3:00 PM – 5:30 PM (IST)"}
                </span>
              </div>

              <div style="padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <span style="display: block; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; font-family: monospace;">
                  Venue & Hall
                </span>
                <span style="display: block; font-weight: 700; color: #0f172a; margin-top: 2px;">
                  ${hallOrRoom || "SG Hall, FIEM Campus"}
                </span>
                <span style="display: block; color: #64748b; font-size: 11px;">
                  ${venue || "FIEM Kolkata"}
                </span>
              </div>
            </div>

            <!-- Perks reminder -->
            <div style="padding: 14px; background: #cee5ff; border-radius: 14px; border: 1px solid #b6d8ff; margin-bottom: 24px; font-size: 12px; color: #1557b0;">
              🎁 <strong>Attendee Perks:</strong> Free Google Cloud Skills Boost lab vouchers, developer roadmaps, and official GDG stickers will be distributed during check-in.
            </div>

            <!-- Footer info -->
            <p style="text-align: center; color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.5;">
              This pass is issued exclusively for <strong>${fullName}</strong>.<br />
              TinyGD Developer Community · Future Institute of Engineering & Management, Kolkata
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 1. Check Resend API
    const resendApiKey = process.env.RESEND_API_KEY || "";
    if (resendApiKey && resendApiKey.startsWith("re_")) {
      const resend = new Resend(resendApiKey);
      const resendFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const { data, error } = await resend.emails.send({
        from: resendFrom,
        to: [email],
        subject: `Your RSVP Confirmation: ${eventTitle || "Study Jams 2026–27"}`,
        html: htmlContent,
      });

      if (error) {
        console.error("Resend API error:", error);
        throw new Error(error.message);
      }

      return NextResponse.json({ success: true, messageId: data?.id, provider: "resend" });
    }

    // 2. Check Custom SMTP / Gmail
    const smtpHost = process.env.SMTP_HOST || "";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    const rawEmailFrom = process.env.EMAIL_FROM || "";

    if (smtpUser && smtpPass && !smtpPass.includes("placeholder")) {
      // Clean sender address to prevent malformed nested brackets like <"Name" <email>>
      let senderAddress = "";
      if (rawEmailFrom) {
        if (rawEmailFrom.includes("<") && rawEmailFrom.includes(">")) {
          senderAddress = rawEmailFrom;
        } else {
          senderAddress = `"${eventTitle || "GDG Community Events"}" <${rawEmailFrom.trim()}>`;
        }
      } else {
        senderAddress = `"${eventTitle || "GDG Community Events"}" <${smtpUser.trim()}>`;
      }

      const isGmail = !smtpHost || smtpHost.includes("gmail") || smtpUser.endsWith("@gmail.com");
      const transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: "gmail",
              auth: {
                user: smtpUser.trim(),
                pass: smtpPass.replace(/\s+/g, ""), // Remove spaces from Google App passwords
              },
            }
          : {
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                user: smtpUser.trim(),
                pass: smtpPass.replace(/\s+/g, ""),
              },
            }
      );

      const info = await transporter.sendMail({
        from: senderAddress,
        to: email,
        subject: `Your RSVP Confirmation: ${eventTitle || "Study Jams 2026–27"}`,
        html: htmlContent,
      });

      console.log(`[EMAIL DISPATCHED] ID: ${info.messageId} to ${email}`);
      return NextResponse.json({ success: true, messageId: info.messageId, provider: "smtp" });
    }

    // 3. Fallback simulation when email keys are not in .env yet
    console.warn(`[EMAIL WARNING] Real email not dispatched: SMTP credentials missing in environment variables. Sent to: ${email}`);

    return NextResponse.json({
      success: true,
      simulated: true,
      message: "Email simulated: Missing SMTP_USER and SMTP_PASS in Vercel Environment Variables.",
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal error";
    console.error("Email send error:", error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

/**
 * Diagnostic GET endpoint to check if email environment variables are loaded in production
 */
export async function GET() {
  const hasSmtpUser = Boolean(process.env.SMTP_USER);
  const hasSmtpPass = Boolean(process.env.SMTP_PASS);
  const hasResend = Boolean(process.env.RESEND_API_KEY);

  const maskedUser = process.env.SMTP_USER
    ? process.env.SMTP_USER.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : null;

  return NextResponse.json({
    email_service_ready: (hasSmtpUser && hasSmtpPass) || hasResend,
    provider: hasResend ? "resend" : hasSmtpUser ? "gmail_smtp" : "none (simulation mode)",
    has_smtp_user: hasSmtpUser,
    has_smtp_pass: hasSmtpPass,
    configured_smtp_account: maskedUser,
    guidance:
      !hasSmtpUser || !hasSmtpPass
        ? "Add SMTP_USER and SMTP_PASS in your Vercel Project Settings > Environment Variables, then redeploy."
        : "Email service is fully configured and ready.",
  });
}
