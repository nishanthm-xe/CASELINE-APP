import React from 'react';
import {
  FileText,
  Edit3,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Activity,
  Calendar,
  AlertCircle,
  Pill,
  HeartPulse,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { CaseLineAvatar } from './CaseLineAvatar';
import { CASELINE_13_LANGUAGES } from './CaseLineIntakeHeader';

interface ClinicalSummaryStepProps {
  patientName: string;
  patientId: string;
  selectedLanguage: string;
  chiefComplaint: string;
  painLevel: number;
  duration: string;
  onset: string;
  bodyLocation: string;
  associatedSymptoms: string[];
  pastConditions: string[];
  currentMeds: string[];
  allergies: string[];
  onEditResponses: () => void;
  onProceedToAddRecords: () => void;
  onBackToTimeline: () => void;
}

export const ClinicalSummaryStep: React.FC<ClinicalSummaryStepProps> = ({
  patientName,
  patientId,
  selectedLanguage,
  chiefComplaint,
  painLevel,
  duration,
  onset,
  bodyLocation,
  associatedSymptoms,
  pastConditions,
  currentMeds,
  allergies,
  onEditResponses,
  onProceedToAddRecords,
  onBackToTimeline,
}) => {
  const activeLang =
    CASELINE_13_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    CASELINE_13_LANGUAGES[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
              Step 6 of 8: Clinical Summary
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ABDM Certified Structured Note</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Clinical Summary
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Intake Language: <strong className="text-slate-800 font-bold">{activeLang.name} ({activeLang.nativeName})</strong> • Patient: <strong className="text-slate-800 font-bold">{patientName}</strong> ({patientId})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEditResponses}
            className="px-4 py-2.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-600" />
            <span>Edit Responses</span>
          </button>

          <button
            type="button"
            onClick={onProceedToAddRecords}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Proceed to Add Medical Records</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Clinical Sections on Left + Avatar Guidance on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Structured Clinical Sections */}
        <div className="lg:col-span-8 space-y-4">
          {/* Chief Complaint Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                <span>Chief Complaint</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Reason for Visit</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed pt-1">
              {chiefComplaint || 'No active complaint recorded.'}
            </p>
          </div>

          {/* History of Present Illness (HPI) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>History of Present Illness (HPI)</span>
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                SOCRATES Mapped
              </span>
            </div>

            {/* Duration & Onset Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Duration
                </span>
                <p className="text-xs font-bold text-slate-800">{duration || 'Reported during intake'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Onset
                </span>
                <p className="text-xs font-bold text-slate-800">{onset || 'Gradual progression'}</p>
              </div>
            </div>

            {/* Severity & Pain Score + Anatomical Pain Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Severity & Pain Score
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900">{painLevel} / 10</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      painLevel >= 8
                        ? 'bg-rose-100 text-rose-800'
                        : painLevel >= 5
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {painLevel >= 8 ? 'Severe' : painLevel >= 5 ? 'Moderate' : 'Mild'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Anatomical Pain Location
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">{bodyLocation || 'Chest / Epigastric area'}</span>
                </div>
              </div>
            </div>

            {/* Associated Symptoms */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">
                Associated Symptoms
              </span>
              <div className="flex flex-wrap gap-2">
                {associatedSymptoms.length > 0 ? (
                  associatedSymptoms.map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold"
                    >
                      {sym}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No secondary symptoms recorded</span>
                )}
              </div>
            </div>
          </div>

          {/* Past Medical History */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Past Medical History</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Longitudinal Records</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {pastConditions.length > 0 ? (
                pastConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {cond}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No known chronic conditions</span>
              )}
            </div>
          </div>

          {/* Medications & Allergies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Medications</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {currentMeds.length > 0 ? (
                  currentMeds.map((med, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <span>{med}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">None logged</li>
                )}
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Allergies</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {allergies.length > 0 ? (
                  allergies.map((all, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-rose-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{all}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">No known drug allergies (NKDA)</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: CASE LINE Avatar with Speech Bubble & Verification Indicator */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6 text-center flex flex-col items-center">
          <div className="w-full flex items-center justify-center">
            <CaseLineAvatar
              state="IDLE"
              size="lg"
              variant="female"
              languageName={activeLang.name}
              speechBubbleTitle="Intake Verified"
              speechBubbleText="I have organized your answers into this structured clinical note. You can edit any section or continue to scan medical documents."
              showStatusPill={false}
            />
          </div>

          <div className="w-full p-4 bg-teal-50/80 rounded-2xl border border-teal-200 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Clinical Verification</span>
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              This summary will be handed off to your doctor alongside your timeline and scanned medical records during your consultation.
            </p>
          </div>

          <div className="w-full space-y-2.5">
            <button
              type="button"
              onClick={onProceedToAddRecords}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <span>Add Medical Records / OCR</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onEditResponses}
              className="w-full py-2.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Edit Interview Responses
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToTimeline}
          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Medical Timeline</span>
        </button>

        <button
          type="button"
          onClick={onProceedToAddRecords}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Proceed to Add Medical Records</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
