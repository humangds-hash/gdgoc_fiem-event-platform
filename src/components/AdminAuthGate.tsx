"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  UserPlus,
  LogIn,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Building2,
  BadgeCheck,
  Fingerprint,
} from "lucide-react";
import { useAdminStore, DEFAULT_ADMIN_PASSKEY } from "@/lib/admin-store";
import { AdminRole } from "@/types/event";

interface AdminAuthGateProps {
  onSuccess?: () => void;
}

export function AdminAuthGate({ onSuccess }: AdminAuthGateProps) {
  const { loginAdmin, joinAsAdmin, adminPasskey } = useAdminStore();

  const [activeTab, setActiveTab] = useState<"login" | "join">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Join form state
  const [joinFullName, setJoinFullName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [showJoinPassword, setShowJoinPassword] = useState(false);
  const [joinRole, setJoinRole] = useState<AdminRole>("ORGANIZER");
  const [joinOrganization, setJoinOrganization] = useState("GDG On Campus Kolkata");
  const [joinPasskey, setJoinPasskey] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      const res = loginAdmin(loginEmail, loginPassword);
      setIsLoggingIn(false);
      if (!res.success) {
        setLoginError(res.message);
      } else {
        onSuccess?.();
      }
    }, 400);
  };

  // Pre-fill demo credentials
  const handlePrefillDemo = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError("");
    setIsLoggingIn(true);
    setTimeout(() => {
      loginAdmin(email, pass);
      setIsLoggingIn(false);
      onSuccess?.();
    }, 300);
  };

  // Handle Join as Admin
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    setJoinSuccess("");

    if (!joinFullName.trim()) {
      setJoinError("Please enter your full name.");
      return;
    }
    if (!joinEmail.trim() || !joinEmail.includes("@")) {
      setJoinError("Please enter a valid organizer email address.");
      return;
    }
    if (!joinPassword.trim() || joinPassword.length < 4) {
      setJoinError("Password must be at least 4 characters.");
      return;
    }
    if (!joinPasskey.trim()) {
      setJoinError("Admin Invite Passkey is required to join as an organizer.");
      return;
    }

    setIsJoining(true);
    setTimeout(() => {
      const res = joinAsAdmin({
        fullName: joinFullName,
        email: joinEmail,
        password: joinPassword,
        role: joinRole,
        passkey: joinPasskey,
        organization: joinOrganization,
      });
      setIsJoining(false);

      if (!res.success) {
        setJoinError(res.message);
      } else {
        setJoinSuccess(res.message);
        setTimeout(() => {
          onSuccess?.();
        }, 600);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-[#0c1222] text-white flex flex-col justify-between p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to GDG Website</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Restricted Admin Portal</span>
        </div>
      </div>

      {/* Main Form Card Container */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
          {/* Google 4-Color Accent Line */}
          <div className="h-1.5 w-full flex">
            <div className="flex-1 bg-[#4285f4]" />
            <div className="flex-1 bg-[#ea4335]" />
            <div className="flex-1 bg-[#fbbc05]" />
            <div className="flex-1 bg-[#34a853]" />
          </div>

          <div className="p-6 sm:p-8">
            {/* Header / Logo */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                GDG Admin Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Event Management, QR Verification & Community Dashboard
              </p>
            </div>

            {/* Tabs: Sign In vs Join as Admin */}
            <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-700/70 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setLoginError("");
                  setJoinError("");
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "login"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Admin Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("join");
                  setLoginError("");
                  setJoinError("");
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "join"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Join as Admin</span>
              </button>
            </div>

            {/* TAB 1: SIGN IN */}
            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@gdg.org"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Case sensitive
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Admin Panel</span>
                    </>
                  )}
                </button>

                {/* Quick 1-Click Demo Login Box */}
                <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    Quick Testing & Evaluation
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePrefillDemo("admin@gdg.org", "admin123")}
                      className="p-2 rounded-xl bg-slate-900/70 border border-slate-700 hover:border-blue-500/60 hover:bg-slate-900 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-[11px] font-extrabold text-blue-400 group-hover:text-blue-300">
                        👑 Super Admin
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        admin@gdg.org
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        pass: admin123
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrefillDemo("scanner@gdgkolkata.org", "scanner2026")}
                      className="p-2 rounded-xl bg-slate-900/70 border border-slate-700 hover:border-emerald-500/60 hover:bg-slate-900 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-[11px] font-extrabold text-emerald-400 group-hover:text-emerald-300">
                        📱 Gate Staff
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        scanner@gdgkolkata.org
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        pass: scanner2026
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: JOIN AS ADMIN */}
            {activeTab === "join" && (
              <form onSubmit={handleJoinSubmit} className="space-y-3.5">
                {joinError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{joinError}</span>
                  </div>
                )}

                {joinSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{joinSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={joinFullName}
                      onChange={(e) => setJoinFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Organizer Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={joinEmail}
                      onChange={(e) => setJoinEmail(e.target.value)}
                      placeholder="priya@gdgkolkata.org"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type={showJoinPassword ? "text" : "password"}
                        required
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-8 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowJoinPassword(!showJoinPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showJoinPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Admin Role
                    </label>
                    <select
                      value={joinRole}
                      onChange={(e) => setJoinRole(e.target.value as AdminRole)}
                      className="w-full py-2 px-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500 font-medium"
                    >
                      <option value="ORGANIZER">Event Organizer</option>
                      <option value="CHECKIN_STAFF">Check-in Staff</option>
                      <option value="SUPER_ADMIN">Lead / Super Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Chapter / College
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={joinOrganization}
                      onChange={(e) => setJoinOrganization(e.target.value)}
                      placeholder="GDG On Campus Kolkata"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Admin Invite Passkey Input */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>Admin Passkey / Invite Code</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setJoinPasskey(adminPasskey || DEFAULT_ADMIN_PASSKEY)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline font-mono"
                    >
                      Apply Key: {adminPasskey || DEFAULT_ADMIN_PASSKEY}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={joinPasskey}
                    onChange={(e) => setJoinPasskey(e.target.value.toUpperCase())}
                    placeholder="e.g. GDG-ADMIN-2026"
                    className="w-full px-3 py-2 bg-slate-900/90 border-2 border-amber-500/40 rounded-xl text-sm text-amber-300 font-mono uppercase tracking-wider placeholder-slate-600 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    To prevent unauthorized access, this passkey is provided to GDG organizers and volunteers.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isJoining}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
                >
                  {isJoining ? (
                    <span>Verifying Access...</span>
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      <span>Register & Access Admin Panel</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Google Developer Groups &bull; Official Community Portal &bull; End-to-End Encrypted Session
        </p>
      </div>

      {/* Empty spacer for bottom flex alignment */}
      <div className="max-w-5xl w-full mx-auto" />
    </div>
  );
}
