import React, { useState, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Plus,
  FileText,
  Calendar,
  Building2,
  Pill,
  Activity,
  Save,
  Trash2,
  X,
  Volume2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  MedicalDocument,
  LanguageOption,
  DemographicData,
  MedicationItem,
  InvestigationItem,
} from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";

interface OcrReviewScreenProps {
  document: MedicalDocument;
  patient: DemographicData;
  selectedLanguage: LanguageOption;
  onConfirmDocument: (confirmedDoc: MedicalDocument) => void;
  onScanAnotherDocument: () => void;
  onCancelOrBack: () => void;
}

export const OcrReviewScreen: React.FC<OcrReviewScreenProps> = ({
  document: initialDoc,
  patient,
  selectedLanguage,
  onConfirmDocument,
  onScanAnotherDocument,
  onCancelOrBack,
}) => {
  // Document state (editable by patient)
  const [docType, setDocType] = useState(initialDoc.documentType);
  const [docDate, setDocDate] = useState(
    initialDoc.date && initialDoc.date !== "Date not available" ? initialDoc.date : "Date not available"
  );
  const [institution, setInstitution] = useState(initialDoc.institutionOrDoctor || "");
  const [diagnoses, setDiagnoses] = useState<string[]>(
    initialDoc.extractedDiagnoses || []
  );
  const [medicines, setMedicines] = useState<MedicationItem[]>(
    initialDoc.extractedMedicines || []
  );
  const [investigations, setInvestigations] = useState<InvestigationItem[]>(
    initialDoc.extractedInvestigations || []
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    initialDoc.relevantClinicalNotes || initialDoc.treatmentInformation || ""
  );

  // Edit mode toggles
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editingMedIndex, setEditingMedIndex] = useState<number | null>(null);
  const [editingInvIndex, setEditingInvIndex] = useState<number | null>(null);
  const [newDiagnosisInput, setNewDiagnosisInput] = useState("");

  // Document Viewer states (Zoom, Pan, Rotate, Fullscreen)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Avatar speech & mood
  const [avatarMood, setAvatarMood] = useState<"SPEAKING" | "IDLE">("SPEAKING");

  const guidanceMessages: Record<string, string> = {
    English: "Please check the extracted information.",
    Hindi: "कृपया निकाली गई जानकारी की जाँच करें।",
    Tamil: "பிரித்தெடுக்கப்பட்ட தகவல்களைச் சரிபார்க்கவும்.",
    Telugu: "దయచేసి సేకరించిన సమాచారాన్ని తనిఖీ చేయండి.",
    Kannada: "ದಯವಿಟ್ಟು ಹೊರತೆಗೆಯಲಾದ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
    Malayalam: "ദയവായി വേർതിരിച്ച വിവരങ്ങൾ പരിശോധിക്കുക.",
    Bengali: "অনুগ্রহ করে সংগৃহীত তথ্য যাচাই করুন।",
    Marathi: "कृपया काढलेली माहिती तपासा.",
    Gujarati: "કૃપા કરીને કાઢવામાં આવેલી માહિતી ચકાસો.",
    Punjabi: "ਕਿਰਪਾ ਕਰਕੇ ਕੱਢੀ ਗਈ ਜਾਣਕਾਰੀ ਦੀ ਜਾਂਚ ਕਰੋ।",
    Odia: "ଦୟାକରି ସଂଗୃହିତ ସୂଚନା ଯାଞ୍ଚ କରନ୍ତୁ।",
    Assamese: "অনুগ্ৰহ কৰি সংগৃহীত তথ্য পৰীক্ষা কৰক।",
    Urdu: "براہ کرم نکالی گئی معلومات کی جانچ کریں۔",
  };

  const currentGuidance =
    guidanceMessages[selectedLanguage.name] || guidanceMessages.English;

  useEffect(() => {
    speakText(currentGuidance);
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedLanguage]);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage.ttsLang || "en-IN";
      utterance.rate = 0.95;
      utterance.onstart = () => setAvatarMood("SPEAKING");
      utterance.onend = () => setAvatarMood("IDLE");
      utterance.onerror = () => setAvatarMood("IDLE");
      window.speechSynthesis.speak(utterance);
    }
  };

  // Medicine Edit Handlers
  const handleUpdateMedicine = (index: number, updated: Partial<MedicationItem>) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...updated, needsReview: false } : m))
    );
    setEditingMedIndex(null);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMedicine = () => {
    const newMed: MedicationItem = {
      id: `med-${Date.now()}`,
      name: "New Medicine",
      dose: "1 tablet",
      frequency: "Once daily",
      duration: "5 days",
      instructions: "After meals",
      source: "extracted-from-document",
    };
    setMedicines([...medicines, newMed]);
    setEditingMedIndex(medicines.length);
  };

  // Investigation Edit Handlers
  const handleUpdateInvestigation = (
    index: number,
    updated: Partial<InvestigationItem>
  ) => {
    setInvestigations((prev) =>
      prev.map((inv, i) => (i === index ? { ...inv, ...updated, needsReview: false } : inv))
    );
    setEditingInvIndex(null);
  };

  const handleRemoveInvestigation = (index: number) => {
    setInvestigations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddInvestigation = () => {
    const newInv: InvestigationItem = {
      id: `inv-${Date.now()}`,
      testName: "New Lab Test",
      value: "Normal",
      unit: "",
      referenceRange: "Standard",
      status: "within_range",
      interpretation: "Within expected limits",
      date: docDate,
    };
    setInvestigations([...investigations, newInv]);
    setEditingInvIndex(investigations.length);
  };

  // Diagnosis Handlers
  const handleAddDiagnosis = () => {
    if (!newDiagnosisInput.trim()) return;
    setDiagnoses([...diagnoses, newDiagnosisInput.trim()]);
    setNewDiagnosisInput("");
  };

  const handleRemoveDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  // Confirm document and integrate into clinical record
  const handleConfirmAndSave = () => {
    const confirmed: MedicalDocument = {
      ...initialDoc,
      documentType: docType,
      date: docDate,
      institutionOrDoctor: institution,
      extractedDiagnoses: diagnoses,
      extractedMedicines: medicines.map((m) => ({
        ...m,
        source: "extracted-from-document",
        needsReview: false,
      })),
      extractedInvestigations: investigations.map((inv) => ({
        ...inv,
        needsReview: false,
      })),
      relevantClinicalNotes: clinicalNotes,
      status: "processed",
      needsVerification: false,
      patientConfirmed: true,
      patientCorrections: {
        confirmedAt: new Date().toISOString(),
        verifiedByPatient: true,
      },
    };

    onConfirmDocument(confirmed);
  };

  return (
    <div
      id="ocr-review-screen"
      className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-28"
    >
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancelOrBack}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            ← Back
          </button>
          <span className="text-slate-300">•</span>
          <div className="text-xs font-bold text-slate-400">
            Step 5 of 6: <span className="text-sky-700 font-black">OCR Review & Patient Confirmation</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="scan-another-doc-btn"
            onClick={onScanAnotherDocument}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Scan Another Document</span>
          </button>

          <button
            type="button"
            id="confirm-ocr-info-btn"
            onClick={handleConfirmAndSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Information →</span>
          </button>
        </div>
      </div>

      {/* Uncertainty Notice Banner */}
      {(initialDoc.needsVerification || initialDoc.confidenceScore < 0.85 || initialDoc.isHandwritten) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-amber-950">
              ⚠️ Please verify this information
            </h4>
            <p className="text-amber-800 leading-relaxed">
              {initialDoc.isHandwritten
                ? "This document appears to contain doctor handwriting. Some text may need your confirmation or correction."
                : "Some text was marked for review. Please check all extracted medicines, dates, and test values before confirming."}
            </p>
          </div>
        </div>
      )}

      {/* 2-COLUMN VIEW: LEFT ORIGINAL DOCUMENT | RIGHT EXTRACTED INFORMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ORIGINAL DOCUMENT PREVIEW (5 Cols) */}
        <div className={`lg:col-span-5 space-y-3 ${isFullscreen ? "fixed inset-0 z-50 bg-black/90 p-6 flex flex-col" : ""}`}>
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-extrabold text-slate-800">
                  Original Document
                </span>
              </div>

              {/* Viewport Controls: Zoom In, Zoom Out, Rotate, Fullscreen */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="Rotate"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Document Canvas Display */}
            <div
              className={`rounded-2xl overflow-auto bg-slate-900/5 flex items-center justify-center p-3 border border-slate-200 transition-all ${
                isFullscreen ? "flex-1 max-h-none" : "max-h-[580px]"
              }`}
            >
              {initialDoc.filePreview ? (
                <div
                  className="transition-transform duration-200 origin-center"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                >
                  {initialDoc.fileType === "application/pdf" ? (
                    <div className="p-8 text-center bg-white rounded-xl shadow-xs border border-slate-200 max-w-sm">
                      <FileText className="w-12 h-12 text-sky-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-900">
                        {initialDoc.fileName || "Medical PDF Document"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        OCR extraction completed successfully
                      </p>
                    </div>
                  ) : (
                    <img
                      src={initialDoc.filePreview}
                      alt="Scanned Document"
                      className="max-h-[520px] w-auto object-contain rounded-lg shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              ) : (
                <div className="p-10 text-center text-slate-400 text-xs">
                  No preview available
                </div>
              )}
            </div>

            {/* Verification Status Indicator */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Verification Status:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Pending Doctor Verification
              </span>
            </div>
          </div>

          {/* AI Avatar Speech Bubble */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-md flex items-center gap-3">
            <CaseLineAvatar
              size="md"
              character="female"
              mood={avatarMood}
              pose="review"
            />
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">
                "{currentGuidance}"
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Check and edit any fields if OCR made a mistake.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EXTRACTED INFORMATION (PATIENT EDITABLE) (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Metadata Card: Document Type, Date, Hospital */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>Document Details</span>
                {docDate === "Date not available" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Undated
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingMetadata ? "Done" : "Edit"}</span>
              </button>
            </div>

            {isEditingMetadata ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Prescription">Prescription</option>
                    <option value="Laboratory report">Laboratory report</option>
                    <option value="Discharge summary">Discharge summary</option>
                    <option value="Scan / investigation report">Scan / Imaging report</option>
                    <option value="Other Medical Record">Other Medical Record</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Document Date
                  </label>
                  <input
                    type="text"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    placeholder="YYYY-MM-DD or 'Date not available'"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Hospital / Clinic / Doctor
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Hospital or Doctor name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Type
                  </span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">
                    {docType}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Date
                  </span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {docDate}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Hospital / Provider
                  </span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block truncate">
                    {institution || "Not specified on document"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Diagnoses Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Extracted Diagnoses & Conditions</span>
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {diagnoses.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  No explicit diagnosis identified on this record.
                </span>
              ) : (
                diagnoses.map((diag, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 font-bold text-xs flex items-center gap-2"
                  >
                    <span>{diag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDiagnosis(i)}
                      className="text-sky-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newDiagnosisInput}
                onChange={(e) => setNewDiagnosisInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDiagnosis()}
                placeholder="Add condition or diagnosis..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddDiagnosis}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Medicines Card: Name, Dosage, Frequency */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  <span>Prescribed Medicines ({medicines.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Extracted from document • Patient editable
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Medicine</span>
              </button>
            </div>

            {medicines.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No medications extracted from this document.
              </p>
            ) : (
              <div className="space-y-2">
                {medicines.map((med, index) => {
                  const isEditing = editingMedIndex === index;
                  return (
                    <div
                      key={med.id || index}
                      className={`p-3 rounded-2xl border transition-all ${
                        med.needsReview
                          ? "border-amber-300 bg-amber-50/50"
                          : "border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">
                                Medicine Name
                              </label>
                              <input
                                type="text"
                                defaultValue={med.name}
                                id={`edit-med-name-${index}`}
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">
                                Dosage
                              </label>
                              <input
                                type="text"
                                defaultValue={med.dose}
                                id={`edit-med-dose-${index}`}
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">
                                Frequency
                              </label>
                              <input
                                type="text"
                                defaultValue={med.frequency}
                                id={`edit-med-freq-${index}`}
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">
                                Instructions / Notes
                              </label>
                              <input
                                type="text"
                                defaultValue={med.instructions || ""}
                                id={`edit-med-inst-${index}`}
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingMedIndex(null)}
                              className="px-3 py-1 rounded-lg text-slate-500 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const name = (
                                  document.getElementById(
                                    `edit-med-name-${index}`
                                  ) as HTMLInputElement
                                )?.value;
                                const dose = (
                                  document.getElementById(
                                    `edit-med-dose-${index}`
                                  ) as HTMLInputElement
                                )?.value;
                                const frequency = (
                                  document.getElementById(
                                    `edit-med-freq-${index}`
                                  ) as HTMLInputElement
                                )?.value;
                                const instructions = (
                                  document.getElementById(
                                    `edit-med-inst-${index}`
                                  ) as HTMLInputElement
                                )?.value;
                                handleUpdateMedicine(index, {
                                  name,
                                  dose,
                                  frequency,
                                  instructions,
                                });
                              }}
                              className="px-3 py-1 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">
                                {med.name}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                                {med.dose}
                              </span>
                              {med.needsReview && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                                  Verify
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Frequency: <span className="font-bold text-slate-700">{med.frequency}</span>
                              {med.instructions && ` • ${med.instructions}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingMedIndex(index)}
                              className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-100 cursor-pointer"
                              title="Edit medicine"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(index)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                              title="Remove medicine"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Laboratory Tests & Investigation Values */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Lab Tests & Investigation Values ({investigations.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Compared against standard reference ranges
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddInvestigation}
                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Test</span>
              </button>
            </div>

            {investigations.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No lab investigation values extracted from this record.
              </p>
            ) : (
              <div className="space-y-2">
                {investigations.map((inv, index) => {
                  const isEditing = editingInvIndex === index;
                  const isAbnormal =
                    inv.status === "above_range" || inv.status === "below_range";

                  return (
                    <div
                      key={inv.id || index}
                      className={`p-3 rounded-2xl border transition-all ${
                        isAbnormal
                          ? "border-amber-300 bg-amber-50/40"
                          : "border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">
                                Test Name
                              </label>
                              <input
                                type="text"
                                defaultValue={inv.testName}
                                id={`edit-inv-name-${index}`}
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">
                                Result Value
                              </label>
                              <input
                                type="text"
                                defaultValue={inv.value}
                                id={`edit-inv-val-${index}`}
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">
                                Unit
                              </label>
                              <input
                                type="text"
                                defaultValue={inv.unit}
                                id={`edit-inv-unit-${index}`}
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">
                                Reference Range
                              </label>
                              <input
                                type="text"
                                defaultValue={inv.referenceRange}
                                id={`edit-inv-ref-${index}`}
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">
                                Status
                              </label>
                              <select
                                defaultValue={inv.status}
                                id={`edit-inv-status-${index}`}
                                className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                              >
                                <option value="within_range">Within Range</option>
                                <option value="above_range">Above Range (High)</option>
                                <option value="below_range">Below Range (Low)</option>
                                <option value="undetermined">Undetermined</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingInvIndex(null)}
                              className="px-3 py-1 rounded-lg text-slate-500 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const testName = (
                                  document.getElementById(
                                    `edit-inv-name-${index}`
                                  ) as HTMLInputElement
                                )?.value;
                                const value = (
                                  document.getElementById(
                                    `edit-inv-val-${index}`
                                  ) as HTMLInputElement
                                )?.value;
                                const unit = (
                                  document.getElementById(
                                    `edit-inv-unit-${index}`
                                  ) as HTMLInputElement
                                )?.value;
                                const referenceRange = (
                                  document.getElementById(
                                    `edit-inv-ref-${index}`
                                  ) as HTMLInputElement
                                )?.value;
                                const status = (
                                  document.getElementById(
                                    `edit-inv-status-${index}`
                                  ) as HTMLSelectElement
                                )?.value as any;
                                handleUpdateInvestigation(index, {
                                  testName,
                                  value,
                                  unit,
                                  referenceRange,
                                  status,
                                });
                              }}
                              className="px-3 py-1 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">
                                {inv.testName}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  inv.status === "above_range"
                                    ? "bg-rose-100 text-rose-800"
                                    : inv.status === "below_range"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {inv.value} {inv.unit}
                              </span>
                              {inv.status === "above_range" && (
                                <span className="text-[10px] font-bold text-rose-600">
                                  ▲ High
                                </span>
                              )}
                              {inv.status === "below_range" && (
                                <span className="text-[10px] font-bold text-amber-600">
                                  ▼ Low
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Reference: {inv.referenceRange || "Standard"}
                              {inv.interpretation && ` • ${inv.interpretation}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingInvIndex(index)}
                              className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-100 cursor-pointer"
                              title="Edit test"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveInvestigation(index)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                              title="Remove test"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Relevant Clinical Notes & Treatment Info */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Treatment Information & Clinical Notes
            </h3>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Doctor's notes, treatment plan, or discharge advice..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onScanAnotherDocument}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Scan Another Document</span>
            </button>

            <button
              type="button"
              id="confirm-information-btn"
              onClick={handleConfirmAndSave}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Information & Update Record →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
