import QRCode from "qrcode";
import { AttendeeRegistration } from "@/types/event";
import { EventDetails } from "@/types/event";

/**
 * Generates a high-resolution, pixel-perfect PNG ticket image for an attendee
 * and triggers an automatic browser download to their device.
 */
export async function downloadTicketImage(
  attendee: AttendeeRegistration,
  event: EventDetails
): Promise<void> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context not available");
  }

  // 2x Retina scale for crystal-clear text and scannable QR code
  const scale = 2;
  const width = 640;
  const height = 960;
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Smooth anti-aliased rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Outer Background
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, width, height);

  // 2. Ticket Card Dimensions & Path
  const cardMargin = 24;
  const cardX = cardMargin;
  const cardY = cardMargin;
  const cardW = width - cardMargin * 2;
  const cardH = height - cardMargin * 2;
  const cardRadius = 24;

  // Draw Card Drop Shadow
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#ffffff";
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fill();
  ctx.restore();

  // Draw Card Base & Border
  ctx.fillStyle = "#ffffff";
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Clip inside card for top Google bar and styling
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.clip();

  // Top Google 4-Color Accent Strip
  const stripH = 8;
  const segW = cardW / 4;
  ctx.fillStyle = "#4285F4"; // Blue
  ctx.fillRect(cardX, cardY, segW, stripH);
  ctx.fillStyle = "#EA4335"; // Red
  ctx.fillRect(cardX + segW, cardY, segW, stripH);
  ctx.fillStyle = "#FBBC04"; // Yellow
  ctx.fillRect(cardX + segW * 2, cardY, segW, stripH);
  ctx.fillStyle = "#34A853"; // Green
  ctx.fillRect(cardX + segW * 3, cardY, segW, stripH);

  ctx.restore();

  // 4. Ticket Header
  let currY = cardY + 36;

  // Status Badge: RSVP Confirmed
  const badgeText = "✓ RSVP CONFIRMED · SEAT RESERVED";
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  const badgeW = ctx.measureText(badgeText).width + 24;
  const badgeH = 24;
  const badgeX = cardX + (cardW - badgeW) / 2;

  ctx.fillStyle = "#d7f5e4";
  drawRoundedRect(ctx, badgeX, currY, badgeW, badgeH, 12);
  ctx.fill();
  ctx.strokeStyle = "#b0ecc4";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#0f5132";
  ctx.textAlign = "center";
  ctx.fillText(badgeText, cardX + cardW / 2, currY + 16);

  currY += 44;

  // Event Title (prominently rendered with multi-line wrapping if needed)
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  const title = event.title || "GDG Community Event";
  const maxTitleW = cardW - 48;

  if (ctx.measureText(title).width > maxTitleW) {
    // Split into 2 lines
    const words = title.split(" ");
    let line1 = "";
    let line2 = "";
    for (const w of words) {
      if (!line2 && ctx.measureText(line1 + (line1 ? " " : "") + w).width <= maxTitleW) {
        line1 += (line1 ? " " : "") + w;
      } else {
        line2 += (line2 ? " " : "") + w;
      }
    }
    ctx.fillText(line1, cardX + cardW / 2, currY);
    currY += 24;
    ctx.fillText(line2, cardX + cardW / 2, currY);
  } else {
    ctx.fillText(title, cardX + cardW / 2, currY);
  }

  currY += 22;

  // Subtitle / Community
  ctx.fillStyle = "#64748b";
  ctx.font = "500 13px system-ui, -apple-system, sans-serif";
  ctx.fillText(`${event.communityName} · FIEM Kolkata`, cardX + cardW / 2, currY);

  currY += 28;

  // 5. Attendee Section Box
  const attBoxX = cardX + 24;
  const attBoxW = cardW - 48;
  const attBoxH = 110;
  const attBoxY = currY;

  ctx.fillStyle = "#f8fafc";
  drawRoundedRect(ctx, attBoxX, attBoxY, attBoxW, attBoxH, 16);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Attendee Avatar (Image with graceful fallback to Initials badge)
  const avatarSize = 64;
  const avatarX = attBoxX + 18;
  const avatarY = attBoxY + 23;

  let avatarLoaded = false;
  const avatarSrc = attendee.avatarUrl;

  if (avatarSrc) {
    try {
      const img = await loadImageSafe(avatarSrc);
      if (img) {
        ctx.save();
        drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 14);
        ctx.clip();
        ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Avatar outer border
        drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 14);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        avatarLoaded = true;
      }
    } catch {
      avatarLoaded = false;
    }
  }

  if (!avatarLoaded) {
    // Draw stylish gradient initials badge
    ctx.save();
    const grad = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
    grad.addColorStop(0, "#4285F4");
    grad.addColorStop(1, "#34A853");
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 14);
    ctx.fill();

    const initials = getInitials(attendee.fullName);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, avatarX + avatarSize / 2, avatarY + avatarSize / 2);
    ctx.restore();
  }

  // Attendee Details
  const infoX = avatarX + avatarSize + 16;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Label
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillText("REGISTERED ATTENDEE", infoX, attBoxY + 28);

  // Full Name
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
  const truncatedName = truncateText(ctx, attendee.fullName, attBoxW - (avatarSize + 48));
  ctx.fillText(truncatedName, infoX, attBoxY + 52);

  // Email
  ctx.fillStyle = "#64748b";
  ctx.font = "500 12px 'Courier New', monospace";
  const truncatedEmail = truncateText(ctx, attendee.email, attBoxW - (avatarSize + 48));
  ctx.fillText(truncatedEmail, infoX, attBoxY + 70);

  // Role Pill
  const roleText = (attendee.role || "Attendee Pass").toUpperCase();
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  const roleW = ctx.measureText(roleText).width + 16;
  const roleH = 20;
  const rolePillY = attBoxY + 80;

  ctx.fillStyle = "#cee5ff";
  drawRoundedRect(ctx, infoX, rolePillY, roleW, roleH, 6);
  ctx.fill();
  ctx.strokeStyle = "#b6d8ff";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#1557b0";
  ctx.fillText(roleText, infoX + 8, rolePillY + 14);

  // Organization (if present)
  if (attendee.organization) {
    const orgX = infoX + roleW + 8;
    const orgText = attendee.organization;
    ctx.font = "500 11px system-ui, -apple-system, sans-serif";
    const maxOrgW = attBoxW - (infoX - attBoxX + roleW + 16);
    const truncOrg = truncateText(ctx, orgText, maxOrgW);

    ctx.fillStyle = "#475569";
    ctx.fillText(truncOrg, orgX, rolePillY + 14);
  }

  currY = attBoxY + attBoxH + 24;

  // 6. Tear-line divider with notches
  const notchRadius = 12;
  // Left notch
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.arc(cardX, currY, notchRadius, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Right notch
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.arc(cardX + cardW, currY, notchRadius, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.fill();
  ctx.stroke();

  // Dashed tear line across
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.moveTo(cardX + notchRadius + 6, currY);
  ctx.lineTo(cardX + cardW - notchRadius - 6, currY);
  ctx.stroke();
  ctx.restore();

  currY += 24;

  // 7. Event Specs Grid (Date & Time | Venue & Hall)
  const col1X = cardX + 28;
  const col2X = cardX + cardW / 2 + 10;

  // Left Column: Date & Time
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillText("DATE & TIME", col1X, currY);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
  ctx.fillText(event.displayDate || "Friday, Oct 9, 2026", col1X, currY + 18);

  ctx.fillStyle = "#64748b";
  ctx.font = "500 12px system-ui, -apple-system, sans-serif";
  ctx.fillText(event.displayTime || "3:00 PM – 5:30 PM (IST)", col1X, currY + 34);

  // Right Column: Venue & Hall
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillText("VENUE & HALL", col2X, currY);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
  ctx.fillText(event.hallOrRoom || "SG Hall, FIEM Campus", col2X, currY + 18);

  ctx.fillStyle = "#64748b";
  ctx.font = "500 12px system-ui, -apple-system, sans-serif";
  ctx.fillText(event.venueName || "Kolkata, West Bengal", col2X, currY + 34);

  currY += 56;

  // 8. Scannable QR Code Box
  const qrBoxW = 240;
  const qrBoxH = 260;
  const qrBoxX = cardX + (cardW - qrBoxW) / 2;
  const qrBoxY = currY;

  ctx.fillStyle = "#f8fafc";
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 20);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Generate QR Code via qrcode library
  const qrDataUrl = await QRCode.toDataURL(attendee.qrCodeData, {
    margin: 1,
    width: 360,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });

  const qrImg = await loadImageSafe(qrDataUrl);
  if (qrImg) {
    const qrSize = 170;
    const qrX = qrBoxX + (qrBoxW - qrSize) / 2;
    const qrY = qrBoxY + 16;

    // White backing for QR code
    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 12);
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  // Pass ID below QR
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.textAlign = "center";
  const passIdText = `PASS ID: ${attendee.id.toUpperCase()}`;
  ctx.fillText(passIdText, cardX + cardW / 2, qrBoxY + 220);

  // Entry Check-in Notice
  ctx.fillStyle = "#10b981";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("● OFFICIAL CHECK-IN PASS · KEEP READY AT DESK", cardX + cardW / 2, qrBoxY + 242);

  currY = qrBoxY + qrBoxH + 20;

  // 9. Footer Notice
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 11px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Present this digital pass at the FIEM SG Hall registration desk for instant entry.", cardX + cardW / 2, currY);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "500 10px 'Courier New', monospace";
  ctx.fillText("TinyGD Ecosystem · Google Developer Groups Community", cardX + cardW / 2, currY + 16);

  // 10. Trigger Download
  try {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const safeEvent = (event.title || event.id || "event")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const safeName = attendee.fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `ticket-${safeEvent}-${safeName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Failed to export ticket canvas:", err);
    throw err;
  }
}

/**
 * Helper to draw a rounded rectangle
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Helper to load an image with CORS handling and timeout
 */
function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    let finished = false;

    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve(null);
      }
    }, 2000);

    img.onload = () => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        resolve(img);
      }
    };

    img.onerror = () => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        resolve(null);
      }
    };

    img.src = src;
  });
}

/**
 * Truncate text with ellipsis if it exceeds maxWidth
 */
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let len = text.length;
  while (len > 3 && ctx.measureText(text.substring(0, len) + "...").width > maxWidth) {
    len--;
  }
  return text.substring(0, len) + "...";
}

/**
 * Opens a print-ready window styled for saving as PDF or printing
 */
export async function printTicket(
  attendee: AttendeeRegistration,
  event: EventDetails
): Promise<void> {
  const qrDataUrl = await QRCode.toDataURL(attendee.qrCodeData, {
    margin: 1,
    width: 260,
    errorCorrectionLevel: "H",
  });

  const printWindow = window.open("", "_blank", "width=750,height=900");
  if (!printWindow) {
    alert("Please allow popups to print your pass.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket - ${event.title} - ${attendee.fullName}</title>
      <style>
        @page { size: portrait; margin: 12mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f8fafc;
          color: #0f172a;
          display: flex;
          justify-content: center;
        }
        .ticket-wrapper {
          width: 520px;
          background: #ffffff;
          border-radius: 20px;
          border: 2px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .google-bar {
          height: 6px;
          display: flex;
          width: 100%;
          background: linear-gradient(90deg, #4285F4 25%, #EA4335 25% 50%, #FBBC04 50% 75%, #34A853 75%);
        }
        .header {
          padding: 24px;
          text-align: center;
          border-bottom: 1px solid #f1f5f9;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #d7f5e4;
          color: #0f5132;
          font-size: 11px;
          font-weight: 800;
          border-radius: 9999px;
          border: 1px solid #b0ecc4;
          margin-bottom: 10px;
        }
        .title {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 800;
        }
        .subtitle {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }
        .body {
          padding: 24px;
        }
        .attendee-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 20px;
        }
        .attendee-avatar {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          border: 2px solid #ffffff;
          object-fit: cover;
          background: #e2e8f0;
        }
        .attendee-name {
          font-size: 17px;
          font-weight: 800;
          margin: 0 0 2px 0;
        }
        .attendee-email {
          font-size: 12px;
          font-family: monospace;
          color: #64748b;
          margin: 0 0 6px 0;
        }
        .role-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          color: #1557b0;
          background: #cee5ff;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 16px 0;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px dashed #cbd5e1;
          margin-bottom: 20px;
        }
        .label {
          font-size: 10px;
          font-weight: 700;
          font-family: monospace;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .val-primary {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .val-sub {
          font-size: 12px;
          color: #64748b;
        }
        .qr-section {
          text-align: center;
          padding: 10px 0;
        }
        .qr-img {
          width: 160px;
          height: 160px;
          padding: 10px;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
        }
        .pass-id {
          margin-top: 10px;
          font-size: 12px;
          font-weight: 800;
          font-family: monospace;
          color: #0f172a;
        }
        .notice {
          margin-top: 16px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
        }
        @media print {
          body { background: transparent; padding: 0; }
          .ticket-wrapper { box-shadow: none; border: 1px solid #cbd5e1; }
        }
      </style>
    </head>
    <body>
      <div class="ticket-wrapper">
        <div class="google-bar"></div>
        <div class="header">
          <div class="status-badge">✓ RSVP Confirmed · Seat Reserved</div>
          <h1 class="title">${event.title}</h1>
          <p class="subtitle">${event.communityName} · FIEM Kolkata</p>
        </div>
        <div class="body">
          <div class="attendee-card">
            <img src="${attendee.avatarUrl || `https://api.dicebear.com/7.x/notionists/png?seed=${encodeURIComponent(attendee.fullName)}`}" class="attendee-avatar" alt="Avatar" />
            <div>
              <div class="label">Attendee</div>
              <h2 class="attendee-name">${attendee.fullName}</h2>
              <div class="attendee-email">${attendee.email}</div>
              <span class="role-badge">${(attendee.role || "Attendee Pass").toUpperCase()}</span>
            </div>
          </div>
          <div class="grid">
            <div>
              <div class="label">Date & Time</div>
              <div class="val-primary">${event.displayDate}</div>
              <div class="val-sub">${event.displayTime}</div>
            </div>
            <div>
              <div class="label">Venue & Hall</div>
              <div class="val-primary">${event.hallOrRoom}</div>
              <div class="val-sub">${event.venueName}</div>
            </div>
          </div>
          <div class="qr-section">
            <img src="${qrDataUrl}" class="qr-img" alt="QR Code Pass" />
            <div class="pass-id">PASS ID: ${attendee.id.toUpperCase()}</div>
          </div>
          <div class="notice">
            Present this QR pass and a student/photo ID at SG Hall Check-in Desk for entry.
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Generate 2-letter initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

