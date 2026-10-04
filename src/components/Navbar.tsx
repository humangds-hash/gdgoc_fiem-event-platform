"use client";

import Link from "next/link";
import { Ticket, ShieldCheck } from "lucide-react";
import { useEventStore } from "@/lib/event-store";
import { GdgLogo } from "@/components/Icons";

interface NavbarProps {
  onOpenRsvp: () => void;
  onOpenMyPass: () => void;
}

export function Navbar({ onOpenRsvp, onOpenMyPass }: NavbarProps) {
  const { currentUser, currentAttendee, event, getUserRegistrations } = useEventStore();
  const userProfile = currentUser || (currentAttendee ? {
    fullName: currentAttendee.fullName,
    email: currentAttendee.email,
    avatarUrl: currentAttendee.avatarUrl,
    role: currentAttendee.role,
    organization: currentAttendee.organization,
  } : null);

  const myRegistrations = userProfile ? getUserRegistrations(userProfile.email) : [];
  const passCount = myRegistrations.length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      {/* Google 4-color top accent line */}
      <div className="h-[3px] w-full flex">
        <div className="flex-1 bg-[#4285F4]" />
        <div className="flex-1 bg-[#EA4335]" />
        <div className="flex-1 bg-[#FBBC04]" />
        <div className="flex-1 bg-[#34A853]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo and Brand with Official GDG SVG */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border-2 border-slate-200/90 flex items-center justify-center p-1.5 shadow-xs group-hover:border-blue-400 group-hover:scale-105 transition-all">
            <GdgLogo className="w-full h-full" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-[#121927] tracking-tight leading-none">
                TinyGD
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5 truncate max-w-[140px] sm:max-w-none">
              Developer Ecosystem
            </span>
          </div>
        </Link>

        {/* Center Navigation: Upcoming & Past Events */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
          <Link
            href="/upcoming"
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
          >
            Upcoming Events
          </Link>
          <Link
            href="/upcoming?tab=past"
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
          >
            Past Events
          </Link>
        </nav>

        {/* Right Actions - Clean and uncluttered */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 rounded-xl transition-all border border-blue-200 shadow-xs"
            title="Open Organizer Admin Panel"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Admin</span>
          </Link>

          {userProfile ? (
            <button
              onClick={onOpenMyPass}
              className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border-2 border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/30 transition-all shadow-xs active:scale-[0.98] group cursor-pointer"
              title="View My Joined Events & Pass"
            >
              <div className="relative shrink-0">
                <img
                  src={
                    userProfile.avatarUrl ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userProfile.fullName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
                  }
                  alt={userProfile.fullName}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 border border-slate-200 object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
              </div>
              <div className="text-left hidden sm:flex flex-col">
                <span className="text-xs font-extrabold text-[#121927] group-hover:text-blue-600 transition-colors leading-tight">
                  {userProfile.fullName.split(" ")[0]}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold leading-none">
                  {passCount > 0 ? `Passes (${passCount})` : "My Passes"}
                </span>
              </div>
              <Ticket className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </button>
          ) : (
            <button
              onClick={onOpenRsvp}
              disabled={!event.isRegistrationOpen}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <span>RSVP Free</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
