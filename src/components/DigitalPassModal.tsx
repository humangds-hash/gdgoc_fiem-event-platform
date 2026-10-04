"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, CheckCircle2, CalendarPlus, ExternalLink, Download, Printer, Loader2, Check } from "lucide-react";
import { useEventStore } from "@/lib/event-store";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { downloadTicketImage, printTicket } from "@/lib/ticket-generator";
import { EventDetails, AttendeeRegistration } from "@/types/event";

interface DigitalPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEvent?: EventDetails | null;
  targetAttendee?: AttendeeRegistration | null;
}

export function DigitalPassModal({
  isOpen,
  onClose,
  targetEvent,
  targetAttendee,
}: DigitalPassModalProps) {
  const { currentAttendee, event, getRegistrationForEvent, getEventById } = useEventStore();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Precision resolution: targetAttendee > targetEvent registration > currentAttendee
  const attendeeToDisplay =
    targetAttendee ||
    (targetEvent ? getRegistrationForEvent(targetEvent.id) : null) ||
    currentAttendee;

  const eventToDisplay =
    targetEvent ||
    (attendeeToDisplay ? getEventById(attendeeToDisplay.eventId) : null) ||
    event;

  if (!isOpen || !attendeeToDisplay || !eventToDisplay) return null;

  const googleCalUrl = getGoogleCalendarUrl(eventToDisplay);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadTicketImage(attendeeToDisplay, eventToDisplay);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to download ticket:", err);
      alert("Could not generate ticket image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    try {
      await printTicket(attendeeToDisplay, eventToDisplay);
    } catch (err) {
      console.error("Failed to print ticket:", err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Google 4-color top accent line */}
        <div className="h-[3px] w-full flex shrink-0">
          <div className="flex-1 bg-[#4285F4]" />
          <div className="flex-1 bg-[#EA4335]" />
          <div className="flex-1 bg-[#FBBC04]" />
          <div className="flex-1 bg-[#34A853]" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100/90 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Digital Ticket Scrollable Container */}
        <div ref={ticketRef} className="p-5 sm:p-7 space-y-5 overflow-y-auto">
          {/* Ticket Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7F5E4] text-[#0f5132] text-xs font-extrabold border-2 border-[#B0ECC4] mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>RSVP Confirmed · Seat Reserved</span>
            </div>

            {/* Event Name prominently displayed on the ticket pass */}
            <div className="pt-1 px-2">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest font-mono block">
                {eventToDisplay.categoryTags?.[0] || "Community Event"} Pass
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[#121927] tracking-tight leading-snug">
                {eventToDisplay.title}
              </h3>
            </div>

            <p className="text-xs text-slate-500 truncate max-w-xs mx-auto">
              {eventToDisplay.communityName} · FIEM Kolkata
            </p>
          </div>

          {/* Ticket Card Body */}
          <div className="relative rounded-2xl border-2 border-slate-200/90 bg-[#FBFBFC] p-5 space-y-4">
            {/* Notch decoration */}
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-r-2 border-slate-200" />
            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-l-2 border-slate-200" />

            {/* Attendee Info with Premium Avatar */}
            <div className="flex items-start gap-3.5">
              <img
                src={
                  attendeeToDisplay.avatarUrl ||
                  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(attendeeToDisplay.fullName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
                }
                alt={attendeeToDisplay.fullName}
                className="w-12 h-12 rounded-xl border-2 border-slate-200/90 shadow-xs bg-white object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Attendee
                </span>
                <h4 className="text-base font-extrabold text-[#121927] leading-tight truncate">
                  {attendeeToDisplay.fullName}
                </h4>
                <p className="text-xs font-mono text-slate-500 truncate">
                  {attendeeToDisplay.email}
                </p>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-extrabold text-[#1557b0] bg-[#CEE5FF] px-2.5 py-0.5 rounded-full border border-[#B6D8FF]">
                    {attendeeToDisplay.role}
                  </span>
                  {attendeeToDisplay.organization && (
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60 truncate max-w-[160px]">
                      {attendeeToDisplay.organization}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Event Quick Specs */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">
                  Date & Time
                </span>
                <span className="font-bold text-slate-800 block">{eventToDisplay.displayDate}</span>
                <span className="text-slate-500 text-[11px] font-medium">{eventToDisplay.displayTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">
                  Venue & Hall
                </span>
                <span className="font-bold text-slate-800 block">{eventToDisplay.hallOrRoom}</span>
                <span className="text-slate-500 text-[11px] truncate block font-medium">{eventToDisplay.venueName}</span>
              </div>
            </div>

            {/* Scannable QR Code */}
            <div className="pt-3 border-t border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-200/90 shadow-xs">
                <QRCodeSVG
                  value={attendeeToDisplay.qrCodeData}
                  size={130}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <span className="font-mono text-[10px] text-slate-400 font-bold tracking-wider">
                PASS ID: {attendeeToDisplay.id.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Action Buttons: Download, Print, Add to Calendar */}
          <div className="space-y-2.5 pt-1">
            {/* Primary Action: Download Ticket for Offline Check-in */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`w-full inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-80 ${
                downloadSuccess
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  : "bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-blue-500/25"
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating High-Res Pass...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Ticket Saved to Device!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Ticket (Save Pass Image)</span>
                </>
              )}
            </button>

            {/* Secondary Row: Print/PDF + Add to Google Calendar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-colors border border-slate-200/80 cursor-pointer"
                title="Print ticket or save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print / Save PDF</span>
              </button>

              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-colors border border-slate-200/80"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-slate-600" />
                <span>Add to Calendar</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

            <p className="text-center text-[11px] text-slate-400 leading-tight">
              Save to device for offline access. Show the QR pass at the SG Hall registration desk for instant entry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
