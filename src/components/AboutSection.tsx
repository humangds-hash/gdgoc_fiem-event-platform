"use client";

import Image from "next/image";
import { Gift, Cloud, Award, Sparkles, CheckCircle2, Clock, Users, ShieldCheck } from "lucide-react";
import { EventDetails } from "@/types/event";

interface AboutSectionProps {
  event: EventDetails;
}

export function AboutSection({ event }: AboutSectionProps) {
  const stats = [
    { number: "3 Hours", label: "Live Lab & Orientation", icon: Clock, bg: "bg-[#CEE5FF]", border: "border-[#B6D8FF]", text: "text-[#12284C]" },
    { number: "100+", label: "Campus Devs Gathering", icon: Users, bg: "bg-[#FFF4CF]", border: "border-[#F7E5A3]", text: "text-[#512B10]" },
    { number: "10 Leads", label: "Core GDG Mentors", icon: ShieldCheck, bg: "bg-[#D7F5E4]", border: "border-[#B0ECC4]", text: "text-[#0f5132]" },
    { number: "100%", label: "Free Skills Boost Access", icon: Gift, bg: "bg-[#FFE5DE]", border: "border-[#FDCBC0]", text: "text-[#8a220b]" },
  ];

  const pillars = [
    {
      title: "Google Cloud Credits",
      badge: "Zero-Cost Access",
      icon: Cloud,
      headerBg: "bg-[#CEE5FF]",
      borderColor: "border-[#B6D8FF]",
      textColor: "text-[#12284C]",
      desc: "Unlock real Google Cloud Skills Boost lab credits without adding a credit card. Practice VMs, Kubernetes, BigQuery, and Vertex AI safely.",
      perk: "Full access to hands-on learning quests",
    },
    {
      title: "Official GDG Goodies",
      badge: "Perks & Swag",
      icon: Gift,
      headerBg: "bg-[#FFF4CF]",
      borderColor: "border-[#F7E5A3]",
      textColor: "text-[#512B10]",
      desc: "Complete your pathway quests to earn official Google developer stickers, bottles, t-shirts, and backpack badges shipped directly to campus.",
      perk: "Limited edition 2026–27 developer kits",
    },
    {
      title: "Google Credentials",
      badge: "Verified Skill Badges",
      icon: Award,
      headerBg: "bg-[#D7F5E4]",
      borderColor: "border-[#B0ECC4]",
      textColor: "text-[#0f5132]",
      desc: "Earn digital skill badges that display directly on your LinkedIn profile and resume, verifying your foundational cloud and AI skills.",
      perk: "Shareable badges backed by Google Cloud",
    },
  ];

  return (
    <section id="overview" className="space-y-10 sm:space-y-14 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="space-y-3 sm:space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#CEE5FF] border border-[#B6D8FF] text-[#12284C] text-xs font-extrabold uppercase tracking-[0.15em] font-mono">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Chapter Kickoff · 2026–27</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#121927] tracking-[-0.035em]">
          About the Info Session
        </h2>
        <p className="text-sm sm:text-lg text-slate-600 leading-relaxed font-normal">
          The <strong>Google Cloud Study Jams</strong> are the flagship annual learning experience hosted by GDG on Campus FIEM. Whether you're in your first year or nearing graduation, this orientation breaks down the entire journey from your first console login to earning industry-recognized Google badges.
        </p>
      </div>

      {/* 4 Big Retro-Modern Stat Blocks with SVG Icons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bearhacks-card p-4 sm:p-6 text-center border-2 ${stat.border} ${stat.bg} space-y-1.5 flex flex-col items-center justify-center`}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/70 flex items-center justify-center mb-1">
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${stat.text}`} />
              </div>
              <div className={`text-xl sm:text-3xl lg:text-4xl font-extrabold font-mono tracking-tight ${stat.text} leading-none`}>
                {stat.number}
              </div>
              <div className="text-[11px] sm:text-xs font-extrabold text-slate-600">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 Spacious Feature Pillar Cards */}
      <div className="space-y-5">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#121927] tracking-tight">
          What Makes This Session Essential
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {pillars.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bearhacks-card overflow-hidden flex flex-col justify-between border-2 border-slate-200/90"
              >
                {/* Card Pastel Header */}
                <div className={`p-5 sm:p-6 ${item.headerBg} border-b-2 ${item.borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-block text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/80 ${item.textColor} font-mono`}>
                      {item.badge}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className={`text-lg sm:text-xl font-extrabold ${item.textColor} tracking-tight`}>
                    {item.title}
                  </h4>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item.perk}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organizer Lead Quote Card */}
      <div className="bearhacks-card p-5 sm:p-8 bg-[#FFF4CF]/40 border-2 border-[#F7E5A3] flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-[#F7E5A3] bg-white shadow-xs">
          <Image
            src="https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_100,h_100,g_center/v1/gcs/platform-data-goog/avatars/rishita_kundu.png"
            alt="Rishita Kundu"
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-[#121927] text-sm sm:text-base">Rishita Kundu</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-[#1557b0] bg-[#CEE5FF] px-2.5 py-0.5 rounded-full border border-[#B6D8FF]">
              GDG on Campus Organizer
            </span>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-[#512B10] leading-relaxed italic font-medium">
            &ldquo;We say Study Jams, and we think goodies! We designed this session so every single student can kickstart their cloud profile and take home official Google developer swags.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
