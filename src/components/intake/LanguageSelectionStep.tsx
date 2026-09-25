import React, { useState, useMemo } from 'react';
import {
  Globe2,
  Volume2,
  Check,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { CaseLineAvatar } from './CaseLineAvatar';
import { CASELINE_13_LANGUAGES } from './CaseLineIntakeHeader';

interface LanguageSelectionStepProps {
  selectedLanguage: string;
  onSelectLanguage: (langCode: string) => void;
  onContinue: () => void;
}

export const LanguageSelectionStep: React.FC<LanguageSelectionStepProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onContinue,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Active language object
  const activeLang = useMemo(() => {
    return (
      CASELINE_13_LANGUAGES.find((l) => l.code === selectedLanguage) ||
      CASELINE_13_LANGUAGES[0]
    );
  }, [selectedLanguage]);

  // Audio testing function for selected language
  const handleTestAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(true);

      const greetings: Record<string, string> = {
        en: 'Hello! Welcome to Case Line. How are you feeling today?',
        hi: 'नमस्ते! केस लाइन में आपका स्वागत है। आज आप कैसा महसूस कर रहे हैं?',
        ta: 'வணக்கம்! கேஸ் லைனுக்கு வரவேற்கிறோம். இன்று உங்கள் உடல்நிலை எப்படி உள்ளது?',
        te: 'నమస్కారం! కేస్ లైన్‌కి స్వాగతం. ఈ రోజు మీ ఆరోగ్యం ఎలా ఉంది?',
        kn: 'ನಮಸ್ಕಾರ! ಕೇಸ್ ಲೈನ್‌ಗೆ ಸ್ವಾಗತ. ಇಂದು ನಿಮ್ಮ ಆರೋಗ್ಯ ಹೇಗಿದೆ?',
        ml: 'നമസ്കാരം! കേസ് ലൈനിലേക്ക് സ്വാഗതം. ഇന്ന് നിങ്ങൾക്ക് എങ്ങനെയുണ്ട്?',
        bn: 'নমস্কার! কেস লাইনে আপনাকে স্বাগতম। আজ আপনার শরীর কেমন আছে?',
        mr: 'नमस्कार! केस लाइनमध्ये आपले स्वागत आहे. आज आपल्याला कसे वाटत आहे?',
        gu: 'નમસ્તે! કેસ લાઈનમાં આપનું સ્વાગત છે. આજે તમારી તબિયત કેવી છે?',
        pa: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਕੇਸ ਲਾਈਨ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?',
        or: 'ନମସ୍କାର! କେସ୍ ଲାଇନକୁ ସ୍ୱାଗତ। ଆଜି ଆପଣ କିପରି ଅନୁଭବ କରୁଛନ୍ତି?',
        as: 'নমস্কাৰ! কেচ লাইনলৈ স্বাগতম। আজি আপোনাৰ স্বাস্থ্য কেনে আছে?',
        ur: 'السلام علیکم! کیس لائن میں خوش آمدید۔ آج آپ کیسی طبیعت محسوس کر رہے ہیں؟',
      };

      const textToSpeak = greetings[selectedLanguage] || greetings['en'];
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        pa: 'pa-IN',
        or: 'or-IN',
        as: 'as-IN',
        ur: 'ur-IN',
      };
      utterance.lang = langMap[selectedLanguage] || 'en-IN';
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Heading */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Globe2 className="w-4 h-4 text-teal-600" />
          <span>Patient Intake • Step 1 of 8</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Your Preferred Language
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
          Choose the language you feel most comfortable speaking in today. Case Line AI will conduct your entire pre-consultation interview and extract your clinical symptoms in this language.
        </p>
      </div>

      {/* Main Grid: 13 Language Options on Left + Avatar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 13 Language Cards Grid */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Available Consultation Languages (13)
            </span>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Selected: {activeLang.name} ({activeLang.nativeName})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {CASELINE_13_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-teal-500 shadow-md scale-[1.02]'
                      : 'bg-slate-50/80 hover:bg-white text-slate-800 border-slate-200 hover:border-teal-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div
                        className={`text-base font-bold tracking-tight ${
                          isSelected ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {lang.name}
                      </div>
                      <div
                        className={`text-xs font-medium mt-0.5 ${
                          isSelected ? 'text-teal-300' : 'text-slate-500'
                        }`}
                      >
                        {lang.nativeName}
                      </div>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 font-bold'
                          : 'bg-white text-slate-400 group-hover:text-teal-600 border border-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                    <span
                      className={`font-semibold ${
                        isSelected ? 'text-teal-200' : 'text-teal-700'
                      }`}
                    >
                      Voice & Text Active
                    </span>
                    {isSelected && (
                      <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: CASE LINE Avatar + Speech Bubble + Test Voice Audio + Continue to Login */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6 text-center flex flex-col items-center">
          <div className="w-full flex items-center justify-center">
            <CaseLineAvatar
              state={isPlayingAudio ? 'SPEAKING' : 'IDLE'}
              size="lg"
              variant="female"
              languageName={activeLang.name}
              speechBubbleTitle="CASE LINE AI Assistant"
              speechBubbleText={`Please select the language you feel most comfortable speaking. I will conduct your full clinical intake in ${activeLang.name} (${activeLang.nativeName}).`}
              showStatusPill={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3 pt-2">
            {/* Test Voice Audio */}
            <button
              type="button"
              onClick={handleTestAudio}
              disabled={isPlayingAudio}
              className="w-full py-3 px-4 rounded-2xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              <Volume2 className={`w-4 h-4 text-teal-600 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span>{isPlayingAudio ? 'Playing Greeting Audio...' : `Test Voice Audio (${activeLang.name})`}</span>
            </button>

            {/* Continue to Patient Login */}
            <button
              type="button"
              onClick={onContinue}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
            >
              <span>Continue to Patient Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 text-left w-full space-y-1">
            <span className="font-bold text-slate-700 block">ABDM & HIPAA Language Compliance:</span>
            <p>Your selected language preference is locked into your clinical session header and reflected in doctor-facing summaries.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
