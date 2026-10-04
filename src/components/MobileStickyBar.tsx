"use client";

import { Sparkles, Ticket } from "lucide-react";
import { EventDetails } from "@/types/event";
import { useEventStore } from "@/lib/event-store";

interface MobileStickyBarProps {
  event: EventDetails;
  onOpenRsvp: () => void;
  onOpenMyPass: () => void;
}

export function MobileStickyBar({ event, onOpenRsvp, onOpenMyPass }: MobileStickyBarProps) {
  const { isRegisteredForEvent } = useEventStore();
  const isRegistered = isRegisteredForEvent(event.id);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900">Free Admission</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
              Live
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block truncate max-w-[170px]">
            {event.registeredCount} of {event.capacity} seats taken
          </span>
        </div>

        {isRegistered ? (
          <button
            onClick={onOpenMyPass}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            View Pass
          </button>
        ) : (
          <button
            onClick={onOpenRsvp}
            disabled={!event.isRegistrationOpen}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            RSVP Free
          </button>
        )}
      </div>
    </div>
  );
}
