import React from "react";
import {
  DemographicData,
  LanguageOption,
  PatientScreen,
  PhysicianClinicalHistory,
  MedicalDocument,
} from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { getTranslation } from "../data/languages";
import {
  Mic,
  Calendar,
  FileText,
  Clock,
  Settings,
  Pill,
  TrendingUp,
  Upload,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface PatientDashboardScreenProps {
  patient: DemographicData;
  selectedLanguage: LanguageOption;
  clinicalSummary: PhysicianClinicalHistory;
  documents: MedicalDocument[];
  onNavigate: (screen: PatientScreen) => void;
  onOpenLanguageSelector: () => void;
  onEmergencySOS: () => void;
  verificationStatus?: string;
}

export const PatientDashboardScreen: React.FC<PatientDashboardScreenProps> = ({
  patient,
  selectedLanguage,
  clinicalSummary,
  documents,
  onNavigate,
  onOpenLanguageSelector,
  onEmergencySOS,
  verificationStatus = "DRAFT",
}) => {
  const t = getTranslation(selectedLanguage.name);

  return (
    <div
      id="patient-dashboard-screen"
      className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24"
    >
      {/* Top Welcome Section */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          <div className="flex items-center gap-4 text-center sm:text-left">
            {/* Small circular avatar icon near greeting */}
            <div className="relative shrink-0">
              <CaseLineAvatar
                size="md"
                mood="IDLE"
                pose="dashboard"
                showStatusBadge={true}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 text-white backdrop-blur-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  <span>ID: {patient.patientId || "PID-2026-8819"}</span>
                </span>
                <button
                  type="button"
                  id="dashboard-lang-selector-btn"
                  onClick={onOpenLanguageSelector}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-500/50 hover:bg-sky-500 text-white border border-white/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>🗣️ {selectedLanguage.name} ({selectedLanguage.nativeName})</span>
                </button>
              </div>

              {/* Exact reference text */}
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {t.greeting}, {patient.name || "Ramesh Kumar"}
              </h1>
              <p className="text-sm sm:text-base text-sky-100 font-medium mt-0.5">
                {t.dashboardSubtitle}
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/25 text-left shrink-0">
            <div className="text-[10px] text-sky-200 font-bold uppercase tracking-wider">
              {t.clinicalStatus}
            </div>
            <div className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>{t.readyForIntake}</span>
            </div>
            <div className="text-xs text-sky-100 mt-0.5">
              {documents.length} {t.documentsOnFile}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Cards (Exact Reference Specification) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Card 1: Start Health Interview */}
        <div
          id="card-start-health-interview"
          onClick={() => onNavigate("interview")}
          className="bg-white rounded-3xl p-6 border-2 border-sky-400 hover:border-sky-600 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6 animate-pulse" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-sky-100 text-sky-800 border border-sky-200">
                Primary Step
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-snug">
              {t.startVoiceIntake}
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              {t.startIntakeDesc}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700">
              Speak in {selectedLanguage.name} ({selectedLanguage.nativeName})
            </span>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-sky-600 group-hover:bg-sky-700 text-white font-black text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{t.startVoiceIntake} →</span>
            </button>
          </div>
        </div>

        {/* Card 2: Medical Timeline */}
        <div
          id="card-medical-timeline"
          onClick={() => onNavigate("timeline")}
          className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400">
                History
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-snug">
              {t.timeline}
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              {t.timelineDesc}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Chronological records
            </span>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-100 group-hover:bg-sky-50 text-slate-800 group-hover:text-sky-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer"
            >
              <span>{t.viewTimeline}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Upload Records */}
        <div
          id="card-upload-records"
          onClick={() => onNavigate("records")}
          className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400">
                Documents & OCR
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-snug">
              {t.documents}
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              {t.documentsDesc}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {documents.length} attached
            </span>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-800 group-hover:text-emerald-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer"
            >
              <span>{t.uploadRecord}</span>
            </button>
          </div>
        </div>

        {/* Card 4: Doctor Summary */}
        <div
          id="card-doctor-summary"
          onClick={() => onNavigate("summary")}
          className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400">
                Clinical Output
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-snug">
              {t.summary}
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              {t.summaryDesc}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Structured HPI & AYUSH
            </span>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-100 group-hover:bg-teal-50 text-slate-800 group-hover:text-teal-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer"
            >
              <span>{t.reviewSummary}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auxiliary Settings & Showcase Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Voice & Avatar Settings button */}
        <div
          id="card-voice-avatar-settings"
          onClick={() => onNavigate("settings")}
          className="bg-sky-50/70 hover:bg-sky-100/80 rounded-2xl p-4 border border-sky-200 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-sky-700 flex items-center justify-center shadow-2xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                {t.voiceAndAvatarSettings}
              </h4>
              <p className="text-xs text-slate-500">
                Preferred spoken regional language, dialect, voice gender & speed
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-700" />
        </div>

        {/* Persistent Avatar Showcase button (Screen 10) */}
        <div
          id="card-persistent-avatar-showcase"
          onClick={() => onNavigate("persistent-avatar")}
          className="bg-indigo-50/70 hover:bg-indigo-100/80 rounded-2xl p-4 border border-indigo-200 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-indigo-700 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                {t.persistentAvatar}
              </h4>
              <p className="text-xs text-slate-500">
                "One Avatar. Every Page. Always With You."
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-700" />
        </div>
      </div>

      {/* Continuing Care Module Tiles */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-800 tracking-tight">
              {t.continuingCare}
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800">
              Post-Intake
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("continuing-care")}
            className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Care Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            onClick={() => onNavigate("continuing-care")}
            className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-sky-300 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Appointments
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tomorrow, 10:30 AM
            </p>
          </div>

          <div
            onClick={() => onNavigate("continuing-care")}
            className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-sky-300 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
              <Pill className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Medications
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              2 active prescriptions
            </p>
          </div>

          <div
            onClick={() => onNavigate("continuing-care")}
            className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-sky-300 transition-all cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Health Trends
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Vitals & telemetry stable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
