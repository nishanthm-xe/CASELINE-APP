import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Pill,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Save,
  Plus,
  ArrowLeft,
  Sparkles,
  Eye,
} from "lucide-react";
import {
  MedicalDocument,
  MedicationItem,
  InvestigationItem,
  LanguageOption,
} from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { processDocumentOcr } from "../services/apiService";
import { evaluateInvestigationStatus } from "../utils/investigationUtils";

interface MedicalRecordsUploadScreenProps {
  patientId: string;
  selectedLanguage: LanguageOption;
  existingDocuments: MedicalDocument[];
  onAddDocument: (doc: MedicalDocument) => void;
  onBackToDashboard: () => void;
}

export const MedicalRecordsUploadScreen: React.FC<MedicalRecordsUploadScreenProps> = ({
  patientId,
  selectedLanguage,
  existingDocuments,
  onAddDocument,
  onBackToDashboard,
}) => {
  const [docType, setDocType] = useState<
    | "Prescription"
    | "Laboratory report"
    | "Discharge summary"
    | "Scan / investigation report"
    | "Medical report"
  >("Laboratory report");

  const [institution, setInstitution] = useState("Apollo Specialty Hospital");
  const [docDate, setDocDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  // Extracted entities
  const [extractedMedicines, setExtractedMedicines] = useState<MedicationItem[]>(
    []
  );
  const [extractedInvestigations, setExtractedInvestigations] = useState<
    InvestigationItem[]
  >([]);
  const [extractedDiagnoses, setExtractedDiagnoses] = useState<string[]>([]);
  const [newDiagnosis, setNewDiagnosis] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const docTypesList = [
    "Prescription",
    "Laboratory report",
    "Discharge summary",
    "Scan / investigation report",
    "Medical report",
  ] as const;

  // Handle file selection (drag, manual, camera)
  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setFilePreview(base64);
      runOcr(base64);
    };
    reader.readAsDataURL(file);
  };

  const runOcr = async (base64: string) => {
    setIsProcessingOcr(true);
    setOcrSuccess(false);

    try {
      const result = await processDocumentOcr(base64, "image/jpeg", docType);
      if (result) {
        setExtractedMedicines(result.extractedMedicines || []);
        // Map investigations with status comparison
        const mappedInvs: InvestigationItem[] = (
          result.extractedInvestigations || []
        ).map((inv: any, i: number) => {
          const evalResult = evaluateInvestigationStatus(inv.value, inv.referenceRange);
          return {
            id: inv.id || `inv-${Date.now()}-${i}`,
            testName: inv.testName,
            value: inv.value,
            unit: inv.unit || "",
            referenceRange: inv.referenceRange || "Standard",
            status: inv.status || evalResult.status,
            interpretation: inv.interpretation || evalResult.interpretation,
            date: inv.date || docDate,
          };
        });

        setExtractedInvestigations(mappedInvs);
        setExtractedDiagnoses(result.extractedDiagnoses || []);
        setOcrSuccess(true);
      }
    } catch (err) {
      console.error("OCR Processing error:", err);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleSaveAndAttach = () => {
    const newDoc: MedicalDocument = {
      id: `doc-${Date.now()}`,
      patientId,
      title: `${docType} - ${institution}`,
      documentType: docType,
      date: docDate,
      institutionOrDoctor: institution,
      filePreview: filePreview || undefined,
      extractedDiagnoses,
      extractedMedicines,
      extractedInvestigations,
      proceduresMentioned: [],
      allergiesMentioned: [],
      status: "verified",
      confidenceScore: 0.96,
    };

    onAddDocument(newDoc);
    onBackToDashboard();
  };

  // Quick Demo Document pre-loader
  const handleLoadDemoLabReport = () => {
    setFileName("Apollo_Comprehensive_Metabolic_Panel.pdf");
    setDocType("Laboratory report");
    setInstitution("Apollo Diagnostics");
    setDocDate("2026-03-15");
    setFilePreview(
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
    );

    setExtractedInvestigations([
      {
        id: "inv-1",
        testName: "Fasting Blood Sugar (FBS)",
        value: "136",
        unit: "mg/dL",
        referenceRange: "70 - 100",
        status: "above_range",
        interpretation: "Hyperglycemia - Requires diabetic review",
      },
      {
        id: "inv-2",
        testName: "HbA1c (Glycated Hemoglobin)",
        value: "7.8",
        unit: "%",
        referenceRange: "< 5.7",
        status: "above_range",
        interpretation: "Sub-optimal glycemic control",
      },
      {
        id: "inv-3",
        testName: "Serum Creatinine",
        value: "1.1",
        unit: "mg/dL",
        referenceRange: "0.7 - 1.3",
        status: "within_range",
        interpretation: "Normal kidney filtration",
      },
      {
        id: "inv-4",
        testName: "Total Cholesterol",
        value: "215",
        unit: "mg/dL",
        referenceRange: "< 200",
        status: "above_range",
        interpretation: "Mild hypercholesterolemia",
      },
    ]);

    setExtractedMedicines([
      {
        id: "med-1",
        name: "Metformin Hydrochloride",
        dose: "500 mg",
        frequency: "Once daily with dinner",
        duration: "30 days",
        source: "extracted-from-document",
      },
      {
        id: "med-2",
        name: "Telmisartan",
        dose: "40 mg",
        frequency: "Once daily morning",
        duration: "30 days",
        source: "extracted-from-document",
      },
    ]);

    setExtractedDiagnoses(["Type 2 Diabetes Mellitus", "Essential Hypertension"]);
    setOcrSuccess(true);
  };

  return (
    <div
      id="medical-records-upload-screen"
      className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24"
    >
      {/* Top Banner with CaseLine Avatar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CaseLineAvatar
            size="md"
            mood={isProcessingOcr ? "PROCESSING" : "IDLE"}
            pose="document"
            showStatusBadge={true}
          />
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                OCR & Lab Verification
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Medical Documents & OCR Scan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Upload prescriptions, discharge notes, or lab test results for instant AI entity extraction
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadDemoLabReport}
          className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Load Sample Lab Report</span>
        </button>
      </div>

      {/* Document Type Selector Chips */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Select Document Category:
        </label>
        <div className="flex flex-wrap gap-2">
          {docTypesList.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDocType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                docType === type
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone & Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Drag & Drop Upload Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="md:col-span-2 border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <div className="w-16 h-16 rounded-2xl bg-white shadow-md text-sky-600 flex items-center justify-center mb-3">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="font-extrabold text-base text-slate-900">
            {fileName ? fileName : "Drag & Drop Medical Report, or Click to Browse"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Supports PDF, JPG, and PNG files. High resolution ensures accurate medicine and reference range extraction.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-2xs hover:bg-sky-700"
            >
              Browse Files
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Camera Scan</span>
            </button>
          </div>
        </div>

        {/* Institution and Date fields */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900">
            Document Metadata
          </h4>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Hospital / Lab Provider
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Report Date
            </label>
            <input
              type="date"
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            />
          </div>

          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Verification Engine
            </div>
            <p className="text-xs text-slate-600">
              Gemini Vision OCR with automated reference range comparison
            </p>
          </div>
        </div>
      </div>

      {/* OCR Review & Extracted Information */}
      {(ocrSuccess || extractedInvestigations.length > 0 || extractedMedicines.length > 0) && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  OCR Extraction & Clinical Review
                </h3>
                <p className="text-xs text-slate-500">
                  Verify or edit extracted parameters before adding to your permanent timeline
                </p>
              </div>
            </div>

            <button
              type="button"
              id="confirm-attach-doc-btn"
              onClick={handleSaveAndAttach}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Confirm & Attach to Timeline</span>
            </button>
          </div>

          {/* Section: Laboratory Investigations Table */}
          {extractedInvestigations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                  <span>
                    Laboratory Investigations & Reference Ranges (
                    {extractedInvestigations.length})
                  </span>
                </h4>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3">Test Name</th>
                      <th className="p-3">Reported Value</th>
                      <th className="p-3">Reference Range</th>
                      <th className="p-3">Status Comparison</th>
                      <th className="p-3">Interpretation</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extractedInvestigations.map((inv, idx) => (
                      <tr key={inv.id || idx} className="hover:bg-sky-50/40">
                        <td className="p-3 font-bold text-slate-900">
                          {inv.testName}
                        </td>
                        <td className="p-3 font-extrabold text-slate-800">
                          {inv.value} {inv.unit}
                        </td>
                        <td className="p-3 text-slate-500 font-medium">
                          {inv.referenceRange}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold inline-block ${
                              inv.status === "within_range"
                                ? "bg-emerald-100 text-emerald-800"
                                : inv.status === "above_range"
                                ? "bg-rose-100 text-rose-800"
                                : inv.status === "below_range"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {inv.status === "within_range"
                              ? "✓ Within Range"
                              : inv.status === "above_range"
                              ? "▲ Above Range"
                              : inv.status === "below_range"
                              ? "▼ Below Range"
                              : "Undetermined"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs">
                          {inv.interpretation || "—"}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setExtractedInvestigations((prev) =>
                                prev.filter((_, i) => i !== idx)
                              );
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Extracted Medicines */}
          {extractedMedicines.length > 0 && (
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 mb-3">
                <Pill className="w-4 h-4 text-purple-600" />
                <span>Extracted Prescription Medications ({extractedMedicines.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {extractedMedicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 flex items-start justify-between gap-2"
                  >
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900">
                        {med.name}
                      </h5>
                      <p className="text-xs text-purple-900 font-semibold mt-0.5">
                        {med.dose} • {med.frequency}
                      </p>
                      {med.duration && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Duration: {med.duration}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExtractedMedicines((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Diagnoses */}
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 mb-2">
              Diagnoses Mentioned in Document
            </h4>
            <div className="flex flex-wrap gap-2">
              {extractedDiagnoses.map((diag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 font-bold text-xs flex items-center gap-1.5"
                >
                  <span>{diag}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setExtractedDiagnoses((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-sky-400 hover:text-sky-800"
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder="+ Add diagnosis"
                  className="px-3 py-1 rounded-xl border border-slate-200 text-xs font-medium"
                />
                {newDiagnosis && (
                  <button
                    type="button"
                    onClick={() => {
                      setExtractedDiagnoses((prev) => [...prev, newDiagnosis]);
                      setNewDiagnosis("");
                    }}
                    className="px-2.5 py-1 rounded-xl bg-sky-600 text-white text-xs font-bold"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
