"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: "Who is eligible to attend the Study Jams Info Session?",
    a: "The session is open to all students across all engineering branches, years, and technical backgrounds. While hosted at FIEM Kolkata, curious learners and developers from nearby colleges are warmly welcome.",
  },
  {
    q: "Do I need prior Google Cloud or coding experience?",
    a: "None at all! The orientation starts from ground zero. Our team walks you through navigating the console, setting up credentials, and running commands step by step.",
  },
  {
    q: "What should I bring to SG Hall?",
    a: "Bring your laptop and charger so you can participate directly in the live lab quest. Make sure you also bring your student ID card for campus gate entry and keep your TinyGD digital entry pass handy on your mobile phone.",
  },
  {
    q: "How do I earn the official Google Developer swags?",
    a: "Every attendee receives complimentary Google Cloud Skills Boost lab credits. By finishing the specified quest milestones and earning your skill badges, you automatically qualify for official Google developer shirts, bottles, stickers, and swag kits.",
  },
  {
    q: "Is registration completely free?",
    a: "Yes, 100% free of charge! GDG on Campus FIEM is an open student community powered by Google Developers. We will never charge any fee for sessions, vouchers, or digital passes.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="space-y-10 sm:space-y-14 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="space-y-3 sm:space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D7F5E4] border border-[#B0ECC4] text-[#0f5132] text-xs font-extrabold uppercase tracking-[0.15em] font-mono">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
          <span>Got Questions?</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#121927] tracking-[-0.035em]">
          Frequently Asked Questions
        </h2>
        <p className="text-sm sm:text-lg text-slate-600 leading-relaxed font-normal">
          Everything you need to know before joining us at SG Hall for the Cloud Study Jams 2026–27.
        </p>
      </div>

      {/* Accordion Cards */}
      <div className="space-y-3 sm:space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`bearhacks-card overflow-hidden border-2 transition-all ${
                isOpen ? "border-[#1a73e8] bg-white shadow-md" : "border-slate-200/90 bg-white/90"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-4 sm:p-6 flex items-center justify-between gap-3 sm:gap-4 text-sm sm:text-lg font-extrabold text-[#121927] hover:text-[#1a73e8] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${isOpen ? "bg-[#CEE5FF] text-[#12284C]" : "bg-slate-100 text-slate-500"}`}>
                    <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <span className="leading-snug">{faq.q}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-[#1a73e8]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 text-xs sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 font-normal">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
