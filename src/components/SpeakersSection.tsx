"use client";

import { SpeakerOrHost } from "@/types/event";
import { Users, ExternalLink } from "lucide-react";
import { XIcon, LinkedInIcon } from "@/components/Icons";

interface SpeakersSectionProps {
  team: SpeakerOrHost[];
}

export function SpeakersSection({ team }: SpeakersSectionProps) {
  return (
    <section id="hosts" className="space-y-10 sm:space-y-14 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="space-y-3 sm:space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#CEE5FF] border border-[#B6D8FF] text-[#12284C] text-xs font-extrabold uppercase tracking-[0.15em] font-mono">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Chapter Leadership</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#121927] tracking-[-0.035em]">
          Meet the GDG FIEM Leads
        </h2>
        <p className="text-sm sm:text-lg text-slate-600 leading-relaxed font-normal">
          The student organizers, community managers, and tech leads running Google Developer Group on Campus Future Institute of Engineering & Management.
        </p>
      </div>

      {/* Spacious 3-Column Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {team.map((member) => (
          <div
            key={member.id}
            className="bearhacks-card p-5 sm:p-6 flex flex-col justify-between space-y-4 sm:space-y-5 border-2 border-slate-200/90"
          >
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-200/90 bg-slate-100 shadow-xs">
                <img
                  src={member.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(member.name)}`}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(member.name)}`;
                  }}
                />
              </div>

              <div className="min-w-0 space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-[#121927] truncate tracking-tight">
                  {member.name}
                </h3>
                <span className="inline-block text-[10px] sm:text-[11px] font-extrabold text-[#1557b0] bg-[#CEE5FF] px-2.5 py-0.5 rounded-full border border-[#B6D8FF] truncate max-w-full">
                  {member.role}
                </span>
                <p className="text-[10px] sm:text-[11px] text-slate-500 truncate font-medium">
                  {member.organization}
                </p>
              </div>
            </div>

            {/* Social Links Bar */}
            {(member.socials?.linkedin || member.socials?.twitter) && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                  Social
                </span>
                <div className="flex items-center gap-1.5">
                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077B5]/10 hover:bg-[#0077B5]/20 border border-[#0077B5]/30 text-[#0077B5] text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-xs"
                      title={`${member.name} on LinkedIn`}
                    >
                      <LinkedInIcon className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}

                  {member.socials.twitter && (
                    <a
                      href={member.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 text-slate-800 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-xs"
                      title={`${member.name} on X`}
                    >
                      <XIcon className="w-3 h-3 text-slate-800" />
                      <span>X</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
