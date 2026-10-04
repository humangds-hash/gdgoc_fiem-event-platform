"use client";

import { Sparkles, BookOpen, Clock, Users, MapPin, HelpCircle, LucideIcon } from "lucide-react";

export type EventTab = "overview" | "learn" | "schedule" | "hosts" | "venue" | "faq";

interface SectionNavProps {
  activeTab: EventTab;
  onChangeTab: (tab: EventTab) => void;
}

interface TabConfig {
  id: EventTab;
  label: string;
  icon: LucideIcon;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  iconColor: string;
}

const TABS: TabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Sparkles,
    activeBg: "bg-[#CEE5FF]",
    activeText: "text-[#12284C]",
    activeBorder: "border-[#B6D8FF]",
    iconColor: "text-blue-600",
  },
  {
    id: "learn",
    label: "What You'll Learn",
    icon: BookOpen,
    activeBg: "bg-[#FFF4CF]",
    activeText: "text-[#512B10]",
    activeBorder: "border-[#F7E5A3]",
    iconColor: "text-amber-700",
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: Clock,
    activeBg: "bg-[#D7F5E4]",
    activeText: "text-[#0f5132]",
    activeBorder: "border-[#B0ECC4]",
    iconColor: "text-emerald-700",
  },
  {
    id: "hosts",
    label: "Team Leads",
    icon: Users,
    activeBg: "bg-[#CEE5FF]",
    activeText: "text-[#12284C]",
    activeBorder: "border-[#B6D8FF]",
    iconColor: "text-blue-600",
  },
  {
    id: "venue",
    label: "Venue & Map",
    icon: MapPin,
    activeBg: "bg-[#FFF4CF]",
    activeText: "text-[#512B10]",
    activeBorder: "border-[#F7E5A3]",
    iconColor: "text-amber-700",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: HelpCircle,
    activeBg: "bg-[#D7F5E4]",
    activeText: "text-[#0f5132]",
    activeBorder: "border-[#B0ECC4]",
    iconColor: "text-emerald-700",
  },
];

export function SectionNav({ activeTab, onChangeTab }: SectionNavProps) {
  const handleTabClick = (tabId: EventTab) => {
    onChangeTab(tabId);
    if (typeof window !== "undefined") {
      const contentEl = document.getElementById("section-content");
      if (contentEl) {
        const yOffset = -90;
        const y = contentEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    /* Clean sticky bar with NO parallel divider lines running across the screen */
    <div className="sticky top-16 sm:top-18 z-30 py-3.5 bg-white/90 backdrop-blur-md mb-8 sm:mb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* The exact format and rounded-2xl track you liked from the screenshot */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 touch-pan-x">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? `${tab.activeBg} ${tab.activeText} border-2 ${tab.activeBorder} shadow-xs scale-[1.02]`
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80 border-2 border-transparent"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${
                    isActive ? tab.iconColor : "text-slate-400"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
