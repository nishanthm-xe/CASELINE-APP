import React from "react";
import {
  Activity,
  AlertTriangle,
  Clock,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Heart,
  Mic,
  QrCode,
  ShieldCheck,
  Stethoscope,
  Upload,
  User,
} from "lucide-react";
import { TRANSLATIONS } from "../data/languages";
import { DemographicData, MedicalDocument, PhysicianClinicalHistory, TimelineEvent } from "../types";

interface PatientDashboardProps {
  patient: DemographicData;
  selectedLanguage: string;
  onStartInterview: () => void;
  onViewSummary: () => void;
  onViewTimeline: () => void;
  onOpenUpload: () => void;
  onOpenSos: () => void;
  onOpenAbdm: () => void;
  historySummary: PhysicianClinicalHistory;
  documentsCount: number;
  timelineCount: number;
  isHighContrast?: boolean;
  isLargeText?: boolean;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  selectedLanguage,
  onStartInterview,
  onViewSummary,
  onViewTimeline,
  onOpenUpload,
  onOpenSos,
  onOpenAbdm,
  historySummary,
  documentsCount,
  timelineCount,
  isHighContrast = false,
  isLargeText = false,
}) => {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS["English"];
  const isHistoryComplete = historySummary.status === "verified_physician" || historySummary.hpi.onset !== "";

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Patient Welcome Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-700 via-teal-700 to-emerald-700 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-2xl border border-white/30">
              {patient.name.charAt(0) || "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl sm:text-2xl">{patient.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-xs font-semibold">
                  {patient.gender}, {patient.age} Yrs
                </span>
              </div>
              <p className="text-xs text-cyan-100 mt-0.5">
                MRN: {patient.patientId} • ABHA: {patient.abhaId || "91-4523-8891-2304"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-black/20 text-center text-xs">
              <span className="block text-[10px] text-cyan-200 uppercase font-semibold">
                Status
              </span>
              <span className="font-bold">
                {isHistoryComplete ? "Ready for Doctor" : "History Incomplete"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Grid (Accessibility-First with Large Tap Targets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Start / Continue Voice & Touch Intake */}
        <button
          id="patient-start-intake-card"
          type="button"
          onClick={onStartInterview}
          className={`p-5 rounded-2xl border text-left transition-all group flex flex-col justify-between shadow-xs ${
            isHighContrast
              ? "bg-black text-white border-yellow-400 hover:bg-zinc-900"
              : "bg-white hover:bg-cyan-50/50 border-slate-200 hover:border-cyan-400"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
              <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
              {isHistoryComplete ? "Update History" : "Start Intake"}
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Voice & Touch Clinical Intake
            </h3>
            <p className="text-xs text-slate-500">
              Speak or tap in your language. Adaptive questions prepare your clinical history before you meet the physician.
            </p>
          </div>
        </button>

        {/* Card 2: Upload Medical Document / Prescription OCR */}
        <button
          id="patient-upload-doc-card"
          type="button"
          onClick={onOpenUpload}
          className={`p-5 rounded-2xl border text-left transition-all group flex flex-col justify-between shadow-xs ${
            isHighContrast
              ? "bg-black text-white border-yellow-400 hover:bg-zinc-900"
              : "bg-white hover:bg-teal-50/50 border-slate-200 hover:border-teal-400"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {documentsCount} Uploaded
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Scan & Upload Medical Records
            </h3>
            <p className="text-xs text-slate-500">
              Upload past doctor prescriptions, lab tests, or scan reports. Multimodal OCR extracts medicines and diagnoses.
            </p>
          </div>
        </button>

        {/* Card 3: Medical Timeline */}
        <button
          id="patient-view-timeline-card"
          type="button"
          onClick={onViewTimeline}
          className={`p-5 rounded-2xl border text-left transition-all group flex flex-col justify-between shadow-xs ${
            isHighContrast
              ? "bg-black text-white border-yellow-400 hover:bg-zinc-900"
              : "bg-white hover:bg-purple-50/50 border-slate-200 hover:border-purple-400"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Clock className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200">
              {timelineCount} Events
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              My Chronological Medical Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Explore your past hospital visits, lab investigations, test trends, and prescription history across 2024–2026.
            </p>
          </div>
        </button>

        {/* Card 4: Doctor-Ready Clinical Summary */}
        <button
          id="patient-view-summary-card"
          type="button"
          onClick={onViewSummary}
          className={`p-5 rounded-2xl border text-left transition-all group flex flex-col justify-between shadow-xs ${
            isHighContrast
              ? "bg-black text-white border-yellow-400 hover:bg-zinc-900"
              : "bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-400"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileCheck2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              14 Sections
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Physician-Ready Clinical Summary
            </h3>
            <p className="text-xs text-slate-500">
              Inspect the structured 14-section clinical draft ready for your doctor's review and sign-off.
            </p>
          </div>
        </button>
      </div>

      {/* ABDM & Emergency SOS Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-teal-700" />
            <div>
              <h4 className="text-xs font-bold text-teal-950">
                ABDM Health Gateway & Digital Consent
              </h4>
              <p className="text-[11px] text-teal-800">
                Consent granted for outpatient intake. Freely revocable.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAbdm}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-700 text-white hover:bg-teal-800 shrink-0"
          >
            Manage Consent
          </button>
        </div>

        <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h4 className="text-xs font-bold text-red-950">
                Emergency Triage & SOS
              </h4>
              <p className="text-[11px] text-red-800">
                Immediate chest pain / severe shortness of breath alert.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSos}
            className="px-3 py-1.5 text-xs font-extrabold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-xs shrink-0"
          >
            Trigger SOS
          </button>
        </div>
      </div>
    </div>
  );
};
