"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { RsvpModal } from "@/components/RsvpModal";
import { DigitalPassModal } from "@/components/DigitalPassModal";
import { MyEventsModal } from "@/components/MyEventsModal";
import { useEventStore } from "@/lib/event-store";
import { EventDetails, AttendeeRegistration } from "@/types/event";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Users,
  Sparkles,
  Layers,
  ArrowLeft,
} from "lucide-react";

function UpcomingEventsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "past" ? "past" : "upcoming";

  const { events, upcomingEvents, pastEvents, activeEvents, isRegisteredForEvent, getRegistrationForEvent } = useEventStore();
  const [selectedTab, setSelectedTab] = useState<"all" | "upcoming" | "past">(initialTab);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [myEventsModalOpen, setMyEventsModalOpen] = useState(false);
  const [selectedEventForRsvp, setSelectedEventForRsvp] = useState<EventDetails | undefined>(undefined);
  const [selectedPassData, setSelectedPassData] = useState<{ attendee: AttendeeRegistration; event: EventDetails } | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "past") setSelectedTab("past");
    else if (tabParam === "upcoming") setSelectedTab("upcoming");
    else if (tabParam === "all") setSelectedTab("all");
  }, [searchParams]);

  const displayedEvents =
    selectedTab === "upcoming"
      ? upcomingEvents
      : selectedTab === "past"
      ? pastEvents
      : activeEvents;

  const handleOpenRsvpForEvent = (ev: EventDetails) => {
    setSelectedEventForRsvp(ev);
    setRsvpModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFE] text-[#121927]">
      {/* Top Navbar */}
      <Navbar
        onOpenRsvp={() => {
          if (upcomingEvents.length > 0) {
            handleOpenRsvpForEvent(upcomingEvents[0]);
          } else if (events.length > 0) {
            handleOpenRsvpForEvent(events[0]);
          }
        }}
        onOpenMyPass={() => setMyEventsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8 sm:space-y-10">
        {/* Header Breadcrumb & Chapter Title */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-extrabold text-blue-600 font-mono uppercase tracking-wider">
              Community Events Directory
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#121927] tracking-tight leading-tight">
                All Community Events
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
                Explore hands-on Google Cloud workshops, Gemini agentic codelabs, and student developer conferences organized by GDG on Campus FIEM.
              </p>
            </div>

            {/* Quick Filter Switcher Pills */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/90 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setSelectedTab("upcoming")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  selectedTab === "upcoming"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upcoming ({upcomingEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab("past")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  selectedTab === "past"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Past Events ({pastEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab("all")}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  selectedTab === "all"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({activeEvents.length})
              </button>
            </div>
          </div>
        </div>

        {/* Event Cards Grid */}
        {displayedEvents.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              No {selectedTab === "past" ? "past" : "upcoming"} events found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Check back soon or browse other community sessions.
            </p>
            <button
              onClick={() => setSelectedTab("all")}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View all events ({activeEvents.length})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {displayedEvents.map((ev) => {
              const isPast = ev.status === "PAST";
              const fillPct = Math.min(
                100,
                Math.round((ev.registeredCount / ev.capacity) * 100)
              );

              return (
                <div
                  key={ev.id}
                  className="rounded-3xl border-2 border-slate-200/90 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col group"
                >
                  {/* Event Banner Image with Badges */}
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={ev.bannerUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

                    {/* Top Status Pill */}
                    <div className="absolute top-4 right-4">
                      {isPast ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-extrabold border border-amber-400/30">
                          Past Event
                        </span>
                      ) : ev.isRegistrationOpen ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>RSVP Open</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-extrabold shadow-sm">
                          Full / Closed
                        </span>
                      )}
                    </div>

                    {/* Category Tags */}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5">
                      {ev.categoryTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] sm:text-xs font-extrabold text-white bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-lg border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                      <Link href={`/events/${ev.id}`}>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#121927] hover:text-blue-600 transition-colors leading-snug">
                          {ev.title}
                        </h2>
                      </Link>
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {ev.tagline}
                      </p>
                    </div>

                    {/* Logistics Row */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                          Date & Time
                        </span>
                        <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{ev.displayDate}</span>
                        </div>
                        <span className="text-slate-500 text-[11px] block truncate">
                          {ev.displayTime}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                          Venue
                        </span>
                        <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate">{ev.hallOrRoom}</span>
                        </div>
                        <span className="text-slate-500 text-[11px] block truncate">
                          FIEM Campus, Kolkata
                        </span>
                      </div>
                    </div>

                    {/* Seats Progress Bar */}
                    {!isPast && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Reserved Seats</span>
                          <span className="font-mono font-extrabold text-slate-800">
                            {ev.registeredCount} / {ev.capacity}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        href={`/events/${ev.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold transition-all active:scale-[0.98]"
                      >
                        <span>View Details & Agenda</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      {!isPast && ev.isRegistrationOpen && (
                        isRegisteredForEvent(ev.id) ? (
                          <button
                            type="button"
                            onClick={() => {
                              const att = getRegistrationForEvent(ev.id);
                              if (att) {
                                setSelectedPassData({ attendee: att, event: ev });
                                setPassModalOpen(true);
                              } else {
                                setMyEventsModalOpen(true);
                              }
                            }}
                            className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>View Ticket</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenRsvpForEvent(ev)}
                            className="inline-flex items-center justify-center gap-1.5 py-3 px-5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <Ticket className="w-4 h-4" />
                            <span>RSVP</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* RSVP Modal */}
      <RsvpModal
        isOpen={rsvpModalOpen}
        onClose={() => setRsvpModalOpen(false)}
        onRegistrationSuccess={(newAtt, targetEv) => {
          if (newAtt && targetEv) {
            setSelectedPassData({ attendee: newAtt, event: targetEv });
          }
          setPassModalOpen(true);
        }}
        targetEvent={selectedEventForRsvp}
      />

      {/* Digital Pass Modal */}
      <DigitalPassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        targetEvent={selectedPassData?.event || selectedEventForRsvp}
        targetAttendee={selectedPassData?.attendee || (selectedEventForRsvp ? getRegistrationForEvent(selectedEventForRsvp.id) : null)}
      />

      {/* My Joined Events Modal */}
      <MyEventsModal
        isOpen={myEventsModalOpen}
        onClose={() => setMyEventsModalOpen(false)}
        onOpenPass={(att, ev) => {
          if (att && ev) {
            setSelectedPassData({ attendee: att, event: ev });
          }
          setPassModalOpen(true);
        }}
      />
    </div>
  );
}

export default function UpcomingEventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFE]">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <UpcomingEventsContent />
    </Suspense>
  );
}
