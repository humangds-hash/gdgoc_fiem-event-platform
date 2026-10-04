"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    function calculate() {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isMounted) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
        <span className="animate-pulse">Loading countdown...</span>
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D7F5E4] text-[#0f5132] text-xs font-bold border-2 border-[#B0ECC4]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        Event Live or Completed
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days, bg: "bg-[#FFF4CF]", border: "border-[#F7E5A3]", text: "text-[#512B10]" },
    { label: "Hours", value: timeLeft.hours, bg: "bg-[#CEE5FF]", border: "border-[#B6D8FF]", text: "text-[#12284C]" },
    { label: "Mins", value: timeLeft.minutes, bg: "bg-[#FFF4CF]", border: "border-[#F7E5A3]", text: "text-[#512B10]" },
    { label: "Secs", value: timeLeft.seconds, bg: "bg-[#CEE5FF]", border: "border-[#B6D8FF]", text: "text-[#12284C]" },
  ];

  return (
    <div className="inline-flex items-center gap-2 sm:gap-2.5 p-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/90 shadow-sm">
      {units.map((unit, idx) => (
        <div key={idx} className="flex items-center">
          <div
            className={`flex flex-col items-center justify-center ${unit.bg} border-2 ${unit.border} rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-[48px] sm:min-w-[56px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]`}
          >
            <span className={`text-base sm:text-lg font-extrabold font-mono tracking-tight ${unit.text} leading-none`}>
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              {unit.label}
            </span>
          </div>
          {idx < units.length - 1 && (
            <span className="text-slate-300 font-bold px-0.5 sm:px-1 text-sm">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
