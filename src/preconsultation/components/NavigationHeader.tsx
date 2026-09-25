import React from "react";
import {
  Heart,
  Globe,
  Stethoscope,
  Sliders,
  AlertOctagon,
  Languages,
  User,
  Settings,
  Eye,
} from "lucide-react";
import {
  PatientScreen,
  LanguageOption,
  DemographicData,
  ActiveRole,
} from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";

interface NavigationHeaderProps {
  currentScreen: PatientScreen;
  onNavigate: (screen: PatientScreen) => void;
  selectedLanguage: LanguageOption;
  patient: DemographicData;
  activeRole: ActiveRole;
  onToggleRole: () => void;
  onTriggerSos: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  isLargeText: boolean;
  onToggleLargeText: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentScreen,
  onNavigate,
  selectedLanguage,
  patient,
  activeRole,
  onToggleRole,
  onTriggerSos,
  isHighContrast,
  onToggleHighContrast,
  isLargeText,
  onToggleLargeText,
}) => {
  // If in pure onboarding screens (welcome or language selection), show simplified header
  const isMinimalHeader =
    currentScreen === "welcome" || currentScreen === "language-selection";

  return (
    <header
      id="caseline-navigation-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo & Identity */}
        <div
          onClick={() => onNavigate(patient.patientId ? "dashboard" : "welcome")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Subtle Mini Avatar icon in header */}
          <div className="relative">
            <CaseLineAvatar
              size="sm"
              mood="IDLE"
              pose="dashboard"
              showStatusBadge={false}
              className="group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 flex items-center">
                CASE<span className="text-sky-600 ml-0.5">LINE</span>
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 tracking-wider uppercase">
                Care
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
              Your Voice. Better Care.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Language Pill */}
          <button
            type="button"
            id="nav-language-select-btn"
            onClick={() => onNavigate("language-selection")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
            title="Change Indian language"
          >
            <Languages className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">{selectedLanguage.name}</span>
            <span className="text-sky-700 font-bold font-sans">
              ({selectedLanguage.nativeName})
            </span>
          </button>

          {/* Accessibility: Contrast & Text sizing */}
          <div className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              type="button"
              onClick={onToggleHighContrast}
              className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                isHighContrast
                  ? "bg-slate-900 text-yellow-300 shadow-xs"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              title="Toggle High Contrast"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToggleLargeText}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-colors ${
                isLargeText
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              title="Toggle Accessible Large Text"
            >
              A+
            </button>
          </div>

          {/* Role Switcher: Patient / Doctor Portal */}
          <button
            type="button"
            onClick={onToggleRole}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer ${
              activeRole === "doctor"
                ? "bg-purple-600 border-purple-600 text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
            }`}
            title="Switch between Patient and Attending Doctor view"
          >
            <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">
              {activeRole === "patient" ? "Doctor Portal" : "Patient App"}
            </span>
          </button>

          {/* Quick Settings Icon */}
          <button
            type="button"
            onClick={() => onNavigate("settings")}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Voice & Avatar Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Emergency SOS Button */}
          <button
            type="button"
            id="global-sos-btn"
            onClick={onTriggerSos}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Emergency SOS hotline & hospital alert"
          >
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
