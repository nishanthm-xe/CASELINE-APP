import React, { useState, useEffect } from "react";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { LanguageOption, DemographicData } from "../types";
import { getTranslation } from "../data/languages";
import { loginPatient } from "../services/apiService";
import { useLanguage } from "../context/LanguageContext";
import {

  ArrowLeft,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  HelpCircle,
  Stethoscope,
  ShieldCheck,
  Volume2,
  AlertCircle,
} from "lucide-react";

interface LoginScreenProps {
  currentLanguage: LanguageOption;
  onLoginSuccess: (patient: DemographicData, token?: string) => void;
  onBack: () => void;
  defaultPatient: DemographicData;
  onSwitchToDoctor?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  currentLanguage,
  onLoginSuccess,
  onBack,
  defaultPatient,
  onSwitchToDoctor,
}) => {
  const t = getTranslation(currentLanguage.name);
  const [activeTab, setActiveTab] = useState<"patient" | "doctor">("patient");
  const [patientId, setPatientId] = useState(defaultPatient.patientId || "PID-2026-8819");
  const [password, setPassword] = useState("pass123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { t: translate } = useLanguage();

  // Avatar guidance in selected language
  const rawGuidance =

    currentLanguage.name === "Hindi"
      ? "कृपया अपना पेशेंट आईडी और पासवर्ड दर्ज करें।"
      : currentLanguage.name === "Tamil"
      ? "தயவுசெய்து உங்கள் நோயாளி ஐடி மற்றும் கடவுச்சொல்லை உள்ளிடவும்."
      : currentLanguage.name === "Telugu"
      ? "దయచేసి మీ పేషెంట్ ఐడి మరియు పాస్‌వర్డ్‌ను నమోదు చేయండి."
      : currentLanguage.name === "Kannada"
      ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ರೋಗಿಯ ಐಡಿ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ."
      : currentLanguage.name === "Malayalam"
      ? "ദയവായി നിങ്ങളുടെ പേഷ്യന്റ് ഐഡിയും പാസ്‌വേഡും നൽകുക."
      : currentLanguage.name === "Bengali"
      ? "অনুগ্রহ করে আপনার পেশেন্ট আইডি এবং পাসওয়ার্ড লিখুন।"
      : currentLanguage.name === "Marathi"
      ? "कृपया तुमचा पेशंट आयडी आणि पासवर्ड टाका."
      : currentLanguage.name === "Gujarati"
      ? "કૃપા કરીને તમારું પેશન્ટ આઈડી અને પાસવર્ડ દાખલ કરો."
      : currentLanguage.name === "Punjabi"
      ? "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪੇਸ਼ੈਂਟ ਆਈਡੀ ਅਤੇ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ।"
      : currentLanguage.name === "Odia"
      ? "ଦୟାକରି ଆପଣଙ୍କର ରୋଗୀ ଆଇଡି ଏବଂ ପାସୱାର୍ଡ ପ୍ରବେଶ କରନ୍ତୁ।"
      : currentLanguage.name === "Assamese"
      ? "অনুগ্ৰহ কৰি আপোনাৰ ৰোগীৰ আইডি আৰু পাছৱৰ্ড প্ৰবিষ্ট কৰক।"
      : currentLanguage.name === "Urdu"
      ? "براہ کرم اپنا پیشنٹ آئی ڈی اور پاس ورڈ درج کریں۔"
      : "Please enter your Patient ID and Password.";

  const verbalGuidance = translate("login.verbalGuidance", rawGuidance);


  // Speak guidance on mount / language change
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(verbalGuidance);
      utterance.lang = currentLanguage.ttsLang || "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentLanguage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "doctor") {
      if (onSwitchToDoctor) {
        onSwitchToDoctor();
      }
      return;
    }

    if (!patientId.trim()) {
      setError(
        translate("login.invalidIdError", "Please enter a valid Patient ID or ABHA ID")
      );
      return;
    }

    if (!password || password.length < 3) {
      setError(
        translate("login.invalidPassError", "Password must be at least 3 characters")
      );
      return;
    }


    setError(null);
    setIsLoading(true);

    try {
      const result = await loginPatient({
        patientId: patientId.trim(),
        password: password.trim(),
        language: currentLanguage.name,
      });

      if (result.success && result.patient) {
        onLoginSuccess(result.patient, result.token);
      } else {
        setError(
          result.error ||
            translate(
              "login.loginFailed",
              "Authentication failed. Please verify your credentials."
            )
        );

      }
    } catch (err) {
      onLoginSuccess({
        ...defaultPatient,
        patientId: patientId.trim().toUpperCase(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="login-screen"
      className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/50 flex flex-col justify-between px-4 py-6 md:py-8"
    >
      {/* Header Bar */}
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

        <button
          type="button"
          onClick={() => setShowForgotModal(true)}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-sky-600 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
          title="Help & Information"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area: LEFT/MAIN: Login Form | RIGHT: Video AI Avatar */}
      <div className="max-w-5xl mx-auto w-full my-6 flex flex-col-reverse md:flex-row items-center md:items-start gap-8 lg:gap-12">
        {/* LEFT / MAIN: Login Form */}
        <div className="w-full md:w-7/12 flex flex-col">
          <div className="mb-4 text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.patientLogin || "Patient Login"}
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Sign in with your Patient ID or ABHA ID to continue to your health intake.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md w-full">
            {/* Tabs: Patient Login | Doctor Login */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("patient")}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === "patient"
                    ? "bg-white text-sky-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.patientLogin}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("doctor")}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === "doctor"
                    ? "bg-white text-sky-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.doctorLogin}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "patient" ? (
                <>
                  {/* Patient ID */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      {t.patientIdLabel}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        id="login-patient-id"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        placeholder="e.g. PID-2026-8819 or ABHA ID"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
                        required
                      />
                    </div>
                  </div>

                  {/* Password masked with toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        {t.passwordLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                      >
                        {t.forgotPassword}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-base shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>{isLoading ? "Signing in..." : t.login}</span>
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-500 font-medium">
                    Any registered patient ID or ABHA ID can login.
                  </div>
                </>
              ) : (
                /* Doctor Portal Tab */
                <div className="space-y-4">
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-800">
                    Staff & Doctor Portal credentials
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Doctor / Staff ID
                    </label>
                    <input
                      type="text"
                      defaultValue="DOC-SUNDARAM-441"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Enter Doctor Review Portal</span>
                  </button>
                </div>
              )}
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ABDM & HIPAA Compliant Hospital Kiosk</span>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: Video AI Avatar with Verbal Guidance */}
        <div className="w-full md:w-5/12 flex flex-col items-center text-center">
          <CaseLineAvatar
            character="male"
            size="hero"
            mood="SPEAKING"
            pose="login"
            showStatusBadge={true}
          />

          {/* Speech bubble */}
          <div className="mt-4 relative bg-white border border-sky-200 rounded-3xl p-5 shadow-lg max-w-sm text-center">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-sky-200 rotate-45" />
            <p className="relative z-10 text-base font-extrabold text-slate-900 leading-snug">
              "{verbalGuidance}"
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs font-bold text-sky-700">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Verbal Guidance in {currentLanguage.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-black text-lg text-slate-900 mb-2">
              Kiosk Assistance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              If you have misplaced your Patient ID or Password, please speak to the hospital registration desk or scan your ABHA health card.
            </p>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-md mx-auto text-center text-xs text-slate-400 border-t border-slate-200/60 pt-4">
        CASE LINE Multilingual Healthcare AI • Hospital Intake Login
      </div>
    </div>
  );
};
