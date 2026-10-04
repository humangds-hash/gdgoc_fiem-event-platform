import { supabase, isSupabaseConfigured } from "./client";
import { EventDetails, AttendeeRegistration, AdminUser } from "@/types/event";

/**
 * Maps database row to EventDetails
 */
export function mapDbRowToEvent(row: any): EventDetails {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline || "",
    communityName: row.community_name || "Google Developer Groups on Campus",
    communityLogoUrl: row.community_logo_url || undefined,
    bannerUrl: row.banner_url,
    thumbnailUrl: row.thumbnail_url,
    categoryTags: Array.isArray(row.category_tags) ? row.category_tags : [],
    audienceType: (row.audience_type as any) || "IN_PERSON",
    startDate: row.start_date,
    endDate: row.end_date,
    displayDate: row.display_date,
    displayTime: row.display_time,
    timezone: row.timezone || "Asia/Kolkata (IST)",
    venueName: row.venue_name,
    hallOrRoom: row.hall_or_room,
    address: row.address,
    city: row.city || "Kolkata, West Bengal",
    mapsUrl: row.maps_url,
    capacity: Number(row.capacity) || 250,
    registeredCount: Number(row.registered_count) || 0,
    isRegistrationOpen: Boolean(row.is_registration_open),
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    status: (row.status as any) || "UPCOMING",
    aboutMarkdown: row.about_markdown || "",
    perks: Array.isArray(row.perks) ? row.perks : [],
    agenda: Array.isArray(row.agenda) ? row.agenda : [],
    team: Array.isArray(row.team) ? row.team : [],
  };
}

/**
 * Maps EventDetails to database row
 */
export function mapEventToDbRow(event: EventDetails): any {
  return {
    id: event.id,
    title: event.title,
    tagline: event.tagline,
    community_name: event.communityName,
    community_logo_url: event.communityLogoUrl || null,
    banner_url: event.bannerUrl,
    thumbnail_url: event.thumbnailUrl,
    category_tags: event.categoryTags,
    audience_type: event.audienceType,
    start_date: event.startDate,
    end_date: event.endDate,
    display_date: event.displayDate,
    display_time: event.displayTime,
    timezone: event.timezone,
    venue_name: event.venueName,
    hall_or_room: event.hallOrRoom,
    address: event.address,
    city: event.city,
    maps_url: event.mapsUrl,
    capacity: event.capacity,
    registered_count: event.registeredCount,
    is_registration_open: event.isRegistrationOpen,
    is_active: event.isActive ?? true,
    status: event.status ?? "UPCOMING",
    about_markdown: event.aboutMarkdown,
    perks: event.perks,
    agenda: event.agenda,
    team: event.team,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Maps database row to AttendeeRegistration
 */
export function mapDbRowToAttendee(row: any): AttendeeRegistration {
  return {
    id: row.id,
    eventId: row.event_id,
    fullName: row.full_name,
    email: row.email,
    role: row.role as any,
    organization: row.organization || undefined,
    avatarUrl: row.avatar_url || undefined,
    fastRegistrationOptIn: Boolean(row.fast_registration_opt_in),
    qrCodeData: row.qr_code_data,
    status: (row.status as any) || "CONFIRMED",
    checkInTimestamp: row.check_in_timestamp || undefined,
    registeredAt: row.registered_at,
  };
}

/**
 * Maps AttendeeRegistration to database row
 */
export function mapAttendeeToDbRow(att: AttendeeRegistration): any {
  return {
    id: att.id,
    event_id: att.eventId,
    full_name: att.fullName,
    email: att.email.trim().toLowerCase(),
    role: att.role,
    organization: att.organization || null,
    avatar_url: att.avatarUrl || null,
    fast_registration_opt_in: att.fastRegistrationOptIn,
    qr_code_data: att.qrCodeData,
    status: att.status,
    check_in_timestamp: att.checkInTimestamp || null,
    registered_at: att.registeredAt,
  };
}

/**
 * Maps database row to AdminUser
 */
export function mapDbRowToAdmin(row: any): AdminUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    password: row.password,
    role: row.role as any,
    organization: row.organization || undefined,
    avatarUrl: row.avatar_url || undefined,
    invitedBy: row.invited_by || undefined,
    createdAt: row.created_at,
  };
}

/**
 * Maps AdminUser to database row
 */
export function mapAdminToDbRow(adm: AdminUser): any {
  return {
    id: adm.id,
    full_name: adm.fullName,
    email: adm.email.trim().toLowerCase(),
    password: adm.password,
    role: adm.role,
    organization: adm.organization || "GDG Community Team",
    avatar_url: adm.avatarUrl || null,
    invited_by: adm.invitedBy || null,
    created_at: adm.createdAt,
  };
}

// ----------------------------------------------------------------------------
// Remote Database Services
// ----------------------------------------------------------------------------

/**
 * Fetches all events from Supabase
 */
export async function fetchRemoteEvents(): Promise<EventDetails[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase.from("events").select("*").order("start_date", { ascending: true });
    if (error) {
      console.warn("Supabase fetch events notice:", error.message);
      return null;
    }
    if (!data || data.length === 0) return null;
    return data.map(mapDbRowToEvent);
  } catch (err) {
    console.warn("Supabase fetch events network issue:", err);
    return null;
  }
}

/**
 * Upserts an event into Supabase
 */
export async function upsertRemoteEvent(event: EventDetails): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const row = mapEventToDbRow(event);
    const { error } = await supabase.from("events").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert event notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase upsert event network issue:", err);
    return false;
  }
}

/**
 * Deletes an event from Supabase
 */
export async function deleteRemoteEvent(eventId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) {
      console.warn("Supabase delete event notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase delete event network issue:", err);
    return false;
  }
}

/**
 * Fetches all attendees from Supabase
 */
export async function fetchRemoteAttendees(): Promise<AttendeeRegistration[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase.from("attendees").select("*");
    if (error) {
      console.warn("Supabase fetch attendees notice:", error.message);
      return null;
    }
    if (!data) return null;
    return data.map(mapDbRowToAttendee);
  } catch (err) {
    console.warn("Supabase fetch attendees network issue:", err);
    return null;
  }
}

/**
 * Upserts an attendee into Supabase
 */
export async function upsertRemoteAttendee(attendee: AttendeeRegistration): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const row = mapAttendeeToDbRow(attendee);
    const { error } = await supabase.from("attendees").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert attendee notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase upsert attendee network issue:", err);
    return false;
  }
}

/**
 * Fetches all admins from Supabase
 */
export async function fetchRemoteAdmins(): Promise<AdminUser[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase.from("admins").select("*");
    if (error) {
      console.warn("Supabase fetch admins notice:", error.message);
      return null;
    }
    if (!data || data.length === 0) return null;
    return data.map(mapDbRowToAdmin);
  } catch (err) {
    console.warn("Supabase fetch admins network issue:", err);
    return null;
  }
}

/**
 * Upserts an admin into Supabase
 */
export async function upsertRemoteAdmin(admin: AdminUser): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const row = mapAdminToDbRow(admin);
    const { error } = await supabase.from("admins").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert admin notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase upsert admin network issue:", err);
    return false;
  }
}

/**
 * Deletes an admin from Supabase
 */
export async function deleteRemoteAdmin(adminId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from("admins").delete().eq("id", adminId);
    if (error) {
      console.warn("Supabase delete admin notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase delete admin network issue:", err);
    return false;
  }
}

/**
 * Fetches a global setting from Supabase
 */
export async function fetchRemoteSetting(key: string): Promise<any | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase.from("app_settings").select("value").eq("key", key).single();
    if (error || !data) return null;
    return data.value;
  } catch {
    return null;
  }
}

/**
 * Sets a global setting in Supabase
 */
export async function setRemoteSetting(key: string, value: any): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from("app_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Subscribes to Supabase Realtime changes on all tables
 */
export function subscribeToRemoteSync(callbacks: {
  onEventsChange?: () => void;
  onAttendeesChange?: () => void;
  onAdminsChange?: () => void;
  onSettingsChange?: () => void;
}) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  try {
    const channel = supabase
      .channel("tinygd-realtime-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
        callbacks.onEventsChange?.();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "attendees" }, () => {
        callbacks.onAttendeesChange?.();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "admins" }, () => {
        callbacks.onAdminsChange?.();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => {
        callbacks.onSettingsChange?.();
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Supabase Realtime subscription error:", err);
    return () => {};
  }
}
