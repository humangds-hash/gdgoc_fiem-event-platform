"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SectionNav, EventTab } from "@/components/SectionNav";
import { AboutSection } from "@/components/AboutSection";
import { LearnSection } from "@/components/LearnSection";
import { AgendaSection } from "@/components/AgendaSection";
import { SpeakersSection } from "@/components/SpeakersSection";
import { VenueSection } from "@/components/VenueSection";
import { FAQSection } from "@/components/FAQSection";
import { RsvpModal } from "@/components/RsvpModal";
import { DigitalPassModal } from "@/components/DigitalPassModal";
import { MyEventsModal } from "@/components/MyEventsModal";
import { useEventStore } from "@/lib/event-store";
import { EventDetails, AttendeeRegistration } from "@/types/event";
import {
  Ticket,
  CheckCircle2,
  Cloud,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  Layers,
} from "lucide-react";
import { GdgLogo } from "@/components/Icons";

export default function HomePage() {
  const {
    event,
    events,
    activeEvents,
    upcomingEvents,
    pastEvents,
    setActiveEvent,
    currentUser,
    currentAttendee,
    isEmailRegistered,
    isRegisteredForEvent,
    getRegistrationForEvent,
    loginAttendeeByEmail,
  } = useEventStore();

  const [activeTab, setActiveTab] = useState<EventTab>("overview");
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [myEventsModalOpen, setMyEventsModalOpen] = useState(false);
  const [selectedEventForRsvp, setSelectedEventForRsvp] = useState<EventDetails | undefined>(undefined);
  const [selectedPassData, setSelectedPassData] = useState<{ attendee: AttendeeRegistration; event: EventDetails } | null>(null);
  const [initialGoogleUser, setInitialGoogleUser] = useState<{ fullName: string; email: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("google_auth") === "success") {
        const name = params.get("google_name") || "Google User";
        const email = params.get("google_email") || "";
        const avatar = params.get("google_avatar") || "";

        if (email && isEmailRegistered(email, event.id)) {
          loginAttendeeByEmail(email);
          const att = getRegistrationForEvent(event.id, email);
          if (att) setSelectedPassData({ attendee: att, event });
          setPassModalOpen(true);
        } else {
          setInitialGoogleUser({ fullName: name, email, avatarUrl: avatar });
          setSelectedEventForRsvp(event);
          setRsvpModalOpen(true);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [event, isEmailRegistered, loginAttendeeByEmail, getRegistrationForEvent]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFE] text-[#121927]">
      {/* Top Chapter Navigation - Clean & uncluttered */}
      <Navbar
        onOpenRsvp={() => {
          setSelectedEventForRsvp(event);
          setRsvpModalOpen(true);
        }}
        onOpenMyPass={() => setMyEventsModalOpen(true)}
      />

      {/* Multi-Event Live Switcher Bar */}
      {activeEvents.length > 1 && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-emerald-50/60 border-b border-slate-200/90">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                {activeEvents.length} Active Events on Site:
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              {activeEvents.map((ev) => {
                const isSelected = ev.id === event.id;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setActiveEvent(ev.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>{ev.title}</span>
                    <span className="text-[10px] opacity-80">({ev.displayDate.split(",")[1]?.trim() || ev.displayDate})</span>
                  </button>
                );
              })}

              <Link
                href="/upcoming"
                className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:text-blue-700 hover:underline px-2 shrink-0"
              >
                <span>View All ↗</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Spacious Panoramic Hero with Centered RSVP & BearHacks Countdown */}
      <Hero
        event={event}
        onOpenRsvp={() => {
          setSelectedEventForRsvp(event);
          setRsvpModalOpen(true);
        }}
        onOpenMyPass={() => {
          const att = getRegistrationForEvent(event.id);
          if (att) {
            setSelectedPassData({ attendee: att, event });
            setPassModalOpen(true);
          } else {
            setMyEventsModalOpen(true);
          }
        }}
      />

      {/* Floating Segmented Section Switcher - Clean with NO divider lines */}
      <SectionNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Main Single-Column Spacious Content Area */}
      <main
        id="section-content"
        className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 w-full"
      >
        {activeTab === "overview" && <AboutSection event={event} />}
        {activeTab === "learn" && <LearnSection />}
        {activeTab === "schedule" && <AgendaSection agenda={event.agenda} />}
        {activeTab === "hosts" && <SpeakersSection team={event.team} />}
        {activeTab === "venue" && <VenueSection event={event} />}
        {activeTab === "faq" && <FAQSection />}

        {/* ALL LIVE COMMUNITY EVENTS DIRECTORY ON HOMEPAGE */}
        <div id="all-events" className="mt-16 sm:mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-extrabold text-blue-600 font-mono uppercase tracking-wider">
                Active Community Events
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                More Events by GDG on Campus
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore upcoming workshops and past session archives organized for student developers.
              </p>
            </div>

            <Link
              href="/upcoming"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-extrabold transition-colors shrink-0"
            >
              <span>Explore All Events Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeEvents.map((ev) => {
              const isCurrent = ev.id === event.id;
              const isPast = ev.status === "PAST";

              return (
                <div
                  key={ev.id}
                  className={`rounded-3xl border-2 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isCurrent ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img src={ev.bannerUrl} alt={ev.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3 right-3">
                      {isPast ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-amber-300 text-xs font-extrabold border border-amber-400/30">
                          Past Event
                        </span>
                      ) : isCurrent ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-extrabold shadow-xs">
                          ★ Currently Viewing
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-extrabold shadow-xs">
                          Active · Open
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
                      {ev.categoryTags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/events/${ev.id}`}>
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 hover:text-blue-600 transition-colors leading-snug">
                          {ev.title}
                        </h3>
                      </Link>
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

                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        href={`/events/${ev.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>View Ticket</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEventForRsvp(ev);
                              setRsvpModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
                          >
                            <Ticket className="w-3.5 h-3.5" />
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
        </div>

        {/* Spacious BearHacks Celebration Banner */}
        <div className="mt-16 sm:mt-24 bearhacks-card p-6 sm:p-12 border-2 border-[#B6D8FF] bg-gradient-to-br from-[#CEE5FF]/40 via-white to-[#FFF4CF]/40 text-center space-y-6 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4CF] text-[#512B10] text-xs font-extrabold border border-[#F7E5A3] -rotate-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Free Community Pass</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CEE5FF] text-[#12284C] text-xs font-extrabold border border-[#B6D8FF] rotate-1">
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Limited Seats</span>
            </span>
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#121927] tracking-tight leading-snug">
              Ready to Kickstart Your Cloud Journey?
            </h3>
            <p className="text-xs sm:text-base text-slate-600 font-normal leading-relaxed">
              Reserve your free seat now to receive Google Cloud Skills Boost lab credits, hands-on mentorship, and official GDG goodies at SG Hall.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {isRegisteredForEvent(event.id) ? (
              <button
                type="button"
                onClick={() => {
                  const att = getRegistrationForEvent(event.id);
                  if (att) {
                    setSelectedPassData({ attendee: att, event });
                  }
                  setPassModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl bg-[#D7F5E4] text-[#0f5132] hover:bg-emerald-200 font-extrabold text-sm sm:text-base border-2 border-[#B0ECC4] shadow-sm transition-all active:scale-[0.99] cursor-pointer"
              >
                <Ticket className="w-5 h-5 text-emerald-600" />
                <span>View Your Digital Entry Pass</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedEventForRsvp(event);
                  setRsvpModalOpen(true);
                }}
                disabled={!event.isRegistrationOpen}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-500/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <span>Claim Your Free Pass</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-bold text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant QR Pass</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Email Confirmation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hands-on Mentors</span>
            </span>
          </div>
        </div>
      </main>

      {/* Interactive Custom Google Cloud Auth & RSVP Modal */}
      <RsvpModal
        isOpen={rsvpModalOpen}
        onClose={() => setRsvpModalOpen(false)}
        onRegistrationSuccess={(newAtt, targetEv) => {
          if (newAtt && targetEv) {
            setSelectedPassData({ attendee: newAtt, event: targetEv });
          }
          setPassModalOpen(true);
        }}
        initialGoogleUser={initialGoogleUser}
        targetEvent={selectedEventForRsvp || event}
      />

      {/* Digital Entry Pass Modal */}
      <DigitalPassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        targetEvent={selectedPassData?.event || (selectedEventForRsvp || event)}
        targetAttendee={selectedPassData?.attendee || null}
      />

      {/* User Joined Events & Passes Dashboard */}
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

      {/* Clean, Editorial BearHacks-Inspired Footer */}
      <footer className="border-t-2 border-slate-200/80 bg-white py-10 sm:py-12 mt-auto text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200/90 flex items-center justify-center p-1 shadow-xs">
                <GdgLogo className="w-full h-full" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-slate-900 text-sm">TinyGD</span>
                <span className="text-[11px] text-slate-400">Developer Community Ecosystem</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <button onClick={() => setActiveTab("overview")} className="hover:text-blue-600 transition-colors cursor-pointer">Overview</button>
              <button onClick={() => setActiveTab("learn")} className="hover:text-blue-600 transition-colors cursor-pointer">Curriculum</button>
              <button onClick={() => setActiveTab("schedule")} className="hover:text-blue-600 transition-colors cursor-pointer">Schedule</button>
              <button onClick={() => setActiveTab("hosts")} className="hover:text-blue-600 transition-colors cursor-pointer">Team</button>
              <button onClick={() => setActiveTab("faq")} className="hover:text-blue-600 transition-colors cursor-pointer">FAQ</button>
              <Link
                href="/admin"
                className="text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 font-bold lowercase first-letter:uppercase"
                title="Organizer Admin Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-center sm:text-left text-[11px]">
            <p>
              Google Developer Groups on Campus is an independent student developer community recognized by Google Developers.
            </p>
            <p className="shrink-0 font-mono">
              Designed with care for Kolkata dev students · 2026–27
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
