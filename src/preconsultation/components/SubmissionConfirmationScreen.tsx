import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Printer,
  LogOut,
  Stethoscope,
  Copy,
  Check,
  Building2,
  Ticket,
  Volume2,
  ShieldCheck,
} from "lucide-react";
import {
  DemographicData,
  LanguageOption,
} from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { useLanguage } from "../context/LanguageContext";


interface SubmissionConfirmationScreenProps {
  patient: DemographicData;
  selectedLanguage: LanguageOption;
  referenceId?: string;
  onLogout: () => void;
  onSwitchToDoctorView?: () => void;
  doctorName?: string;
  roomNumber?: string;
  tokenNumber?: string;
  estimatedWaitTime?: string;
}

export const SubmissionConfirmationScreen: React.FC<
  SubmissionConfirmationScreenProps
> = ({
  patient,
  selectedLanguage,
  referenceId = "CASE-2026-IN8821",
  onLogout,
  onSwitchToDoctorView,
  doctorName = "Dr. Sundaram, MD (Cardiology)",
  roomNumber = "Room 4 (OPD Block B)",
  tokenNumber = "#B-42",
  estimatedWaitTime = "12 mins",
}) => {
  const [countdown, setCountdown] = useState(10);
  const [copied, setCopied] = useState(false);
  const [printed, setPrinted] = useState(false);

  const { t } = useLanguage();

  // Avatar goodbye in selected language
  const defaultGoodbye =
    selectedLanguage.name === "Hindi"
      ? `धन्यवाद ${patient.name} जी। आपका विवरण डॉ. सुंदरम को भेज दिया गया है। कृपया कमरा नंबर 4 पर जाएं।`
      : selectedLanguage.name === "Tamil"
      ? `நன்றி ${patient.name}. உங்கள் விவரங்கள் டாக்டர் சுந்தரத்திற்கு அனுப்பப்பட்டுள்ளது. அறை 4க்கு செல்லவும்.`
      : selectedLanguage.name === "Telugu"
      ? `ధన్యవాదాలు ${patient.name}. మీ వివరాలు డాక్టర్ సుందరం గారికి పంపబడ్డాయి. దయచేసి రూమ్ 4కు వెళ్లండి.`
      : `Thank you. Your consultation details have been sent to Dr. Sundaram. Please proceed to Room 4.`;

  const goodbyeMessage = t("confirmation.goodbye", defaultGoodbye);


  // Auto-logout countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  // Spoken avatar goodbye
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(goodbyeMessage);
      utterance.lang = selectedLanguage.ttsLang || "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedLanguage]);

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    setPrinted(true);
    window.print();
  };

  return (
    <div
      id="submission-confirmation-screen"
      className="max-w-5xl mx-auto px-4 py-8 space-y-6 pb-24"
    >
      {/* 2-Column Responsive Layout: MAIN (Left) | RIGHT (Video AI Avatar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN AREA (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Celebratory Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center flex flex-col items-center">
            {/* Confirmation graphic */}
            <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Submitted to Doctor
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-lg leading-relaxed font-medium">
              Your intake summary has been securely routed to the attending physician.
            </p>

            {/* Reference ID Pill */}
            <div className="mt-4 p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-3">
              <span className="text-xs font-bold text-sky-800">
                Case Reference ID:
              </span>
              <span className="font-mono font-black text-base text-slate-900">
                {referenceId}
              </span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="p-1 rounded-lg hover:bg-sky-100 text-sky-600 transition-colors cursor-pointer"
                title="Copy Reference ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Summary Details Grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-base text-slate-900">
              Consultation Queue Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Token Number */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-sm">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                    Token Number
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {tokenNumber}
                  </span>
                </div>
              </div>

              {/* Estimated Wait Time */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    Estimated Wait Time
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {estimatedWaitTime}
                  </span>
                </div>
              </div>

              {/* Room / Counter */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Room / Counter Number
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {roomNumber}
                  </span>
                </div>
              </div>

              {/* Attending Physician */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                    Attending Physician
                  </span>
                  <span className="text-sm font-black text-slate-900 leading-tight block">
                    {doctorName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-logout countdown banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-mono font-black text-lg">
                {countdown}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-100">
                  Kiosk Security & Privacy
                </h4>
                <p className="text-xs text-slate-400">
                  Logging out automatically in {countdown} seconds to protect your medical privacy.
                </p>
              </div>
            </div>

            {/* Action Buttons: Logout Now | Print Intake Slip */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                id="submission-print-slip-btn"
                onClick={handlePrint}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                <span>{printed ? "Printed" : "Print Slip"}</span>
              </button>

              <button
                type="button"
                id="submission-logout-now-btn"
                onClick={onLogout}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Now</span>
              </button>
            </div>
          </div>

          {/* Staff/Doctor link */}
          {onSwitchToDoctorView && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onSwitchToDoctorView}
                className="text-xs font-bold text-sky-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Portal Verification View</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT AREA: Video AI Avatar saying goodbye */}
        <div className="lg:col-span-4 flex flex-col items-center sticky top-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md w-full flex flex-col items-center text-center">
            <div className="mb-2">
              <CaseLineAvatar
                size="hero"
                character="female"
                mood="SPEAKING"
                pose="confirmation"
                showStatusBadge={true}
              />
            </div>

            {/* Speech bubble with goodbye */}
            <div className="mt-4 relative bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center w-full">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-sky-50 border-t border-l border-sky-200 rotate-45" />
              <p className="relative z-10 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                "{goodbyeMessage}"
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] font-extrabold text-sky-700">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Spoken Guidance in {selectedLanguage.name}</span>
              </div>
            </div>

            <div className="mt-5 w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Session Auto-Secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
