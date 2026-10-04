"use client";

import { use, useState, useEffect } from "react";
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
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Ticket,
  Cloud,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const { getEventById, events, isEmailRegistered, isRegisteredForEvent, getRegistrationForEvent, loginAttendeeByEmail } = useEventStore();
  const event = getEventById(eventId) || events.find((e) => e.id === eventId);

  const [activeTab, setActiveTab] = useState<EventTab>("overview");
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [myEventsModalOpen, setMyEventsModalOpen] = useState(false);
  const [selectedPassData, setSelectedPassData] = useState<{ attendee: AttendeeRegistration; event: EventDetails } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Handle Google OAuth redirect parameters if returning
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("google_auth") === "success") {
        const email = urlParams.get("google_email") || "";
        if (email && event && isEmailRegistered(email, event.id)) {
          loginAttendeeByEmail(email);
          const att = getRegistrationForEvent(event.id, email);
          if (att) setSelectedPassData({ attendee: att, event });
          setPassModalOpen(true);
        } else {
          setRsvpModalOpen(true);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [event, isEmailRegistered, loginAttendeeByEmail, getRegistrationForEvent]);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFDFE] text-[#121927]">
        <Navbar
          onOpenRsvp={() => {}}
          onOpenMyPass={() => setMyEventsModalOpen(true)}
        />
        <main className="flex-1 max-w-lg mx-auto px-4 py-24 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 border border-red-200 flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Event Not Found</h1>
            <p className="text-sm text-slate-600">
              The event ID <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{eventId}</code> does not exist or has been archived.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href="/upcoming"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Events</span>
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFE] text-[#121927]">
      {/* Top Chapter Navigation */}
      <Navbar
        onOpenRsvp={() => setRsvpModalOpen(true)}
        onOpenMyPass={() => setMyEventsModalOpen(true)}
      />

      {/* Sub-header Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 sm:top-18 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <Link
            href="/upcoming"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Community Events</span>
          </Link>

          <div className="flex items-center gap-2">
            {event.status === "PAST" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-200">
                Past Event Archive
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Upcoming Active
              </span>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Share event link"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedLink ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Event Hero Banner */}
      <Hero
        event={event}
        onOpenRsvp={() => setRsvpModalOpen(true)}
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

      {/* Floating Segmented Section Switcher */}
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

        {/* Celebration Banner */}
        <div className="mt-16 sm:mt-24 bearhacks-card p-6 sm:p-12 border-2 border-[#B6D8FF] bg-gradient-to-br from-[#CEE5FF]/40 via-white to-[#FFF4CF]/40 text-center space-y-6 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4CF] text-[#512B10] text-xs font-extrabold border border-[#F7E5A3] -rotate-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{event.status === "PAST" ? "Event Completed" : "Free Community Pass"}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CEE5FF] text-[#12284C] text-xs font-extrabold border border-[#B6D8FF] rotate-1">
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span>{event.hallOrRoom}</span>
            </span>
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#121927] tracking-tight leading-snug">
              {event.status === "PAST"
                ? `Thank You for Joining ${event.title}`
                : `Ready to Join ${event.title}?`}
            </h3>
            <p className="text-xs sm:text-base text-slate-600 font-normal leading-relaxed">
              {event.status === "PAST"
                ? "Check out our upcoming sessions or explore community recordings and code repositories."
                : `Reserve your free seat now to receive hands-on mentorship, workshop materials, and official goodies at ${event.venueName}.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isRegisteredForEvent(event.id) ? (
              <button
                type="button"
                onClick={() => {
                  const att = getRegistrationForEvent(event.id);
                  if (att) setSelectedPassData({ attendee: att, event });
                  setPassModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#D7F5E4] text-[#0f5132] hover:bg-emerald-200 text-sm font-extrabold border-2 border-[#B0ECC4] shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>View Your Digital Entry Pass</span>
              </button>
            ) : event.status !== "PAST" && event.isRegistrationOpen ? (
              <button
                type="button"
                onClick={() => setRsvpModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-extrabold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Claim Your Free Pass & QR</span>
              </button>
            ) : (
              <Link
                href="/upcoming"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-extrabold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>View Upcoming Events</span>
              </Link>
            )}
          </div>
        </div>
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
        targetEvent={event}
      />

      {/* Digital Pass Modal */}
      <DigitalPassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        targetEvent={selectedPassData?.event || event}
        targetAttendee={selectedPassData?.attendee || getRegistrationForEvent(event.id) || null}
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
