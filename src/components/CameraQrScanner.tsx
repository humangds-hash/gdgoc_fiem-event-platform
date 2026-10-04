"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  FlipHorizontal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Search,
  Volume2,
  VolumeX,
  Upload,
  Image as ImageIcon,
  Check,
  Copy,
  Printer,
  History,
  Building2,
  Mail,
  QrCode,
  Undo2,
} from "lucide-react";
import { AttendeeRegistration, EventDetails } from "@/types/event";
import { downloadTicketImage } from "@/lib/ticket-generator";

interface CheckInResult {
  success: boolean;
  message: string;
  attendee?: AttendeeRegistration;
}

interface CameraQrScannerProps {
  onScanTicket: (data: string) => CheckInResult;
  onUndoCheckIn?: (attendeeId: string) => void;
  currentEvent?: EventDetails;
  allAttendees?: AttendeeRegistration[];
}

/**
 * Plays a pleasant double-chime using Web Audio API
 */
function playSuccessBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1); // D6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  } catch (err) {
    // AudioContext blocked or not supported; ignore
  }
}

function playWarningBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch (err) {
    // AudioContext blocked or not supported; ignore
  }
}

export function CameraQrScanner({
  onScanTicket,
  onUndoCheckIn,
  currentEvent,
  allAttendees = [],
}: CameraQrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scanned result state
  const [scannedResult, setScannedResult] = useState<CheckInResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [autoResumeTimer, setAutoResumeTimer] = useState<number | null>(null);

  // Persistent active attendee state so details remain visible after scanning
  const [activeAttendee, setActiveAttendee] = useState<AttendeeRegistration | null>(null);
  const [activeScanStatus, setActiveScanStatus] = useState<"SUCCESS" | "DUPLICATE" | "NOT_FOUND" | null>(null);
  const [activeScanMessage, setActiveScanMessage] = useState<string>("");
  const [recentScans, setRecentScans] = useState<AttendeeRegistration[]>([]);
  const [copiedPassId, setCopiedPassId] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [undoSuccess, setUndoSuccess] = useState(false);

  // Manual fallback input
  const [manualCode, setManualCode] = useState("");

  // Ticket image upload fallback
  const [isScanningFile, setIsScanningFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "tinygd-camera-reader";

  // Process decoded code
  const handleDecodedText = useCallback(
    (decodedText: string) => {
      if (isPaused) return;

      setIsPaused(true);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      const result = onScanTicket(decodedText.trim());
      setScannedResult(result);
      setUndoSuccess(false);

      if (result.attendee) {
        setActiveAttendee(result.attendee);
        setActiveScanStatus(result.message.includes("Already checked in") ? "DUPLICATE" : "SUCCESS");
        setActiveScanMessage(result.message);
        setRecentScans((prev) => {
          const filtered = prev.filter((a) => a.id !== result.attendee!.id);
          return [result.attendee!, ...filtered].slice(0, 10);
        });
      } else {
        setActiveScanStatus("NOT_FOUND");
        setActiveScanMessage(result.message);
      }

      if (result.success && !result.message.includes("Already checked in")) {
        if (soundEnabled) playSuccessBeep();
      } else {
        if (soundEnabled) playWarningBeep();
      }

      // Automatically resume camera viewfinder after 3 seconds, but activeAttendee card stays visible
      let count = 3;
      setAutoResumeTimer(count);
      const interval = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(interval);
          setAutoResumeTimer(null);
          setScannedResult(null);
          setIsPaused(false);
        } else {
          setAutoResumeTimer(count);
        }
      }, 1000);
    },
    [isPaused, onScanTicket, soundEnabled]
  );

  const startScanner = async (mode: "environment" | "user") => {
    setErrorMessage("");
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
          ],
          verbose: false,
        });
      }

      if (scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (_) {}
      }

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      try {
        await scannerRef.current.start(
          { facingMode: mode },
          config,
          (decodedText) => {
            handleDecodedText(decodedText);
          },
          () => {
            // Frame parse error (no QR detected in frame), silently ignore
          }
        );
      } catch (firstErr: any) {
        // If mode === "environment" failed (e.g. laptop/desktop webcam without environment camera or NotReadableError), fallback to "user" camera
        if (mode === "environment") {
          console.warn("Back camera unavailable, attempting front/default camera fallback:", firstErr?.message);
          setFacingMode("user");
          await scannerRef.current.start(
            { facingMode: "user" },
            config,
            (decodedText) => {
              handleDecodedText(decodedText);
            },
            () => {}
          );
        } else {
          throw firstErr;
        }
      }

      setIsScanning(true);
      setHasPermission(true);
    } catch (err: any) {
      // Use console.warn instead of console.error to avoid triggering Next.js dev error overlay
      console.warn("Camera scanner notice:", err?.message || err);
      setIsScanning(false);
      setHasPermission(false);

      const errStr = String(err?.message || err?.name || "");
      if (err?.name === "NotAllowedError" || errStr.includes("Permission denied")) {
        setErrorMessage("Camera permission denied. Please allow camera access in your browser address bar.");
      } else if (err?.name === "NotFoundError" || errStr.includes("NotFoundError")) {
        setErrorMessage("No camera hardware was detected on this device.");
      } else if (
        err?.name === "NotReadableError" ||
        errStr.includes("NotReadableError") ||
        errStr.includes("Could not start video source")
      ) {
        setErrorMessage(
          "Camera is currently in use or blocked by another application (Zoom, Teams, or another browser tab). Please close other camera apps, switch to the other camera, or upload a ticket image below."
        );
      } else {
        setErrorMessage(err?.message || "Could not start camera scanner. You can upload an image or type the code manually.");
      }
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch (err) {
      console.warn("Notice stopping scanner:", err);
    } finally {
      setIsScanning(false);
      setIsPaused(false);
      setScannedResult(null);
    }
  };

  // Ticket image file scan fallback
  const handleScanImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningFile(true);
    setErrorMessage("");

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
          ],
          verbose: false,
        });
      }

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }

      const decodedText = await scannerRef.current.scanFile(file, false);
      if (decodedText) {
        handleDecodedText(decodedText);
      }
    } catch (err: any) {
      console.warn("File QR scan notice:", err);
      setErrorMessage("No valid QR code was detected in the selected image. Please upload a clear photo of the ticket QR code.");
    } finally {
      setIsScanningFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Toggle Camera
  const handleToggleScanning = async () => {
    if (isScanning) {
      await stopScanner();
    } else {
      await startScanner(facingMode);
    }
  };

  // Flip between rear and front camera (ideal for mobile phone)
  const handleFlipCamera = async () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    if (isScanning) {
      await stopScanner();
      await startScanner(nextMode);
    }
  };

  // Resume scanning immediately
  const handleScanNext = () => {
    setAutoResumeTimer(null);
    setScannedResult(null);
    setIsPaused(false);
  };

  // Manual code entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    handleDecodedText(manualCode.trim());
    setManualCode("");
  };

  // Copy pass ID
  const handleCopyPassId = (passId: string) => {
    navigator.clipboard.writeText(passId);
    setCopiedPassId(true);
    setTimeout(() => setCopiedPassId(false), 2000);
  };

  // Undo check-in
  const handleUndo = () => {
    if (!activeAttendee || !onUndoCheckIn) return;
    onUndoCheckIn(activeAttendee.id);
    setActiveAttendee({
      ...activeAttendee,
      status: "CONFIRMED",
      checkInTimestamp: undefined,
    });
    setActiveScanStatus(null);
    setUndoSuccess(true);
    setTimeout(() => setUndoSuccess(false), 3000);
  };

  // Print/Download badge
  const handlePrintBadge = async () => {
    if (!activeAttendee || !currentEvent) return;
    setIsPrinting(true);
    try {
      await downloadTicketImage(activeAttendee, currentEvent);
    } catch (err) {
      console.warn("Could not download badge image:", err);
    } finally {
      setIsPrinting(false);
    }
  };

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live Check-in Camera Viewfinder</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Attendee Pass Barcode Scanner
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Point your phone or laptop camera at the attendee&apos;s ticket QR code to validate entry automatically.
        </p>
      </div>

      {/* Main Scanner Card */}
      <div className="rounded-3xl border-2 border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Top Google accent bar */}
        <div className="h-[3px] w-full flex">
          <div className="flex-1 bg-[#4285F4]" />
          <div className="flex-1 bg-[#EA4335]" />
          <div className="flex-1 bg-[#FBBC04]" />
          <div className="flex-1 bg-[#34A853]" />
        </div>

        {/* Camera Viewport Area */}
        <div className="relative bg-slate-950 aspect-square w-full flex items-center justify-center overflow-hidden">
          {/* html5-qrcode DOM Target Element */}
          <div
            id={readerElementId}
            className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
          />

          {/* Idle / Camera Off State */}
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-900 text-white z-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">Camera is Standby</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Tap below to activate your camera, or upload a ticket QR screenshot.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => startScanner(facingMode)}
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Scanner</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanningFile}
                  className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>{isScanningFile ? "Scanning..." : "Upload QR Image"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Scanning Target Overlay Box with Laser Animation */}
          {isScanning && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              {/* Dimmed backdrop around target */}
              <div className="relative w-64 h-64 border-2 border-emerald-400 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]">
                {/* 4 Target Corner Brackets */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Animated Laser Scan Bar */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse" />
                
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-white bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
                  Align QR Code inside frame
                </span>
              </div>
            </div>
          )}

          {/* Scanned Result Popover Overlay */}
          {scannedResult && (
            <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
              {scannedResult.success ? (
                scannedResult.message.includes("Already checked in") ? (
                  /* Warning: Already Checked In */
                  <div className="w-full max-w-sm bg-white rounded-2xl p-5 border-2 border-amber-300 shadow-2xl space-y-3 text-slate-900">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Duplicate Scan
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">
                        Already Checked In
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">{scannedResult.message}</p>
                    </div>

                    {scannedResult.attendee && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center gap-3">
                        <img
                          src={scannedResult.attendee.avatarUrl}
                          alt={scannedResult.attendee.fullName}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-200 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {scannedResult.attendee.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono truncate">
                            {scannedResult.attendee.email}
                          </p>
                          <span className="text-[10px] font-bold text-blue-600">
                            {scannedResult.attendee.role}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleScanNext}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Scan Next Attendee {autoResumeTimer ? `(${autoResumeTimer}s)` : ""}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Success: Checked In Confirmed */
                  <div className="w-full max-w-sm bg-white rounded-2xl p-5 border-2 border-emerald-400 shadow-2xl space-y-3.5 text-slate-900">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-[#D7F5E4] px-2.5 py-0.5 rounded-full border border-[#B0ECC4] uppercase tracking-wider">
                        ✓ Seat Validated
                      </span>
                      <h4 className="text-lg font-extrabold text-slate-900 mt-1">
                        Check-in Successful!
                      </h4>
                      <p className="text-xs text-slate-500">Welcome to TinyGD Study Jams 2026</p>
                    </div>

                    {scannedResult.attendee && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center gap-3">
                        <img
                          src={scannedResult.attendee.avatarUrl}
                          alt={scannedResult.attendee.fullName}
                          className="w-12 h-12 rounded-xl bg-white border border-slate-200 object-cover shadow-xs shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold text-slate-900 truncate">
                            {scannedResult.attendee.fullName}
                          </p>
                          <p className="text-xs text-slate-500 font-mono truncate">
                            {scannedResult.attendee.email}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                              {scannedResult.attendee.role}
                            </span>
                            {scannedResult.attendee.organization && (
                              <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                {scannedResult.attendee.organization}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                      <span>PASS: {scannedResult.attendee?.id.toUpperCase()}</span>
                      <span>TIME: {new Date().toLocaleTimeString()}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleScanNext}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-600/25 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Scan Next Attendee {autoResumeTimer ? `(${autoResumeTimer}s)` : ""}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )
              ) : (
                /* Error: Pass Not Found */
                <div className="w-full max-w-sm bg-white rounded-2xl p-5 border-2 border-red-300 shadow-2xl space-y-3 text-slate-900">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Invalid Code
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">
                      Attendee Pass Not Found
                    </h4>
                    <p className="text-xs text-red-600 mt-0.5">{scannedResult.message}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleScanNext}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Try Again</span>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scanner Control Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleScanning}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isScanning
                  ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }`}
            >
              {isScanning ? (
                <>
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera</span>
                </>
              )}
            </button>

            {/* Switch Camera Mode (Back / Front) - Crucial for Mobile Phones */}
            <button
              type="button"
              onClick={handleFlipCamera}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              title={`Switch to ${facingMode === "environment" ? "Front / Laptop" : "Back / Phone"} camera`}
            >
              <FlipHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">
                {facingMode === "environment" ? "Back Camera" : "Front Camera"}
              </span>
            </button>

            {/* Upload Ticket Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanningFile}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              title="Upload ticket screenshot or photo"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{isScanningFile ? "Scanning..." : "Upload Pass"}</span>
            </button>
          </div>

          {/* Hidden file input for ticket uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleScanImageFile}
          />

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            title={soundEnabled ? "Mute beep sound" : "Enable beep sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Error Notice Banner with Quick Fallback Actions */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 text-xs space-y-2.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <p className="font-extrabold text-amber-950">Camera Scanner Notice</p>
              <p className="text-amber-800 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-slate-400 hover:text-slate-600 font-bold px-1 text-sm"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
            <button
              type="button"
              onClick={() => startScanner("user")}
              className="px-3 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-200 text-amber-900 text-[11px] font-bold cursor-pointer transition-colors"
            >
              Try Front / Laptop Camera
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3 h-3 text-emerald-600" />
              <span>Upload Ticket Image</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Fallback Input */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>Manual Check-in Fallback</span>
          <span className="text-[11px] text-slate-400 font-normal">If screen is cracked or camera off</span>
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste Pass ID, QR string, or attendee email..."
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Check In
          </button>
        </form>
      </div>

      {/* PERSISTENT ATTENDEE DETAILS VERIFICATION CARD */}
      {activeAttendee && (
        <div className="rounded-3xl border-2 border-emerald-400 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Status Bar */}
          <div className={`px-5 py-3 flex items-center justify-between text-xs font-extrabold ${
            activeScanStatus === "DUPLICATE"
              ? "bg-amber-50 text-amber-900 border-b border-amber-200"
              : "bg-emerald-50 text-emerald-900 border-b border-emerald-200"
          }`}>
            <div className="flex items-center gap-2">
              {activeScanStatus === "DUPLICATE" ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Duplicate Scan: {activeScanMessage}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ticket Verified: {activeScanMessage || "Checked In Successfully"}</span>
                </>
              )}
            </div>
            {undoSuccess && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                ✓ Check-in Reverted
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Attendee Profile Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <img
                src={activeAttendee.avatarUrl}
                alt={activeAttendee.fullName}
                className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-200 object-cover shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 truncate">
                    {activeAttendee.fullName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    {activeAttendee.role}
                  </span>
                  {activeAttendee.fastRegistrationOptIn && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                      ⚡ Express Pass
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {activeAttendee.email}
                  </span>
                  {activeAttendee.organization && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {activeAttendee.organization}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pass Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">PASS ID</span>
                <button
                  type="button"
                  onClick={() => handleCopyPassId(activeAttendee.id)}
                  className="font-extrabold text-slate-800 hover:text-blue-600 inline-flex items-center gap-1 cursor-pointer"
                  title="Click to copy"
                >
                  <span>{activeAttendee.id.toUpperCase()}</span>
                  {copiedPassId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">GATE STATUS</span>
                <span className={`font-extrabold ${activeAttendee.status === "CHECKED_IN" ? "text-emerald-700" : "text-amber-700"}`}>
                  {activeAttendee.status === "CHECKED_IN" ? "✓ CHECKED IN" : "CONFIRMED"}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">CHECK-IN TIME</span>
                <span className="font-extrabold text-slate-800">
                  {activeAttendee.checkInTimestamp ? new Date(activeAttendee.checkInTimestamp).toLocaleTimeString() : "Just now"}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handleScanNext}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Scan Next Ticket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {currentEvent && (
                <button
                  type="button"
                  onClick={handlePrintBadge}
                  disabled={isPrinting}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  title="Download / print ticket badge for attendee"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isPrinting ? "Generating..." : "Print / Download Badge"}</span>
                </button>
              )}

              {onUndoCheckIn && activeAttendee.status === "CHECKED_IN" && (
                <button
                  type="button"
                  onClick={handleUndo}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer inline-flex items-center gap-1.5 ml-auto"
                  title="Accidental scan? Revert back to confirmed"
                >
                  <Undo2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Undo Check-In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECENT CHECK-INS GATE FEED */}
      {recentScans.length > 0 && (
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
              <History className="w-4 h-4 text-blue-600" />
              <span>Recent Gate Check-ins ({recentScans.length})</span>
            </div>
            <span className="text-[11px] text-slate-400">Click any attendee to re-inspect</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentScans.map((att) => (
              <div
                key={att.id}
                onClick={() => {
                  setActiveAttendee(att);
                  setActiveScanStatus("SUCCESS");
                }}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={att.avatarUrl}
                    alt={att.fullName}
                    className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{att.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{att.id.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Checked In
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {att.checkInTimestamp ? new Date(att.checkInTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
