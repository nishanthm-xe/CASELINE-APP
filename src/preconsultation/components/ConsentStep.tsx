import React, { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  Lock,
  RotateCcw,
  Shield,
  Stethoscope,
  UserX,
  Volume2,
  VolumeX,
} from "lucide-react";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "../data/languages";

interface ConsentStepProps {
  selectedLanguage: string;
  onAccept: () => void;
  onDecline: () => void;
  onBack: () => void;
  isHighContrast?: boolean;
  isLargeText?: boolean;
}

export const ConsentStep: React.FC<ConsentStepProps> = ({
  selectedLanguage,
  onAccept,
  onDecline,
  onBack,
  isHighContrast = false,
  isLargeText = false,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS["English"];

  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const consentAudioText =
    selectedLanguage === "Hindi"
      ? "केसलाइन में आपका स्वागत है। डॉक्टर से मिलने से पहले, हम आपकी स्वास्थ्य तकलीफों और लक्षणों की जानकारी ले रहे हैं। यह जानकारी केवल आपके डॉक्टर की सहायता के लिए है। आपके डॉक्टर स्वयं हर बात की जांच करेंगे। आप इस सहमति को कभी भी वापस ले सकते हैं। कृपया सहमत होने पर हरा बटन दबाएं।"
      : selectedLanguage === "Tamil"
      ? "கேஸ்லைனிற்கு வரவேற்கிறோம். மருத்துவரை சந்திக்கும் முன் உங்கள் உடல் உபாதைகள் பதிவு செய்யப்படுகின்றன. உங்கள் மருத்துவர் இதை முழுமையாக சரிபார்த்த பின்னரே முடிவு எடுப்பார். நீங்கள் எப்போது வேண்டுமானாலும் இந்த அனுமதியை திரும்பப் பெறலாம்."
      : "Welcome to CaseLine. Before your doctor consultation, we collect your symptoms and health history using voice and touch. This creates a structured clinical draft strictly for your physician's review. AI does not make autonomous diagnoses. You can revoke this consent at any time. Tap Agree to continue.";

  const handleToggleAudio = () => {
    if (!("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(consentAudioText);
      utterance.lang = langConfig.ttsLang;
      utterance.rate = 0.85;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Step Indicator */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2 border border-teal-200">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>Step 2 of 5 — Patient Health Data Consent</span>
        </div>
        <h1
          className={`font-bold tracking-tight ${
            isLargeText ? "text-3xl" : "text-2xl"
          } ${isHighContrast ? "text-white" : "text-slate-900"}`}
        >
          {t.consentTitle}
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-lg mx-auto">
          {t.consentSimpleText}
        </p>
      </div>

      {/* Audio Playback Bar for Low-Literacy Users */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            id="consent-audio-play-btn"
            type="button"
            onClick={handleToggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-md ${
              isPlayingAudio ? "bg-amber-400 text-black animate-pulse" : "bg-white text-cyan-700"
            }`}
          >
            {isPlayingAudio ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>
          <div>
            <h2 className="font-bold text-base leading-tight">
              {isPlayingAudio ? "Speaking in " + langConfig.name + "..." : t.consentReadAloud}
            </h2>
            <p className="text-xs text-cyan-100">
              Tap the speaker icon to listen to an audio explanation
            </p>
          </div>
        </div>

        {isPlayingAudio && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-6 bg-white rounded-full animate-bounce" />
            <span className="w-1.5 h-8 bg-amber-300 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-4 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
        )}
      </div>

      {/* 4 Visual Pillars (Designed for Low-Literacy Comprehension) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-800">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Physician In Control</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              AI creates a draft. Your doctor reviews, edits, and finalizes every clinical record.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Private & Secure</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Encrypted health record storage aligned with ABDM privacy architecture principles.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Freely Revocable</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              You can cancel or revoke data consent at any time without losing hospital care access.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-900">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No Auto-Prescribing</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              AI never issues prescriptions or autonomous diagnoses. It organizes your story.
            </p>
          </div>
        </div>
      </div>

      {/* Explicit Prototype & Legal Separation Disclaimer */}
      <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Prototype Notice: </span>
          This interface demonstrates privacy, consent-revocation, and data-flow workflows. While architected according to ABDM guidelines, it separates prototype testing from statutory legal certification.
        </div>
      </div>

      {/* Actions: Accept, Decline, Review Terms */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          id="consent-back-btn"
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            id="review-consent-modal-btn"
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t.reviewConsent}
          </button>

          <button
            id="decline-consent-btn"
            type="button"
            onClick={onDecline}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserX className="w-4 h-4 text-rose-600" />
            <span>{t.declineConsent}</span>
          </button>

          <button
            id="accept-consent-btn"
            type="button"
            onClick={onAccept}
            className={`w-full sm:w-auto px-6 py-3 font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95 ${
              isLargeText ? "text-lg" : "text-sm"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{t.acceptConsent}</span>
          </button>
        </div>
      </div>

      {/* Review Consent Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              CaseLine Patient Privacy & Data Flow Charter
            </h3>
            <div className="text-xs text-slate-600 space-y-2.5 max-h-80 overflow-y-auto pr-1">
              <p>
                <strong>1. Purpose of Health Intake:</strong> CaseLine captures your reported symptoms, medical timeline, and past records to prepare a preliminary clinical history draft for your attending hospital physician.
              </p>
              <p>
                <strong>2. Physician Verification:</strong> AI does not make autonomous medical diagnoses or dispense prescriptions. All drafts require active physician inspection, modification, and sign-off.
              </p>
              <p>
                <strong>3. Revocation Rights:</strong> You hold the statutory right under ABDM framework to revoke data access at any time through the patient dashboard or hospital front desk.
              </p>
              <p>
                <strong>4. Low-Literacy Safeguards:</strong> Audio prompts and touch cards are provided to ensure complete transparency regardless of technical or literacy background.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700"
              >
                Close Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
