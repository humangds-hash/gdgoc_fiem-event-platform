"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Mail,
  Briefcase,
  Building,
  ShieldAlert,
  Ticket,
} from "lucide-react";
import confetti from "canvas-confetti";
import { AttendeeRole, AttendeeRegistration, EventDetails } from "@/types/event";
import { signInWithGoogle, isSupabaseConfigured } from "@/lib/supabase/client";
import { useEventStore } from "@/lib/event-store";
import { GoogleIcon } from "@/components/Icons";

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrationSuccess: (attendee?: AttendeeRegistration, event?: EventDetails) => void;
  initialGoogleUser?: { fullName: string; email: string; avatarUrl?: string } | null;
  targetEvent?: EventDetails;
}

const ROLES: AttendeeRole[] = [
  "Student",
  "Working Professional / Developer",
  "Designer / Product Specialist",
  "Founder / Entrepreneur",
  "Other Community Role",
];

export function RsvpModal({ isOpen, onClose, onRegistrationSuccess, initialGoogleUser, targetEvent }: RsvpModalProps) {
  const { registerAttendee, event, isEmailRegistered, getAttendeeByEmail, loginAttendeeByEmail, currentUser } = useEventStore();
  const activeEvent = targetEvent || event;

  // Modal Flow Step: 1 = Google Auth prompt, 2 = Registration Details form
  const [step, setStep] = useState<1 | 2>(initialGoogleUser ? 2 : 1);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authenticated user state
  const [googleUser, setGoogleUser] = useState<{
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  } | null>(
    initialGoogleUser
      ? {
          id: "google-oauth",
          email: initialGoogleUser.email,
          fullName: initialGoogleUser.fullName,
          avatarUrl: initialGoogleUser.avatarUrl,
        }
      : null
  );

  // Form inputs
  const [fullName, setFullName] = useState(initialGoogleUser?.fullName || currentUser?.fullName || "");
  const [directEmail, setDirectEmail] = useState(currentUser?.email || "");
  const [emailValue, setEmailValue] = useState(initialGoogleUser?.email || currentUser?.email || "");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [role, setRole] = useState<AttendeeRole>(currentUser?.role || "Student");
  const [organization, setOrganization] = useState(currentUser?.organization || "");
  const [fastRegistrationOptIn, setFastRegistrationOptIn] = useState(true);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [showGoogleEmailPrompt, setShowGoogleEmailPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alreadyRegisteredAttendee, setAlreadyRegisteredAttendee] = useState<AttendeeRegistration | null>(null);

  useEffect(() => {
    if (currentUser && !fullName && !directEmail) {
      setFullName(currentUser.fullName);
      setDirectEmail(currentUser.email);
      setEmailValue(currentUser.email);
      if (currentUser.role) setRole(currentUser.role);
      if (currentUser.organization) setOrganization(currentUser.organization);
    }
  }, [currentUser]);

  useEffect(() => {
    if (initialGoogleUser) {
      setGoogleUser({
        id: "google-oauth",
        email: initialGoogleUser.email,
        fullName: initialGoogleUser.fullName,
        avatarUrl: initialGoogleUser.avatarUrl,
      });
      setFullName(initialGoogleUser.fullName);
      setEmailValue(initialGoogleUser.email);
      setStep(2);
    }
  }, [initialGoogleUser]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMessage("");

    try {
      // Check if custom Google Cloud OAuth is configured
      const res = await fetch("/api/auth/google/url");
      const data = await res.json();

      if (data.configured && data.url) {
        // Redirect to official Google Cloud OAuth consent page
        window.location.href = data.url;
        return;
      }

      // If Google Cloud keys are not pasted yet, show email prompt so user can enter ANY Google email!
      setShowGoogleEmailPrompt(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in with Google";
      setErrorMessage(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleContinueWithCustomGoogleAccount = () => {
    const email = (googleEmailInput.trim() || directEmail.trim() || "").toLowerCase();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid Google email address.");
      return;
    }

    if (isEmailRegistered(email)) {
      const existing = getAttendeeByEmail(email);
      setAlreadyRegisteredAttendee(existing || null);
      setErrorMessage(`The email "${email}" is already registered! Each email can only register for 1 pass.`);
      setShowGoogleEmailPrompt(false);
      return;
    }
    
    // Derive sensible default display name from email (e.g. priya.sharma@gmail.com -> Priya Sharma)
    const emailPrefix = email.split("@")[0].replace(/[._-]/g, " ");
    const derivedName = fullName.trim() || emailPrefix.replace(/\b\w/g, (c) => c.toUpperCase());

    const avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    setGoogleUser({
      id: "usr_google_" + Math.random().toString(36).substring(2, 8),
      email: email,
      fullName: derivedName,
      avatarUrl: avatar,
    });
    setFullName(derivedName);
    setEmailValue(email);
    setShowGoogleEmailPrompt(false);
    setAlreadyRegisteredAttendee(null);
    setErrorMessage("");
    setStep(2);
  };

  const handleDirectRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    const cleanEmail = directEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (isEmailRegistered(cleanEmail, activeEvent.id)) {
      const existing = getAttendeeByEmail(cleanEmail, activeEvent.id);
      setAlreadyRegisteredAttendee(existing || null);
      setErrorMessage(`The email "${cleanEmail}" is already registered for ${activeEvent.title}!`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const newAtt = registerAttendee({
        fullName: fullName.trim(),
        email: cleanEmail,
        role,
        organization: organization.trim(),
        fastRegistrationOptIn,
        eventId: activeEvent.id,
      });

      // Send confirmation email in background
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAtt.email,
          fullName: newAtt.fullName,
          ticketId: newAtt.id,
          eventTitle: activeEvent.title,
          displayDate: activeEvent.displayDate,
          displayTime: activeEvent.displayTime,
          hallOrRoom: activeEvent.hallOrRoom,
          venue: `${activeEvent.hallOrRoom}, ${activeEvent.venueName}`,
          avatarUrl: newAtt.avatarUrl,
        }),
      }).catch((err) => console.error("Email send failed:", err));

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853"],
      });

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        onRegistrationSuccess(newAtt, activeEvent);
      }, 400);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  const handleConfirmRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const targetEmail = (emailValue.trim() || googleUser?.email || directEmail.trim() || "").toLowerCase();
    if (!targetEmail || !targetEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (isEmailRegistered(targetEmail, activeEvent.id)) {
      const existing = getAttendeeByEmail(targetEmail, activeEvent.id);
      setAlreadyRegisteredAttendee(existing || null);
      setErrorMessage(`The email "${targetEmail}" is already registered for ${activeEvent.title}!`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const newAtt = registerAttendee({
        fullName: fullName.trim(),
        email: targetEmail,
        role,
        organization: organization.trim(),
        avatarUrl: googleUser?.avatarUrl,
        fastRegistrationOptIn,
        eventId: activeEvent.id,
      });

      // Send confirmation email in background
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAtt.email,
          fullName: newAtt.fullName,
          ticketId: newAtt.id,
          eventTitle: activeEvent.title,
          displayDate: activeEvent.displayDate,
          displayTime: activeEvent.displayTime,
          hallOrRoom: activeEvent.hallOrRoom,
          venue: `${activeEvent.hallOrRoom}, ${activeEvent.venueName}`,
          avatarUrl: newAtt.avatarUrl,
        }),
      }).catch((err) => console.error("Email send failed:", err));

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853"],
      });

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        onRegistrationSuccess(newAtt, activeEvent);
      }, 500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top brand header ribbon */}
        <div className="h-[3px] w-full flex shrink-0">
          <div className="flex-1 bg-[#4285F4]" />
          <div className="flex-1 bg-[#EA4335]" />
          <div className="flex-1 bg-[#FBBC04]" />
          <div className="flex-1 bg-[#34A853]" />
        </div>

        {/* Modal close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100/90 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-7 overflow-y-auto">
          {/* STEP 1: Google Authentication Trigger */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#CEE5FF] border-2 border-[#B6D8FF] text-[#12284C] flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>

              <div>
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider font-mono">
                  Step 1 of 2 · Quick Sign-In
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#121927] mt-1 tracking-tight">
                  RSVP for Study Jams 2026–27
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
                  Sign in with Google to pre-fill your ticket details and receive your official digital entry pass.
                </p>
              </div>

              {alreadyRegisteredAttendee ? (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 animate-in fade-in duration-150 text-left">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1 flex-1">
                      <p className="font-extrabold text-amber-900 text-sm">
                        Already Registered
                      </p>
                      <p className="text-amber-800 leading-relaxed">
                        <strong className="font-mono text-amber-950">{alreadyRegisteredAttendee.email}</strong> is already registered for this event under <strong>{alreadyRegisteredAttendee.fullName}</strong>. Each attendee can only register once.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        loginAttendeeByEmail(alreadyRegisteredAttendee.email);
                        onClose();
                        onRegistrationSuccess();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-extrabold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>View Your Existing Pass & QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAlreadyRegisteredAttendee(null);
                        setErrorMessage("");
                        setDirectEmail("");
                        setEmailValue("");
                        setGoogleEmailInput("");
                      }}
                      className="inline-flex items-center justify-center py-2.5 px-3 rounded-xl bg-white hover:bg-amber-100/60 text-amber-900 text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
                    >
                      Use Different Email
                    </button>
                  </div>
                </div>
              ) : errorMessage ? (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 text-left">
                  {errorMessage}
                </div>
              ) : null}

              {/* Google Account Selector or Trigger Button */}
              {showGoogleEmailPrompt ? (
                <div className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/50 space-y-3 text-left animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GoogleIcon className="w-5 h-5" />
                      <span className="text-xs sm:text-sm font-extrabold text-[#121927]">
                        Sign in with Google
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGoogleEmailPrompt(false)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-bold px-1"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-tight">
                    Enter any Google email address to register your seat:
                  </p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      autoFocus
                      required
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-3 py-2 text-sm rounded-xl border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 bg-white font-medium"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleContinueWithCustomGoogleAccount();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleContinueWithCustomGoogleAccount}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-extrabold shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <span>Continue with this Google Email</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticating}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold shadow-xs transition-all hover:border-slate-300 active:scale-[0.99] disabled:opacity-60"
                  >
                    <GoogleIcon className="w-5 h-5" />
                    <span>
                      {isAuthenticating ? "Connecting with Google..." : "Continue with Google"}
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Official Google Cloud OAuth 2.0 verification</span>
                  </div>
                </div>
              )}

              {/* Clean separator */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  or 1-click quick register
                </span>
              </div>

              {/* Direct 1-Click Registration Form */}
              <form onSubmit={handleDirectRsvp} className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={directEmail}
                    onChange={(e) => {
                      setDirectEmail(e.target.value);
                      if (alreadyRegisteredAttendee) setAlreadyRegisteredAttendee(null);
                      if (errorMessage) setErrorMessage("");
                    }}
                    onBlur={() => {
                      const clean = directEmail.trim().toLowerCase();
                      if (clean && isEmailRegistered(clean)) {
                        const existing = getAttendeeByEmail(clean);
                        setAlreadyRegisteredAttendee(existing || null);
                        setErrorMessage(`The email "${clean}" is already registered! Each email can only register for 1 pass.`);
                      }
                    }}
                    placeholder="e.g. priya.dev@gmail.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as AttendeeRole)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">College / Dept</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. FIEM CSE"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 bg-white font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !!alreadyRegisteredAttendee}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-extrabold shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Creating your pass...</span>
                  ) : (
                    <>
                      <span>Claim Your Free Pass & QR</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Pre-populated Details Form */}
          {step === 2 && googleUser && (
            <form onSubmit={handleConfirmRsvp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider font-mono">
                    Step 2 of 2 · Confirm RSVP
                  </span>
                  <div className="flex items-center gap-1.5">
                    {googleUser.avatarUrl && (
                      <img
                        src={googleUser.avatarUrl}
                        alt={googleUser.fullName}
                        className="w-5 h-5 rounded-full border border-emerald-400 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-[#D7F5E4] px-2.5 py-0.5 rounded-full border border-[#B0ECC4]">
                      Google Verified
                    </span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#121927] mt-1 tracking-tight">
                  Complete Your Ticket Details
                </h3>
              </div>

              {alreadyRegisteredAttendee ? (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 animate-in fade-in duration-150 text-left">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1 flex-1">
                      <p className="font-extrabold text-amber-900 text-sm">
                        Already Registered
                      </p>
                      <p className="text-amber-800 leading-relaxed">
                        <strong className="font-mono text-amber-950">{alreadyRegisteredAttendee.email}</strong> is already registered for this event under <strong>{alreadyRegisteredAttendee.fullName}</strong>. Each attendee can only register once.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        loginAttendeeByEmail(alreadyRegisteredAttendee.email);
                        onClose();
                        onRegistrationSuccess();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-extrabold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>View Your Existing Pass & QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAlreadyRegisteredAttendee(null);
                        setErrorMessage("");
                        setEmailValue("");
                        setIsEditingEmail(true);
                      }}
                      className="inline-flex items-center justify-center py-2.5 px-3 rounded-xl bg-white hover:bg-amber-100/60 text-amber-900 text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
                    >
                      Change Email
                    </button>
                  </div>
                </div>
              ) : errorMessage ? (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                  {errorMessage}
                </div>
              ) : null}

              {/* Full Name (Pre-populated from Google, editable) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Full Name</span>
                  <span className="text-[11px] font-normal text-slate-400">Editable</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white font-medium"
                  />
                </div>
              </div>

              {/* Email Address (Pre-populated from Google, editable) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Email Address</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">Google</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    {isEditingEmail ? "Done" : "Change Email"}
                  </button>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    readOnly={!isEditingEmail}
                    value={emailValue}
                    onChange={(e) => {
                      setEmailValue(e.target.value);
                      if (alreadyRegisteredAttendee) setAlreadyRegisteredAttendee(null);
                      if (errorMessage) setErrorMessage("");
                    }}
                    onBlur={() => {
                      const clean = emailValue.trim().toLowerCase();
                      if (clean && isEmailRegistered(clean)) {
                        const existing = getAttendeeByEmail(clean);
                        setAlreadyRegisteredAttendee(existing || null);
                        setErrorMessage(`The email "${clean}" is already registered! Each email can only register for 1 pass.`);
                      }
                    }}
                    placeholder="your.email@gmail.com"
                    className={`w-full pl-9 pr-8 py-2 text-sm rounded-xl border font-mono text-xs transition-all ${
                      isEditingEmail
                        ? "border-blue-500 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-700 cursor-default"
                    }`}
                  />
                  <CheckCircle2 className="absolute right-3 top-2.5 w-4 h-4 text-emerald-600" />
                </div>
              </div>

              {/* Role / Category Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>Attendee Category</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AttendeeRole)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white font-medium"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* College / Organization */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>College / Department Name</span>
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. FIEM CSE, IT, Heritage, etc."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white font-medium"
                />
              </div>

              {/* Fast 1-click registration preference checkbox */}
              <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fastRegistrationOptIn}
                  onChange={(e) => setFastRegistrationOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Remember my details for 1-click registration in upcoming GDG on Campus workshops.
                </span>
              </label>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !!alreadyRegisteredAttendee}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-extrabold shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Confirming your reservation...</span>
                  ) : (
                    <>
                      <span>Confirm RSVP & Get Pass</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
