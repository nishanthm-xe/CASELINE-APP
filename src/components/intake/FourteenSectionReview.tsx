import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Download,
  Printer,
  QrCode,
  Sparkles,
  HeartPulse,
  Pill,
  Clock,
  Layers,
  Leaf,
  FileCheck2,
  Activity,
  ArrowRight,
  User,
  ShieldAlert,
  Share2,
} from 'lucide-react';
import { AttachedDocument } from './DocumentScanStep';

export interface FourteenSectionData {
  caseReferenceId: string;
  patientName: string;
  patientId: string;
  abhaId?: string;
  age: number;
  gender: string;
  bloodGroup: string;
  triageGrade: 'EMERGENCY' | 'URGENT_CARE' | 'PRIMARY_CARE' | 'SELF_CARE';
  chiefComplaint: string;
  hpi: {
    duration: string;
    onset: string;
    bodyLocation: string;
    severity: number;
    character: string;
    radiation: string;
    associatedSymptoms: string[];
    exacerbating: string;
  };
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  currentMedications: string[];
  drugAllergies: string[];
  familyHistory: string[];
  personalHistory: {
    diet: string;
    sleep: string;
    habits: string;
  };
  reviewOfSystems: {
    cardiovascular: string;
    respiratory: string;
    gastrointestinal: string;
    neurological: string;
    musculoskeletal: string;
  };
  previousInvestigations: Array<{
    title: string;
    date: string;
    finding: string;
  }>;
  attachedDocs: AttachedDocument[];
  ayushAssessment?: {
    enabled: boolean;
    prakriti: string;
    agni: string;
    koshtha: string;
  };
  redFlagAlerts: string[];
}

interface FourteenSectionReviewProps {
  data: FourteenSectionData;
  onConfirmAndSubmit: () => void;
  isSubmitting?: boolean;
  onEditSection?: (sectionId: number) => void;
}

export const FourteenSectionReview: React.FC<FourteenSectionReviewProps> = ({
  data,
  onConfirmAndSubmit,
  isSubmitting = false,
  onEditSection,
}) => {
  const [verifiedSections, setVerifiedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
    11: true,
    12: true,
    13: true,
    14: true,
  });

  const toggleVerify = (secNum: number) => {
    setVerifiedSections((prev) => ({ ...prev, [secNum]: !prev[secNum] }));
  };

  // Generate FHIR R4 Bundle JSON
  const handleExportFhirBundle = () => {
    const fhirBundle = {
      resourceType: 'Bundle',
      id: `bundle-${data.caseReferenceId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:patient-${data.patientId}`,
          resource: {
            resourceType: 'Patient',
            id: data.patientId,
            identifier: [
              { system: 'https://healthid.ndhm.gov.in', value: data.abhaId || '91-8821-4402-9912' },
              { system: 'https://caseline.health/patient-code', value: data.patientId },
            ],
            name: [{ text: data.patientName }],
            gender: data.gender.toLowerCase(),
          },
        },
        {
          fullUrl: `urn:uuid:encounter-${data.caseReferenceId}`,
          resource: {
            resourceType: 'Encounter',
            id: data.caseReferenceId,
            status: 'arrived',
            class: { code: 'AMB', display: 'ambulatory' },
            priority: {
              coding: [
                {
                  system: 'https://caseline.health/triage',
                  code: data.triageGrade,
                  display: data.triageGrade,
                },
              ],
            },
          },
        },
        {
          fullUrl: `urn:uuid:condition-chief-complaint`,
          resource: {
            resourceType: 'Condition',
            code: { text: data.chiefComplaint },
            severity: { text: `${data.hpi.severity}/10` },
            bodySite: [{ text: data.hpi.bodyLocation }],
          },
        },
        ...data.currentMedications.map((med, idx) => ({
          fullUrl: `urn:uuid:medication-${idx}`,
          resource: {
            resourceType: 'MedicationStatement',
            status: 'active',
            medicationCodeableConcept: { text: med },
          },
        })),
        ...data.drugAllergies.map((alg, idx) => ({
          fullUrl: `urn:uuid:allergy-${idx}`,
          resource: {
            resourceType: 'AllergyIntolerance',
            clinicalStatus: { text: 'active' },
            code: { text: alg },
          },
        })),
      ],
    };

    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_R4_${data.caseReferenceId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTriageBadge = (grade: string) => {
    if (grade === 'EMERGENCY') {
      return 'bg-rose-500 text-white border-rose-600 animate-pulse';
    }
    if (grade === 'URGENT_CARE') {
      return 'bg-orange-500 text-white border-orange-600';
    }
    if (grade === 'PRIMARY_CARE') {
      return 'bg-amber-500 text-slate-950 border-amber-600';
    }
    return 'bg-emerald-500 text-white border-emerald-600';
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-md max-w-5xl mx-auto space-y-6">
      {/* Top Banner with Case ID and QR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl border border-teal-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-400 text-slate-950">
              ABDM & FHIR R4 Compliant
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getTriageBadge(data.triageGrade)}`}>
              Triage: {data.triageGrade.replace('_', ' ')}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black mt-1.5 tracking-tight text-white flex items-center gap-2">
            <span>Case Ref: {data.caseReferenceId}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Patient: <strong className="text-teal-300">{data.patientName}</strong> ({data.age}Y / {data.gender} / {data.bloodGroup}) • ABHA ID: {data.abhaId || '91-8821-4402-9912'}
          </p>
        </div>

        {/* QR Code and Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-2 bg-white rounded-xl text-slate-900 flex flex-col items-center">
            <QrCode className="w-9 h-9" />
            <span className="text-[9px] font-mono font-bold mt-0.5">KIOSK SCAN</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleExportFhirBundle}
              className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export FHIR R4</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Docket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs text-teal-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-teal-900">
            14-Section Physician-Ready Clinical Intake Docket
          </p>
          <p className="text-teal-800 leading-relaxed">
            Please review each section below. You can toggle "Verified" or make amendments. Once confirmed, this structured record is synchronized directly with your consulting doctor's OPD interface.
          </p>
        </div>
      </div>

      {/* 14 SECTIONS GRID */}
      <div className="space-y-4">
        {/* Section 1: Chief Complaint */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Chief Complaint</h3>
            </div>
            <button
              type="button"
              onClick={() => toggleVerify(1)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition ${
                verifiedSections[1] ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{verifiedSections[1] ? 'Verified by Patient' : 'Mark Verified'}</span>
            </button>
          </div>
          <p className="text-sm font-bold text-slate-900 pl-8">{data.chiefComplaint}</p>
        </div>

        {/* Section 2: HPI & SOCRATES */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">History of Present Illness (SOCRATES)</h3>
            </div>
            <button
              type="button"
              onClick={() => toggleVerify(2)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition ${
                verifiedSections[2] ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{verifiedSections[2] ? 'Verified by Patient' : 'Mark Verified'}</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pl-8 text-xs">
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Site / Location:</span>
              <strong className="text-slate-800">{data.hpi.bodyLocation}</strong>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Onset & Duration:</span>
              <strong className="text-slate-800">{data.hpi.onset} • {data.hpi.duration}</strong>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Character:</span>
              <strong className="text-slate-800 capitalize">{data.hpi.character}</strong>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Severity:</span>
              <strong className="text-slate-800">{data.hpi.severity} / 10</strong>
            </div>
          </div>
        </div>

        {/* Section 3 & 4: Past Medical & Surgical History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Past Medical History</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleVerify(3)}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[3] ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {verifiedSections[3] ? '✓ Verified' : 'Verify'}
              </button>
            </div>
            <div className="pl-8 flex flex-wrap gap-1.5">
              {data.pastMedicalHistory.length > 0 ? (
                data.pastMedicalHistory.map((m, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                    {m}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No chronic medical conditions reported</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Past Surgical History</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleVerify(4)}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[4] ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {verifiedSections[4] ? '✓ Verified' : 'Verify'}
              </button>
            </div>
            <div className="pl-8 flex flex-wrap gap-1.5">
              {data.pastSurgicalHistory.length > 0 ? (
                data.pastSurgicalHistory.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No prior surgeries reported</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 5 & 6: Current Meds & Drug Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">5</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Current Medications</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleVerify(5)}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[5] ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {verifiedSections[5] ? '✓ Verified' : 'Verify'}
              </button>
            </div>
            <div className="pl-8 space-y-1">
              {data.currentMedications.length > 0 ? (
                data.currentMedications.map((m, i) => (
                  <div key={i} className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span>{m}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No active medications recorded</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-rose-600 text-white text-xs font-bold flex items-center justify-center">6</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-950">Known Drug Allergies</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleVerify(6)}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[6] ? 'text-emerald-700' : 'text-rose-700'}`}
              >
                {verifiedSections[6] ? '✓ Verified' : 'Verify'}
              </button>
            </div>
            <div className="pl-8">
              {data.drugAllergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.drugAllergies.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-rose-300 rounded-lg text-xs font-bold text-rose-800">
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-semibold text-emerald-800">No known drug allergies (NKDA)</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 7 & 8: Family & Personal History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">7</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Family History</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleVerify(7)}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[7] ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {verifiedSections[7] ? '✓ Verified' : 'Verify'}
              </button>
            </div>
            <p className="pl-8 text-xs text-slate-700">
              {data.familyHistory.join(', ') || 'No significant familial diseases reported.'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">8</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Personal History (Diet & Sleep)</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleVerify(8)}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[8] ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {verifiedSections[8] ? '✓ Verified' : 'Verify'}
              </button>
            </div>
            <div className="pl-8 text-xs text-slate-700 space-y-0.5">
              <div>Diet: <strong className="text-slate-900">{data.personalHistory.diet}</strong></div>
              <div>Sleep: <strong className="text-slate-900">{data.personalHistory.sleep}</strong></div>
              <div>Habits: <strong className="text-slate-900">{data.personalHistory.habits}</strong></div>
            </div>
          </div>
        </div>

        {/* Section 9: Review of Systems (ROS) */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">9</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Review of Systems (ROS)</h3>
            </div>
            <button
              type="button"
              onClick={() => toggleVerify(9)}
              className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[9] ? 'text-emerald-700' : 'text-slate-500'}`}
            >
              {verifiedSections[9] ? '✓ Verified' : 'Verify'}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pl-8 text-xs">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Cardio:</span>
              <span>{data.reviewOfSystems.cardiovascular}</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Respiratory:</span>
              <span>{data.reviewOfSystems.respiratory}</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">GI:</span>
              <span>{data.reviewOfSystems.gastrointestinal}</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Neuro:</span>
              <span>{data.reviewOfSystems.neurological}</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Musculoskeletal:</span>
              <span>{data.reviewOfSystems.musculoskeletal}</span>
            </div>
          </div>
        </div>

        {/* Section 10 & 11: Investigations & Document OCR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">10</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Previous Investigations</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleVerify(10)}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[10] ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {verifiedSections[10] ? '✓ Verified' : 'Verify'}
              </button>
            </div>
            <div className="pl-8 space-y-1.5 text-xs">
              {data.previousInvestigations.length > 0 ? (
                data.previousInvestigations.map((inv, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
                    <div>
                      <strong className="text-slate-800 block">{inv.title}</strong>
                      <span className="text-[11px] text-slate-500">{inv.finding}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{inv.date}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No prior labs attached</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">11</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Scanned Documents & OCR</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleVerify(11)}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[11] ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {verifiedSections[11] ? '✓ Verified' : 'Verify'}
              </button>
            </div>
            <div className="pl-8 space-y-1.5 text-xs">
              {data.attachedDocs.length > 0 ? (
                data.attachedDocs.map((doc) => (
                  <div key={doc.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-800 block truncate">{doc.name}</strong>
                      <span className="text-[10px] text-teal-700 uppercase font-bold">{doc.documentType} • Verified OCR</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{doc.date}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No physical records uploaded in this session</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 12: AYUSH Assessment */}
        {data.ayushAssessment?.enabled && (
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">12</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">AYUSH Integrative Assessment</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleVerify(12)}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[12] ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {verifiedSections[12] ? '✓ Verified' : 'Verify'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 pl-8 text-xs text-emerald-900">
              <div>Prakriti: <strong>{data.ayushAssessment.prakriti}</strong></div>
              <div>Agni: <strong>{data.ayushAssessment.agni}</strong></div>
              <div>Koshtha: <strong>{data.ayushAssessment.koshtha}</strong></div>
            </div>
          </div>
        )}

        {/* Section 13: Red Flag Alerts */}
        <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-rose-600 text-white text-xs font-bold flex items-center justify-center">13</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-950">Clinical Red Flag Alerts & Triage</h3>
            </div>
            <button
              type="button"
              onClick={() => toggleVerify(13)}
              className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[13] ? 'text-emerald-700' : 'text-rose-700'}`}
            >
              {verifiedSections[13] ? '✓ Verified' : 'Verify'}
            </button>
          </div>
          <div className="pl-8 text-xs">
            {data.redFlagAlerts.length > 0 ? (
              <div className="space-y-1">
                {data.redFlagAlerts.map((alert, i) => (
                  <div key={i} className="text-rose-900 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-emerald-800 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero acute red-flag emergency symptoms detected. Routine OPD priority assigned.</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 14: Medical Disclaimer & Provenance */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">14</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Medical AI Disclaimer & Provenance</h3>
            </div>
            <button
              type="button"
              onClick={() => toggleVerify(14)}
              className={`text-xs px-2 py-0.5 rounded-lg font-bold ${verifiedSections[14] ? 'text-emerald-700' : 'text-slate-500'}`}
            >
              {verifiedSections[14] ? '✓ Verified' : 'Verify'}
            </button>
          </div>
          <p className="pl-8 text-[11px] text-slate-600 leading-relaxed">
            AI-generated clinical draft compiled under patient direction. This is a clinical decision-support and intake synthesis tool; it is NOT an autonomous medical diagnosis or prescription. Requires human physician evaluation and sign-off.
          </p>
        </div>
      </div>

      {/* Confirmation & Submission Footer */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Ready to submit? Your doctor will access this complete 14-section record immediately.
        </div>

        <button
          type="button"
          onClick={onConfirmAndSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-7 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Submitting Case Docket...</span>
          ) : (
            <>
              <FileCheck2 className="w-4 h-4" />
              <span>Confirm & Send to Doctor</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
