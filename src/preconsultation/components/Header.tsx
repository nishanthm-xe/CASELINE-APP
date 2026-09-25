import React from "react";
import {
  Activity,
  AlertTriangle,
  FileCheck2,
  Globe,
  Leaf,
  Stethoscope,
  Sun,
  Type,
  User,
  Zap,
} from "lucide-react";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "../data/languages";
import { UserRole } from "../types";

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  isAyushMode: boolean;
  onToggleAyush: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  isLargeText: boolean;
  onToggleLargeText: () => void;
  onOpenSos: () => void;
  onOpenAbdm: () => void;
  onLoadDemo: () => void;
  hasRedFlagActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  selectedLanguage,
  onLanguageChange,
  isAyushMode,
  onToggleAyush,
  isHighContrast,
  onToggleHighContrast,
  isLargeText,
  onToggleLargeText,
  onOpenSos,
  onOpenAbdm,
  onLoadDemo,
  hasRedFlagActive,
}) => {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS["English"];

  return (
    <header
      id="main-header"
      className={`border-b transition-colors ${
        isHighContrast
          ? "bg-black text-white border-yellow-400"
          : "bg-white text-slate-800 border-slate-200"
      } sticky top-0 z-40 shadow-xs`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
              isHighContrast
                ? "bg-yellow-400 text-black"
                : "bg-gradient-to-tr from-cyan-600 to-teal-500"
            }`}
          >
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight">CaseLine</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-100 text-cyan-800 border border-cyan-200">
                AI Clinical History
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Pre-Consultation Clinical Intake & Verification Platform
            </p>
          </div>
        </div>

        {/* Action Controls & Switchers */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Demo button */}
          <button
            id="load-demo-btn"
            type="button"
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            title="Load full fictional patient with lipid panel, timeline & red flag"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
            <span className="hidden sm:inline">Load Demo Patient</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* ABDM / HIS Integration Modal Trigger */}
          <button
            id="abdm-integration-btn"
            type="button"
            onClick={onOpenAbdm}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">ABDM / FHIR</span>
            <span className="text-[10px] bg-teal-100 text-teal-800 px-1 py-0.2 rounded">
              Mock
            </span>
          </button>

          {/* AYUSH Mode Toggle */}
          <button
            id="ayush-mode-toggle"
            type="button"
            onClick={onToggleAyush}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isAyushMode
                ? "bg-amber-50 text-amber-900 border-amber-300 font-semibold ring-1 ring-amber-300"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
            title="Toggle AYUSH / Ayurveda Dashavidha Pariksha Intake"
          >
            <Leaf className={`w-3.5 h-3.5 ${isAyushMode ? "text-amber-600" : "text-slate-400"}`} />
            <span>AYUSH Mode</span>
            {isAyushMode && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Accessibility: High Contrast & Large Text */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              id="toggle-contrast-btn"
              type="button"
              onClick={onToggleHighContrast}
              className={`p-1.5 rounded text-xs transition-colors ${
                isHighContrast
                  ? "bg-yellow-400 text-black font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="High Contrast Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              id="toggle-large-text-btn"
              type="button"
              onClick={onToggleLargeText}
              className={`p-1.5 rounded text-xs transition-colors ${
                isLargeText
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Large Text Mode for Low Literacy"
            >
              <Type className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Role Switcher: Patient View vs Doctor Portal */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              id="role-patient-btn"
              type="button"
              onClick={() => onRoleChange("patient")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                currentRole === "patient"
                  ? "bg-white text-cyan-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient</span>
            </button>
            <button
              id="role-doctor-btn"
              type="button"
              onClick={() => onRoleChange("doctor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                currentRole === "doctor"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor</span>
              {hasRedFlagActive && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          </div>

          {/* Emergency SOS Button */}
          <button
            id="emergency-sos-header-btn"
            type="button"
            onClick={onOpenSos}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-xs transition-transform active:scale-95"
            title="Immediate Emergency Assistance / Red Flag Triage"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
