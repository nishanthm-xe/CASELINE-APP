import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Globe2,
  PhoneCall,
  Stethoscope,
  Volume2,
  Type,
  Sun,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Check,
} from 'lucide-react';
import { INDIAN_LANGUAGES, IndianLanguage } from '../../lib/languages';

// The 13 official supported languages from the Case Line specification
export const CASELINE_13_LANGUAGES: {
  code: string;
  name: string;
  nativeName: string;
  displayName: string;
}[] = [
  { code: 'en', name: 'English', nativeName: 'English', displayName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', displayName: 'Hindi (हिन्दी)' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', displayName: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', displayName: 'Telugu (తెలుగు)' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', displayName: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', displayName: 'Malayalam (മലയാളം)' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', displayName: 'Bengali (বাংলা)' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', displayName: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', displayName: 'Gujarati (ગુજરાતી)' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', displayName: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', displayName: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', displayName: 'Assamese (অসমীয়া)' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', displayName: 'Urdu (اردو)' },
];

interface CaseLineIntakeHeaderProps {
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onOpenDoctorPortal?: () => void;
  onTriggerSOS?: () => void;
  currentStepTitle?: string;
}

export const CaseLineIntakeHeader: React.FC<CaseLineIntakeHeaderProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onBack,
  canGoBack = false,
  onOpenDoctorPortal,
  onTriggerSOS,
  currentStepTitle,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [soundFeedback, setSoundFeedback] = useState(true);

  const currentLang =
    CASELINE_13_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    CASELINE_13_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Back Button + CASE LINE Logo Branding */}
        <div className="flex items-center gap-3">
          {canGoBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Go Back to Previous Step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2.5 select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  CASE<span className="text-teal-600 ml-1">LINE</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 rounded-md border border-teal-200">
                  CARE
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 leading-none mt-0.5 hidden sm:block">
                Your Voice. Better Care.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Step Indicator Title (if provided) */}
        {currentStepTitle && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>{currentStepTitle}</span>
          </div>
        )}

        {/* Right: Accessibility Controls + Language Selector + Doctor Portal + SOS */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Accessibility Controls: Font Size & Voice Feedback */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setFontSize((f) => (f === 'normal' ? 'large' : 'normal'))}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                fontSize === 'large'
                  ? 'bg-white text-teal-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toggle Large Accessibility Font"
            >
              <Type className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSoundFeedback((s) => !s)}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                soundFeedback
                  ? 'bg-white text-teal-700 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Voice Prompt Audio Feedback"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition-colors border border-slate-200/90 shadow-2xs cursor-pointer"
              title="Select Language"
            >
              <Globe2 className="w-3.5 h-3.5 text-teal-600" />
              <span className="max-w-[70px] sm:max-w-none truncate">{currentLang.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Intake Language (13 Options)
                </div>
                {CASELINE_13_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-teal-50 transition-colors ${
                      selectedLanguage === lang.code
                        ? 'font-bold text-teal-800 bg-teal-50/70'
                        : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{lang.name}</span>
                      <span className="text-[11px] text-slate-400">{lang.nativeName}</span>
                    </div>
                    {selectedLanguage === lang.code && (
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Doctor Portal Button */}
          {onOpenDoctorPortal && (
            <button
              type="button"
              onClick={onOpenDoctorPortal}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              title="Switch to Doctor Review Portal"
            >
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Doctor Portal</span>
            </button>
          )}

          {/* SOS Button */}
          <button
            type="button"
            onClick={onTriggerSOS || (() => window.open('tel:108'))}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black tracking-wide shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
            title="Emergency Medical Assistance (108)"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
