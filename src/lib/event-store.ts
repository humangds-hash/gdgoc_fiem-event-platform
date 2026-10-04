"use client";

import { useEffect, useState } from "react";
import { EventDetails, AttendeeRegistration, AttendeeRole, CurrentUserProfile } from "@/types/event";
import { initialEventData, initialEventsList } from "@/data/event-data";
import { getAttendeeAvatarUrl } from "@/lib/avatar";
import { isSupabaseConfigured } from "./supabase/client";
import {
  fetchRemoteEvents,
  upsertRemoteEvent,
  deleteRemoteEvent,
  fetchRemoteAttendees,
  upsertRemoteAttendee,
  fetchRemoteSetting,
  setRemoteSetting,
  subscribeToRemoteSync,
} from "./supabase/db-sync";

const STORAGE_KEY_EVENT = "tinygd_event_data_v1";
const STORAGE_KEY_EVENTS_LIST = "tinygd_events_list_v2";
const STORAGE_KEY_ACTIVE_EVENT_ID = "tinygd_active_event_id_v2";
const STORAGE_KEY_ATTENDEES = "tinygd_attendees_v1";
const STORAGE_KEY_CURRENT_USER = "tinygd_current_user_v2";

// Initial seed registrations for realism
const initialAttendees: AttendeeRegistration[] = [
  {
    id: "att-001",
    eventId: "gdg-study-jams-2026",
    fullName: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "Student",
    organization: "Future Institute of Engineering and Management",
    fastRegistrationOptIn: true,
    qrCodeData: "PASS-TINYGD-GDG-STUDY-JAMS-2026-ATT-001-Priya_Sharma",
    registeredAt: "2026-09-18T10:15:00Z",
    status: "CONFIRMED",
  },
  {
    id: "att-002",
    eventId: "gdg-study-jams-2026",
    fullName: "Debanjan Mukherjee",
    email: "debanjan.m@example.com",
    role: "Working Professional / Developer",
    organization: "TCS Kolkata",
    fastRegistrationOptIn: true,
    qrCodeData: "PASS-TINYGD-GDG-STUDY-JAMS-2026-ATT-002-Debanjan_Mukherjee",
    registeredAt: "2026-09-19T14:30:00Z",
    status: "CONFIRMED",
  },
  {
    id: "att-003",
    eventId: "gdg-study-jams-2026",
    fullName: "Siddharth Sen",
    email: "siddharth.sen@example.com",
    role: "Student",
    organization: "Heritage Institute of Technology",
    fastRegistrationOptIn: false,
    qrCodeData: "PASS-TINYGD-GDG-STUDY-JAMS-2026-ATT-003-Siddharth_Sen",
    registeredAt: "2026-09-20T08:45:00Z",
    status: "CHECKED_IN",
    checkInTimestamp: "2026-09-20T09:00:00Z",
  },
  {
    id: "att-004",
    eventId: "gdg-study-jams-2026",
    fullName: "Ananya Roy",
    email: "ananya.roy@example.com",
    role: "Designer / Product Specialist",
    organization: "Freelance",
    fastRegistrationOptIn: true,
    qrCodeData: "PASS-TINYGD-GDG-STUDY-JAMS-2026-ATT-004-Ananya_Roy",
    registeredAt: "2026-09-20T11:20:00Z",
    status: "CONFIRMED",
  },
];

type StoreListener = () => void;
const listeners = new Set<StoreListener>();

function notify() {
  listeners.forEach((listener) => listener());
}

// Memory caches
let cachedEvents: EventDetails[] = initialEventsList;
let cachedActiveEventId: string = initialEventData.id;
let cachedAttendees: AttendeeRegistration[] = initialAttendees;
let cachedCurrentUser: CurrentUserProfile | null = null;
let isInitialized = false;

function initFromStorage() {
  if (typeof window === "undefined" || isInitialized) return;
  try {
    const storedEventsList = localStorage.getItem(STORAGE_KEY_EVENTS_LIST);
    if (storedEventsList) {
      const parsed: EventDetails[] = JSON.parse(storedEventsList);
      cachedEvents = parsed.map((e) => ({
        ...e,
        isActive: e.isActive !== undefined ? e.isActive : true,
        status: e.status || (e.id.includes("past") || e.id.includes("2025") ? "PAST" : "UPCOMING"),
      }));
      // Ensure past event and secondary event exist if not in list
      for (const initEv of initialEventsList) {
        if (!cachedEvents.some((e) => e.id === initEv.id)) {
          cachedEvents.push(initEv);
        }
      }
    } else {
      const storedSingleEvent = localStorage.getItem(STORAGE_KEY_EVENT);
      if (storedSingleEvent) {
        const single = JSON.parse(storedSingleEvent);
        cachedEvents = [
          { ...single, isActive: single.isActive ?? true, status: single.status || "UPCOMING" },
          ...initialEventsList.filter((e) => e.id !== single.id),
        ];
      } else {
        cachedEvents = initialEventsList;
      }
    }

    const storedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_EVENT_ID);
    if (storedActiveId && cachedEvents.some((e) => e.id === storedActiveId)) {
      cachedActiveEventId = storedActiveId;
    } else if (cachedEvents.length > 0) {
      cachedActiveEventId = cachedEvents[0].id;
    }

    const storedAttendees = localStorage.getItem(STORAGE_KEY_ATTENDEES);
    if (storedAttendees) {
      const parsed: AttendeeRegistration[] = JSON.parse(storedAttendees);
      const seen = new Set<string>();
      const deduplicated: AttendeeRegistration[] = [];
      for (const att of parsed) {
        const norm = att.email.trim().toLowerCase();
        const key = `${norm}___${att.eventId || "default"}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(att);
        }
      }
      cachedAttendees = deduplicated;
      localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(cachedAttendees));
    }
    const storedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (storedUser) {
      try {
        cachedCurrentUser = JSON.parse(storedUser);
      } catch {
        cachedCurrentUser = null;
      }
    } else {
      const legacy = localStorage.getItem("tinygd_current_attendee_v1");
      if (legacy) {
        try {
          const l = JSON.parse(legacy);
          cachedCurrentUser = {
            fullName: l.fullName,
            email: l.email,
            avatarUrl: l.avatarUrl,
            role: l.role,
            organization: l.organization,
          };
        } catch {}
      }
    }
  } catch (err) {
    console.error("Error reading event store from localStorage", err);
  }
  isInitialized = true;
  syncWithSupabase();
}

let isCloudSyncing = false;
let isRealtimeListening = false;

async function syncWithSupabase() {
  if (typeof window === "undefined" || !isSupabaseConfigured() || isCloudSyncing) return;
  isCloudSyncing = true;

  try {
    // 1. Fetch remote events
    const remoteEvents = await fetchRemoteEvents();
    if (remoteEvents && remoteEvents.length > 0) {
      cachedEvents = remoteEvents;
      persistEvents();
    } else {
      // Seed remote events if Supabase is completely empty
      for (const ev of cachedEvents) {
        upsertRemoteEvent(ev);
      }
    }

    // 2. Fetch remote active event ID
    const remoteActiveId = await fetchRemoteSetting("active_event_id");
    if (remoteActiveId && cachedEvents.some((e) => e.id === remoteActiveId)) {
      cachedActiveEventId = remoteActiveId;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ACTIVE_EVENT_ID, remoteActiveId);
      }
    }

    // 3. Fetch remote attendees
    const remoteAttendees = await fetchRemoteAttendees();
    if (remoteAttendees && remoteAttendees.length > 0) {
      const mergedMap = new Map<string, AttendeeRegistration>();
      for (const att of cachedAttendees) {
        const key = `${att.email.trim().toLowerCase()}___${att.eventId}`;
        mergedMap.set(key, att);
      }
      for (const att of remoteAttendees) {
        const key = `${att.email.trim().toLowerCase()}___${att.eventId}`;
        mergedMap.set(key, att);
      }
      cachedAttendees = Array.from(mergedMap.values());
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(cachedAttendees));
      }
    }

    notify();

    // 4. Setup Realtime subscription once
    if (!isRealtimeListening) {
      isRealtimeListening = true;
      subscribeToRemoteSync({
        onEventsChange: async () => {
          const freshEvents = await fetchRemoteEvents();
          if (freshEvents && freshEvents.length > 0) {
            cachedEvents = freshEvents;
            persistEvents();
            notify();
          }
        },
        onAttendeesChange: async () => {
          const freshAttendees = await fetchRemoteAttendees();
          if (freshAttendees) {
            cachedAttendees = freshAttendees;
            if (typeof window !== "undefined") {
              localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(cachedAttendees));
            }
            notify();
          }
        },
        onSettingsChange: async () => {
          const freshActiveId = await fetchRemoteSetting("active_event_id");
          if (freshActiveId && freshActiveId !== cachedActiveEventId) {
            cachedActiveEventId = freshActiveId;
            notify();
          }
        },
      });
    }
  } catch (err) {
    console.warn("Event store cloud sync notice:", err);
  } finally {
    isCloudSyncing = false;
  }
}

function persistEvents() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_EVENTS_LIST, JSON.stringify(cachedEvents));
    localStorage.setItem(STORAGE_KEY_ACTIVE_EVENT_ID, cachedActiveEventId);
    const active = cachedEvents.find((e) => e.id === cachedActiveEventId) || cachedEvents[0];
    localStorage.setItem(STORAGE_KEY_EVENT, JSON.stringify(active));
  }
}

export function useEventStore() {
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    initFromStorage();
    setMounted(true);
    const update = () => setTick((t) => t + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const currentEvent =
    cachedEvents.find((e) => e.id === cachedActiveEventId) || cachedEvents[0] || initialEventData;

  const currentAttendee = cachedCurrentUser
    ? cachedAttendees.find(
        (a) =>
          a.email.trim().toLowerCase() === cachedCurrentUser?.email.trim().toLowerCase() &&
          a.eventId === currentEvent.id
      ) ||
      cachedAttendees.find(
        (a) => a.email.trim().toLowerCase() === cachedCurrentUser?.email.trim().toLowerCase()
      ) ||
      null
    : null;

  return {
    isHydrated: mounted,
    event: currentEvent,
    events: cachedEvents,
    activeEvents: cachedEvents.filter((e) => e.isActive !== false),
    upcomingEvents: cachedEvents.filter((e) => e.isActive !== false && e.status !== "PAST"),
    pastEvents: cachedEvents.filter((e) => e.isActive !== false && e.status === "PAST"),
    activeEventId: cachedActiveEventId,
    attendees: cachedAttendees,
    currentUser: cachedCurrentUser,
    currentAttendee,

    // Query helpers
    getEventById: (id: string): EventDetails | undefined => {
      return cachedEvents.find((e) => e.id === id);
    },

    isRegisteredForEvent: (eventId: string, email?: string): boolean => {
      const targetEmail = (email || cachedCurrentUser?.email || "").trim().toLowerCase();
      if (!targetEmail) return false;
      return cachedAttendees.some(
        (a) => a.email.trim().toLowerCase() === targetEmail && a.eventId === eventId
      );
    },

    getRegistrationForEvent: (eventId: string, email?: string): AttendeeRegistration | undefined => {
      const targetEmail = (email || cachedCurrentUser?.email || "").trim().toLowerCase();
      if (!targetEmail) return undefined;
      return cachedAttendees.find(
        (a) => a.email.trim().toLowerCase() === targetEmail && a.eventId === eventId
      );
    },

    getUserRegistrations: (email?: string): AttendeeRegistration[] => {
      const targetEmail = (email || cachedCurrentUser?.email || "").trim().toLowerCase();
      if (!targetEmail) return [];
      return cachedAttendees.filter(
        (a) => a.email.trim().toLowerCase() === targetEmail
      );
    },

    isEmailRegistered: (email: string, eventId?: string): boolean => {
      const normalized = email.trim().toLowerCase();
      const targetEventId = eventId || currentEvent.id;
      return cachedAttendees.some(
        (a) => a.email.trim().toLowerCase() === normalized && a.eventId === targetEventId
      );
    },

    getAttendeeByEmail: (email: string, eventId?: string): AttendeeRegistration | undefined => {
      const normalized = email.trim().toLowerCase();
      const targetEventId = eventId || currentEvent.id;
      return cachedAttendees.find(
        (a) => a.email.trim().toLowerCase() === normalized && a.eventId === targetEventId
      );
    },

    loginAttendeeByEmail: (email: string): AttendeeRegistration | null => {
      const normalized = email.trim().toLowerCase();
      const existing = cachedAttendees.find(
        (a) => a.email.trim().toLowerCase() === normalized
      );
      if (existing) {
        cachedCurrentUser = {
          fullName: existing.fullName,
          email: existing.email,
          avatarUrl: existing.avatarUrl,
          role: existing.role,
          organization: existing.organization,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(cachedCurrentUser));
        }
        notify();
        return existing;
      }
      return null;
    },

    // Multi-Event Management Actions
    toggleEventActive: (id: string) => {
      cachedEvents = cachedEvents.map((e) =>
        e.id === id ? { ...e, isActive: !Boolean(e.isActive ?? true) } : e
      );
      persistEvents();
      notify();
      const updated = cachedEvents.find((e) => e.id === id);
      if (updated) upsertRemoteEvent(updated);
    },

    setEventStatus: (id: string, status: "UPCOMING" | "PAST") => {
      cachedEvents = cachedEvents.map((e) =>
        e.id === id ? { ...e, status } : e
      );
      persistEvents();
      notify();
      const updated = cachedEvents.find((e) => e.id === id);
      if (updated) upsertRemoteEvent(updated);
    },

    setActiveEvent: (id: string) => {
      if (cachedEvents.some((e) => e.id === id)) {
        cachedActiveEventId = id;
        persistEvents();
        notify();
        setRemoteSetting("active_event_id", id);
      }
    },

    addEvent: (newEventData: Partial<EventDetails> & { title: string }): EventDetails => {
      const slug = newEventData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const newId = `event-${slug}-${Date.now().toString(36)}`;

      const newEvent: EventDetails = {
        id: newId,
        title: newEventData.title,
        tagline: newEventData.tagline || "Join us for an exciting GDG developer session and workshop.",
        communityName: newEventData.communityName || currentEvent.communityName,
        communityLogoUrl: newEventData.communityLogoUrl,
        bannerUrl:
          newEventData.bannerUrl ||
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000&q=80",
        thumbnailUrl:
          newEventData.thumbnailUrl ||
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
        categoryTags: newEventData.categoryTags && newEventData.categoryTags.length > 0
          ? newEventData.categoryTags
          : ["Tech Talk", "Community Meetup"],
        audienceType: newEventData.audienceType || "IN_PERSON",
        startDate: newEventData.startDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: newEventData.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 3600 * 1000).toISOString(),
        displayDate: newEventData.displayDate || "Upcoming 2026",
        displayTime: newEventData.displayTime || "3:00 PM – 5:30 PM (IST)",
        timezone: newEventData.timezone || "Asia/Kolkata (IST)",
        venueName: newEventData.venueName || currentEvent.venueName,
        hallOrRoom: newEventData.hallOrRoom || "SG Hall, FIEM Campus",
        address: newEventData.address || currentEvent.address,
        city: newEventData.city || "Kolkata, West Bengal",
        mapsUrl: newEventData.mapsUrl || currentEvent.mapsUrl,
        capacity: newEventData.capacity || 250,
        registeredCount: 0,
        isRegistrationOpen: newEventData.isRegistrationOpen ?? true,
        isActive: newEventData.isActive ?? true,
        status: newEventData.status || "UPCOMING",
        aboutMarkdown:
          newEventData.aboutMarkdown ||
          `Welcome to **${newEventData.title}** hosted by Google Developer Groups on Campus FIEM.\n\nJoin fellow students and developers for hands-on sessions, tech talks, and networking.`,
        perks: newEventData.perks || [
          "Hands-on Mentorship & Workshops",
          "Official GDG Goodies & Stickers",
          "Certificate of Participation",
          "High Tea & Refreshments",
        ],
        agenda: newEventData.agenda || [
          {
            id: `a-${Date.now()}-1`,
            timeSlot: "3:00 PM – 3:30 PM",
            title: "Check-in & Welcome Address",
            description: "Opening keynote and community updates.",
            room: newEventData.hallOrRoom || "Main Hall",
            tag: "Keynote",
          },
          {
            id: `a-${Date.now()}-2`,
            timeSlot: "3:30 PM – 5:00 PM",
            title: "Tech Session & Hands-on Workshop",
            description: "Deep dive into tools, frameworks, and live building.",
            room: newEventData.hallOrRoom || "Main Hall",
            tag: "Workshop",
          },
        ],
        team: newEventData.team || currentEvent.team.slice(0, 4),
      };

      cachedEvents = [newEvent, ...cachedEvents];
      cachedActiveEventId = newEvent.id;
      persistEvents();
      notify();
      upsertRemoteEvent(newEvent);
      setRemoteSetting("active_event_id", newEvent.id);
      return newEvent;
    },

    updateEventById: (id: string, updates: Partial<EventDetails>) => {
      cachedEvents = cachedEvents.map((e) => (e.id === id ? { ...e, ...updates } : e));
      persistEvents();
      notify();
      const updated = cachedEvents.find((e) => e.id === id);
      if (updated) upsertRemoteEvent(updated);
    },

    deleteEvent: (id: string) => {
      if (cachedEvents.length <= 1) {
        alert("Cannot delete the only event. You must have at least one active event.");
        return;
      }
      cachedEvents = cachedEvents.filter((e) => e.id !== id);
      if (cachedActiveEventId === id) {
        cachedActiveEventId = cachedEvents[0].id;
      }
      persistEvents();
      notify();
      deleteRemoteEvent(id);
    },

    updateEventDetails: (details: Partial<EventDetails>) => {
      cachedEvents = cachedEvents.map((e) => (e.id === cachedActiveEventId ? { ...e, ...details } : e));
      persistEvents();
      notify();
      const updated = cachedEvents.find((e) => e.id === cachedActiveEventId);
      if (updated) upsertRemoteEvent(updated);
    },

    updateEvent: (updates: Partial<EventDetails>) => {
      cachedEvents = cachedEvents.map((e) => (e.id === cachedActiveEventId ? { ...e, ...updates } : e));
      persistEvents();
      notify();
      const updated = cachedEvents.find((e) => e.id === cachedActiveEventId);
      if (updated) upsertRemoteEvent(updated);
    },

    registerAttendee: (data: {
      fullName: string;
      email: string;
      role: AttendeeRole;
      organization?: string;
      fastRegistrationOptIn: boolean;
      avatarUrl?: string;
      eventId?: string;
    }): AttendeeRegistration => {
      const normalizedEmail = data.email.trim().toLowerCase();
      const targetEventId = data.eventId || currentEvent.id;
      const targetEvent = cachedEvents.find((e) => e.id === targetEventId) || currentEvent;

      // Enforce strict 1 email = 1 registration rule PER EVENT
      const existing = cachedAttendees.find(
        (a) => a.email.trim().toLowerCase() === normalizedEmail && a.eventId === targetEvent.id
      );

      if (existing) {
        throw new Error(
          `The email "${normalizedEmail}" is already registered for ${targetEvent.title}! Each attendee can only register once per event.`
        );
      }

      const newId = `att-${Date.now().toString(36)}`;
      const qrData = `PASS-TINYGD-${targetEvent.id.toUpperCase()}-${newId.toUpperCase()}-${encodeURIComponent(data.fullName.replace(/\s+/g, "_"))}`;
      const avatar = data.avatarUrl || getAttendeeAvatarUrl(data.fullName, data.email);

      const newAttendee: AttendeeRegistration = {
        id: newId,
        eventId: targetEvent.id,
        fullName: data.fullName,
        email: normalizedEmail,
        role: data.role,
        organization: data.organization || "",
        avatarUrl: avatar,
        fastRegistrationOptIn: data.fastRegistrationOptIn,
        qrCodeData: qrData,
        registeredAt: new Date().toISOString(),
        status: "CONFIRMED",
      };

      cachedAttendees = [newAttendee, ...cachedAttendees];
      cachedCurrentUser = {
        fullName: data.fullName,
        email: normalizedEmail,
        avatarUrl: avatar,
        role: data.role,
        organization: data.organization,
      };

      cachedEvents = cachedEvents.map((e) =>
        e.id === targetEvent.id
          ? { ...e, registeredCount: (e.registeredCount || 0) + 1 }
          : e
      );

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(cachedAttendees));
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(cachedCurrentUser));
      }

      persistEvents();
      notify();
      upsertRemoteAttendee(newAttendee);
      const targetEv = cachedEvents.find((e) => e.id === targetEvent.id);
      if (targetEv) upsertRemoteEvent(targetEv);
      return newAttendee;
    },

    logoutAttendee: () => {
      cachedCurrentUser = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
        localStorage.removeItem("tinygd_current_attendee_v1");
      }
      notify();
    },

    checkInAttendee: (attendeeIdOrQr: string): { success: boolean; attendee?: AttendeeRegistration; message: string } => {
      const raw = (attendeeIdOrQr || "").trim();
      if (!raw) {
        return { success: false, message: "Invalid scan: Empty code received" };
      }

      const query = raw.toLowerCase();

      // Check if it's a JSON string
      let jsonId: string | null = null;
      let jsonEmail: string | null = null;
      if (raw.startsWith("{") && raw.endsWith("}")) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.id) jsonId = String(parsed.id).toLowerCase();
          if (parsed.email) jsonEmail = String(parsed.email).toLowerCase();
        } catch (_) {}
      }

      // Check if it's a URL query param
      let urlPassId: string | null = null;
      if (raw.includes("http://") || raw.includes("https://")) {
        try {
          const url = new URL(raw);
          urlPassId = (url.searchParams.get("pass") || url.searchParams.get("id") || url.searchParams.get("code") || "").toLowerCase() || null;
        } catch (_) {}
      }

      // Extract regex pattern for att-xxx (case insensitive)
      const attIdMatch = query.match(/att-[a-z0-9_-]+/i);
      const extractedAttId = attIdMatch ? attIdMatch[0].toLowerCase() : null;

      // Extract email pattern
      const emailMatch = query.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const extractedEmail = emailMatch ? emailMatch[0].toLowerCase() : null;

      const index = cachedAttendees.findIndex((a) => {
        const aId = a.id.toLowerCase();
        const aEmail = a.email.toLowerCase();
        const aQr = (a.qrCodeData || "").toLowerCase();

        return (
          aId === query ||
          aQr === query ||
          (extractedAttId && aId === extractedAttId) ||
          (jsonId && aId === jsonId) ||
          (urlPassId && aId === urlPassId) ||
          (extractedEmail && aEmail === extractedEmail) ||
          (jsonEmail && aEmail === jsonEmail) ||
          query.includes(aId) ||
          aQr.includes(query) ||
          query.includes(aQr) ||
          aEmail === query
        );
      });

      if (index === -1) {
        return { success: false, message: `Ticket record not found for: "${raw.length > 35 ? raw.slice(0, 32) + '...' : raw}"` };
      }

      const attendee = cachedAttendees[index];
      if (attendee.status === "CHECKED_IN") {
        const timeStr = attendee.checkInTimestamp
          ? new Date(attendee.checkInTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "Earlier";
        return {
          success: true,
          attendee,
          message: `Already checked in at ${timeStr}`,
        };
      }

      const updatedAttendee: AttendeeRegistration = {
        ...attendee,
        status: "CHECKED_IN",
        checkInTimestamp: new Date().toISOString(),
      };

      cachedAttendees[index] = updatedAttendee;

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(cachedAttendees));
      }

      notify();
      upsertRemoteAttendee(updatedAttendee);
      return { success: true, attendee: updatedAttendee, message: "Check-in successful!" };
    },

    undoCheckInAttendee: (attendeeId: string): { success: boolean; message: string } => {
      const index = cachedAttendees.findIndex((a) => a.id.toLowerCase() === attendeeId.trim().toLowerCase());
      if (index === -1) {
        return { success: false, message: "Attendee record not found" };
      }

      const updatedAttendee: AttendeeRegistration = {
        ...cachedAttendees[index],
        status: "CONFIRMED",
        checkInTimestamp: undefined,
      };

      cachedAttendees[index] = updatedAttendee;

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(cachedAttendees));
      }

      notify();
      upsertRemoteAttendee(updatedAttendee);
      return { success: true, message: "Check-in status reverted to Confirmed" };
    },

    resetToDefault: () => {
      cachedEvents = initialEventsList;
      cachedActiveEventId = initialEventData.id;
      cachedAttendees = initialAttendees;
      cachedCurrentUser = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY_EVENT);
        localStorage.removeItem(STORAGE_KEY_EVENTS_LIST);
        localStorage.removeItem(STORAGE_KEY_ACTIVE_EVENT_ID);
        localStorage.removeItem(STORAGE_KEY_ATTENDEES);
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
      notify();
    },
  };
}
