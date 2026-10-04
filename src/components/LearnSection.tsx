"use client";

import { CheckCircle2, Terminal, Cpu, Award, Target, Laptop, Zap } from "lucide-react";

export function LearnSection() {
  const tracks = [
    {
      badge: "Track 01 · Foundation",
      title: "Cloud Computing & Architecture",
      headerBg: "bg-[#CEE5FF]",
      border: "border-[#B6D8FF]",
      textColor: "text-[#12284C]",
      icon: Terminal,
      description:
        "Understand core Google Cloud infrastructure without overwhelming theory. Learn how modern distributed systems, compute engines, and secure cloud storage operate.",
      outcomes: [
        "Deploying your first Compute Engine Virtual Machine",
        "Configuring IAM permissions & secure Cloud Storage",
        "Understanding global regions, zones, and VPC networks",
      ],
    },
    {
      badge: "Track 02 · Innovation",
      title: "Generative AI & Gemini APIs",
      headerBg: "bg-[#FFF4CF]",
      border: "border-[#F7E5A3]",
      textColor: "text-[#512B10]",
      icon: Cpu,
      description:
        "Dive into cutting-edge AI technologies on Vertex AI. Learn prompt engineering, function calling, and connecting Gemini multimodal models to real codebases.",
      outcomes: [
        "Prompt tuning and parameter configuration in Vertex AI",
        "Building multimodal applications with Gemini 1.5 Flash",
        "Creating custom AI tools with function calling & embeddings",
      ],
    },
    {
      badge: "Track 03 · Milestone",
      title: "Skill Badges & GDG Swag Rewards",
      headerBg: "bg-[#D7F5E4]",
      border: "border-[#B0ECC4]",
      textColor: "text-[#0f5132]",
      icon: Award,
      description:
        "Master the roadmap to unlocking official Google Cloud Skill Badges. Showcase verified credentials on LinkedIn and qualify for limited-edition GDG developer merch.",
      outcomes: [
        "Public credential linking for your resume and LinkedIn",
        "Step-by-step guidance to unlock Tier 1 & Tier 2 swags",
        "Exclusive access to GDG on Campus FIEM alumni network",
      ],
    },
  ];

  return (
    <section id="learn" className="space-y-10 sm:space-y-14 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="space-y-3 sm:space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF4CF] border border-[#F7E5A3] text-[#512B10] text-xs font-extrabold uppercase tracking-[0.15em] font-mono">
          <Target className="w-3.5 h-3.5 text-amber-800" />
          <span>Curriculum & Pathways</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#121927] tracking-[-0.035em]">
          What You'll Learn & Build
        </h2>
        <p className="text-sm sm:text-lg text-slate-600 leading-relaxed font-normal">
          We break down Google Cloud into practical, bite-sized quests. No prior cloud or DevOps experience is required — our leads start from absolute zero.
        </p>
      </div>

      {/* 3 Spacious BearHacks Track Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
        {tracks.map((track, idx) => {
          const Icon = track.icon;
          return (
            <div
              key={idx}
              className="bearhacks-card overflow-hidden flex flex-col justify-between border-2 border-slate-200/90"
            >
              {/* Card Header */}
              <div className={`p-5 sm:p-6 ${track.headerBg} border-b-2 ${track.border} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/80 ${track.textColor} font-mono`}>
                    {track.badge}
                  </span>
                  <div className={`w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center ${track.textColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className={`text-lg sm:text-xl font-extrabold ${track.textColor} tracking-tight leading-snug`}>
                  {track.title}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {track.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">
                    Key Outcomes
                  </span>
                  {track.outcomes.map((outcome, oIdx) => (
                    <div key={oIdx} className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hands-on Workshop Reminder Box */}
      <div className="bearhacks-card p-5 sm:p-6 bg-[#CEE5FF]/40 border-2 border-[#B6D8FF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-[#B6D8FF] flex items-center justify-center text-[#12284C] shrink-0 shadow-xs">
            <Laptop className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm sm:text-base font-extrabold text-[#12284C] tracking-tight">
              Bring Your Laptop & Charger to SG Hall
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              We will guide you through setting up your account and solving your very first lab quest live on your own screen!
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#12284C] text-xs font-bold border border-[#B6D8FF] shrink-0 font-mono shadow-xs">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Live Codelab</span>
        </span>
      </div>
    </section>
  );
}
