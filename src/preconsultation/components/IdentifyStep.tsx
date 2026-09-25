import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Globe,
  IdCard,
  ShieldCheck,
  UserCheck,
  Volume2,
} from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../data/languages";
import { DemographicData } from "../types";

interface IdentifyStepProps {
  patient: DemographicData;
  onUpdatePatient: (data: Partial<DemographicData>) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onProceed: () => void;
  isHighContrast?: boolean;
  isLargeText?: boolean;
}

export const IdentifyStep: React.FC<IdentifyStepProps> = ({
  patient,
  onUpdatePatient,
  selectedLanguage,
  onLanguageChange,
  onProceed,
  isHighContrast = false,
  isLargeText = false,
}) => {
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [isAbhaVerified, setIsAbhaVerified] = useState(true);
  const [isVerifyingAbha, setIsVerifyingAbha] = useState(false);
  const [abhaInput, setAbhaInput] = useState(patient.abhaId || "91-4523-8891-2304");
  const [playingSample, setPlayingSample] = useState<string | null>(null);

  const handleVerifyAbha = () => {
    setIsVerifyingAbha(true);
    setTimeout(() => {
      setIsVerifyingAbha(false);
      setIsAbhaVerified(true);
      onUpdatePatient({ abhaId: abhaInput });
    }, 600);
  };

  const handlePlayVoiceSample = (langCode: string, phrase: string, ttsLang: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = ttsLang;
      utterance.rate = 0.9;
      setPlayingSample(langCode);
      utterance.onend = () => setPlayingSample(null);
      utterance.onerror = () => setPlayingSample(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Progress & Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          <span>Step 1 of 5 — Patient Identification</span>
        </div>
        <h1
          className={`font-bold tracking-tight ${
            isLargeText ? "text-3xl" : "text-2xl"
          } ${isHighContrast ? "text-white" : "text-slate-900"}`}
        >
          Welcome to CaseLine
        </h1>
        <p
          className={`mt-1 text-slate-500 max-w-xl mx-auto ${
            isLargeText ? "text-base" : "text-sm"
          }`}
        >
          Complete your clinical intake comfortably in your preferred language before seeing your doctor.
        </p>
      </div>

      {/* Mode Switch: New Registration vs Quick Patient Login */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            id="tab-new-patient"
            type="button"
            onClick={() => setIsNewPatient(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isNewPatient
                ? "bg-white text-cyan-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            New Patient Registration
          </button>
          <button
            id="tab-existing-patient"
            type="button"
            onClick={() => setIsNewPatient(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              !isNewPatient
                ? "bg-white text-cyan-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Existing Patient Login
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div
        className={`rounded-2xl p-6 shadow-sm border transition-colors ${
          isHighContrast
            ? "bg-zinc-900 border-yellow-400 text-white"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Language Selection Grid with Native Scripts & Voice Previews */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-600" />
              <span>Select Your Language (भाषा चुनें / மொழியைத் தேர்ந்தெடுக்கவும்)</span>
            </label>
            <span className="text-xs text-slate-500">
              Interaction remains in this language
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              const isSpeaking = playingSample === lang.code;

              return (
                <div
                  key={lang.code}
                  className={`relative p-3 rounded-xl border cursor-pointer text-center transition-all ${
                    isSelected
                      ? "border-cyan-600 bg-cyan-50/80 text-cyan-900 ring-2 ring-cyan-500 font-semibold"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700"
                  }`}
                  onClick={() => onLanguageChange(lang.code)}
                >
                  <p className="text-sm font-bold">{lang.nativeName}</p>
                  <p className="text-xs text-slate-500">{lang.name}</p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayVoiceSample(lang.code, lang.samplePhrase, lang.ttsLang);
                    }}
                    className={`mt-2 p-1 rounded-full inline-flex items-center justify-center text-xs transition-colors ${
                      isSpeaking
                        ? "bg-cyan-600 text-white animate-pulse"
                        : "bg-white hover:bg-cyan-100 text-slate-600 border border-slate-200"
                    }`}
                    title={`Play audio in ${lang.name}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ABHA ID Section (Ayushman Bharat Digital Mission) */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                ABHA
              </div>
              <div>
                <h3 className="text-sm font-bold text-teal-950">
                  Ayushman Bharat Health Account (ABHA ID)
                </h3>
                <p className="text-xs text-teal-800">
                  Link existing digital health records from national repository
                </p>
              </div>
            </div>
            {isAbhaVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            ) : null}
          </div>

          <div className="flex gap-2">
            <input
              id="abha-id-input"
              type="text"
              value={abhaInput}
              onChange={(e) => {
                setAbhaInput(e.target.value);
                setIsAbhaVerified(false);
              }}
              placeholder="e.g. 91-4523-8891-2304"
              className="flex-1 px-3 py-2 text-sm bg-white border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
            <button
              id="verify-abha-btn"
              type="button"
              disabled={isVerifyingAbha}
              onClick={handleVerifyAbha}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-700 text-white hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              {isVerifyingAbha ? "Verifying..." : "Verify ABHA"}
            </button>
          </div>
        </div>

        {/* Demographics Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Legal Name *
            </label>
            <input
              id="patient-name-input"
              type="text"
              value={patient.name}
              onChange={(e) => onUpdatePatient({ name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="e.g. Ramesh Kumar"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age (Years) *
              </label>
              <input
                id="patient-age-input"
                type="number"
                value={patient.age}
                onChange={(e) => onUpdatePatient({ age: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="58"
                min={1}
                max={120}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender *
              </label>
              <select
                id="patient-gender-select"
                value={patient.gender}
                onChange={(e) => onUpdatePatient({ gender: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Phone (for SMS Token)
            </label>
            <input
              id="patient-phone-input"
              type="tel"
              value={patient.phone}
              onChange={(e) => onUpdatePatient({ phone: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="+91 98451 23098"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Patient ID / MRN</span>
              <span className="text-[10px] text-cyan-600 font-normal">Auto-assigned</span>
            </label>
            <div className="flex items-center px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600">
              <IdCard className="w-4 h-4 mr-2 text-slate-400" />
              <span>{patient.patientId || "PID-2026-8819"}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            id="proceed-to-consent-btn"
            type="button"
            onClick={onProceed}
            className={`w-full sm:w-auto px-6 py-3 font-bold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95 ${
              isLargeText ? "text-lg" : "text-sm"
            }`}
          >
            <span>Confirm Identity & Proceed to Consent</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
