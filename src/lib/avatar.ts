/**
 * Standard Premium Avatar Generator
 * Generates deterministic, high-quality developer avatars based on attendee name or email.
 * Uses DiceBear Notionists / Lorelei developer styles with inline fallback.
 */

export function getAttendeeAvatarUrl(name: string, email?: string, existingAvatar?: string): string {
  if (existingAvatar && existingAvatar.trim()) {
    return existingAvatar;
  }

  const seed = encodeURIComponent((name || email || "developer").trim().toLowerCase());
  
  // High-res modern Notionist / Lorelei style avatars with soft pastel backgrounds
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

/**
 * Returns initials from a full name (e.g. "Priya Sharma" -> "PS")
 */
export function getInitials(name: string): string {
  if (!name) return "GD";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns a consistent pastel color set based on name
 */
export function getAvatarColorSet(name: string) {
  const palettes = [
    { bg: "#CEE5FF", text: "#1557B0", border: "#B6D8FF" }, // Blue
    { bg: "#D7F5E4", text: "#0F5132", border: "#B0ECC4" }, // Mint
    { bg: "#FFF4CF", text: "#8A6D00", border: "#F7E5A3" }, // Yellow
    { bg: "#FFE5DE", text: "#A52A1A", border: "#FDCBC0" }, // Peach
    { bg: "#E8DEF8", text: "#4A2574", border: "#D0BCFF" }, // Purple
  ];
  
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}
