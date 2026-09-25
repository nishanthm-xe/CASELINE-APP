import React, { useEffect } from "react";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { DemographicData, LanguageOption } from "../types";
import { getTranslation } from "../data/languages";
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  Keyboard,
  ShieldCheck,
  Stethoscope,
  Volume2,
} from "lucide-react";

interface BeginHealthInterviewScreenProps {
  patient: DemographicData;
  selectedLanguage: LanguageOption;
  onBeginInterview?: () => void;
  onStartInterview?: () => void;
  onBack: () => void;
}

export const BeginHealthInterviewScreen: React.FC<BeginHealthInterviewScreenProps> = ({
  patient,
  selectedLanguage,
  onBeginInterview,
  onStartInterview,
  onBack,
}) => {
  const t = getTranslation(selectedLanguage.name);
  const handleBegin = onBeginInterview || onStartInterview;

  // Avatar spoken explanation
  const explanationText =
    selectedLanguage.name === "Hindi"
      ? "मैं आपके स्वास्थ्य के बारे में कुछ प्रश्न पूछूंगी। आप बोलकर या लिखकर उत्तर दे सकते हैं।"
      : selectedLanguage.name === "Tamil"
      ? "உங்கள் உடல்நலம் குறித்து சில கேள்விகளைக் கேட்பேன். நீங்கள் பேசியோ அல்லது தட்டச்சு செய்தோ பதிலளிக்கலாம்."
      : selectedLanguage.name === "Telugu"
      ? "నేను మీ ఆరోగ్యం గురించి కొన్ని ప్రశ్నలు అడుగుతాను. మీరు మాట్లాడి లేదా టైప్ చేసి సమాధానం ఇవ్వవచ్చు."
      : selectedLanguage.name === "Kannada"
      ? "ನಾನು ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕೆಲವು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳುತ್ತೇನೆ. ನೀವು ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ಉತ್ತರಿಸಬಹುದು."
      : selectedLanguage.name === "Malayalam"
      ? "നിങ്ങളുടെ ആരോഗ്യത്തെക്കുറിച്ച് ഞാൻ ചില ചോദ്യങ്ങൾ ചോദിക്കും. നിങ്ങൾക്ക് സംസാരിക്കുകയോ ടൈപ്പ് ചെയ്യുകയോ ചെയ്യാം."
      : selectedLanguage.name === "Bengali"
      ? "আমি আপনার স্বাস্থ্য সম্পর্কে কিছু প্রশ্ন জিজ্ঞাসা করব। আপনি কথা বলে বা লিখে উত্তর দিতে পারেন।"
      : selectedLanguage.name === "Marathi"
      ? "मी तुमच्या तब्येतीबद्दल काही प्रश्न विचारेन. तुम्ही बोलून किंवा लिहून उत्तर देऊ शकता."
      : selectedLanguage.name === "Gujarati"
      ? "હું તમારા સ્વાસ્થ્ય વિશે થોડા પ્રશ્નો પૂછીશ. તમે બોલીને અથવા ટાઇપ કરીને જવાબ આપી શકો છો."
      : selectedLanguage.name === "Punjabi"
      ? "ਮੈਂ ਤੁਹਾਡੀ ਸਿਹਤ ਬਾਰੇ ਕੁਝ ਸਵਾਲ ਪੁੱਛਾਂਗੀ। ਤੁਸੀਂ ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਜਵਾਬ ਦੇ ਸਕਦੇ ਹੋ।"
      : selectedLanguage.name === "Odia"
      ? "ମୁଁ ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ବିଷୟରେ କିଛି ପ୍ରଶ୍ନ ପଚାରିବି। ଆପଣ କହି କିମ୍ବା ଟାଇପ୍ କରି ଉତ୍ତର ଦେଇପାରିବେ।"
      : selectedLanguage.name === "Assamese"
      ? "মই আপোনাৰ স্বাস্থ্যৰ বিষয়ে কেইটামান প্ৰশ্ন সুধিম। আপুনি কথা কৈ বা টাইপ কৰি উত্তৰ দিব পাৰে।"
      : selectedLanguage.name === "Urdu"
      ? "میں آپ کی صحت کے بارے میں چند سوالات پوچھوں گی۔ آپ بول کر یا لکھ کر جواب دے سکتے ہیں۔"
      : "I will ask you a few questions about your health. You can speak or type your answers.";

  // Speak explanation upon screen load
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(explanationText);
      utterance.lang = selectedLanguage.ttsLang || "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedLanguage]);

  return (
    <div
      id="begin-health-interview-screen"
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
            <p className="text-[10px] font-bold text-sky-700">{t.tagline}</p>
          </div>
        </div>

        <div className="text-xs font-bold text-sky-800 bg-sky-100/70 border border-sky-200 px-3 py-1 rounded-full">
          {selectedLanguage.name} ({selectedLanguage.nativeName})
        </div>
      </div>

      {/* Main Area: 2 Columns (LEFT: Instructions & Begin Interview | RIGHT: Video AI Avatar) */}
      <div className="max-w-5xl mx-auto w-full my-6 flex flex-col-reverse md:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side: Information & Action */}
        <div className="w-full md:w-7/12 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-extrabold mb-3">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
            <span>Patient Intake Step</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Begin Health Interview
          </h2>

          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            Welcome, <span className="font-bold text-slate-900">{patient.name || "Patient"}</span> (ID: {patient.patientId}).
            Our AI Clinical Assistant will guide you through an adaptive health interview in your chosen language.
          </p>

          {/* Key Features Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full my-6">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Speak Naturally</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Tap the microphone and speak in {selectedLanguage.name}.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Type Anytime</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Type your answers or tap quick touch options.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted and verified for your attending doctor.</span>
          </div>

          {/* Buttons: Begin Interview & Back */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              type="button"
              id="begin-interview-btn"
              onClick={handleBegin}
              className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-base shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
              <span>Begin Interview</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-base shadow-2xs transition-colors cursor-pointer"
            >
              <span>{t.back}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Video AI Avatar with Verbal Guidance */}
        <div className="w-full md:w-5/12 flex flex-col items-center text-center">
          <CaseLineAvatar
            character="female"
            size="hero"
            mood="SPEAKING"
            pose="interview"
            showStatusBadge={true}
          />

          {/* Speech Bubble */}
          <div className="mt-4 relative bg-white border border-sky-200 rounded-3xl p-5 shadow-lg max-w-sm text-center">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-sky-200 rotate-45" />
            <p className="relative z-10 text-base font-extrabold text-slate-900 leading-snug">
              "{explanationText}"
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs font-bold text-sky-700">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Speaking in {selectedLanguage.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto text-center text-xs text-slate-400 border-t border-slate-200/60 pt-4">
        CASE LINE Multilingual Clinical AI Platform • Patient Intake
      </div>
    </div>
  );
};
