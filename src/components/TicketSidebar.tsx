"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Ticket,
  CalendarPlus,
  Download,
  Share2,
  Check,
  Building,
} from "lucide-react";
import { EventDetails } from "@/types/event";
import { useEventStore } from "@/lib/event-store";
import { getGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";

interface TicketSidebarProps {
  event: EventDetails;
  onOpenRsvp: () => void;
  onOpenMyPass: () => void;
}

export function TicketSidebar({ event, onOpenRsvp, onOpenMyPass }: TicketSidebarProps) {
  const { isRegisteredForEvent } = useEventStore();
  const isRegistered = isRegisteredForEvent(event.id);
  const [copied, setCopied] = useState(false);
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);

  const fillPercentage = Math.min(
    100,
    Math.round((event.registeredCount / event.capacity) * 100)
  );

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className="w-full lg:w-[350px] xl:w-[370px] shrink-0 space-y-4">
      <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-5">
        
        {/* Ticket Header & Free Admission */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase font-mono">
              Registration Open
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            Free Admission
          </span>
        </div>

        {/* Pricing & Seat Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Free Pass
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              {event.registeredCount} / {event.capacity} seats
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 text-right font-medium">
              {event.capacity - event.registeredCount} seats remaining
            </div>
          </div>
        </div>

        {/* Primary RSVP Action */}
        <div>
          {isRegistered ? (
            <button
              onClick={onOpenMyPass}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Registered · View Pass</span>
            </button>
          ) : (
            <button
              onClick={onOpenRsvp}
              disabled={!event.isRegistrationOpen}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-bold shadow-md shadow-blue-600/15 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>RSVP for Event</span>
            </button>
          )}
        </div>

        {/* Quick Date, Time & Venue in Card */}
        <div className="space-y-2.5 pt-2 text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-900">{event.displayDate}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{event.displayTime}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <span className="truncate">{event.hallOrRoom}, FIEM</span>
          </div>
        </div>

        {/* Calendar & Share Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          {/* Calendar Dropdown */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setCalendarMenuOpen(!calendarMenuOpen)}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
              Calendar
            </button>

            {calendarMenuOpen && (
              <div className="absolute left-0 bottom-full mb-1 w-full bg-white rounded-lg border border-slate-200 shadow-lg p-1 space-y-0.5 z-30">
                <a
                  href={getGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  suppressHydrationWarning
                  onClick={() => setCalendarMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Google Calendar
                </a>
                <button
                  type="button"
                  onClick={() => {
                    downloadIcsFile(event);
                    setCalendarMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Apple / Outlook (.ics)
                </button>
              </div>
            )}
          </div>

          {/* Share button */}
          <button
            type="button"
            onClick={handleCopyShare}
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            title="Copy link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Hosted By badge */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5 text-xs text-slate-500">
          <Building className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate">GDG on Campus FIEM</span>
        </div>

      </div>
    </aside>
  );
}
