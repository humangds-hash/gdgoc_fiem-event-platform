"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  CalendarPlus,
  ExternalLink,
  LogOut,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Download,
  Loader2,
  Check,
} from "lucide-react";
import { useEventStore } from "@/lib/event-store";
import { getAttendeeAvatarUrl } from "@/lib/avatar";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { downloadTicketImage } from "@/lib/ticket-generator";
import { EventDetails, AttendeeRegistration } from "@/types/event";

interface MyEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPass: (attendee?: AttendeeRegistration, event?: EventDetails) => void;
}

export function MyEventsModal({ isOpen, onClose, onOpenPass }: MyEventsModalProps) {
  const { currentUser, currentAttendee, attendees, events, event, logoutAttendee } = useEventStore();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const userProfile = currentUser || (currentAttendee ? {
    fullName: currentAttendee.fullName,
    email: currentAttendee.email,
    avatarUrl: currentAttendee.avatarUrl,
    role: currentAttendee.role,
    organization: currentAttendee.organization,
  } : null);

  if (!isOpen || !userProfile) return null;

  const avatarUrl =
    userProfile.avatarUrl ||
    getAttendeeAvatarUrl(userProfile.fullName, userProfile.email);

  const userEmail = userProfile.email.trim().toLowerCase();
  const myRegistrations = attendees.filter(
    (a) => a.email.trim().toLowerCase() === userEmail
  );
  const registrationsToDisplay = myRegistrations.length > 0 ? myRegistrations : (currentAttendee ? [currentAttendee] : []);

  const handleLogout = () => {
    logoutAttendee();
    onClose();
  };

  const handleDownloadTicketForEvent = async (att: any, targetEv: any) => {
    if (downloadingId) return;
    setDownloadingId(att.id);
    try {
      await downloadTicketImage(att, targetEv);
      setDownloadSuccessId(att.id);
      setTimeout(() => setDownloadSuccessId(null), 3500);
    } catch (err) {
      console.error("Failed to download ticket:", err);
      alert("Could not download ticket. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Google 4-color top accent ribbon */}
        <div className="h-[3px] w-full flex shrink-0">
          <div className="flex-1 bg-[#4285F4]" />
          <div className="flex-1 bg-[#EA4335]" />
          <div className="flex-1 bg-[#FBBC04]" />
          <div className="flex-1 bg-[#34A853]" />
        </div>

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100/90 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Attendee Profile Card Header */}
          <div className="flex items-center gap-3.5 sm:gap-4 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200/80">
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt={userProfile.fullName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white shadow-md bg-white object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[#121927] truncate">
                  {userProfile.fullName}
                </h3>
                <span className="shrink-0 text-[10px] font-extrabold text-emerald-700 bg-[#D7F5E4] px-2 py-0.5 rounded-full border border-[#B0ECC4]">
                  Active Attendee
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate">
                {userProfile.email}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {userProfile.role && (
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                    {userProfile.role}
                  </span>
                )}
                {userProfile.organization && (
                  <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[150px]">
                    {userProfile.organization}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Joined Events */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-extrabold text-[#121927] uppercase tracking-wider font-mono">
                  My Joined Events ({registrationsToDisplay.length})
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">TinyGD Passes</span>
            </div>

            {/* Event Pass Cards List */}
            <div className="space-y-4">
              {registrationsToDisplay.map((att) => {
                const targetEv = events.find((e) => e.id === att.eventId) || event;
                const calUrl = getGoogleCalendarUrl(targetEv);
                const isItemDownloading = downloadingId === att.id;
                const isItemSuccess = downloadSuccessId === att.id;

                return (
                  <div
                    key={att.id}
                    className="rounded-2xl border-2 border-slate-200/90 bg-[#FBFBFC] hover:border-blue-300 transition-all p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D7F5E4] text-[#0f5132] text-[11px] font-extrabold border border-[#B0ECC4] mb-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Confirmed · Seat Reserved</span>
                        </span>
                        <h5 className="text-base font-extrabold text-[#121927] leading-snug">
                          {targetEv.title}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {targetEv.communityName} · {targetEv.hallOrRoom}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPass(att, targetEv);
                        }}
                        className="shrink-0 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-blue-600 transition-colors shadow-xs cursor-pointer"
                        title="View Full Pass QR"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Event Metadata Pill Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200/80">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                          Date & Time
                        </span>
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{targetEv.displayDate}</span>
                        </div>
                        <span className="text-slate-500 text-[11px] font-medium block">
                          {targetEv.displayTime}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                          Venue & Check-in
                        </span>
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate">{targetEv.hallOrRoom}</span>
                        </div>
                        <span className="text-slate-500 text-[11px] font-medium block truncate">
                          {targetEv.venueName}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPass(att, targetEv);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View Entry Pass & QR</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadTicketForEvent(att, targetEv)}
                        disabled={isItemDownloading}
                        className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer disabled:opacity-80 ${
                          isItemSuccess
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                        title="Download ticket image directly to your device"
                      >
                        {isItemDownloading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        ) : isItemSuccess ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                        )}
                        <span>{isItemDownloading ? "Saving..." : isItemSuccess ? "Saved!" : "Download Pass"}</span>
                      </button>

                      <a
                        href={calUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                        title="Add event to Google Calendar"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-slate-600" />
                        <span className="hidden sm:inline">Calendar</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Switcher Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Account: {userProfile.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 font-bold hover:underline"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Account / Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
