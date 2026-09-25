import React, { useState } from 'react';
import {
  LogIn,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  User,
  Stethoscope,
  KeyRound,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { CaseLineAvatar } from './CaseLineAvatar';
import { CASELINE_13_LANGUAGES } from './CaseLineIntakeHeader';

interface PatientLoginStepProps {
  selectedLanguage: string;
  patientName: string;
  patientId: string;
  onLoginSuccess: () => void;
  onBackToLanguage: () => void;
  onOpenDoctorLogin?: () => void;
}

export const PatientLoginStep: React.FC<PatientLoginStepProps> = ({
  selectedLanguage,
  patientName,
  patientId,
  onLoginSuccess,
  onBackToLanguage,
  onOpenDoctorLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [patientInput, setPatientInput] = useState(patientId || '91-4829-1029-4821');
  const [pinInput, setPinInput] = useState('4829');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeLang =
    CASELINE_13_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    CASELINE_13_LANGUAGES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientInput.trim()) {
      setError('Please enter your Patient ID or 14-digit ABHA number.');
      return;
    }
    if (!pinInput.trim()) {
      setError('Please enter your 4-digit security PIN or password.');
      return;
    }
    setError(null);
    onLoginSuccess();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb / Nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLanguage}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Language Selection</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span>Intake Language: {activeLang.name} ({activeLang.nativeName})</span>
        </div>
      </div>

      {/* Main Grid: Form on Left + Avatar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Login Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          {/* Tabs: Patient Login / Doctor Login */}
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('patient')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'patient'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-teal-600" />
              <span>Patient Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenDoctorLogin) {
                  onOpenDoctorLogin();
                } else {
                  setActiveTab('doctor');
                }
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'doctor'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <span>Doctor Login</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Patient Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your Ayushman Bharat Health Account (ABHA) ID or Hospital Patient Number to begin your clinical interview.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient ID / ABHA Number field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Patient ID / 14-digit ABHA Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={patientInput}
                  onChange={(e) => setPatientInput(e.target.value)}
                  placeholder="e.g. 91-4829-1029-4821 or CL-PAT-092"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-600 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-hidden transition-all"
                />
              </div>
              <span className="text-[11px] text-slate-400 block">
                Pre-linked patient record: <strong className="text-slate-700 font-bold">{patientName}</strong>
              </span>
            </div>

            {/* Password / 4-digit PIN field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Password / 4-digit PIN
                </label>
                <button
                  type="button"
                  onClick={() => alert('PIN reset instructions sent to your registered mobile number via ABDM SMS gateway.')}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-digit security PIN"
                  maxLength={12}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-600 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-mono outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-teal-600 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span>Remember on this clinical terminal</span>
              </label>

              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ABHA Verified</span>
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Login & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* ABHA / HIPAA Compliance Message */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-start gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block">
                ABDM & HIPAA Compliance Guarantee:
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                All pre-consultation information is encrypted with 256-bit AES cryptographic standards under the National Digital Health Mission (ABDM). Zero clinical data is shared with third parties without your explicit cryptographic consent.
              </p>
            </div>
          </div>
        </div>

        {/* Right: CASE LINE Avatar + Speech Bubble */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6 text-center flex flex-col items-center">
          <div className="w-full flex items-center justify-center">
            <CaseLineAvatar
              state="IDLE"
              size="lg"
              variant="female"
              languageName={activeLang.name}
              speechBubbleTitle="Welcome to CASE LINE"
              speechBubbleText={`Welcome back, ${patientName}! Please enter your Patient ID or ABHA number to start your confidential clinical intake.`}
              showStatusPill={false}
            />
          </div>

          <div className="w-full p-4 bg-teal-50/80 rounded-2xl border border-teal-200 text-left text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-teal-900">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span>Pre-Consultation Security</span>
            </div>
            <ul className="text-[11px] text-teal-800 space-y-1 list-disc list-inside leading-relaxed">
              <li>Direct patient-to-physician intake docket</li>
              <li>Voice and text inputs captured concurrently</li>
              <li>Fully linked with your longitudinal medical records</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
