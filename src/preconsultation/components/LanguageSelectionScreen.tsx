import React, { useState } from "react";
import { LanguageOption } from "../types";
import { SUPPORTED_LANGUAGES, getTranslation } from "../data/languages";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { Check, ArrowLeft, Volume2, Stethoscope } from "lucide-react";

interface LanguageSelectionScreenProps {
  currentLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  currentLanguage,
  onSelectLanguage,
  onConfirm,
  onBack,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const t = getTranslation(currentLanguage.name);

  // All 13 supported Indian languages
  const targetLanguages = [
    "English",
    "Hindi",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Punjabi",
    "Odia",
    "Assamese",
    "Urdu",
  ];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((l) =>
    targetLanguages.includes(l.name)
  ).sort(
    (a, b) => targetLanguages.indexOf(a.name) - targetLanguages.indexOf(b.name)
  );

  const handlePlaySample = (e: React.MouseEvent, lang: LanguageOption) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lang.samplePhrase);
      utterance.lang = lang.ttsLang;
      utterance.rate = 0.95;

      setIsPlayingAudio(lang.code);
      utterance.onend = () => setIsPlayingAudio(null);
      utterance.onerror = () => setIsPlayingAudio(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      id="language-selection-screen"
      className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/50 flex flex-col justify-between px-4 py-6 md:py-8"
    >
      {/* Top Header Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-2xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
              CASE LINE
            </h1>
            <p className="text-[10px] font-bold text-sky-700">
              {t.tagline}
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-sky-800 bg-sky-100/70 border border-sky-200 px-3 py-1 rounded-full">
          13 Indian Languages
        </div>
      </div>

      {/* Main Content Area: LEFT/MAIN: Language Cards | RIGHT: Video AI Avatar */}
      <div className="max-w-5xl mx-auto w-full my-6 flex flex-col-reverse md:flex-row items-center md:items-start gap-8">
        {/* LEFT / MAIN: Title, Subtitle, Language Grid */}
        <div className="w-full md:w-7/12 flex flex-col">
          <div className="mb-4 text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.selectLanguageTitle || "Select Your Language"}
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {t.selectLanguageSubtitle || "Choose your preferred Indian language to begin health intake"}
            </p>
          </div>

          {/* 13 Language Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
            {filteredLanguages.map((lang) => {
              const isSelected = currentLanguage.name === lang.name;
              const isPlayingThis = isPlayingAudio === lang.code;

              return (
                <div
                  key={lang.code}
                  id={`lang-card-${lang.code}`}
                  onClick={() => {
                    onSelectLanguage(lang);
                    if ("speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                      const greeting = new SpeechSynthesisUtterance(lang.samplePhrase);
                      greeting.lang = lang.ttsLang;
                      window.speechSynthesis.speak(greeting);
                    }
                  }}
                  className={`relative rounded-2xl p-3.5 text-left border transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? "bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-400/40"
                      : "bg-white border-slate-200 hover:border-sky-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                        isSelected
                          ? "bg-sky-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {lang.flagOrIcon || lang.code.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handlePlaySample(e, lang)}
                        title={`Listen to ${lang.name} sample`}
                        className={`p-1 rounded-lg transition-colors ${
                          isPlayingThis
                            ? "bg-teal-500 text-white animate-pulse"
                            : "text-slate-400 hover:text-sky-600 hover:bg-sky-100"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                      {lang.nativeName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {lang.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Note & Continue to Login Button */}
          <div className="mt-5 space-y-3">
            <p className="text-xs font-medium text-slate-500 text-center sm:text-left flex items-center gap-1.5 justify-center sm:justify-start">
              <Volume2 className="w-3.5 h-3.5 text-sky-600" />
              <span>{t.testVoice}</span>
            </p>

            <button
              type="button"
              id="language-continue-btn"
              onClick={onConfirm}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-base shadow-lg shadow-sky-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Continue to Patient Login →</span>
            </button>
          </div>
        </div>

        {/* RIGHT AREA: Video AI Avatar with Speech Bubble */}
        <div className="w-full md:w-5/12 flex flex-col items-center text-center">
          <CaseLineAvatar
            character="female"
            size="xl"
            mood={isPlayingAudio ? "SPEAKING" : "IDLE"}
            pose="language"
            showStatusBadge={true}
          />

          {/* Speech bubble pointing to avatar */}
          <div className="mt-4 relative bg-white border border-sky-200 rounded-3xl p-4 shadow-md max-w-xs text-center">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-sky-200 rotate-45" />
            <p className="relative z-10 text-sm md:text-base font-extrabold text-slate-900 leading-snug">
              "{currentLanguage.samplePhrase}"
            </p>
            <p className="relative z-10 text-xs font-bold text-sky-700 mt-1.5">
              {currentLanguage.name} ({currentLanguage.nativeName})
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto text-center text-xs text-slate-400 pt-2">
        CASE LINE Multilingual Healthcare AI • {currentLanguage.name} ({currentLanguage.nativeName})
      </div>
    </div>
  );
};
