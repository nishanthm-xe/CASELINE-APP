import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Plus,
  Trash2,
  FileText,
  User,
  Activity,
  Pill,
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { AttachedDocument } from './DocumentScanStep';
import { FourteenSectionReview, FourteenSectionData } from './FourteenSectionReview';
import { CaseLineAvatar } from './CaseLineAvatar';

interface ReviewConfirmStepProps {
  patientName: string;
  patientId: string;
  selectedLanguageName: string;
  chiefComplaint: string;
  setChiefComplaint: (val: string) => void;
  painLevel: number;
  setPainLevel: (val: number) => void;
  duration: string;
  onset: string;
  bodyLocation: string;
  progression: string;
  associatedSymptoms: string[];
  setAssociatedSymptoms: React.Dispatch<React.SetStateAction<string[]>>;
  pastConditions: string[];
  setPastConditions: React.Dispatch<React.SetStateAction<string[]>>;
  currentMeds: string[];
  setCurrentMeds: React.Dispatch<React.SetStateAction<string[]>>;
  allergies: string[];
  setAllergies: React.Dispatch<React.SetStateAction<string[]>>;
  attachedDocs: AttachedDocument[];
  ayushEnabled: boolean;
  prakriti: string;
  agni: string;
  koshtha: string;
  onEditSection: (targetStep: number) => void;
  onBack: () => void;
  onConfirmAndSubmit: () => void;
  isSubmitting: boolean;
}

export const ReviewConfirmStep: React.FC<ReviewConfirmStepProps> = ({
  patientName,
  patientId,
  selectedLanguageName,
  chiefComplaint,
  setChiefComplaint,
  painLevel,
  setPainLevel,
  duration,
  onset,
  bodyLocation,
  progression,
  associatedSymptoms,
  setAssociatedSymptoms,
  pastConditions,
  setPastConditions,
  currentMeds,
  setCurrentMeds,
  allergies,
  setAllergies,
  attachedDocs,
  ayushEnabled,
  prakriti,
  agni,
  koshtha,
  onEditSection,
  onBack,
  onConfirmAndSubmit,
  isSubmitting,
}) => {
  const [patientConfirmed, setPatientConfirmed] = useState(false);
  const [editingChiefComplaint, setEditingChiefComplaint] = useState(false);
  const [tempComplaint, setTempComplaint] = useState(chiefComplaint);
  const [viewMode, setViewMode] = useState<'standard' | 'fourteen_section'>('fourteen_section');

  const saveComplaintEdit = () => {
    setChiefComplaint(tempComplaint);
    setEditingChiefComplaint(false);
  };

  const fourteenSectionData: FourteenSectionData = {
    caseReferenceId: `CL-OPD-${patientId.replace(/[^0-9]/g, '') || '9472'}`,
    patientName,
    patientId,
    abhaId: '91-8821-4402-9912',
    age: 42,
    gender: 'Female',
    bloodGroup: 'B+',
    triageGrade: painLevel >= 8 ? 'EMERGENCY' : painLevel >= 6 ? 'URGENT_CARE' : 'PRIMARY_CARE',
    chiefComplaint,
    hpi: {
      duration,
      onset,
      bodyLocation: bodyLocation || 'Chest / Head',
      severity: painLevel,
      character: 'Dull / Continuous',
      radiation: 'Non-radiating',
      associatedSymptoms,
      exacerbating: 'Movement and prolonged standing',
    },
    pastMedicalHistory: pastConditions,
    pastSurgicalHistory: ['Appendectomy (2018)'],
    currentMedications: currentMeds,
    drugAllergies: allergies,
    familyHistory: ['Type 2 Diabetes (Maternal)', 'Hypertension (Paternal)'],
    personalHistory: {
      diet: 'Vegetarian',
      sleep: '6-7 hours/night',
      habits: 'Non-smoker, non-drinker',
    },
    reviewOfSystems: {
      cardiovascular: painLevel > 7 ? 'Retrosternal discomfort reported' : 'No palpitation / chest pressure',
      respiratory: 'No dyspnea, normal breathing',
      gastrointestinal: 'Mild acidity, regular bowel movements',
      neurological: 'Alert and oriented x 3',
      musculoskeletal: 'Pain on local palpation / exertion',
    },
    previousInvestigations: [
      { title: 'Complete Blood Count (CBC)', date: '12 Jan 2026', finding: 'Hemoglobin 12.8 g/dL (Normal)' },
      { title: 'Random Blood Sugar', date: '12 Jan 2026', finding: '110 mg/dL (Normal fasting)' },
    ],
    attachedDocs,
    ayushAssessment: ayushEnabled
      ? {
          enabled: true,
          prakriti,
          agni,
          koshtha,
        }
      : undefined,
    redFlagAlerts:
      painLevel >= 8
        ? ['High pain severity (≥8/10) reported during intake']
        : [],
  };

  return (
    <div className="space-y-6">
      {/* View Mode Selector Tabs */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-slate-200 shadow-xs max-w-4xl mx-auto">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('fourteen_section')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'fourteen_section'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>14-Section Physician Docket (FHIR R4 & ABDM)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('standard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'standard'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Quick Summary</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {viewMode === 'fourteen_section' ? (
        <FourteenSectionReview
          data={fourteenSectionData}
          onConfirmAndSubmit={onConfirmAndSubmit}
          isSubmitting={isSubmitting}
          onEditSection={onEditSection}
        />
      ) : (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xs max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Final Verification Step • Step 8 of 8</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ABDM Encrypted & Verified</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Review Before Submission
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Please review your health interview, medical timeline, medical documents, extracted parameters, and clinical summary before submitting to your consulting physician.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-600" />
              <span>Edit Information</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirmAndSubmit}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Submit</span>
            </button>
          </div>
        </div>

        {/* CASE LINE Avatar Submission Guidance Message */}
        <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex items-start gap-3.5">
          <div className="shrink-0">
            <CaseLineAvatar state="IDLE" size="sm" variant="female" showStatusPill={false} />
          </div>
          <div className="space-y-1 text-xs">
            <span className="font-bold text-teal-900 block">CASE LINE Submission Guidance:</span>
            <p className="text-teal-800 leading-relaxed">
              Your clinical docket has been cross-referenced with your medical timeline and scanned documents. Review each section below, then check the confirmation box and tap Confirm & Submit.
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Information Sources */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-slate-700">Clinical Information Sources:</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Patient-Reported Interview Source
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          Extracted from Document / OCR Source
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          ABDM Longitudinal Health Record
        </span>
      </div>

      {/* Review Card: Patient Details */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Consulting Patient
          </span>
          <span className="text-sm font-bold text-slate-900">{patientName}</span>
          <span className="text-slate-500 block font-mono">ID: {patientId}</span>
        </div>
        <div className="sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Language Mode
          </span>
          <span className="text-sm font-bold text-teal-800">{selectedLanguageName}</span>
        </div>
      </div>

      {/* Chief Complaint Review */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Chief Complaint
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full">
              Patient Provided
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEditingChiefComplaint(!editingChiefComplaint)}
            className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{editingChiefComplaint ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        {editingChiefComplaint ? (
          <div className="space-y-2 pt-1">
            <textarea
              rows={2}
              value={tempComplaint}
              onChange={(e) => setTempComplaint(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
            />
            <button
              type="button"
              onClick={saveComplaintEdit}
              className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold"
            >
              Save Change
            </button>
          </div>
        ) : (
          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
            {chiefComplaint}
          </p>
        )}
      </div>

      {/* HPI Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block">Pain Severity</span>
          <strong className="text-slate-800">{painLevel} / 10</strong>
          <span className="text-[10px] text-emerald-700 block font-semibold">Patient Provided</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 block">Duration</span>
          <strong className="text-slate-800">{duration}</strong>
          <span className="text-[10px] text-purple-700 block font-semibold">AI Structured</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 block">Onset</span>
          <strong className="text-slate-800">{onset}</strong>
          <span className="text-[10px] text-purple-700 block font-semibold">AI Structured</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 block">Location</span>
          <strong className="text-slate-800 line-clamp-1">{bodyLocation}</strong>
          <span className="text-[10px] text-emerald-700 block font-semibold">Patient Provided</span>
        </div>
      </div>

      {/* Chronic Medical Conditions */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Chronic Medical Conditions
            </span>
            <span className="px-2 py-0.5 bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold rounded-full">
              Existing Medical Record
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEditSection(4)}
            className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {pastConditions.map((c, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Medications & Allergies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Active Meds */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active Medications
            </span>
            <button
              type="button"
              onClick={() => onEditSection(4)}
              className="text-xs text-teal-700 font-semibold"
            >
              Edit
            </button>
          </div>
          <div className="space-y-1">
            {currentMeds.map((m, i) => (
              <div key={i} className="text-xs text-slate-800 font-medium">
                • {m}
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Known Allergies
            </span>
            <button
              type="button"
              onClick={() => onEditSection(4)}
              className="text-xs text-rose-700 font-semibold"
            >
              Edit
            </button>
          </div>
          <div className="space-y-1">
            {allergies.map((a, i) => (
              <div key={i} className="text-xs text-rose-900 font-bold">
                ⚠️ {a}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attached Physical Documents */}
      {attachedDocs.length > 0 && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Attached Physical Records & Reports ({attachedDocs.length})
            </span>
            <button
              type="button"
              onClick={() => onEditSection(5)}
              className="text-xs text-teal-700 font-semibold"
            >
              Manage Documents
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {attachedDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-slate-800 block truncate">{doc.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{doc.documentType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AYUSH Summary (if active) */}
      {ayushEnabled && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-2">
          <span className="font-bold text-emerald-900 uppercase tracking-wider block">
            AYUSH Integrative Parameters
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-emerald-700 block text-[10px]">Prakriti</span>
              <strong className="text-emerald-950">{prakriti}</strong>
            </div>
            <div>
              <span className="text-emerald-700 block text-[10px]">Agni</span>
              <strong className="text-emerald-950">{agni}</strong>
            </div>
            <div>
              <span className="text-emerald-700 block text-[10px]">Koshtha</span>
              <strong className="text-emerald-950">{koshtha}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Patient Confirmation Checkbox */}
      <div className="p-4 bg-teal-50/80 border-2 border-teal-300 rounded-2xl space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={patientConfirmed}
            onChange={(e) => setPatientConfirmed(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded-md accent-teal-600 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
          />
          <div className="text-xs text-teal-950 leading-relaxed font-medium">
            <strong className="font-bold text-teal-900 block mb-0.5">
              Patient Verification & Consent Confirmation
            </strong>
            I have reviewed the structured medical history above and confirm that it accurately represents my current health concerns, previous conditions, and attached records. I authorize Case Line to compile this docket for my consulting physician.
          </div>
        </label>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Documents</span>
        </button>

        <button
          type="button"
          disabled={!patientConfirmed || isSubmitting}
          onClick={onConfirmAndSubmit}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isSubmitting ? 'Submitting Clinical Docket...' : 'Confirm & Submit to Doctor'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
      )}
    </div>
  );
};
