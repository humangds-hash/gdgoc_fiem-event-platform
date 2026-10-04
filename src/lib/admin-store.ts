"use client";

import { useState, useEffect } from "react";
import { AdminUser, AdminRole } from "@/types/event";
import { isSupabaseConfigured } from "./supabase/client";
import {
  fetchRemoteAdmins,
  upsertRemoteAdmin,
  deleteRemoteAdmin,
  fetchRemoteSetting,
  setRemoteSetting,
  subscribeToRemoteSync,
} from "./supabase/db-sync";

const STORAGE_KEY_ADMINS = "tinygd_admins_v1";
const STORAGE_KEY_CURRENT_ADMIN = "tinygd_current_admin_v1";
const STORAGE_KEY_ADMIN_PASSKEY = "tinygd_admin_passkey_v1";

export const DEFAULT_ADMIN_PASSKEY = "GDG-ADMIN-2026";

const initialAdmins: AdminUser[] = [
  {
    id: "admin-super-01",
    fullName: "GDG Lead Organizer",
    email: "admin@gdg.org",
    role: "SUPER_ADMIN",
    password: "admin123",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=GDGLead&backgroundColor=b6e3f4",
    organization: "Google Developer Groups Kolkata",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "admin-org-02",
    fullName: "Debanjan Event Co-Lead",
    email: "organizer@gdgkolkata.org",
    role: "ORGANIZER",
    password: "gdg2026",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Debanjan&backgroundColor=ffd5dc",
    organization: "GDG Core Team",
    createdAt: "2026-02-15T00:00:00Z",
    invitedBy: "GDG Lead Organizer",
  },
  {
    id: "admin-staff-03",
    fullName: "Siddharth Scanner Staff",
    email: "scanner@gdgkolkata.org",
    role: "CHECKIN_STAFF",
    password: "scanner2026",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Siddharth&backgroundColor=c0aede",
    organization: "Volunteer Check-in Team",
    createdAt: "2026-03-01T00:00:00Z",
    invitedBy: "GDG Lead Organizer",
  },
];

type StoreListener = () => void;
const listeners = new Set<StoreListener>();

function notify() {
  listeners.forEach((listener) => listener());
}

// Memory caches
let cachedAdmins: AdminUser[] = initialAdmins;
let cachedCurrentAdmin: AdminUser | null = null;
let cachedAdminPasskey: string = DEFAULT_ADMIN_PASSKEY;
let isInitialized = false;

function initFromStorage() {
  if (typeof window === "undefined" || isInitialized) return;
  try {
    const storedAdmins = localStorage.getItem(STORAGE_KEY_ADMINS);
    if (storedAdmins) {
      const parsed: AdminUser[] = JSON.parse(storedAdmins);
      // Ensure default super admin always exists
      const merged = [...parsed];
      for (const initAdm of initialAdmins) {
        if (!merged.some((a) => a.email.toLowerCase() === initAdm.email.toLowerCase())) {
          merged.push(initAdm);
        }
      }
      cachedAdmins = merged;
    } else {
      cachedAdmins = initialAdmins;
      localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(cachedAdmins));
    }

    const storedPasskey = localStorage.getItem(STORAGE_KEY_ADMIN_PASSKEY);
    if (storedPasskey) {
      cachedAdminPasskey = storedPasskey;
    } else {
      cachedAdminPasskey = DEFAULT_ADMIN_PASSKEY;
      localStorage.setItem(STORAGE_KEY_ADMIN_PASSKEY, cachedAdminPasskey);
    }

    const storedCurrent = localStorage.getItem(STORAGE_KEY_CURRENT_ADMIN);
    if (storedCurrent) {
      const parsedAdmin: AdminUser = JSON.parse(storedCurrent);
      // Verify admin still exists in active list
      const activeMatch = cachedAdmins.find((a) => a.id === parsedAdmin.id || a.email.toLowerCase() === parsedAdmin.email.toLowerCase());
      if (activeMatch) {
        cachedCurrentAdmin = activeMatch;
      } else {
        cachedCurrentAdmin = null;
        localStorage.removeItem(STORAGE_KEY_CURRENT_ADMIN);
      }
    }
  } catch (err) {
    console.error("Failed to load admin store from localStorage:", err);
  } finally {
    isInitialized = true;
    syncAdminsWithSupabase();
  }
}

let isCloudSyncingAdmins = false;
let isRealtimeListeningAdmins = false;

async function syncAdminsWithSupabase() {
  if (typeof window === "undefined" || !isSupabaseConfigured() || isCloudSyncingAdmins) return;
  isCloudSyncingAdmins = true;

  try {
    // 1. Fetch remote admins
    const remoteAdmins = await fetchRemoteAdmins();
    if (remoteAdmins && remoteAdmins.length > 0) {
      const mergedMap = new Map<string, AdminUser>();
      for (const a of cachedAdmins) mergedMap.set(a.email.toLowerCase(), a);
      for (const a of remoteAdmins) mergedMap.set(a.email.toLowerCase(), a);
      cachedAdmins = Array.from(mergedMap.values());
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(cachedAdmins));
      }
    } else {
      // Seed remote admins if empty
      for (const adm of cachedAdmins) {
        upsertRemoteAdmin(adm);
      }
    }

    // 2. Fetch remote passkey
    const remotePasskey = await fetchRemoteSetting("admin_passkey");
    if (remotePasskey && typeof remotePasskey === "string") {
      cachedAdminPasskey = remotePasskey;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ADMIN_PASSKEY, remotePasskey);
      }
    } else {
      setRemoteSetting("admin_passkey", cachedAdminPasskey);
    }

    notify();

    // 3. Setup realtime
    if (!isRealtimeListeningAdmins) {
      isRealtimeListeningAdmins = true;
      subscribeToRemoteSync({
        onAdminsChange: async () => {
          const fresh = await fetchRemoteAdmins();
          if (fresh && fresh.length > 0) {
            cachedAdmins = fresh;
            if (typeof window !== "undefined") {
              localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(cachedAdmins));
            }
            notify();
          }
        },
        onSettingsChange: async () => {
          const freshKey = await fetchRemoteSetting("admin_passkey");
          if (freshKey && freshKey !== cachedAdminPasskey) {
            cachedAdminPasskey = freshKey;
            notify();
          }
        },
      });
    }
  } catch (err) {
    console.warn("Admin store cloud sync notice:", err);
  } finally {
    isCloudSyncingAdmins = false;
  }
}

function getStoreSnapshot() {
  initFromStorage();
  return {
    admins: cachedAdmins,
    currentAdmin: cachedCurrentAdmin,
    adminPasskey: cachedAdminPasskey,
  };
}

export function useAdminStore() {
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

  return {
    admins: cachedAdmins,
    currentAdmin: cachedCurrentAdmin,
    adminPasskey: cachedAdminPasskey,
    isHydrated: mounted,

    /**
     * Sign in as an admin with email & password
     */
    loginAdmin: (email: string, password: string): { success: boolean; message: string; admin?: AdminUser } => {
      initFromStorage();
      const normEmail = email.trim().toLowerCase();
      const found = cachedAdmins.find((a) => a.email.trim().toLowerCase() === normEmail);

      if (!found) {
        return { success: false, message: "No admin account found with this email. Have you joined as admin?" };
      }

      if (found.password !== password.trim()) {
        return { success: false, message: "Incorrect password. Please verify your credentials." };
      }

      cachedCurrentAdmin = found;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_CURRENT_ADMIN, JSON.stringify(found));
      }
      notify();
      return { success: true, message: `Welcome back, ${found.fullName}!`, admin: found };
    },

    /**
     * Join as Admin using the Community Passkey
     */
    joinAsAdmin: (data: {
      fullName: string;
      email: string;
      password: string;
      role: AdminRole;
      passkey: string;
      organization?: string;
    }): { success: boolean; message: string; admin?: AdminUser } => {
      initFromStorage();

      // Check Passkey
      const enteredKey = data.passkey.trim().toUpperCase();
      const validKey = cachedAdminPasskey.trim().toUpperCase();
      if (enteredKey !== validKey && enteredKey !== DEFAULT_ADMIN_PASSKEY) {
        return {
          success: false,
          message: `Invalid Admin Passkey. Please obtain the official invite passkey from your GDG Lead Organizer.`,
        };
      }

      const normEmail = data.email.trim().toLowerCase();
      if (cachedAdmins.some((a) => a.email.trim().toLowerCase() === normEmail)) {
        return {
          success: false,
          message: "An admin account with this email already exists. Please sign in instead.",
        };
      }

      if (data.password.trim().length < 4) {
        return {
          success: false,
          message: "Password must be at least 4 characters long.",
        };
      }

      const newAdmin: AdminUser = {
        id: `admin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        fullName: data.fullName.trim(),
        email: normEmail,
        password: data.password.trim(),
        role: data.role,
        organization: data.organization?.trim() || "GDG Community Team",
        avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(data.fullName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
        createdAt: new Date().toISOString(),
      };

      cachedAdmins = [newAdmin, ...cachedAdmins];
      cachedCurrentAdmin = newAdmin;

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(cachedAdmins));
        localStorage.setItem(STORAGE_KEY_CURRENT_ADMIN, JSON.stringify(newAdmin));
      }

      notify();
      upsertRemoteAdmin(newAdmin);
      return {
        success: true,
        message: `Admin access granted! Welcome to the team, ${newAdmin.fullName}.`,
        admin: newAdmin,
      };
    },

    /**
     * Sign Out Admin
     */
    logoutAdmin: () => {
      cachedCurrentAdmin = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY_CURRENT_ADMIN);
      }
      notify();
    },

    /**
     * Super Admin adds new admin directly
     */
    addAdmin: (data: {
      fullName: string;
      email: string;
      password: string;
      role: AdminRole;
      organization?: string;
    }): { success: boolean; message: string; admin?: AdminUser } => {
      initFromStorage();
      const normEmail = data.email.trim().toLowerCase();
      if (cachedAdmins.some((a) => a.email.trim().toLowerCase() === normEmail)) {
        return { success: false, message: "Admin email already exists." };
      }

      const newAdmin: AdminUser = {
        id: `admin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        fullName: data.fullName.trim(),
        email: normEmail,
        password: data.password.trim(),
        role: data.role,
        organization: data.organization?.trim() || "GDG Community Team",
        avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(data.fullName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
        createdAt: new Date().toISOString(),
        invitedBy: cachedCurrentAdmin?.fullName || "Lead Organizer",
      };

      cachedAdmins = [newAdmin, ...cachedAdmins];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(cachedAdmins));
      }
      notify();
      upsertRemoteAdmin(newAdmin);
      return { success: true, message: `Admin ${newAdmin.fullName} created successfully.`, admin: newAdmin };
    },

    /**
     * Super Admin removes an admin
     */
    deleteAdmin: (adminId: string): { success: boolean; message: string } => {
      initFromStorage();
      const target = cachedAdmins.find((a) => a.id === adminId);
      if (!target) return { success: false, message: "Admin not found." };

      if (target.role === "SUPER_ADMIN") {
        const superCount = cachedAdmins.filter((a) => a.role === "SUPER_ADMIN").length;
        if (superCount <= 1) {
          return { success: false, message: "Cannot delete the only Super Admin in the system." };
        }
      }

      cachedAdmins = cachedAdmins.filter((a) => a.id !== adminId);
      if (cachedCurrentAdmin?.id === adminId) {
        cachedCurrentAdmin = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY_CURRENT_ADMIN);
        }
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(cachedAdmins));
      }
      notify();
      deleteRemoteAdmin(adminId);
      return { success: true, message: `Removed admin access for ${target.fullName}.` };
    },

    /**
     * Super Admin updates community invite passkey
     */
    updateAdminPasskey: (newKey: string): { success: boolean; message: string } => {
      initFromStorage();
      const trimmed = newKey.trim().toUpperCase();
      if (trimmed.length < 4) {
        return { success: false, message: "Passkey must be at least 4 characters." };
      }
      cachedAdminPasskey = trimmed;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ADMIN_PASSKEY, trimmed);
      }
      notify();
      setRemoteSetting("admin_passkey", trimmed);
      return { success: true, message: `Admin invite passkey updated to: ${trimmed}` };
    },
  };
}
