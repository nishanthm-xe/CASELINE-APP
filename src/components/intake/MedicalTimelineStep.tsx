import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  Building,
  User,
  Activity,
  Upload,
  ArrowRight,
  ArrowLeft,
  Eye,
  Filter,
  CheckCircle2,
  Stethoscope,
  Pill,
  Hospital,
  ChevronRight,
  X,
} from 'lucide-react';
import { CaseLineAvatar } from './CaseLineAvatar';

export interface TimelineRecord {
  id: string;
  year: string;
  date: string;
  type: 'consultation' | 'lab' | 'prescription' | 'admission';
  title: string;
  hospital: string;
  doctor: string;
  specialty: string;
  summary: string;
  details: {
    diagnosis?: string;
    vitals?: string;
    medications?: string[];
    labResults?: Array<{ parameter: string; value: string; unit: string; flag?: string }>;
    dischargeCondition?: string;
  };
}

const SAMPLE_TIMELINE_RECORDS: TimelineRecord[] = [
  {
    id: 'rec-1',
    year: '2026',
    date: '14 Feb 2026',
    type: 'consultation',
    title: 'Cardiology Outpatient Follow-up',
    hospital: 'Apollo Speciality Hospital, Chennai',
    doctor: 'Dr. S. Ramachandran, MD, DM (Cardio)',
    specialty: 'Cardiology',
    summary: 'Evaluated for exertion-related chest pressure. Resting 12-lead ECG normal. Recommended 2D Echocardiogram.',
    details: {
      diagnosis: 'Atypical Angina Pectoris (Class II NYHA) - Rule out CAD',
      vitals: 'BP: 130/84 mmHg, HR: 74 bpm, SpO2: 98%',
      medications: ['Tab. Sorbitrate 5mg (SOS)', 'Tab. Aspirin 75mg (OD)'],
    },
  },
  {
    id: 'rec-2',
    year: '2026',
    date: '10 Jan 2026',
    type: 'lab',
    title: 'Comprehensive Metabolic Panel & Lipid Profile',
    hospital: 'Neuberg Diagnostics, Central Lab',
    doctor: 'Dr. M. Senthil, MD (Pathology)',
    specialty: 'Laboratory Medicine',
    summary: 'Fasting lipid panel and glycaemic indices within borderline management targets.',
    details: {
      labResults: [
        { parameter: 'Total Cholesterol', value: '198', unit: 'mg/dL', flag: 'Borderline' },
        { parameter: 'LDL Cholesterol', value: '118', unit: 'mg/dL', flag: 'Borderline' },
        { parameter: 'HDL Cholesterol', value: '46', unit: 'mg/dL', flag: 'Normal' },
        { parameter: 'HbA1c', value: '6.1', unit: '%', flag: 'Prediabetes range' },
        { parameter: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', flag: 'Normal' },
      ],
    },
  },
  {
    id: 'rec-3',
    year: '2025',
    date: '18 Nov 2025',
    type: 'prescription',
    title: 'Hypertension Management Prescription',
    hospital: 'Madras Medical Mission, Mogappair',
    doctor: 'Dr. Priya Nair, MD (Internal Medicine)',
    specialty: 'General Medicine',
    summary: 'Essential hypertension routine review. Blood pressure stabilized on mono-agent ARB.',
    details: {
      diagnosis: 'Essential Hypertension (Stage 1)',
      medications: [
        'Tab. Telmisartan 40mg - Once daily after breakfast',
        'Tab. Pantoprazole 40mg - Once daily before breakfast (PRN)',
      ],
    },
  },
  {
    id: 'rec-4',
    year: '2025',
    date: '05 Aug 2025',
    type: 'admission',
    title: 'Short Stay Medical Admission (Gastritis & Chest Discomfort)',
    hospital: 'Fortis Malar Hospital, Adyar',
    doctor: 'Dr. K. Balaji, MS, DNB',
    specialty: 'Emergency Medicine / Gastroenterology',
    summary: '48-hour inpatient observation for acute epigastric burning radiating retrosternally. Cardiac biomarkers negative.',
    details: {
      diagnosis: 'Acute Erosive Gastritis with secondary esophageal spasm',
      dischargeCondition: 'Stable, asymptomatic at discharge',
      medications: ['Inj. Pantoprazole 40mg IV', 'Syrup Mucaine Gel 10ml TID'],
    },
  },
  {
    id: 'rec-5',
    year: '2024',
    date: '12 Oct 2024',
    type: 'consultation',
    title: 'Orthopedic Consultation & Lumbar Spine X-Ray',
    hospital: 'MIOT International, Manapakkam',
    doctor: 'Dr. Arvind Swamy, MS (Ortho)',
    specialty: 'Orthopedics',
    summary: 'Low back strain after heavy lifting. Lumbar spine radiographs showed mild L4-L5 disc space narrowing without spondylolisthesis.',
    details: {
      diagnosis: 'Mechanical Low Back Strain',
      medications: ['Tab. Aceclofenac + Paracetamol (SOS)', 'Physiotherapy core strengthening'],
    },
  },
];

interface MedicalTimelineStepProps {
  patientName: string;
  patientId: string;
  selectedLanguage: string;
  onUploadRecord: () => void;
  onProceedToSummary: () => void;
  onBackToInterview: () => void;
}

export const MedicalTimelineStep: React.FC<MedicalTimelineStepProps> = ({
  patientName,
  patientId,
  selectedLanguage,
  onUploadRecord,
  onProceedToSummary,
  onBackToInterview,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'consultation' | 'lab' | 'prescription' | 'admission'>('all');
  const [selectedRecord, setSelectedRecord] = useState<TimelineRecord | null>(null);

  const filteredRecords = SAMPLE_TIMELINE_RECORDS.filter((rec) => {
    if (filterType === 'all') return true;
    return rec.type === filterType;
  });

  // Group by year
  const recordsByYear = filteredRecords.reduce<Record<string, TimelineRecord[]>>((acc, rec) => {
    if (!acc[rec.year]) acc[rec.year] = [];
    acc[rec.year].push(rec);
    return acc;
  }, {});

  const years = Object.keys(recordsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border-2 border-teal-500/30 flex items-center justify-center text-teal-700 shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
                Step 5 of 8: Medical Timeline
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {patientId}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Medical Timeline
            </h1>
            <p className="text-xs text-slate-500">
              Patient: <strong className="text-slate-800 font-bold">{patientName}</strong> • Longitudinal health history verified via ABDM Health Information Provider (HIP).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={onUploadRecord}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl border border-teal-600 text-teal-700 hover:bg-teal-50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Record</span>
          </button>

          <button
            type="button"
            onClick={onProceedToSummary}
            className="flex-1 md:flex-none px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
          >
            <span>Proceed to Clinical Summary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 pl-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>

        {[
          { key: 'all', label: `All (${SAMPLE_TIMELINE_RECORDS.length})` },
          { key: 'consultation', label: 'Consultations' },
          { key: 'lab', label: 'Investigations / Labs' },
          { key: 'prescription', label: 'Prescriptions' },
          { key: 'admission', label: 'Admissions' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilterType(f.key as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterType === f.key
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Chronological Timeline Container */}
      <div className="space-y-6">
        {years.map((year) => (
          <div key={year} className="space-y-4">
            {/* Year Section Divider */}
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 bg-teal-600 text-white font-extrabold text-xs rounded-full shadow-2xs">
                {year}
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Timeline Cards under this year */}
            <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-teal-200 ml-4">
              {recordsByYear[year].map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all relative group"
                >
                  {/* Circle on timeline line */}
                  <div className="absolute -left-[23px] sm:-left-[31px] top-6 w-3.5 h-3.5 rounded-full bg-white border-3 border-teal-600 shadow-2xs" />

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          <span>{rec.date}</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            rec.type === 'consultation'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : rec.type === 'lab'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : rec.type === 'prescription'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rec.type}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {rec.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rec.hospital}</span>
                        </span>
                        <span className="flex items-center gap-1 font-medium text-teal-800">
                          <User className="w-3.5 h-3.5 text-teal-600" />
                          <span>{rec.doctor} ({rec.specialty})</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {rec.summary}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(rec)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs font-bold text-slate-800 hover:text-teal-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToInterview}
          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clinical Voice Interview</span>
        </button>

        <button
          type="button"
          onClick={onProceedToSummary}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Proceed to Clinical Summary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* View Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block">
                  {selectedRecord.type} • {selectedRecord.date}
                </span>
                <h3 className="font-bold text-slate-900 text-lg">{selectedRecord.title}</h3>
                <span className="text-xs text-slate-500 block">{selectedRecord.hospital}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Consultant Physician</span>
                <span className="font-bold text-slate-900">{selectedRecord.doctor}</span>
                <span className="text-slate-500 block">{selectedRecord.specialty}</span>
              </div>

              {selectedRecord.details.diagnosis && (
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-1">
                  <span className="text-[10px] font-bold text-teal-800 block uppercase">Clinical Diagnosis</span>
                  <span className="font-bold text-teal-950">{selectedRecord.details.diagnosis}</span>
                </div>
              )}

              {selectedRecord.details.vitals && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Recorded Vitals</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedRecord.details.vitals}</span>
                </div>
              )}

              {selectedRecord.details.medications && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 block uppercase">Prescribed Regimen</span>
                  <ul className="list-disc list-inside text-emerald-950 space-y-1 font-medium">
                    {selectedRecord.details.medications.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRecord.details.labResults && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                  <span className="text-[10px] font-bold text-purple-800 block uppercase">Lab Indices</span>
                  <div className="space-y-1.5">
                    {selectedRecord.details.labResults.map((lr, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-purple-950 font-medium">{lr.parameter}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-900">
                            {lr.value} {lr.unit}
                          </span>
                          {lr.flag && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-white rounded-md text-purple-700 font-bold border border-purple-200">
                              {lr.flag}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
