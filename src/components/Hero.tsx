"use client";

import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Cloud,
  CheckCircle2,
  CalendarPlus,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { EventDetails } from "@/types/event";
import { Countdown } from "@/components/Countdown";
import { useEventStore } from "@/lib/event-store";
import { getGoogleCalendarUrl } from "@/lib/calendar";

interface HeroProps {
  event: EventDetails;
  onOpenRsvp: () => void;
  onOpenMyPass: () => void;
}

export function Hero({ event, onOpenRsvp, onOpenMyPass }: HeroProps) {
  const { isRegisteredForEvent, getRegistrationForEvent, currentUser } = useEventStore();
  const isRegistered = isRegisteredForEvent(event.id);
  const thisEventPass = getRegistrationForEvent(event.id);

  const fillPercentage = Math.min(
    100,
    Math.round((event.registeredCount / event.capacity) * 100)
  );

  const googleCalUrl = getGoogleCalendarUrl(event);

  // Clean social proof avatars from event team data
  const socialAvatars = event.team.slice(0, 4).map((m) => m.avatarUrl);

  return (
    /* Hero section with NO divider line */
    <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-[#CEE5FF]/25 via-white to-white">
      {/* Subtle ambient decorative blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#CEE5FF]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#FFF4CF]/40 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 relative z-10">

        {/* Micro-Stickers with TinyGD ecosystem branding & 2026-2027 year */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#CEE5FF] text-[#12284C] text-xs font-extrabold border-2 border-[#B6D8FF] shadow-xs -rotate-2 hover:rotate-0 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>TinyGD Ecosystem</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF4CF] text-[#512B10] text-xs font-extrabold border-2 border-[#F7E5A3] shadow-xs rotate-1 hover:rotate-0 transition-transform">
            <Ticket className="w-3.5 h-3.5 text-amber-700" />
            <span>100% Free Entry</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D7F5E4] text-[#0f5132] text-xs font-extrabold border-2 border-[#B0ECC4] shadow-xs -rotate-1 hover:rotate-0 transition-transform">
            <Cloud className="w-3.5 h-3.5 text-emerald-700" />
            <span>{event.categoryTags?.[0] || "Community Meetup"}</span>
          </span>
        </div>

        {/* Main Event Headline & Description */}
        <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold text-[#121927] tracking-[-0.035em] leading-[1.12] break-words">
            {event.title}
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto px-2">
            {event.tagline}
          </p>

          {/* Key Event Logistics Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 font-bold shadow-xs">
              <Calendar className="w-4 h-4 text-[#1a73e8] shrink-0" />
              <span>{event.displayDate}</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 font-bold shadow-xs">
              <Clock className="w-4 h-4 text-[#ea4335] shrink-0" />
              <span>{event.displayTime}</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 font-bold shadow-xs">
              <MapPin className="w-4 h-4 text-[#34a853] shrink-0" />
              <span>{event.hallOrRoom}, FIEM Kolkata</span>
            </div>
          </div>
        </div>

        {/* Standard Event Hero Banner (16:9 on mobile, 2:1 on desktop) */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] max-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-slate-100">
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-black/10 to-transparent pointer-events-none" />

          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1a73e8] text-[11px] sm:text-xs font-extrabold tracking-tight shadow-sm">
              {event.title.split(":")[0] || event.title}
            </span>
            <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold border border-white/20">
              Future Institute of Engineering & Management
            </span>
          </div>
        </div>

        {/* Centered High-Conversion Action & Live Countdown Card */}
        <div className="max-w-lg mx-auto bearhacks-card p-5 sm:p-8 space-y-5 sm:space-y-6 text-center border-2 border-slate-200/90">
          {/* Countdown timer */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400 font-mono">
              Countdown to Kickoff
            </span>
            <div className="flex justify-center">
              <Countdown targetDate={event.startDate} />
            </div>
          </div>

          {/* Action CTA Button & Calendar Link */}
          <div className="space-y-3">
            {isRegistered && thisEventPass ? (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={onOpenMyPass}
                  className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-2xl bg-[#D7F5E4] text-[#0f5132] hover:bg-emerald-200 text-sm sm:text-base font-extrabold border-2 border-[#B0ECC4] shadow-sm transition-all active:scale-[0.99] cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>You're Registered for this Event · View Pass</span>
                </button>
                <p className="text-xs text-slate-500 font-medium">
                  Entry Pass reserved for <span className="font-bold text-slate-700">{thisEventPass.fullName}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={onOpenRsvp}
                  disabled={!event.isRegistrationOpen}
                  className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm sm:text-base font-extrabold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <span>Claim Your Free Pass</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                {currentUser && (
                  <p className="text-[11px] text-blue-600 font-medium">
                    1-Click RSVP ready for <span className="font-bold">{currentUser.fullName}</span> ({currentUser.email})
                  </p>
                )}

                {/* Secondary Action: Add to Calendar with hydration suppression */}
                <a
                  href={googleCalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  suppressHydrationWarning
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/80 transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add to Google Calendar</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold pt-1">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Instant QR Pass Issued</span>
                  </span>
                  <span className="font-mono text-slate-500 font-bold">
                    {event.capacity - event.registeredCount} spots left
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Live Capacity Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>{event.registeredCount} students attending</span>
              <span>Capacity: {event.capacity}</span>
            </div>
          </div>

          {/* Attendee Social Proof Pile */}
          {socialAvatars.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {socialAvatars.map((src, i) => (
                  <div
                    key={i}
                    className="inline-block w-7 h-7 rounded-full ring-2 ring-white overflow-hidden relative bg-slate-200"
                  >
                    <Image
                      src={src}
                      alt="Attendee"
                      fill
                      unoptimized
                      sizes="28px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-left text-xs">
                <span className="font-bold text-slate-800">Join 68+ campus developers</span>
                <span className="text-slate-400 block text-[10px]">FIEM CSE, IT, ECE & AIML</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
