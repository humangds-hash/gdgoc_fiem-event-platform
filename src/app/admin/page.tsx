"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Users,
  CheckCircle2,
  Calendar,
  Settings,
  QrCode,
  Search,
  Download,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  Check,
  X,
  Radio,
  ChevronDown,
  Globe,
  Tag,
  Image as ImageIcon,
  Eye,
  EyeOff,
  LogOut,
  KeyRound,
  Copy,
  UserPlus,
  Loader2,
  Fingerprint,
  BadgeCheck,
  Database,
  Cloud,
  HelpCircle,
  Pencil,
  Upload,
} from "lucide-react";
import { useEventStore } from "@/lib/event-store";
import { useAdminStore } from "@/lib/admin-store";
import { AgendaItem, SpeakerOrHost, EventDetails, AdminRole, AdminUser } from "@/types/event";
import { CameraQrScanner } from "@/components/CameraQrScanner";
import { AdminAuthGate } from "@/components/AdminAuthGate";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { LinkedInIcon, XIcon } from "@/components/Icons";

const BANNER_PRESETS = [
  {
    label: "Google Cloud Study Jams",
    url: "https://res.cloudinary.com/startup-grind/image/upload/c_scale,w_2560/c_crop,h_640,w_2560,y_0.0_mul_h_sub_0.0_mul_640/c_crop,h_640,w_2560/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/event_banners/blob_vmPQdAw",
  },
  {
    label: "Google I/O Extended Conference",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000&q=80",
  },
  {
    label: "AI & Gemini Workshop",
    url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=2000&q=80",
  },
  {
    label: "Developer Community Hackathon",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=80",
  },
];

export default function AdminPage() {
  const {
    event,
    events,
    activeEventId,
    setActiveEvent,
    toggleEventActive,
    setEventStatus,
    addEvent,
    updateEvent,
    updateEventById,
    deleteEvent,
    attendees,
    checkInAttendee,
    undoCheckInAttendee,
    resetToDefault,
  } = useEventStore();

  const {
    currentAdmin,
    admins,
    adminPasskey,
    isHydrated: isAdminHydrated,
    logoutAdmin,
    addAdmin,
    deleteAdmin,
    updateAdminPasskey,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<"overview" | "events" | "content" | "team-agenda" | "attendees" | "scanner" | "admins">("overview");

  // Admin management state
  const [copiedPasskey, setCopiedPasskey] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>("ORGANIZER");
  const [newAdminOrg, setNewAdminOrg] = useState("GDG On Campus Kolkata");
  const [newAdminError, setNewAdminError] = useState("");
  const [isEditingPasskey, setIsEditingPasskey] = useState(false);
  const [editingPasskeyValue, setEditingPasskeyValue] = useState("");
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Content form state
  const [title, setTitle] = useState(event.title);
  const [tagline, setTagline] = useState(event.tagline);
  const [aboutMarkdown, setAboutMarkdown] = useState(event.aboutMarkdown);
  const [displayDate, setDisplayDate] = useState(event.displayDate);
  const [displayTime, setDisplayTime] = useState(event.displayTime);
  const [hallOrRoom, setHallOrRoom] = useState(event.hallOrRoom);
  const [venueName, setVenueName] = useState(event.venueName);
  const [address, setAddress] = useState(event.address);
  const [capacity, setCapacity] = useState(event.capacity);
  const [bannerUrl, setBannerUrl] = useState(event.bannerUrl);
  const [categoryTagsInput, setCategoryTagsInput] = useState(event.categoryTags.join(", "));
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(event.isRegistrationOpen);
  const [contentSaved, setContentSaved] = useState(false);

  // Sync form inputs when active event changes
  useEffect(() => {
    setTitle(event.title);
    setTagline(event.tagline);
    setAboutMarkdown(event.aboutMarkdown);
    setDisplayDate(event.displayDate);
    setDisplayTime(event.displayTime);
    setHallOrRoom(event.hallOrRoom);
    setVenueName(event.venueName);
    setAddress(event.address);
    setCapacity(event.capacity);
    setBannerUrl(event.bannerUrl);
    setCategoryTagsInput(event.categoryTags.join(", "));
    setIsRegistrationOpen(event.isRegistrationOpen);
  }, [event]);

  // Create New Event Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newDisplayDate, setNewDisplayDate] = useState("");
  const [newDisplayTime, setNewDisplayTime] = useState("10:00 AM – 4:30 PM (IST)");
  const [newHallOrRoom, setNewHallOrRoom] = useState("Main Stage Auditorium");
  const [newVenueName, setNewVenueName] = useState("Future Institute of Engineering and Management");
  const [newAddress, setNewAddress] = useState("Sonarpur Station Road, Rajpur Sonarpur, Kolkata 700150");
  const [newCapacity, setNewCapacity] = useState(250);
  const [newCategoryTags, setNewCategoryTags] = useState("Google Cloud, AI / Gemini, Workshop");
  const [newBannerUrl, setNewBannerUrl] = useState(BANNER_PRESETS[1].url);
  const [newAboutMarkdown, setNewAboutMarkdown] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [newStatus, setNewStatus] = useState<"UPCOMING" | "PAST">("UPCOMING");

  // Attendees filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // New Speaker states
  const [newSpeakerName, setNewSpeakerName] = useState("");
  const [newSpeakerRole, setNewSpeakerRole] = useState("");
  const [newSpeakerOrg, setNewSpeakerOrg] = useState("");
  const [newSpeakerAvatar, setNewSpeakerAvatar] = useState("");
  const [newSpeakerLinkedin, setNewSpeakerLinkedin] = useState("");
  const [newSpeakerTwitter, setNewSpeakerTwitter] = useState("");
  const [newSpeakerBio, setNewSpeakerBio] = useState("");

  // Edit Speaker Modal state
  const [editingSpeaker, setEditingSpeaker] = useState<SpeakerOrHost | null>(null);
  const [editSpeakerName, setEditSpeakerName] = useState("");
  const [editSpeakerRole, setEditSpeakerRole] = useState("");
  const [editSpeakerOrg, setEditSpeakerOrg] = useState("");
  const [editSpeakerAvatar, setEditSpeakerAvatar] = useState("");
  const [editSpeakerLinkedin, setEditSpeakerLinkedin] = useState("");
  const [editSpeakerTwitter, setEditSpeakerTwitter] = useState("");
  const [editSpeakerBio, setEditSpeakerBio] = useState("");

  const [newAgendaTime, setNewAgendaTime] = useState("");
  const [newAgendaTitle, setNewAgendaTitle] = useState("");
  const [newAgendaRoom, setNewAgendaRoom] = useState("");

  // Statistics
  const eventAttendees = attendees.filter((a) => a.eventId === event.id);
  const checkedInCount = eventAttendees.filter((a) => a.status === "CHECKED_IN").length;
  const studentCount = eventAttendees.filter((a) => a.role === "Student").length;
  const developerCount = eventAttendees.filter((a) => a.role.includes("Developer")).length;

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvent({
      title,
      tagline,
      aboutMarkdown,
      displayDate,
      displayTime,
      hallOrRoom,
      venueName,
      address,
      bannerUrl,
      categoryTags: categoryTagsInput.split(",").map((s) => s.trim()).filter(Boolean),
      capacity: Number(capacity),
      isRegistrationOpen,
    });
    setContentSaved(true);
    setTimeout(() => setContentSaved(false), 2500);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Please enter an event title.");
      return;
    }

    const created = addEvent({
      title: newTitle.trim(),
      tagline: newTagline.trim() || "An engaging hands-on developer session by GDG on Campus.",
      displayDate: newDisplayDate.trim() || "Saturday, Upcoming 2026",
      displayTime: newDisplayTime.trim() || "10:00 AM – 4:30 PM (IST)",
      hallOrRoom: newHallOrRoom.trim() || "SG Hall, FIEM Campus",
      venueName: newVenueName.trim() || "Future Institute of Engineering and Management",
      address: newAddress.trim() || "Sonarpur Station Road, Kolkata",
      capacity: Number(newCapacity) || 250,
      bannerUrl: newBannerUrl,
      thumbnailUrl: newBannerUrl,
      categoryTags: newCategoryTags.split(",").map((s) => s.trim()).filter(Boolean),
      aboutMarkdown:
        newAboutMarkdown.trim() ||
        `Welcome to **${newTitle.trim()}** organized by Google Developer Groups on Campus FIEM.\n\nJoin fellow students, mentors, and developers for inspiring keynotes, interactive codelabs, and community swags.`,
      isActive: newIsActive,
      status: newStatus,
    });

    setIsCreateModalOpen(false);
    // Reset modal form
    setNewTitle("");
    setNewTagline("");
    setNewDisplayDate("");
    setNewAboutMarkdown("");

    // Switch to content tab for the newly created event
    setActiveTab("content");
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Event ID", "Full Name", "Email", "Role", "Organization", "Status", "Registered At"];
    const rows = attendees.map((a) => [
      a.id,
      a.eventId,
      `"${a.fullName}"`,
      a.email,
      `"${a.role}"`,
      `"${a.organization || ""}"`,
      a.status,
      a.registeredAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tinygd-attendees-${event.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle local image file upload for speaker avatar
  const handleSpeakerAvatarUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image file is too large (max 5MB). Please choose a smaller photo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setter(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSpeaker = () => {
    if (!newSpeakerName.trim()) {
      alert("Please enter the speaker or team member's full name.");
      return;
    }
    const defaultAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(newSpeakerName.trim())}`;
    const newMember: SpeakerOrHost = {
      id: `t-${Date.now()}`,
      name: newSpeakerName.trim(),
      role: newSpeakerRole.trim() || "Speaker",
      organization: newSpeakerOrg.trim() || "Community Speaker",
      avatarUrl: newSpeakerAvatar.trim() || defaultAvatar,
      bio: newSpeakerBio.trim() || undefined,
      socials: {
        ...(newSpeakerLinkedin.trim() ? { linkedin: newSpeakerLinkedin.trim() } : {}),
        ...(newSpeakerTwitter.trim() ? { twitter: newSpeakerTwitter.trim() } : {}),
      },
    };
    updateEvent({ team: [...event.team, newMember] });
    setNewSpeakerName("");
    setNewSpeakerRole("");
    setNewSpeakerOrg("");
    setNewSpeakerAvatar("");
    setNewSpeakerLinkedin("");
    setNewSpeakerTwitter("");
    setNewSpeakerBio("");
  };

  const openEditSpeakerModal = (speaker: SpeakerOrHost) => {
    setEditingSpeaker(speaker);
    setEditSpeakerName(speaker.name);
    setEditSpeakerRole(speaker.role);
    setEditSpeakerOrg(speaker.organization || "");
    setEditSpeakerAvatar(speaker.avatarUrl || "");
    setEditSpeakerLinkedin(speaker.socials?.linkedin || "");
    setEditSpeakerTwitter(speaker.socials?.twitter || "");
    setEditSpeakerBio(speaker.bio || "");
  };

  const handleUpdateSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker) return;
    if (!editSpeakerName.trim()) {
      alert("Speaker name cannot be empty.");
      return;
    }

    const updatedTeam = event.team.map((s) => {
      if (s.id !== editingSpeaker.id) return s;
      return {
        ...s,
        name: editSpeakerName.trim(),
        role: editSpeakerRole.trim() || "Speaker",
        organization: editSpeakerOrg.trim() || "Community Member",
        avatarUrl: editSpeakerAvatar.trim() || s.avatarUrl,
        bio: editSpeakerBio.trim() || undefined,
        socials: {
          ...s.socials,
          ...(editSpeakerLinkedin.trim() ? { linkedin: editSpeakerLinkedin.trim() } : { linkedin: undefined }),
          ...(editSpeakerTwitter.trim() ? { twitter: editSpeakerTwitter.trim() } : { twitter: undefined }),
        },
      };
    });

    updateEvent({ team: updatedTeam });
    setEditingSpeaker(null);
  };

  const handleDeleteSpeaker = (id: string) => {
    if (confirm("Are you sure you want to remove this speaker / team member?")) {
      updateEvent({ team: event.team.filter((m) => m.id !== id) });
    }
  };

  const handleAddAgendaItem = () => {
    if (!newAgendaTitle.trim() || !newAgendaTime.trim()) return;
    const newItem: AgendaItem = {
      id: `a-${Date.now()}`,
      timeSlot: newAgendaTime.trim(),
      title: newAgendaTitle.trim(),
      description: "Interactive session by domain experts.",
      room: newAgendaRoom.trim() || event.hallOrRoom,
      tag: "Session",
    };
    updateEvent({ agenda: [...event.agenda, newItem] });
    setNewAgendaTime("");
    setNewAgendaTitle("");
    setNewAgendaRoom("");
  };

  const handleDeleteAgendaItem = (id: string) => {
    updateEvent({ agenda: event.agenda.filter((a) => a.id !== id) });
  };

  const filteredAttendees = attendees.filter((a) => {
    const matchesQuery =
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || a.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewAdminError("");

    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) {
      setNewAdminError("Please fill in all required fields.");
      return;
    }

    const res = addAdmin({
      fullName: newAdminName,
      email: newAdminEmail,
      password: newAdminPassword,
      role: newAdminRole,
      organization: newAdminOrg,
    });

    if (!res.success) {
      setNewAdminError(res.message);
    } else {
      setIsAddAdminModalOpen(false);
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminError("");
    }
  };

  const handleCopyPasskey = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(adminPasskey);
      setCopiedPasskey(true);
      setTimeout(() => setCopiedPasskey(false), 2000);
    }
  };

  const handleSavePasskey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPasskeyValue.trim()) return;
    updateAdminPasskey(editingPasskeyValue.trim());
    setIsEditingPasskey(false);
  };

  if (!isAdminHydrated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3 text-white font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs font-semibold text-slate-400">Loading GDG Admin Portal...</span>
      </div>
    );
  }

  if (!currentAdmin) {
    return <AdminAuthGate />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-[#0f172a]">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">
                  Organizer Dashboard
                </h1>
                <span className="text-[11px] text-blue-600 font-medium">TinyGD Control Hub</span>
              </div>
            </div>
          </div>

          {/* Center / Right: Event Switcher Dropdown, + New Event, Admin Profile, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Event Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 border border-slate-200/80 rounded-xl px-2.5 py-1 text-xs">
              <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-500">Event:</span>
              <select
                value={event.id}
                onChange={(e) => setActiveEvent(e.target.value)}
                className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} {ev.id === activeEventId ? "(Active on Site)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* + Add New Event Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-extrabold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Event</span>
            </button>

            <button
              onClick={() => {
                if (confirm("Reset all event data and attendees back to initial GDG pre-seed?")) {
                  resetToDefault();
                  window.location.reload();
                }
              }}
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium transition-colors"
              title="Reset data"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            {/* Current Admin Profile Badge */}
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100/90 border border-slate-200">
                <img
                  src={
                    currentAdmin.avatarUrl ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(currentAdmin.fullName)}`
                  }
                  alt={currentAdmin.fullName}
                  className="w-6 h-6 rounded-full border border-slate-300 object-cover"
                />
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {currentAdmin.fullName}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 leading-none">
                    {currentAdmin.role === "SUPER_ADMIN"
                      ? "👑 Super Admin"
                      : currentAdmin.role === "CHECKIN_STAFF"
                      ? "📱 Gate Staff"
                      : "🛡️ Organizer"}
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={() => {
                  if (confirm("Sign out of the admin panel?")) {
                    logoutAdmin();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Sign Out / Lock Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 border-t border-slate-100">
          {[
            { id: "overview", label: "Overview", icon: ShieldCheck },
            { id: "events", label: `Manage Events (${events.length})`, icon: Layers },
            { id: "content", label: "Edit Event Details", icon: Settings },
            { id: "team-agenda", label: "Agenda & Speakers", icon: Calendar },
            { id: "attendees", label: `Attendees (${attendees.length})`, icon: Users },
            { id: "scanner", label: "QR Check-in Scanner", icon: QrCode },
            { id: "admins", label: `Admin Team (${admins.length})`, icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Active Event Banner Pill */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={event.thumbnailUrl || event.bannerUrl}
              alt={event.title}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">{event.title}</h2>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-[#D7F5E4] px-2 py-0.5 rounded-full border border-[#B0ECC4]">
                  Active on Public Site
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {event.displayDate} · {event.hallOrRoom} · {event.registeredCount} RSVPs
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Database Cloud Sync Status Pill */}
            {isSupabaseConfigured() ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase Live Sync</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsDbModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-colors cursor-pointer shadow-2xs"
                title="Click to view instructions for connecting Supabase for live deployment"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <Cloud className="w-3.5 h-3.5 text-amber-600" />
                <span>Local Storage Mode · Connect Cloud DB ↗</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("content")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* TAB: ALL EVENTS MANAGER */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">All Community Events</h2>
                <p className="text-xs text-slate-500">
                  Toggle which events are live on the website simultaneously (both upcoming and past events).
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <Check className="w-3 h-3" />
                    {events.filter((e) => e.isActive !== false).length} Active on Public Website
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {events.filter((e) => e.isActive !== false && e.status !== "PAST").length} Upcoming, {events.filter((e) => e.isActive !== false && e.status === "PAST").length} Past
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </button>
            </div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev) => {
                const isEventLive = ev.isActive !== false;
                const isFeaturedOnSite = ev.id === activeEventId;
                const isPast = ev.status === "PAST";
                const regCount = attendees.filter((a) => a.eventId === ev.id).length;
                return (
                  <div
                    key={ev.id}
                    className={`rounded-2xl border-2 bg-white overflow-hidden shadow-sm transition-all ${
                      isEventLive ? "border-slate-300" : "border-slate-200 opacity-80"
                    } ${isFeaturedOnSite ? "ring-2 ring-blue-500/30" : ""}`}
                  >
                    {/* Event Banner */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                      <img src={ev.bannerUrl} alt={ev.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                      {/* Live Active Status Toggle Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {isFeaturedOnSite && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold shadow-xs">
                            ★ Featured
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleEventActive(ev.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm transition-transform active:scale-95 cursor-pointer ${
                            isEventLive
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                          title={isEventLive ? "Click to deactivate/hide from site" : "Click to activate/show on site"}
                        >
                          {isEventLive ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Live on Site</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden (Draft)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Event Type & Category Tags */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                          {ev.categoryTags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] font-bold text-white bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Status Toggle: Upcoming vs Past */}
                        <button
                          type="button"
                          onClick={() => setEventStatus(ev.id, isPast ? "UPCOMING" : "PAST")}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                            isPast
                              ? "bg-amber-400 text-amber-950 font-bold"
                              : "bg-blue-600 text-white"
                          }`}
                          title="Click to toggle between Upcoming and Past archive"
                        >
                          {isPast ? "Past Event" : "Upcoming Event"}
                        </button>
                      </div>
                    </div>

                    {/* Event Details Body */}
                    <div className="p-5 space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-extrabold text-slate-900 leading-snug">{ev.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.tagline}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Date</span>
                          <span className="font-bold text-slate-800">{ev.displayDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Venue</span>
                          <span className="font-bold text-slate-800 truncate block">{ev.hallOrRoom}</span>
                        </div>
                      </div>

                      {/* Registration Stats Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Registrations</span>
                          <span className="font-mono font-bold text-slate-800">
                            {ev.registeredCount} / {ev.capacity} seats
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEvent(ev.id);
                            setActiveTab("content");
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleEventActive(ev.id)}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isEventLive
                              ? "bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isEventLive ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3.5 h-3.5" />
                              <span>Live</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/events/${ev.id}`}
                          target="_blank"
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Open Public Event Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {events.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${ev.title}"?`)) {
                                deleteEvent(ev.id);
                              }
                            }}
                            className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Event Dashed Card */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="h-[360px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white/50 hover:bg-blue-50/20 p-6 flex flex-col items-center justify-center text-center space-y-3 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors shadow-xs">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                    Add New Community Event
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Set up a new workshop, hackathon, or info session with its own RSVP form and QR passes.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Metric Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                  <span>Registered</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {event.registeredCount}
                </div>
                <div className="text-xs text-slate-500">
                  Target Capacity: {event.capacity} seats
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                  <span>Checked In</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {checkedInCount}
                </div>
                <div className="text-xs text-emerald-600 font-medium">
                  {Math.round((checkedInCount / (attendees.length || 1)) * 100)}% on-ground check-in rate
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                  <span>Students</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {studentCount}
                </div>
                <div className="text-xs text-slate-500">
                  FIEM & neighboring campuses
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                  <span>Developers / Pros</span>
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {developerCount}
                </div>
                <div className="text-xs text-slate-500">
                  Industry & freelance builders
                </div>
              </div>
            </div>

            {/* Quick Actions & Event Status Banner */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase font-mono tracking-wider">
                    Current Public Event
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {event.displayDate} · {event.displayTime} · {event.hallOrRoom}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("content")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Event Details</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("events")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                    <span>All Events ({events.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT EVENT CONTENT */}
        {activeTab === "content" && (
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Edit Event Information</h2>
                <p className="text-xs text-slate-500">
                  Editing: <strong className="text-blue-600">{event.title}</strong>. Updates immediately reflect on the public landing page.
                </p>
              </div>
              {contentSaved && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved Changes!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveContent} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tagline / Subheading</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Display Date</label>
                  <input
                    type="text"
                    value={displayDate}
                    onChange={(e) => setDisplayDate(e.target.value)}
                    placeholder="e.g. Friday, Oct 9, 2026"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Display Time</label>
                  <input
                    type="text"
                    value={displayTime}
                    onChange={(e) => setDisplayTime(e.target.value)}
                    placeholder="e.g. 3:00 PM – 5:30 PM (IST)"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hall / Auditorium</label>
                  <input
                    type="text"
                    value={hallOrRoom}
                    onChange={(e) => setHallOrRoom(e.target.value)}
                    placeholder="e.g. SG Hall, FIEM Campus"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Venue Name</label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Venue Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category Tags (comma separated)</label>
                <input
                  type="text"
                  value={categoryTagsInput}
                  onChange={(e) => setCategoryTagsInput(e.target.value)}
                  placeholder="Google Cloud, AI, Tech Talk, Workshop"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Banner Image URL</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Capacity Limit</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isRegistrationOpen}
                      onChange={(e) => setIsRegistrationOpen(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Open for Public RSVPs</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">About Event Overview (Markdown)</label>
                <textarea
                  rows={6}
                  value={aboutMarkdown}
                  onChange={(e) => setAboutMarkdown(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: AGENDA & SPEAKERS */}
        {activeTab === "team-agenda" && (
          <div className="space-y-8">
            {/* Agenda Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Event Agenda & Sessions</h3>
                  <p className="text-xs text-slate-500">Add or reorder timeline blocks for {event.title}.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Time Slot (e.g. 3:00 PM – 3:30 PM)"
                    value={newAgendaTime}
                    onChange={(e) => setNewAgendaTime(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Session Title"
                    value={newAgendaTitle}
                    onChange={(e) => setNewAgendaTitle(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Room / Hall"
                      value={newAgendaRoom}
                      onChange={(e) => setNewAgendaRoom(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddAgendaItem}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 pt-2">
                  {event.agenda.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 font-mono mr-2">{item.timeSlot}</span>
                        <span className="font-semibold text-slate-900">{item.title}</span>
                        <span className="text-slate-400 ml-2">({item.room || event.hallOrRoom})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAgendaItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Speakers / Hosts Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Event Speakers & Team ({event.team.length})</h3>
                  <p className="text-xs text-slate-500">Manage featured organizers, mentors, and session speakers with custom photos and LinkedIn profiles.</p>
                </div>
              </div>

              {/* Add New Speaker Box */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200/90 bg-white shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>+ Add New Speaker / Team Member</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Priya Sen"
                      value={newSpeakerName}
                      onChange={(e) => setNewSpeakerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Role / Designation *</label>
                    <input
                      type="text"
                      placeholder="e.g. Keynote Speaker / AI Lead"
                      value={newSpeakerRole}
                      onChange={(e) => setNewSpeakerRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Organization / College</label>
                    <input
                      type="text"
                      placeholder="e.g. Google Cloud / FIEM"
                      value={newSpeakerOrg}
                      onChange={(e) => setNewSpeakerOrg(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Speaker Photo URL & File Upload */}
                  <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>Speaker Photo / Avatar</span>
                      <span className="text-[10px] text-slate-400 font-normal">Upload photo file or paste image URL</span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-xs">
                        <img
                          src={newSpeakerAvatar || (newSpeakerName ? `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(newSpeakerName)}` : "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,h_250,q_auto:good,w_250/v1/gcs/platform-data-goog/contentbuilder/GDG-Bevy-DefaultProfile_xY7OLAZ.png")}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(newSpeakerName || "speaker")}`;
                          }}
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Paste image URL (https://...) or upload an image file..."
                        value={newSpeakerAvatar}
                        onChange={(e) => setNewSpeakerAvatar(e.target.value)}
                        className="flex-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />

                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSpeakerAvatarUpload(e, setNewSpeakerAvatar)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* LinkedIn Profile */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                      <LinkedInIcon className="w-3 h-3 text-[#0077B5]" />
                      <span>LinkedIn Profile URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={newSpeakerLinkedin}
                      onChange={(e) => setNewSpeakerLinkedin(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0077B5]/20"
                    />
                  </div>

                  {/* Twitter / X Profile */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                      <XIcon className="w-3 h-3 text-slate-800" />
                      <span>Twitter / X Profile URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://x.com/username"
                      value={newSpeakerTwitter}
                      onChange={(e) => setNewSpeakerTwitter(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Add Button */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddSpeaker}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Event Team</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Speakers & Team List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {event.team.map((speaker) => (
                  <div
                    key={speaker.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={speaker.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(speaker.name)}`}
                          alt={speaker.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(speaker.name)}`;
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs font-black text-slate-900 truncate">{speaker.name}</p>
                        <p className="text-[11px] font-bold text-blue-600 truncate">{speaker.role}</p>
                        <p className="text-[10px] text-slate-500 truncate">{speaker.organization || "Team Member"}</p>
                      </div>
                    </div>

                    {/* Social links & Edit/Delete actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {speaker.socials?.linkedin && (
                          <a
                            href={speaker.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0077B5] transition-colors"
                            title="LinkedIn profile"
                          >
                            <LinkedInIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {speaker.socials?.twitter && (
                          <a
                            href={speaker.socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                            title="X (Twitter) profile"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditSpeakerModal(speaker)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Edit speaker & photo"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSpeaker(speaker.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Remove speaker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDEES */}
        {activeTab === "attendees" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Registered Attendees ({attendees.length})</h3>
                <p className="text-xs text-slate-500">Live RSVP records for all events with unique pass IDs.</p>
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Filter Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search attendee by name, email, or pass ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Student">Student</option>
                <option value="Working Professional / Developer">Developer / Professional</option>
                <option value="Designer / Product Specialist">Designer</option>
              </select>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Attendee</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Pass ID</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">
                          No matching attendees found.
                        </td>
                      </tr>
                    ) : (
                      filteredAttendees.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{a.fullName}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{a.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                              {a.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 font-bold">
                            {a.id.toUpperCase()}
                          </td>
                          <td className="px-4 py-3">
                            {a.status === "CHECKED_IN" ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Checked In
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                Confirmed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {new Date(a.registeredAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: QR CHECK-IN SCANNER */}
        {activeTab === "scanner" && (
          <div className="space-y-6">
            <CameraQrScanner
              onScanTicket={(code) => checkInAttendee(code)}
              onUndoCheckIn={(id) => undoCheckInAttendee(id)}
              currentEvent={event}
              allAttendees={attendees}
            />
          </div>
        )}

        {/* TAB 6: ADMIN TEAM & ACCESS CONTROL */}
        {activeTab === "admins" && (
          <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Admin Team & Access Management
                </h2>
                <p className="text-xs text-slate-500">
                  Manage organizers, check-in gate staff, and the community invite passkey for the admin portal.
                </p>
              </div>

              {currentAdmin.role === "SUPER_ADMIN" && (
                <button
                  type="button"
                  onClick={() => setIsAddAdminModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add New Admin</span>
                </button>
              )}
            </div>

            {/* Community Invite Passkey Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white border-2 border-amber-200/90 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-amber-950">
                        Community Admin Passkey
                      </h3>
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        Invite Key
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/80 mt-1 max-w-xl">
                      Share this passkey with new organizers, student co-leads, or gate staff so they can join via the <strong>&quot;Join as Admin&quot;</strong> tab on the portal screen.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  {!isEditingPasskey ? (
                    <>
                      <div className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-mono font-black text-sm tracking-wider shadow-xs select-all">
                        {adminPasskey}
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyPasskey}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                      >
                        {copiedPasskey ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Key</span>
                          </>
                        )}
                      </button>

                      {currentAdmin.role === "SUPER_ADMIN" && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPasskeyValue(adminPasskey);
                            setIsEditingPasskey(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Change</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <form onSubmit={handleSavePasskey} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingPasskeyValue}
                        onChange={(e) => setEditingPasskeyValue(e.target.value.toUpperCase())}
                        className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl border-2 border-amber-400 bg-white text-slate-900 uppercase"
                        placeholder="NEW-PASSKEY"
                        required
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPasskey(false)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Admins
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {admins.length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
                  Super Admins
                </span>
                <div className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">
                  {admins.filter((a) => a.role === "SUPER_ADMIN").length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
                  Organizers
                </span>
                <div className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
                  {admins.filter((a) => a.role === "ORGANIZER").length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                  Gate Staff
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                  {admins.filter((a) => a.role === "CHECKIN_STAFF").length}
                </div>
              </div>
            </div>

            {/* Admin Directory Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Registered Admin Accounts</h3>
                  <span className="text-xs text-slate-500">
                    Accounts authorized to access this dashboard and verify tickets.
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {admins.length} Members
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Admin Member</th>
                      <th className="px-4 py-3">Role & Access</th>
                      <th className="px-4 py-3">Chapter / Organization</th>
                      <th className="px-4 py-3">Joined Date</th>
                      {currentAdmin.role === "SUPER_ADMIN" && (
                        <th className="px-4 py-3 text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admins.map((adm) => {
                      const isSelf = adm.id === currentAdmin.id || adm.email === currentAdmin.email;
                      const isSuper = adm.role === "SUPER_ADMIN";

                      return (
                        <tr key={adm.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  adm.avatarUrl ||
                                  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(adm.fullName)}`
                                }
                                alt={adm.fullName}
                                className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-100 shrink-0"
                              />
                              <div>
                                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <span>{adm.fullName}</span>
                                  {isSelf && (
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm border border-blue-200">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-400 font-mono text-[11px]">{adm.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {adm.role === "SUPER_ADMIN" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
                                <span>👑</span>
                                <span>Super Admin</span>
                              </span>
                            ) : adm.role === "CHECKIN_STAFF" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                <span>📱</span>
                                <span>Gate Staff</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                                <span>🛡️</span>
                                <span>Event Organizer</span>
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-slate-600 font-medium">
                            {adm.organization || "GDG Community Team"}
                          </td>

                          <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                            {new Date(adm.createdAt).toLocaleDateString()}
                          </td>

                          {currentAdmin.role === "SUPER_ADMIN" && (
                            <td className="px-4 py-3.5 text-right">
                              {!isSelf ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Revoke admin access for ${adm.fullName}?`)) {
                                      deleteAdmin(adm.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                  title={`Remove ${adm.fullName}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">
                                  Current Session
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD NEW ADMIN MODAL */}
      {isAddAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="h-1.5 w-full flex shrink-0">
              <div className="flex-1 bg-[#4285F4]" />
              <div className="flex-1 bg-[#EA4335]" />
              <div className="flex-1 bg-[#FBBC04]" />
              <div className="flex-1 bg-[#34A853]" />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAddAdminModalOpen(false);
                setNewAdminError("");
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleAddAdminSubmit} className="p-6 space-y-4">
              <div>
                <span className="text-xs font-extrabold text-blue-600 uppercase font-mono tracking-wider">
                  Team Provisioning
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Add New Organizer or Staff
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Create an admin account directly without requiring the passkey.
                </p>
              </div>

              {newAdminError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {newAdminError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Rahul Sen"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="e.g. rahul@gdgkolkata.org"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Password *</label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Role *</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="ORGANIZER">Event Organizer</option>
                    <option value="CHECKIN_STAFF">Check-in Staff</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Chapter / Organization</label>
                <input
                  type="text"
                  value={newAdminOrg}
                  onChange={(e) => setNewAdminOrg(e.target.value)}
                  placeholder="e.g. GDG On Campus Kolkata"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAdminModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW EVENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Top brand ribbon */}
            <div className="h-[3px] w-full flex shrink-0">
              <div className="flex-1 bg-[#4285F4]" />
              <div className="flex-1 bg-[#EA4335]" />
              <div className="flex-1 bg-[#FBBC04]" />
              <div className="flex-1 bg-[#34A853]" />
            </div>

            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Form */}
            <form onSubmit={handleCreateEvent} className="p-6 overflow-y-auto space-y-4">
              <div>
                <span className="text-xs font-extrabold text-blue-600 uppercase font-mono tracking-wider">
                  Organizer Control
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Create New Community Event
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Add a new workshop, hackathon, or study jam session to TinyGD.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Android 15 DevFest Kolkata 2026"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tagline / Subheading</label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="e.g. Build modern Android & Compose apps with expert Google mentors."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Event Date</label>
                  <input
                    type="text"
                    value={newDisplayDate}
                    onChange={(e) => setNewDisplayDate(e.target.value)}
                    placeholder="e.g. Saturday, Nov 21, 2026"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Time Window</label>
                  <input
                    type="text"
                    value={newDisplayTime}
                    onChange={(e) => setNewDisplayTime(e.target.value)}
                    placeholder="e.g. 10:00 AM – 4:30 PM (IST)"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hall / Room</label>
                  <input
                    type="text"
                    value={newHallOrRoom}
                    onChange={(e) => setNewHallOrRoom(e.target.value)}
                    placeholder="e.g. SG Hall, FIEM Campus"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Venue / College</label>
                  <input
                    type="text"
                    value={newVenueName}
                    onChange={(e) => setNewVenueName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Max Seat Capacity</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Categories (comma separated)</label>
                  <input
                    type="text"
                    value={newCategoryTags}
                    onChange={(e) => setNewCategoryTags(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              {/* Banner Presets Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Choose Event Banner Preset</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BANNER_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setNewBannerUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 text-left p-1 transition-all cursor-pointer ${
                        newBannerUrl === preset.url ? "border-blue-600 ring-2 ring-blue-500/20" : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-12 object-cover rounded-lg" />
                      <span className="text-[10px] font-bold text-slate-700 block truncate mt-1">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">About Event Overview</label>
                <textarea
                  rows={4}
                  value={newAboutMarkdown}
                  onChange={(e) => setNewAboutMarkdown(e.target.value)}
                  placeholder="Describe what attendees will learn, speakers, and event schedule..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              {/* Live on Website & Section Selector */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-slate-800">
                    Live on Website immediately
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Section:</span>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="text-xs font-extrabold px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="UPCOMING">Upcoming Events</option>
                    <option value="PAST">Past Event Archive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create & Publish Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CLOUD DATABASE SETUP MODAL */}
      {isDbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="h-1.5 w-full flex shrink-0">
              <div className="flex-1 bg-[#4285F4]" />
              <div className="flex-1 bg-[#EA4335]" />
              <div className="flex-1 bg-[#FBBC04]" />
              <div className="flex-1 bg-[#34A853]" />
            </div>

            <button
              type="button"
              onClick={() => setIsDbModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Connect Cloud Database for Deployment
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sync admin edits, new events, and RSVPs live across all devices globally.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed">
                Currently running in <strong>Local Storage Mode</strong>. Everything works smoothly in this browser. To sync live with attendees and co-organizers worldwide once deployed, connect a free <strong>Supabase</strong> project.
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Create a Free Supabase Project</span>
                  </div>
                  <p className="text-slate-500 mt-1 pl-7">
                    Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">supabase.com</a> and click &quot;Start your project&quot; (100% free).
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="font-extrabold text-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                      <span>Run SQL Schema</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      supabase/schema.sql
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1 pl-7">
                    Open the <strong>SQL Editor</strong> in your Supabase dashboard, paste the contents of <code className="bg-slate-200 px-1 rounded text-[11px] font-mono">supabase/schema.sql</code>, and click <strong>Run</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Add Keys to .env.local or Vercel</span>
                  </div>
                  <div className="text-slate-600 mt-1.5 pl-7 space-y-1 font-mono text-[11px]">
                    <div className="p-1.5 bg-slate-900 text-slate-200 rounded-lg select-all">
                      NEXT_PUBLIC_SUPABASE_URL=https://your-id.supabase.co
                    </div>
                    <div className="p-1.5 bg-slate-900 text-slate-200 rounded-lg select-all">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDbModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SPEAKER & TEAM MEMBER MODAL */}
      {editingSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border-2 border-slate-200 overflow-hidden">
            {/* Top Color Accent */}
            <div className="h-[3px] w-full flex">
              <div className="flex-1 bg-[#4285F4]" />
              <div className="flex-1 bg-[#EA4335]" />
              <div className="flex-1 bg-[#FBBC04]" />
              <div className="flex-1 bg-[#34A853]" />
            </div>

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Edit Speaker / Team Member
                    </h3>
                    <p className="text-xs text-slate-500">Update photo, designation, and LinkedIn profile</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingSpeaker(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleUpdateSpeaker} className="space-y-4">
                {/* Photo Preview & Upload */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Speaker Photo / Avatar</span>
                    <span className="text-[10px] text-slate-400 font-normal">Upload or paste URL</span>
                  </label>

                  <div className="flex items-center gap-3.5">
                    <div className="relative w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shrink-0 shadow-xs">
                      <img
                        src={editSpeakerAvatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(editSpeakerName || "speaker")}`}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(editSpeakerName || "speaker")}`;
                        }}
                      />
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <input
                        type="text"
                        placeholder="Image URL (https://...)"
                        value={editSpeakerAvatar}
                        onChange={(e) => setEditSpeakerAvatar(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />

                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Upload Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSpeakerAvatarUpload(e, setEditSpeakerAvatar)}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setEditSpeakerAvatar(`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(editSpeakerName || "gdg")}`)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Use Smart Avatar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editSpeakerName}
                      onChange={(e) => setEditSpeakerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Role / Designation *</label>
                    <input
                      type="text"
                      required
                      value={editSpeakerRole}
                      onChange={(e) => setEditSpeakerRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Organization */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Organization / College</label>
                  <input
                    type="text"
                    value={editSpeakerOrg}
                    onChange={(e) => setEditSpeakerOrg(e.target.value)}
                    placeholder="e.g. Google Cloud / Future Institute of Engineering and Management"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* LinkedIn Profile */}
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <LinkedInIcon className="w-3.5 h-3.5 text-[#0077B5]" />
                    <span>LinkedIn Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={editSpeakerLinkedin}
                    onChange={(e) => setEditSpeakerLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0077B5]/20"
                  />
                </div>

                {/* Twitter / X Profile */}
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <XIcon className="w-3.5 h-3.5 text-slate-800" />
                    <span>Twitter / X Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={editSpeakerTwitter}
                    onChange={(e) => setEditSpeakerTwitter(e.target.value)}
                    placeholder="https://x.com/username"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Bio / Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bio / Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={editSpeakerBio}
                    onChange={(e) => setEditSpeakerBio(e.target.value)}
                    placeholder="Brief background or session highlight..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingSpeaker(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
