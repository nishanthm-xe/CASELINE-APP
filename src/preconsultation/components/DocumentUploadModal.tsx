import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BookmarkCheck,
  Camera,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Edit3,
  FileSpreadsheet,
  FileText,
  FileUp,
  HelpCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { DEMO_DOCUMENTS } from "../data/demoData";
import { processDocumentOcr } from "../services/apiService";
import { InvestigationItem, MedicalDocument, MedicationItem } from "../types";
import {
  cleanValueAndUnit,
  evaluateInvestigationStatus,
  normalizeInvestigationItem,
  normalizeMedicationItem,
  STANDARD_INVESTIGATION_PRESETS,
  StandardInvestigationPreset,
} from "../utils/investigationUtils";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (doc: MedicalDocument) => void;
  patientId: string;
  isHighContrast?: boolean;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onAddDocument,
  patientId,
  isHighContrast = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [extractedDoc, setExtractedDoc] = useState<MedicalDocument | null>(() => {
    const base = DEMO_DOCUMENTS[0];
    return {
      ...base,
      extractedInvestigations: base.extractedInvestigations.map((inv, i) =>
        normalizeInvestigationItem(inv, base.date, i)
      ),
      extractedMedicines: base.extractedMedicines.map((med, i) =>
        normalizeMedicationItem(med, i)
      ),
    };
  });
  const [customDocType, setCustomDocType] = useState<any>("Laboratory report");

  // Track verified and manually modified investigation items
  const [verifiedItemIds, setVerifiedItemIds] = useState<Set<string>>(new Set());
  const [manuallyModifiedItemIds, setManuallyModifiedItemIds] = useState<Set<string>>(new Set());
  const [activePresetPickerIndex, setActivePresetPickerIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // Handle Preset Selection
  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    const doc = DEMO_DOCUMENTS[idx];
    const normalizedDoc: MedicalDocument = {
      ...doc,
      extractedInvestigations: doc.extractedInvestigations.map((inv, i) =>
        normalizeInvestigationItem(inv, doc.date, i)
      ),
      extractedMedicines: doc.extractedMedicines.map((med, i) =>
        normalizeMedicationItem(med, i)
      ),
    };
    setExtractedDoc(normalizedDoc);
    setUploadedFilePreview(null);
    setVerifiedItemIds(new Set());
    setManuallyModifiedItemIds(new Set());
    setActivePresetPickerIndex(null);
  };

  // Handle Local File Upload (Image or PDF)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadedFilePreview(base64);

      try {
        // Send to backend Gemini OCR endpoint
        const ocrResult = await processDocumentOcr(base64, file.type, customDocType);
        if (ocrResult) {
          const docDate = ocrResult.documentDate || new Date().toISOString().split("T")[0];
          const newDoc: MedicalDocument = {
            id: `doc-${Date.now()}`,
            patientId,
            title: file.name.replace(/\.[^/.]+$/, ""),
            documentType: ocrResult.documentType || customDocType,
            date: docDate,
            institutionOrDoctor: ocrResult.institutionOrDoctor || "Uploaded Clinical Document",
            rawText: ocrResult.rawExtractedText || "OCR text extraction completed.",
            extractedDiagnoses: ocrResult.diagnoses || [],
            extractedMedicines: (ocrResult.medicines || []).map((med: any, idx: number) =>
              normalizeMedicationItem(med, idx)
            ),
            extractedInvestigations: (ocrResult.investigations || []).map((inv: any, idx: number) =>
              normalizeInvestigationItem(inv, docDate, idx)
            ),
            proceduresMentioned: ocrResult.procedures || [],
            allergiesMentioned: ocrResult.allergiesMentioned || [],
            status: "verified",
            confidenceScore: ocrResult.confidenceScore || 0.94,
          };
          setExtractedDoc(newDoc);
          setVerifiedItemIds(new Set());
          setManuallyModifiedItemIds(new Set());
        }
      } catch (err) {
        console.error("Error processing OCR:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Live Investigation Updates with instant automated status evaluation
  const handleUpdateInvestigation = (index: number, field: keyof InvestigationItem, val: string) => {
    if (!extractedDoc) return;
    const updated = [...extractedDoc.extractedInvestigations];
    const current = { ...updated[index], [field]: val };

    // When value or reference range changes, automatically recalculate comparison status in real time
    if (field === "value" || field === "referenceRange") {
      const evalRes = evaluateInvestigationStatus(
        field === "value" ? val : current.value,
        field === "referenceRange" ? val : current.referenceRange
      );
      current.status = evalRes.status;
      current.interpretation = evalRes.interpretation;
    }

    updated[index] = current;
    setExtractedDoc({ ...extractedDoc, extractedInvestigations: updated });

    const itemId = current.id || `inv-${index}`;
    setManuallyModifiedItemIds((prev) => new Set(prev).add(itemId));
  };

  // Direct manual status override (e.g. clinician knows patient's individual target)
  const handleSetInvestigationStatus = (index: number, newStatus: InvestigationItem["status"]) => {
    if (!extractedDoc) return;
    const updated = [...extractedDoc.extractedInvestigations];
    const current = updated[index];
    let newInterp = current.interpretation;

    if (newStatus === "above_range") newInterp = "Above reference range (High)";
    else if (newStatus === "below_range") newInterp = "Below reference range (Low)";
    else if (newStatus === "within_range") newInterp = "Within reference range";
    else newInterp = "Undetermined reference range";

    updated[index] = {
      ...current,
      status: newStatus,
      interpretation: newInterp,
    };
    setExtractedDoc({ ...extractedDoc, extractedInvestigations: updated });

    const itemId = current.id || `inv-${index}`;
    setManuallyModifiedItemIds((prev) => new Set(prev).add(itemId));
    setVerifiedItemIds((prev) => new Set(prev).add(itemId));
  };

  // Auto-recalculate single item against standard bounds
  const handleRecalculateStatus = (index: number) => {
    if (!extractedDoc) return;
    const updated = [...extractedDoc.extractedInvestigations];
    const item = updated[index];
    const evalRes = evaluateInvestigationStatus(item.value, item.referenceRange);
    updated[index] = {
      ...item,
      status: evalRes.status,
      interpretation: evalRes.interpretation,
    };
    setExtractedDoc({ ...extractedDoc, extractedInvestigations: updated });
  };

  // Reset all automated mappings to pure algorithmic evaluation
  const handleResetAllMappings = () => {
    if (!extractedDoc) return;
    const recalculated = extractedDoc.extractedInvestigations.map((inv) => {
      const evalRes = evaluateInvestigationStatus(inv.value, inv.referenceRange);
      return {
        ...inv,
        status: evalRes.status,
        interpretation: evalRes.interpretation,
      };
    });
    setExtractedDoc({ ...extractedDoc, extractedInvestigations: recalculated });
    setManuallyModifiedItemIds(new Set());
  };

  // Apply standard investigation preset to an existing row
  const handleApplyPreset = (index: number, preset: StandardInvestigationPreset) => {
    if (!extractedDoc) return;
    const updated = [...extractedDoc.extractedInvestigations];
    const current = updated[index];
    const evalRes = evaluateInvestigationStatus(current.value, preset.standardReferenceRange);

    updated[index] = {
      ...current,
      testName: preset.testName,
      unit: preset.defaultUnit,
      referenceRange: preset.standardReferenceRange,
      status: evalRes.status,
      interpretation: evalRes.interpretation,
    };

    setExtractedDoc({ ...extractedDoc, extractedInvestigations: updated });
    const itemId = current.id || `inv-${index}`;
    setManuallyModifiedItemIds((prev) => new Set(prev).add(itemId));
    setActivePresetPickerIndex(null);
  };

  // Toggle verified checkmark for a single row
  const handleToggleVerified = (id: string) => {
    setVerifiedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Verify all rows in 1 click
  const handleVerifyAll = () => {
    if (!extractedDoc) return;
    const allIds = new Set(
      extractedDoc.extractedInvestigations.map((inv, idx) => inv.id || `inv-${idx}`)
    );
    setVerifiedItemIds(allIds);
  };

  // Add a new row
  const handleAddInvestigationRow = (preset?: StandardInvestigationPreset) => {
    if (!extractedDoc) return;
    const newId = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newRow: InvestigationItem = {
      id: newId,
      testName: preset ? preset.testName : "New Parameter",
      value: "0",
      unit: preset ? preset.defaultUnit : "mg/dL",
      referenceRange: preset ? preset.standardReferenceRange : "70 - 100",
      status: "within_range",
      interpretation: "Within normal limits",
      date: extractedDoc.date,
    };

    setExtractedDoc({
      ...extractedDoc,
      extractedInvestigations: [...extractedDoc.extractedInvestigations, newRow],
    });
    setVerifiedItemIds((prev) => new Set(prev).add(newId));
  };

  // Delete row
  const handleDeleteInvestigationRow = (index: number) => {
    if (!extractedDoc) return;
    const target = extractedDoc.extractedInvestigations[index];
    const itemId = target?.id || `inv-${index}`;
    const updated = extractedDoc.extractedInvestigations.filter((_, i) => i !== index);
    setExtractedDoc({ ...extractedDoc, extractedInvestigations: updated });
    setVerifiedItemIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    setManuallyModifiedItemIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  // Confirm and persist to patient timeline
  const handleConfirmAndAddToHistory = () => {
    if (extractedDoc) {
      const finalDoc: MedicalDocument = {
        ...extractedDoc,
        extractedInvestigations: extractedDoc.extractedInvestigations.map((inv, idx) =>
          normalizeInvestigationItem(inv, extractedDoc.date, idx)
        ),
        extractedMedicines: extractedDoc.extractedMedicines.map((med, idx) =>
          normalizeMedicationItem(med, idx)
        ),
      };
      onAddDocument(finalDoc);
      onClose();
    }
  };

  // Statistics for real-time overview badge bar
  const investigationsList = extractedDoc?.extractedInvestigations || [];
  const highCount = investigationsList.filter((inv) => inv.status === "above_range").length;
  const lowCount = investigationsList.filter((inv) => inv.status === "below_range").length;
  const normalCount = investigationsList.filter((inv) => inv.status === "within_range").length;
  const undeterminedCount = investigationsList.filter((inv) => inv.status === "undetermined").length;
  const verifiedCount = investigationsList.filter((inv, idx) =>
    verifiedItemIds.has(inv.id || `inv-${idx}`)
  ).length;
  const allVerified = investigationsList.length > 0 && verifiedCount === investigationsList.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div
        className={`relative w-full max-w-5xl rounded-2xl shadow-2xl border my-6 overflow-hidden flex flex-col max-h-[92vh] ${
          isHighContrast
            ? "bg-zinc-900 border-yellow-400 text-white"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-800">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900">
                  Medical Document OCR & Entity Verification
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  Real-Time Mapping
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Inspect, verify, and fine-tune laboratory values, reference ranges, and automated anomaly flags
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Quick 1-Click Sample Medical Records Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Pre-Configured Test Record Or Upload Document:
              </label>
              <span className="text-[11px] text-cyan-600 font-medium">
                Prototype Presets
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_DOCUMENTS.map((doc, idx) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedPreset === idx && !uploadedFilePreview
                      ? "border-cyan-600 bg-cyan-50/70 ring-2 ring-cyan-500/20 shadow-xs"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {doc.documentType}
                    </span>
                    <span className="text-[10px] text-slate-400">{doc.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {doc.institutionOrDoctor}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Or Upload Custom Image / PDF / Camera */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center">
            <div className="max-w-md mx-auto">
              <Upload className="w-7 h-7 text-cyan-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Or Upload Patient Prescription, Lab Report, or Discharge Summary
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Multimodal OCR automatically extracts parameters, values, and normal ranges.
              </p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <label className="cursor-pointer px-4 py-2 text-xs font-bold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition-colors flex items-center gap-1.5 shadow-2xs">
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <label className="cursor-pointer px-3 py-2 text-xs font-semibold rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Processing Loading Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center gap-3 text-cyan-800 text-xs font-semibold animate-pulse">
              <RefreshCw className="w-5 h-5 text-cyan-600 animate-spin" />
              <span>Scanning document with Gemini Multimodal OCR and identifying clinical entities...</span>
            </div>
          )}

          {/* Extracted Structured Entity View & Abnormal Value Highlighter */}
          {extractedDoc && !isProcessing && (
            <div className="space-y-4">
              {/* Document Summary Header Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <FileText className="w-5 h-5 text-cyan-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {extractedDoc.title}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                        OCR Confidence: {Math.round(extractedDoc.confidenceScore * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {extractedDoc.institutionOrDoctor} • Date: {extractedDoc.date}
                    </p>
                  </div>
                </div>

                {/* Extracted Diagnoses Badges */}
                {extractedDoc.extractedDiagnoses.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">Diagnoses:</span>
                    {extractedDoc.extractedDiagnoses.map((diag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs font-bold rounded-md bg-cyan-100 text-cyan-900 border border-cyan-200"
                      >
                        {diag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* CORE FOCUS: Real-Time Laboratory Investigations Preview & Verification Table */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {/* Real-time Table Header Bar with Live Summary Metrics */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-50 via-cyan-50/30 to-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-600" />
                        <span>Extracted Investigations Verification Table</span>
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-800">
                        {investigationsList.length} Parameter{investigationsList.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Verify observed values and standard reference ranges. Status recalculates automatically in real time.
                    </p>
                  </div>

                  {/* Real-time Status Metric Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {highCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{highCount} High</span>
                      </span>
                    )}

                    {lowCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>{lowCount} Low</span>
                      </span>
                    )}

                    {normalCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <Check className="w-3.5 h-3.5" />
                        <span>{normalCount} Normal</span>
                      </span>
                    )}

                    {undeterminedCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{undeterminedCount} Undetermined</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Verification Control Actions Bar */}
                <div className="px-4 py-2 bg-slate-50/75 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyAll}
                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                        allVerified
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{allVerified ? "All Tests Verified" : "Verify All Tests"}</span>
                    </button>

                    {manuallyModifiedItemIds.size > 0 && (
                      <button
                        type="button"
                        onClick={handleResetAllMappings}
                        title="Re-run automatic reference range math on all parameters"
                        className="px-2.5 py-1 rounded-lg font-semibold bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reset Auto-Mapping</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Reviewed:{" "}
                      <strong className="text-slate-800">
                        {verifiedCount}/{investigationsList.length}
                      </strong>
                    </span>

                    {/* Quick Add Custom or Preset Investigation */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => handleAddInvestigationRow()}
                        className="px-3 py-1 rounded-lg font-bold bg-cyan-700 text-white hover:bg-cyan-800 flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lab Result</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                {investigationsList.length === 0 ? (
                  <div className="p-8 text-center bg-white">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">
                      No laboratory investigations detected in this document.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                      If this record contains blood tests, urinalysis, or radiology parameters, you can manually add them before importing.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddInvestigationRow()}
                      className="mt-3 px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Extracted Lab Parameter</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-2.5 w-10 text-center">Verify</th>
                          <th className="p-2.5 min-w-[170px]">Test Parameter</th>
                          <th className="p-2.5 min-w-[130px]">Observed Value & Unit</th>
                          <th className="p-2.5 min-w-[180px]">Standard Reference Range</th>
                          <th className="p-2.5 min-w-[170px]">Status & Auto-Mapping</th>
                          <th className="p-2.5 min-w-[180px]">Clinical Interpretation</th>
                          <th className="p-2.5 w-12 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {investigationsList.map((inv, i) => {
                          const itemId = inv.id || `inv-${i}`;
                          const isHigh = inv.status === "above_range";
                          const isLow = inv.status === "below_range";
                          const isNormal = inv.status === "within_range";
                          const isVerified = verifiedItemIds.has(itemId);
                          const isModified = manuallyModifiedItemIds.has(itemId);

                          return (
                            <tr
                              key={itemId}
                              className={`transition-colors ${
                                isVerified
                                  ? isHigh
                                    ? "bg-rose-50/40"
                                    : isLow
                                    ? "bg-blue-50/40"
                                    : "bg-emerald-50/25"
                                  : isHigh
                                  ? "bg-rose-50/20 hover:bg-rose-50/40"
                                  : isLow
                                  ? "bg-blue-50/20 hover:bg-blue-50/40"
                                  : "hover:bg-slate-50/80"
                              }`}
                            >
                              {/* Verification Checkbox Column */}
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleVerified(itemId)}
                                  title={isVerified ? "Marked as verified by clinician" : "Click to mark verified"}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                    isVerified
                                      ? "bg-emerald-600 text-white shadow-2xs scale-105"
                                      : "border border-slate-300 text-slate-300 hover:border-emerald-500 hover:text-emerald-500 bg-white"
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </td>

                              {/* Test Parameter Column with Quick Preset Selector */}
                              <td className="p-2.5 font-bold text-slate-900">
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={inv.testName}
                                    onChange={(e) => handleUpdateInvestigation(i, "testName", e.target.value)}
                                    className="w-full px-2 py-1 rounded-md border border-slate-300 font-bold text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                  />
                                  <div className="flex items-center justify-between">
                                    {isModified ? (
                                      <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                                        <Edit3 className="w-2.5 h-2.5" />
                                        <span>Manual adjustment</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">OCR Extracted</span>
                                    )}

                                    {/* Preset Quick Dropdown Trigger */}
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActivePresetPickerIndex(
                                            activePresetPickerIndex === i ? null : i
                                          )
                                        }
                                        className="text-[10px] text-cyan-700 hover:text-cyan-900 font-semibold underline flex items-center gap-0.5"
                                      >
                                        <span>Standard Presets</span>
                                        <ChevronDown className="w-2.5 h-2.5" />
                                      </button>

                                      {activePresetPickerIndex === i && (
                                        <div className="absolute left-0 top-full mt-1 z-50 w-64 p-2 bg-white rounded-xl shadow-xl border border-slate-200 text-left max-h-56 overflow-y-auto">
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                                            Apply Standard Reference:
                                          </div>
                                          {STANDARD_INVESTIGATION_PRESETS.map((preset, pIdx) => (
                                            <button
                                              key={pIdx}
                                              type="button"
                                              onClick={() => handleApplyPreset(i, preset)}
                                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-cyan-50 text-[11px] flex items-center justify-between text-slate-800 transition-colors"
                                            >
                                              <span className="font-semibold line-clamp-1">{preset.testName}</span>
                                              <span className="text-[10px] text-slate-500 font-mono">
                                                {preset.standardReferenceRange} {preset.defaultUnit}
                                              </span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Observed Value & Unit Column */}
                              <td className="p-2.5">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={inv.value}
                                    onChange={(e) => handleUpdateInvestigation(i, "value", e.target.value)}
                                    title="Observed test result"
                                    className={`w-20 px-2 py-1 rounded-md border font-mono font-bold text-xs bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 ${
                                      isHigh
                                        ? "border-rose-300 text-rose-800 bg-rose-50/50"
                                        : isLow
                                        ? "border-blue-300 text-blue-800 bg-blue-50/50"
                                        : "border-slate-300 text-slate-900"
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={inv.unit || ""}
                                    placeholder="unit"
                                    onChange={(e) => handleUpdateInvestigation(i, "unit", e.target.value)}
                                    className="w-16 px-1.5 py-1 rounded-md border border-slate-300 font-mono text-slate-600 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                  />
                                </div>
                              </td>

                              {/* Standard Reference Range Column */}
                              <td className="p-2.5">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={inv.referenceRange}
                                      onChange={(e) =>
                                        handleUpdateInvestigation(i, "referenceRange", e.target.value)
                                      }
                                      className="w-full px-2 py-1 rounded-md border border-slate-300 font-mono text-slate-700 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRecalculateStatus(i)}
                                      title="Auto-evaluate status against reference range"
                                      className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-cyan-700 transition-colors"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <span>e.g. 70 - 99, &lt; 140, &gt; 40</span>
                                  </div>
                                </div>
                              </td>

                              {/* Status & Automated Mapping Selector */}
                              <td className="p-2.5">
                                <div className="space-y-1">
                                  <select
                                    value={inv.status}
                                    onChange={(e) =>
                                      handleSetInvestigationStatus(i, e.target.value as any)
                                    }
                                    className={`w-full px-2 py-1 rounded-md border font-bold text-xs appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-600 ${
                                      isHigh
                                        ? "bg-rose-100 border-rose-300 text-rose-800"
                                        : isLow
                                        ? "bg-blue-100 border-blue-300 text-blue-800"
                                        : isNormal
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                        : "bg-slate-100 border-slate-300 text-slate-700"
                                    }`}
                                  >
                                    <option value="above_range">🔺 Above Range (High)</option>
                                    <option value="within_range">✓ Within Range (Normal)</option>
                                    <option value="below_range">🔻 Below Range (Low)</option>
                                    <option value="undetermined">❓ Undetermined</option>
                                  </select>

                                  <div className="flex items-center justify-between text-[10px]">
                                    {isHigh && (
                                      <span className="text-rose-700 font-semibold flex items-center gap-0.5">
                                        <TrendingUp className="w-2.5 h-2.5" />
                                        <span>Elevated Anomaly</span>
                                      </span>
                                    )}
                                    {isLow && (
                                      <span className="text-blue-700 font-semibold flex items-center gap-0.5">
                                        <TrendingDown className="w-2.5 h-2.5" />
                                        <span>Low Anomaly</span>
                                      </span>
                                    )}
                                    {isNormal && (
                                      <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                        <Check className="w-2.5 h-2.5" />
                                        <span>Optimal Target</span>
                                      </span>
                                    )}
                                    {!isHigh && !isLow && !isNormal && (
                                      <span className="text-slate-500 font-medium">Requires review</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Clinical Interpretation Column */}
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  value={inv.interpretation || ""}
                                  onChange={(e) =>
                                    handleUpdateInvestigation(i, "interpretation", e.target.value)
                                  }
                                  placeholder="Clinical finding..."
                                  className="w-full px-2 py-1 rounded-md border border-slate-300 text-xs bg-white text-slate-800 italic focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                />
                              </td>

                              {/* Delete Row Action */}
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInvestigationRow(i)}
                                  className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                  title="Remove parameter from import"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Extracted Prescribed Medicines Section */}
              {extractedDoc.extractedMedicines.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 block">
                      Extracted Prescribed Medications ({extractedDoc.extractedMedicines.length}):
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Auto-transcribed from document
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extractedDoc.extractedMedicines.map((med, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {med.name}
                          </span>
                          <span className="font-semibold text-cyan-700">
                            {med.dose}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {med.frequency} • {med.duration}
                        </p>
                        {med.instructions && (
                          <p className="text-[10px] text-slate-400 italic">
                            {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw OCR Text Snippet */}
              <div>
                <details className="text-xs text-slate-500 cursor-pointer">
                  <summary className="font-semibold text-slate-700 hover:text-cyan-700">
                    View Raw OCR Extraction Transcript
                  </summary>
                  <pre className="mt-2 p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {extractedDoc.rawText}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Real-Time Import Summary */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>

            {extractedDoc && (
              <span className="text-[11px] text-slate-500">
                Ready to import:{" "}
                <strong className="text-slate-800">
                  {investigationsList.length} lab parameter{investigationsList.length === 1 ? "" : "s"}
                </strong>{" "}
                {highCount > 0 && <span className="text-rose-700 font-bold">({highCount} high)</span>}{" "}
                &{" "}
                <strong className="text-slate-800">
                  {extractedDoc.extractedMedicines.length} medication{extractedDoc.extractedMedicines.length === 1 ? "" : "s"}
                </strong>
              </span>
            )}
          </div>

          <button
            id="add-doc-to-history-btn"
            type="button"
            disabled={!extractedDoc}
            onClick={handleConfirmAndAddToHistory}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Add to Medical Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
