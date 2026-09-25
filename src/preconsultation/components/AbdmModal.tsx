import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileCheck2,
  Lock,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { generateAbdmConsentArtifact, generateFhirR4Bundle } from "../services/fhirService";
import { DemographicData, PhysicianClinicalHistory } from "../types";

interface AbdmModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: DemographicData;
  summary: PhysicianClinicalHistory;
}

export const AbdmModal: React.FC<AbdmModalProps> = ({
  isOpen,
  onClose,
  patient,
  summary,
}) => {
  const [activeTab, setActiveTab] = useState<"consent" | "fhir" | "gateway">("consent");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const consentArtifact = generateAbdmConsentArtifact(patient);
  const fhirBundle = generateFhirR4Bundle(summary);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  ABDM & Hospital Information System (HIS) Integration
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-300 text-teal-950 uppercase">
                  Prototype Integration
                </span>
              </div>
              <p className="text-xs text-teal-200">
                Ayushman Bharat Digital Mission • National Health Data Registry Architecture
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("consent")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "consent"
                ? "border-teal-600 text-teal-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Digital Consent Artifact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fhir")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "fhir"
                ? "border-teal-600 text-teal-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            FHIR R4 Bundle
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gateway")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "gateway"
                ? "border-teal-600 text-teal-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            HIS Bridge & Milestones
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === "consent" && (
            <div className="space-y-3">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">ABHA Health ID: {patient.abhaId || "91-4523-8891-2304"}</span>
                  <p className="text-[11px] text-teal-700">Consent Status: GRANTED (Pre-Consultation Intake)</p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 bg-slate-900 text-teal-300 font-mono text-xs rounded-xl overflow-x-auto">
                <pre>{JSON.stringify(consentArtifact, null, 2)}</pre>
              </div>
            </div>
          )}

          {activeTab === "fhir" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Compliant with NRCeS India FHIR R4 Clinical Profiles:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(fhirBundle, null, 2))}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-72">
                {JSON.stringify(fhirBundle, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === "gateway" && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">ABDM Integration Milestones:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-semibold">M1: ABHA Registration & Verification</span>
                    <span className="text-emerald-700 font-bold">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-semibold">M2: Health Information Provider (HIP) Record Linkage</span>
                    <span className="text-emerald-700 font-bold">Simulated</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-semibold">M3: Health Information User (HIU) Consent Pull</span>
                    <span className="text-emerald-700 font-bold">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
