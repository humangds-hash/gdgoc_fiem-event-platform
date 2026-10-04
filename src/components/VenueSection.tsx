"use client";

import { Navigation, ExternalLink, Laptop, CreditCard, Ticket, MapPin } from "lucide-react";
import { EventDetails } from "@/types/event";

interface VenueSectionProps {
  event: EventDetails;
}

export function VenueSection({ event }: VenueSectionProps) {
  const checklist = [
    {
      icon: Laptop,
      badge: "Essential",
      title: "Laptop & Charger",
      headerBg: "bg-[#CEE5FF]",
      border: "border-[#B6D8FF]",
      textColor: "text-[#12284C]",
      desc: "Required to log into Google Cloud Skills Boost and complete your live lab quest during the hands-on session.",
    },
    {
      icon: CreditCard,
      badge: "Campus ID",
      title: "College Student Card",
      headerBg: "bg-[#FFF4CF]",
      border: "border-[#F7E5A3]",
      textColor: "text-[#512B10]",
      desc: "Keep your student identity card handy for campus verification at the FIEM Main Entrance Gate.",
    },
    {
      icon: Ticket,
      badge: "Quick Check-in",
      title: "TinyGD Digital Pass",
      headerBg: "bg-[#D7F5E4]",
      border: "border-[#B0ECC4]",
      textColor: "text-[#0f5132]",
      desc: "Save your QR entry pass on your phone or check your email confirmation for instant on-ground entry scanning.",
    },
  ];

  return (
    <section id="venue" className="space-y-10 sm:space-y-14 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="space-y-3 sm:space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF4CF] border border-[#F7E5A3] text-[#512B10] text-xs font-extrabold uppercase tracking-[0.15em] font-mono">
          <MapPin className="w-3.5 h-3.5 text-amber-800" />
          <span>Venue & Arrival Guide</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#121927] tracking-[-0.035em]">
          SG Hall · FIEM Campus
        </h2>
        <p className="text-sm sm:text-lg text-slate-600 leading-relaxed font-normal">
          Future Institute of Engineering & Management, Sonarpur Station Road, Kolkata. Follow the GDG directional signage once you arrive at the college gate.
        </p>
      </div>

      {/* 3 Prerequisites Cards (BearHacks Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {checklist.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bearhacks-card overflow-hidden flex flex-col justify-between border-2 border-slate-200/90"
            >
              <div className={`p-5 sm:p-6 ${item.headerBg} border-b-2 ${item.border} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/80 ${item.textColor} font-mono`}>
                    {item.badge}
                  </span>
                  <div className={`w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center ${item.textColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className={`text-lg sm:text-xl font-extrabold ${item.textColor} tracking-tight`}>
                  {item.title}
                </h3>
              </div>

              <div className="p-5 sm:p-6 flex-1">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded Map Card */}
      <div className="bearhacks-card overflow-hidden border-2 border-slate-200/90">
        <div className="p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 border-b-2 border-slate-100 bg-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#CEE5FF] text-[#12284C] text-[11px] sm:text-xs font-extrabold border border-[#B6D8FF]">
                {event.hallOrRoom}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-bold">Main Auditorium</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-[#121927] tracking-tight">
              {event.venueName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              {event.address}, {event.city}
            </p>
          </div>

          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#121927] hover:bg-black text-white text-xs sm:text-sm font-extrabold transition-all hover:scale-105 shadow-sm shrink-0"
          >
            <Navigation className="w-4 h-4" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* Embedded Map */}
        <div className="relative w-full h-72 sm:h-96 bg-slate-100">
          <iframe
            src="https://maps.google.com/maps?q=Future%20Institute%20of%20Engineering%20and%20Management%20Sonarpur&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 absolute inset-0"
            loading="lazy"
            title="FIEM Campus Map"
          />
        </div>
      </div>
    </section>
  );
}
