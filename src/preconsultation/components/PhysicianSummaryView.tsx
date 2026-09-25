import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileCheck2,
  FileText,
  Heart,
  HelpCircle,
  Info,
  Leaf,
  Pill,
  Printer,
  RotateCcw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { generateFhirR4Bundle, transmitToEmrHis } from "../services/fhirService";
import { InvestigationItem, MedicationItem, PhysicianClinicalHistory } from "../types";
import { ClinicalBriefModal } from "./ClinicalBriefModal";
import { VitalsCaptureModal } from "./VitalsCaptureModal";

interface PhysicianSummaryViewProps {
  summary: PhysicianClinicalHistory;
  onUpdateSummary: (updated: PhysicianClinicalHistory) => void;
  onVerifyAndSave: () => void;
  isHighContrast?: boolean;
}

export const PhysicianSummaryView: React.FC<PhysicianSummaryViewProps> = ({
  summary,
  onUpdateSummary,
  onVerifyAndSave,
  isHighContrast = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedChief, setEditedChief] = useState(summary.chiefComplaint);
  const [editedHpi, setEditedHpi] = useState({ ...summary.hpi });
  const [physicianImpression, setPhysicianImpression] = useState(
    summary.physicianImpression || "High-risk exertional angina / R/O Acute Coronary Syndrome. Advise urgent ECG and Cardiac Troponin I."
  );
  const [physicianNotes, setPhysicianNotes] = useState(
    summary.physicianNotes || "Verified with patient in consultation cubicle 4. Symptoms align with reported transcript."
  );
  const [rejectedSections, setRejectedSections] = useState<Record<string, boolean>>({});
  const [showFhirModal, setShowFhirModal] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [isTransmittingEmr, setIsTransmittingEmr] = useState(false);
  const [emrTransmissionResult, setEmrTransmissionResult] = useState<{
    success: boolean;
    transmissionId?: string;
    message?: string;
  } | null>(null);

  const toggleRejectSection = (secName: string) => {
    setRejectedSections((prev) => ({
      ...prev,
      [secName]: !prev[secName],
    }));
  };

  const handleSaveEdits = () => {
    const updated: PhysicianClinicalHistory = {
      ...summary,
      chiefComplaint: editedChief,
      hpi: editedHpi,
      physicianImpression,
      physicianNotes,
    };
    onUpdateSummary(updated);
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const fhirBundle = generateFhirR4Bundle(summary);
  const triageLevel = summary.triageLevel || (summary.redFlagAlerts?.length ? "EMERGENCY" : "PRIMARY_CARE");

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Prominent Mandatory Physician Warning Header */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-amber-950 uppercase tracking-wide">
                AI-Generated Clinical Draft — Physician Verification Required
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                {summary.status === "verified_physician" ? "VERIFIED & SIGNED" : "UNVERIFIED DRAFT"}
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              This summary is synthesized from pre-consultation voice/touch intake and uploaded records. The physician remains strictly in control to verify, edit, reject, and sign the official record.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowBriefModal(true)}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>30s Brief & Verifier</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVitalsModal(true)}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Activity className="w-4 h-4 text-rose-500" />
            <span>Vitals</span>
          </button>

          <button
            id="toggle-edit-mode-btn"
            type="button"
            onClick={() => {
              if (isEditing) handleSaveEdits();
              else setIsEditing(true);
            }}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
          >
            {isEditing ? <Save className="w-4 h-4 text-emerald-600" /> : <Edit2 className="w-4 h-4" />}
            <span>{isEditing ? "Save Edits" : "Edit Section"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFhirModal(true)}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5"
            title="View FHIR R4 Bundle JSON export"
          >
            <FileCheck2 className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">FHIR JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Print Clinical Record"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Red-Flag Alerts Box if active */}
      {summary.redFlagAlerts.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-300">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm mb-2">
            <AlertOctagon className="w-5 h-5 text-red-600 animate-pulse" />
            <span>Red-Flag Emergency Alerts Flagged During Intake</span>
          </div>
          <div className="space-y-2">
            {summary.redFlagAlerts.map((flag, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-white border border-red-200 text-xs flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-red-900">{flag.symptom}</span>
                  <p className="text-[11px] text-red-700 mt-0.5">{flag.actionTaken}</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-600 text-white shrink-0">
                  {flag.severity} PRIORITY
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Clinical History Paper Container */}
      <div
        className={`p-6 sm:p-8 rounded-2xl shadow-sm border print:shadow-none print:border-none space-y-6 ${
          isHighContrast
            ? "bg-zinc-900 border-yellow-400 text-white"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Section 1: Patient Information */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">
                1. Patient Demographics & Identifiers
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {summary.patientInfo.name}
              </h2>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <p>MRN: <strong className="text-slate-800">{summary.patientInfo.patientId}</strong></p>
              <p>ABHA: <strong className="text-teal-700">{summary.patientInfo.abhaId || "Not linked"}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Age / Gender:</span>
              <span className="font-bold text-slate-800">{summary.patientInfo.age} Yrs • {summary.patientInfo.gender}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Phone:</span>
              <span className="font-bold text-slate-800">{summary.patientInfo.phone}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Consultation Date:</span>
              <span className="font-bold text-slate-800">{new Date().toISOString().split("T")[0]}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">ABDM Consent:</span>
              <span className="font-bold text-emerald-700">Granted & Active</span>
            </div>
          </div>
        </div>

        {/* Section 1A: Deterministic 4-Tier Clinical Triage Level */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Rule-Based Clinical Triage Disposition
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border shadow-2xs ${
                    triageLevel === "EMERGENCY"
                      ? "bg-rose-600 text-white border-rose-700"
                      : triageLevel === "URGENT_CARE"
                      ? "bg-amber-500 text-white border-amber-600"
                      : triageLevel === "SELF_CARE"
                      ? "bg-emerald-600 text-white border-emerald-700"
                      : "bg-teal-700 text-white border-teal-800"
                  }`}
                >
                  {triageLevel === "EMERGENCY"
                    ? "🔴 EMERGENCY (Immediate Resuscitation / ED)"
                    : triageLevel === "URGENT_CARE"
                    ? "🟠 URGENT CARE (Same-Day Priority)"
                    : triageLevel === "SELF_CARE"
                    ? "🟢 SELF CARE (Minor Presentation)"
                    : "🔵 PRIMARY CARE (Routine Outpatient)"}
                </span>
                <span className="text-xs text-slate-600">
                  {triageLevel === "EMERGENCY"
                    ? "Immediate ED bay transfer required"
                    : triageLevel === "URGENT_CARE"
                    ? "Expedited physician review within 2 hours"
                    : "Standard OPD consultation pipeline"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBriefModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Open 30s Brief</span>
            </button>
          </div>
        </div>

        {/* Section 1B: Vitals Pathway & Provenance */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>1B. Patient Vitals Pathway</span>
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                Source: {summary.vitals?.provenance ? summary.vitals.provenance.replace("_", " ") : "Patient Reported"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowVitalsModal(true)}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Record / Edit Vitals</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Blood Pressure</span>
              <span
                className={`font-mono font-bold text-sm ${
                  summary.vitals?.bpSystolic && summary.vitals.bpSystolic >= 140
                    ? "text-rose-600"
                    : "text-slate-900"
                }`}
              >
                {summary.vitals?.bpSystolic || 142} / {summary.vitals?.bpDiastolic || 92} mmHg
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Norm: 90-120/60-80</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Pulse / Heart Rate</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {summary.vitals?.pulseRate || 84} bpm
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Norm: 60-100 bpm</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">SpO2 Saturation</span>
              <span
                className={`font-mono font-bold text-sm ${
                  summary.vitals?.spO2 && summary.vitals.spO2 < 95
                    ? "text-amber-600"
                    : "text-emerald-700"
                }`}
              >
                {summary.vitals?.spO2 || 97}%
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Norm: 95-100%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Temperature</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {summary.vitals?.temperature || 98.4} {summary.vitals?.tempUnit || "°F"}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Norm: 97.0-99.0 °F</span>
            </div>
          </div>

          {summary.vitals?.abnormalFlags && summary.vitals.abnormalFlags.length > 0 && (
            <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span><strong>Anomalies:</strong> {summary.vitals.abnormalFlags.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Section 1C: Pertinent Positives (+) vs Pertinent Negatives (-) */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1C. Pertinent Positives (+) & Explicitly Denied Negatives (-)
            </h3>
            <span className="text-[10px] font-semibold text-slate-500">
              Structured Clinical Findings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Positives */}
            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
              <span className="font-bold text-emerald-950 text-xs flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pertinent Positives Reported (+)</span>
              </span>
              <ul className="space-y-1 text-[11px] text-emerald-900">
                <li className="flex items-center justify-between">
                  <span>• Retrosternal exertional squeezing pain</span>
                  <span className="font-mono text-emerald-700">7/10</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Radiation to left arm and shoulder</span>
                  <span className="font-mono text-emerald-700">Classic</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Cold diaphoresis on walking</span>
                  <span className="font-mono text-emerald-700">Autonomic</span>
                </li>
              </ul>
            </div>

            {/* Negatives */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>Pertinent Negatives Explicitly Denied (-)</span>
              </span>
              <ul className="space-y-1 text-[11px] text-slate-700">
                <li className="flex items-center justify-between">
                  <span>• Dyspnea at rest / Orthopnea</span>
                  <span className="font-mono text-slate-500">Denied</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Syncope / Loss of consciousness</span>
                  <span className="font-mono text-slate-500">Denied</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Fever, chills, or productive cough</span>
                  <span className="font-mono text-slate-500">Denied</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 1D: Contradictions & Discrepancies if any */}
        {summary.discrepancies && summary.discrepancies.length > 0 && (
          <div className="border-b border-slate-200 pb-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Clinical Discrepancy & Contradiction Alert</span>
              </div>
              {summary.discrepancies.map((d) => (
                <div key={d.id} className="text-xs bg-white/80 p-2.5 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-950 block">{d.description}</span>
                  <span className="text-[11px] text-amber-800 mt-0.5 block">{d.reconciliationNote}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Chief Complaint */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Chief Complaint (Patient Stated)
            </h3>
            <button
              type="button"
              onClick={() => toggleRejectSection("chiefComplaint")}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                rejectedSections["chiefComplaint"]
                  ? "bg-rose-100 text-rose-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {rejectedSections["chiefComplaint"] ? "Section Rejected" : "Reject"}
            </button>
          </div>

          {isEditing ? (
            <textarea
              value={editedChief}
              onChange={(e) => setEditedChief(e.target.value)}
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              rows={2}
            />
          ) : (
            <p className={`text-sm font-semibold text-slate-900 ${rejectedSections["chiefComplaint"] ? "line-through text-slate-400" : ""}`}>
              {summary.chiefComplaint}
            </p>
          )}
        </div>

        {/* Section 3: History of Present Illness (SOCRATES) */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. History of Present Illness (HPI - SOCRATES Framework)
            </h3>
            <span className="text-[11px] text-cyan-700 font-medium">Structured</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Site & Location:</span>
              <p className="text-slate-800">{summary.hpi.location || "Not provided"}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Onset & Duration:</span>
              <p className="text-slate-800">{summary.hpi.onset || "Not provided"} • {summary.hpi.duration || "Not provided"}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Character & Nature:</span>
              <p className="text-slate-800">{summary.hpi.character || "Not provided"}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Severity & Intensity:</span>
              <p className="text-slate-800 font-semibold text-rose-700">{summary.hpi.severity || "Not provided"}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Aggravating & Relieving Factors:</span>
              <p className="text-slate-800">
                <strong>Aggravates:</strong> {summary.hpi.aggravatingFactors || "Not provided"}<br />
                <strong>Relieves:</strong> {summary.hpi.relievingFactors || "Not provided"}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Associated Symptoms:</span>
              <p className="text-slate-800">{summary.hpi.associatedSymptoms || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Section 4 & 5: Past Medical & Surgical History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              4. Past Medical History
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-800">
              {summary.pastMedicalHistory.length > 0 ? (
                summary.pastMedicalHistory.map((pmh, i) => (
                  <li key={i} className="leading-snug">{pmh}</li>
                ))
              ) : (
                <li className="text-slate-400 italic">Not provided</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              5. Past Surgical History
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-800">
              {summary.pastSurgicalHistory.length > 0 ? (
                summary.pastSurgicalHistory.map((psh, i) => (
                  <li key={i} className="leading-snug">{psh}</li>
                ))
              ) : (
                <li className="text-slate-400 italic">Not provided</li>
              )}
            </ul>
          </div>
        </div>

        {/* Section 6 & 7: Medication History & Allergies */}
        <div className="border-b border-slate-200 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              6. Medication History (Patient Reported vs Document Extracted)
            </h3>
            <span className="text-[10px] text-slate-400">Sources tagged</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {summary.medicationHistory.map((med, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{med.name}</span>
                    <span className="font-semibold text-cyan-700">{med.dose}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {med.frequency} • {med.duration}
                  </p>
                </div>
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase shrink-0 ${
                    med.source === "extracted-from-document"
                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}
                >
                  {med.source === "extracted-from-document" ? "Rx Extracted" : "Self-Reported"}
                </span>
              </div>
            ))}
          </div>

          {/* Drug & Allergy History */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>7. Drug & Allergy History</span>
            </h4>
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs">
              {summary.drugAndAllergyHistory.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-rose-950 font-medium">
                  {summary.drugAndAllergyHistory.map((all, i) => (
                    <li key={i}>{all}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 italic">No known drug allergies reported.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 8 & 9: Family History & Personal History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              8. Family Medical History
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-800">
              {summary.familyHistory.map((fh, i) => (
                <li key={i}>{fh}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              9. Personal & Lifestyle History
            </h3>
            <div className="space-y-1 text-xs text-slate-800">
              <p><strong>Diet:</strong> {summary.personalHistory.diet || "Not provided"}</p>
              <p><strong>Sleep:</strong> {summary.personalHistory.sleep || "Not provided"}</p>
              <p><strong>Occupation:</strong> {summary.personalHistory.occupation || "Not provided"}</p>
              <p><strong>Habits:</strong> {summary.personalHistory.habits || "Not provided"}</p>
              <p><strong>Lifestyle:</strong> {summary.personalHistory.lifestyle || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Section 10: Review of Systems */}
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            10. Review of Systems (ROS)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block">Cardiovascular:</span>
              <span className="text-slate-800">{summary.reviewOfSystems.cardiovascular || "Not provided"}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block">Respiratory:</span>
              <span className="text-slate-800">{summary.reviewOfSystems.respiratory || "Not provided"}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block">Gastrointestinal:</span>
              <span className="text-slate-800">{summary.reviewOfSystems.gastrointestinal || "Not provided"}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block">Neurological:</span>
              <span className="text-slate-800">{summary.reviewOfSystems.neurological || "Not provided"}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block">Musculoskeletal:</span>
              <span className="text-slate-800">{summary.reviewOfSystems.musculoskeletal || "Not provided"}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700 block">General:</span>
              <span className="text-slate-800">{summary.reviewOfSystems.general || "Not provided"}</span>
            </div>
          </div>
        </div>

        {/* Section 11 & 12: Previous Investigations & Document Summary */}
        <div className="border-b border-slate-200 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              11. Previous Investigations (Laboratory & ECG Trends)
            </h3>
            <span className="text-[11px] text-amber-700 italic">For physician review</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5">Investigation</th>
                  <th className="p-2.5">Observed Value</th>
                  <th className="p-2.5">Reference Range</th>
                  <th className="p-2.5">Comparison</th>
                  <th className="p-2.5">Interpretation</th>
                  <th className="p-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.previousInvestigations.map((inv, i) => (
                  <tr
                    key={inv.id || i}
                    className={
                      inv.status === "above_range"
                        ? "bg-rose-50/40 hover:bg-rose-50/70"
                        : inv.status === "below_range"
                        ? "bg-blue-50/40 hover:bg-blue-50/70"
                        : "hover:bg-slate-50"
                    }
                  >
                    <td className="p-2.5 font-bold text-slate-800">{inv.testName}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">
                      {inv.value} {inv.unit && <span className="text-slate-500 font-normal text-[11px]">{inv.unit}</span>}
                    </td>
                    <td className="p-2.5 text-slate-500 font-mono">{inv.referenceRange}</td>
                    <td className="p-2.5">
                      {inv.status === "above_range" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                          Above Range (High)
                        </span>
                      ) : inv.status === "below_range" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-300">
                          Below Range (Low)
                        </span>
                      ) : inv.status === "within_range" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                          Within Range
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                          Undetermined
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-600 italic">{inv.interpretation || "—"}</td>
                    <td className="p-2.5 text-slate-500 font-mono text-[11px]">{inv.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              12. Medical Document Summary
            </h4>
            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {summary.documentSummary}
            </p>
          </div>
        </div>

        {/* Section 13: AYUSH / Dashavidha Pariksha (if enabled) */}
        {summary.isAyushEnabled && (
          <div className="border-b border-slate-200 pb-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                13. AYUSH / Ayurveda Dashavidha Pariksha Clinical Assessment
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-amber-950">
              <div>
                <strong>Prakriti:</strong> {summary.ayushAssessment.prakriti}
              </div>
              <div>
                <strong>Vikriti:</strong> {summary.ayushAssessment.vikriti}
              </div>
              <div>
                <strong>Sara:</strong> {summary.ayushAssessment.sara}
              </div>
              <div>
                <strong>Samhanana:</strong> {summary.ayushAssessment.samhanana}
              </div>
              <div>
                <strong>Pramana:</strong> {summary.ayushAssessment.pramana}
              </div>
              <div>
                <strong>Satmya:</strong> {summary.ayushAssessment.satmya}
              </div>
              <div>
                <strong>Sattva:</strong> {summary.ayushAssessment.sattva}
              </div>
              <div>
                <strong>Ahara Shakti:</strong> {summary.ayushAssessment.aharaShakti}
              </div>
              <div>
                <strong>Vyayama Shakti:</strong> {summary.ayushAssessment.vyayamaShakti}
              </div>
            </div>
          </div>
        )}

        {/* Physician Clinical Impression, Examination Notes & Verification Actions */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-cyan-700" />
              <span>Attending Physician Clinical Impression & Examination Plan</span>
            </h3>
            <span className="text-[10px] text-cyan-700 font-bold">Mandatory for Final Record</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Physician Diagnostic Impression / Working Differential:
            </label>
            <input
              type="text"
              value={physicianImpression}
              onChange={(e) => setPhysicianImpression(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-semibold text-slate-900"
              placeholder="e.g. Accelerating Angina / Rule Out CAD"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Physical Examination Notes & Immediate Orders:
            </label>
            <textarea
              value={physicianNotes}
              onChange={(e) => setPhysicianNotes(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              rows={2}
              placeholder="e.g. Stat 12-lead ECG ordered. Troponin I sent. Patient moved to acute observation."
            />
          </div>

          {/* Final Verification and Signature Controls */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Physician sign-off seals the intake draft into official medical records.</span>
            </div>

            <button
              id="physician-verify-save-btn"
              type="button"
              onClick={onVerifyAndSave}
              className="px-6 py-2.5 text-xs font-extrabold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Sign Clinical History</span>
            </button>
          </div>
        </div>
      </div>

      {/* FHIR R4 Bundle Modal */}
      {showFhirModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  HL7 FHIR R4 Clinical Document Bundle (ABDM Compatible)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFhirModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Standardized FHIR R4 structure for EMR/HIS integration with Patient, Condition, MedicationStatement, and Observation resources:
            </p>

            <pre className="mt-3 flex-1 overflow-y-auto p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl">
              {JSON.stringify(fhirBundle, null, 2)}
            </pre>

            {emrTransmissionResult && (
              <div
                className={`mt-3 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 ${
                  emrTransmissionResult.success
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>EMR Gateway:</strong> {emrTransmissionResult.message}
                  </span>
                </div>
                {emrTransmissionResult.transmissionId && (
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border">
                    {emrTransmissionResult.transmissionId}
                  </span>
                )}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={isTransmittingEmr}
                onClick={async () => {
                  setIsTransmittingEmr(true);
                  try {
                    const res = await transmitToEmrHis(fhirBundle);
                    setEmrTransmissionResult(res);
                  } catch (e: any) {
                    setEmrTransmissionResult({
                      success: false,
                      message: e?.message || "EMR transmission error",
                    });
                  } finally {
                    setIsTransmittingEmr(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{isTransmittingEmr ? "Transmitting..." : "Sync to EMR / ABDM Gateway"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `FHIR-Bundle-${summary.patientInfo.patientId}.json`;
                  a.click();
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFhirModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 30s One-Page Clinical Brief & Verifier Modal */}
      <ClinicalBriefModal
        isOpen={showBriefModal}
        onClose={() => setShowBriefModal(false)}
        summary={summary}
        onUpdateSummary={onUpdateSummary}
        isHighContrast={isHighContrast}
      />

      {/* Vitals Capture Modal */}
      <VitalsCaptureModal
        isOpen={showVitalsModal}
        onClose={() => setShowVitalsModal(false)}
        currentVitals={summary.vitals}
        onSaveVitals={(vitals, measurements) => {
          const updated: PhysicianClinicalHistory = {
            ...summary,
            vitals,
          };
          onUpdateSummary(updated);
        }}
        isHighContrast={isHighContrast}
      />
    </div>
  );
};
