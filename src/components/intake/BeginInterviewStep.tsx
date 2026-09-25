import React from 'react';
import {
  Mic,
  Keyboard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Volume2,
  Activity,
  HeartPulse,
  CheckCircle2,
} from 'lucide-react';
import { CaseLineAvatar } from './CaseLineAvatar';
import { CASELINE_13_LANGUAGES } from './CaseLineIntakeHeader';

interface BeginInterviewStepProps {
  patientName: string;
  patientId: string;
  selectedLanguage: string;
  onBeginInterview: () => void;
  onBack: () => void;
}

export const BeginInterviewStep: React.FC<BeginInterviewStepProps> = ({
  patientName,
  patientId,
  selectedLanguage,
  onBeginInterview,
  onBack,
}) => {
  const activeLang =
    CASELINE_13_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    CASELINE_13_LANGUAGES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Patient Intake Step Badge */}
        <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 flex items-center gap-1.5">
          <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
          <span>Patient Intake Step • Step 3 of 8</span>
        </span>
      </div>

      {/* Main Focus Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm text-center space-y-8">
        {/* Patient Identity & Selected Language Banner */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 p-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl font-bold text-slate-900 shadow-2xs border border-slate-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Patient: {patientName}</span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="font-mono text-slate-600 font-semibold px-2">ID: {patientId}</span>
          <span className="text-slate-400">•</span>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 rounded-xl font-bold text-teal-800 border border-teal-200">
            <span>Language: {activeLang.name} ({activeLang.nativeName})</span>
          </div>
        </div>

        {/* Title */}
        <div className="max-w-2xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Begin Health Interview
          </h1>
          <p className="text-xs sm:text-base text-slate-500 leading-relaxed">
            Your personal CASE LINE clinical assistant will guide you through a step-by-step clinical history conversation. You can speak naturally in your chosen language or type at any time.
          </p>
        </div>

        {/* CASE LINE Female Healthcare Avatar with Circular Frame, Glow & Speech Bubble */}
        <div className="flex flex-col items-center justify-center py-2">
          <CaseLineAvatar
            state="SPEAKING"
            size="lg"
            variant="female"
            languageName={activeLang.name}
            speechBubbleTitle="CASE LINE Clinical Assistant"
            speechBubbleText={`Hello ${patientName}! I am ready to conduct your pre-consultation health interview in ${activeLang.name} (${activeLang.nativeName}). Tap 'Begin Interview' whenever you are ready.`}
            showStatusPill={true}
          />
        </div>

        {/* Key Feature Pills: "Speak Naturally" & "Type Anytime" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">Speak Naturally</span>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Answer each medical question using your normal voice in {activeLang.name}.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">Type Anytime</span>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Prefer typing or in a noisy space? Use interactive quick-reply pills or type answers.
              </p>
            </div>
          </div>
        </div>

        {/* Encrypted / Verified Message */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 max-w-md mx-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>ABDM 256-Bit Encrypted & Verified • Confidential Pre-Consultation</span>
        </div>

        {/* Main CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onBeginInterview}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Begin Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
