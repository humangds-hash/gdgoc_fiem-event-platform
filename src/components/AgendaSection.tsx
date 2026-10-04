"use client";

import { MapPin, Clock, Sparkles, Coffee, Terminal, Award, HelpCircle } from "lucide-react";
import { AgendaItem } from "@/types/event";

interface AgendaSectionProps {
  agenda: AgendaItem[];
}

export function AgendaSection({ agenda }: AgendaSectionProps) {
  // Helper to pick contextual icons for timeline activities
  const getActivityIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("doors") || lower.includes("registration") || lower.includes("check-in")) return Coffee;
    if (lower.includes("lab") || lower.includes("quest") || lower.includes("code")) return Terminal;
    if (lower.includes("swag") || lower.includes("rewards") || lower.includes("perks")) return Award;
    if (lower.includes("q&a") || lower.includes("ask") || lower.includes("mingle")) return HelpCircle;
    return Sparkles;
  };

  return (
    <section id="schedule" className="space-y-10 sm:space-y-14 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="space-y-3 sm:space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D7F5E4] border border-[#B0ECC4] text-[#0f5132] text-xs font-extrabold uppercase tracking-[0.15em] font-mono">
          <Clock className="w-3.5 h-3.5 text-emerald-700" />
          <span>Timeline & Schedule</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#121927] tracking-[-0.035em]">
          Agenda for the Afternoon
        </h2>
        <p className="text-sm sm:text-lg text-slate-600 leading-relaxed font-normal">
          Designed to be fast-paced, interactive, and completely free of endless lecture slides. Total duration is 2.5 hours at SG Hall.
        </p>
      </div>

      {/* Spacious BearHacks Timeline List */}
      <div className="space-y-3.5 sm:space-y-4">
        {agenda.map((item, idx) => {
          const ActivityIcon = getActivityIcon(item.title);
          return (
            <div
              key={item.id || idx}
              className="bearhacks-card p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 border-2 border-slate-200/90"
            >
              {/* Left: Time Badge & Content */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0">
                {/* Butter-cream Time Pill */}
                <div className="shrink-0 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 justify-center font-mono text-xs sm:text-sm font-extrabold text-[#512B10] bg-[#FFF4CF] border-2 border-[#F7E5A3] px-3 sm:px-3.5 py-1.5 rounded-xl shadow-xs">
                    <ActivityIcon className="w-3.5 h-3.5 text-amber-800" />
                    <span>{item.timeSlot}</span>
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#121927] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Right: Room & Category Pill */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {item.room && (
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-slate-600 font-bold bg-slate-100 px-2.5 sm:px-3 py-1 rounded-lg border border-slate-200/80">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{item.room}</span>
                  </span>
                )}
                {item.tag && (
                  <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-extrabold bg-[#CEE5FF] text-[#12284C] border border-[#B6D8FF]">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>{item.tag}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
