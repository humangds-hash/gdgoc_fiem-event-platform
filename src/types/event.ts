export type AttendeeRole =
  | "Student"
  | "Working Professional / Developer"
  | "Designer / Product Specialist"
  | "Founder / Entrepreneur"
  | "Other Community Role";

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface SpeakerOrHost {
  id: string;
  name: string;
  role: string;
  organization: string;
  avatarUrl: string;
  bio?: string;
  socials?: SocialLinks;
  isFeatured?: boolean;
}

export interface AgendaItem {
  id: string;
  timeSlot: string; // e.g., "15:00 - 15:25"
  title: string;
  description: string;
  speakerId?: string;
  room?: string;
  tag?: string;
}

export interface EventDetails {
  id: string;
  title: string;
  tagline: string;
  communityName: string;
  communityLogoUrl?: string;
  bannerUrl: string;
  thumbnailUrl: string;
  categoryTags: string[];
  audienceType: "IN_PERSON" | "HYBRID" | "VIRTUAL";
  
  // Date & Time
  startDate: string; // ISO 8601 string for accurate countdown
  endDate: string;
  displayDate: string;
  displayTime: string;
  timezone: string;
  
  // Venue
  venueName: string;
  hallOrRoom: string;
  address: string;
  city: string;
  mapsUrl: string;
  
  // Capacity & Status
  capacity: number;
  registeredCount: number;
  isRegistrationOpen: boolean;
  isActive?: boolean;
  status?: "UPCOMING" | "PAST";
  
  // Content
  aboutMarkdown: string;
  perks: string[];
  agenda: AgendaItem[];
  team: SpeakerOrHost[];
}

export interface AttendeeRegistration {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  role: AttendeeRole;
  organization?: string;
  avatarUrl?: string;
  fastRegistrationOptIn: boolean;
  qrCodeData: string;
  registeredAt: string;
  status: "CONFIRMED" | "CHECKED_IN" | "CANCELLED";
  checkInTimestamp?: string;
}

export interface CurrentUserProfile {
  fullName: string;
  email: string;
  avatarUrl?: string;
  role?: AttendeeRole;
  organization?: string;
}

export type AdminRole = "SUPER_ADMIN" | "ORGANIZER" | "CHECKIN_STAFF";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  password: string;
  avatarUrl?: string;
  organization?: string;
  createdAt: string;
  invitedBy?: string;
}

