import React from "react";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { LanguageOption } from "../types";
import { getTranslation } from "../data/languages";
import {
  Sparkles,
  Globe2,
  HeartHandshake,
  Clock,
  ShieldCheck,
  Stethoscope,
  Languages,
} from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSelectLanguage?: () => void;
  selectedLanguage?: LanguageOption;
  onQuickLogin?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onSelectLanguage,
  selectedLanguage,
  onQuickLogin,
}) => {
  const currentLang = selectedLanguage?.name || "English";
  const t = getTranslation(currentLang);

  const highlights = [
    {
      icon: Sparkles,
      title: "AI-Powered History Taking",
      desc: "Adaptive clinical intake that understands your symptoms contextually",
      color: "text-sky-600 bg-sky-50 border-sky-200",
    },
    {
      icon: Globe2,
      title: "13 Indian Languages",
      desc: "Speak comfortably in Tamil, Hindi, Telugu, Kannada, Bengali, Odia & more",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      icon: HeartHandshake,
      title: "Patient Friendly",
      desc: "Large touch buttons, voice recording, and intuitive prompts",
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
    {
      icon: Clock,
      title: "Faster Consultation",
      desc: "Pre-organized clinical notes save doctor consultation time",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Private",
      desc: "ABDM compliant, encrypted storage with doctor-only verification",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  const welcomeGreeting = selectedLanguage && selectedLanguage.name !== "English"
    ? `${selectedLanguage.samplePhrase}\nWelcome to CaseLine!`
    : "Welcome to\nCaseLine!\nI'm here to help you.";

  return (
    <div
      id="welcome-screen"
      className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/50 flex flex-col justify-between px-4 py-8 md:py-12"
    >
      {/* Top Header Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
              CASE LINE
            </h1>
            <p className="text-xs font-bold text-sky-700 tracking-wide mt-0.5">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Supporting taglines & action */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs font-extrabold text-sky-900 bg-sky-100/70 border border-sky-200 px-3 py-1 rounded-full">
            <span>Better Patients</span>
            <span>•</span>
            <span>Healthier India</span>
          </div>

          {onSelectLanguage && (
            <button
              type="button"
              onClick={onSelectLanguage}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-sky-600" />
              <span>{selectedLanguage ? `${selectedLanguage.name}` : "Language"}</span>
            </button>
          )}

          {onQuickLogin && (
            <button
              type="button"
              onClick={onQuickLogin}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              {t.login}
            </button>
          )}
        </div>
      </div>

      {/* Center Hero Section */}
      <div className="max-w-2xl mx-auto w-full flex flex-col items-center text-center my-6 md:my-8">
        {/* Main female doctor avatar with authentic speech bubble */}
        <div className="flex flex-col items-center mb-6">
          <CaseLineAvatar
            character="female"
            size="hero"
            mood="IDLE"
            pose="welcome"
            showStatusBadge={true}
          />
          {/* Speech bubble */}
          <div className="mt-4 relative bg-white border border-sky-200 rounded-3xl p-4 shadow-lg text-center max-w-sm">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-sky-200 rotate-45" />
            <p className="relative z-10 text-base md:text-lg font-extrabold text-slate-900 leading-snug whitespace-pre-line">
              {welcomeGreeting}
            </p>
          </div>
        </div>

        {/* Feature List (Exact reference 5 items) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left mt-2">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex items-center gap-3"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Action Button: Get Started → */}
        <div className="w-full max-w-sm mt-8">
          <button
            type="button"
            id="welcome-get-started-btn"
            onClick={onGetStarted}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-lg shadow-lg shadow-sky-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>{t.getStarted} →</span>
          </button>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 mt-3">
            <span>Better Patients</span>
            <span>•</span>
            <span>Healthier India</span>
          </div>
        </div>
      </div>

      {/* Footer reassurance */}
      <div className="max-w-md mx-auto text-center text-xs text-slate-400 border-t border-slate-200/60 pt-4">
        CASE LINE Multilingual Clinical AI Platform • Designed for Indian Healthcare
      </div>
    </div>
  );
};
