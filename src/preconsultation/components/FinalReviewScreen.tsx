import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  Activity,
  Pill,
  User,
  ShieldCheck,
  Edit3,
  Send,
  Calendar,
  Layers,
  Volume2,
  AlertCircle,
  Eye,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";
import {
  DemographicData,
  LanguageOption,
  MedicalDocument,
  PhysicianClinicalHistory,
  TimelineEvent,
} from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { useLanguage } from "../context/LanguageContext";


interface FinalReviewScreenProps {
  patient: DemographicData;
  selectedLanguage: LanguageOption;
  clinicalSummary: PhysicianClinicalHistory;
  medicalDocuments: MedicalDocument[];
  timelineEvents: TimelineEvent[];
  onConfirmAndSubmit: () => void;
  onEditSection: (section: "interview" | "timeline" | "documents" | "summary") => void;
  isSubmitting?: boolean;
  submissionError?: string | null;
}

export const FinalReviewScreen: React.FC<FinalReviewScreenProps> = ({
  patient,
  selectedLanguage,
  clinicalSummary,
  medicalDocuments,
  timelineEvents,
  onConfirmAndSubmit,
  onEditSection,
  isSubmitting = false,
  submissionError = null,
}) => {
  const { t } = useLanguage();
  const [avatarMood, setAvatarMood] = useState<"SPEAKING" | "IDLE">("SPEAKING");
  const [selectedDocPreview, setSelectedDocPreview] = useState<MedicalDocument | null>(null);

  // Localized guidance messages
  const guidanceMessages: Record<string, string> = {
    English: "Please review everything before submission.",
    Hindi: "कृपया सबमिट करने से पहले सभी विवरणों की समीक्षा करें।",
    Tamil: "சமர்ப்பிப்பதற்கு முன் அனைத்தையும் மதிப்பாய்வு செய்யவும்.",
    Telugu: "సమర్పించడానికి ముందు ప్రతిదీ సమీక్షించండి.",
    Kannada: "ಸಲ್ಲಿಸುವ ಮೊದಲು ಎಲ್ಲವನ್ನೂ ಪರಿಶೀಲಿಸಿ.",
    Malayalam: "സമർപ്പിക്കുന്നതിന് മുമ്പ് എല്ലാം അവലോകനം ചെയ്യുക.",
    Bengali: "জমা দেওয়ার আগে সবকিছু একবার দেখে নিন।",
    Marathi: "सबमिट करण्यापूर्वी कृपया सर्व गोष्टींचे पुनरावलोकन करा.",
    Gujarati: "સબમિટ કરતાં પહેલાં કૃપા કરીને બધું ચકાસી લો.",
    Punjabi: "ਜਮ੍ਹਾ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਕਿਰਪਾ ਕਰਕੇ ਸਭ ਕੁਝ ਦੀ ਸਮੀਖਿਆ ਕਰੋ।",
    Odia: "ଦାଖଲ କରିବା ପୂର୍ବରୁ ଦୟାକରି ସମସ୍ତ ବିବରଣୀ ସମୀକ୍ଷା କରନ୍ତୁ।",
    Assamese: "দাখিল কৰাৰ পূৰ্বে অনুগ্ৰহ কৰি সকলো পৰীক্ষা কৰক।",
    Urdu: "براہ کرم جمع کرانے سے پہلے تمام چیزوں کا جائزہ لیں۔",
  };

  const fallbackGuidance =
    guidanceMessages[selectedLanguage.name] || guidanceMessages.English;
  const currentGuidance = t("finalReview.reviewBeforeSubmit", fallbackGuidance);


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

  const allCheckpoints = [
    {
      id: "interview",
      title: "Health Interview",
      status: "Completed",
      description: `Chief complaint: ${clinicalSummary.chiefComplaint || "General consultation"}`,
      count: "Voice verified",
    },
    {
      id: "timeline",
      title: "Medical Timeline",
      status: "Completed",
      description: `${timelineEvents.length} chronological health & clinical events mapped`,
      count: `${timelineEvents.length} events`,
    },
    {
      id: "documents",
      title: "Medical Documents",
      status: medicalDocuments.length > 0 ? "Attached" : "Optional / Skipped",
      description: `${medicalDocuments.length} original documents attached with OCR extract`,
      count: `${medicalDocuments.length} records`,
    },
    {
      id: "ocr_data",
      title: "Extracted Information",
      status: "Patient Confirmed",
      description: "Diagnoses, medications, and laboratory values verified by patient",
      count: "Pending Doctor Verification",
    },
    {
      id: "summary",
      title: "Clinical Summary",
      status: "Synthesized",
      description: "Full clinical history structured for physician consultation",
      count: "Ready",
    },
  ];

  return (
    <div
      id="final-review-screen"
      className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-28"
    >
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEditSection("summary")}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <span className="text-slate-300">•</span>
          <div className="text-xs font-bold text-slate-400">
            Step 6 of 6: <span className="text-emerald-700 font-black">Final Review & Submission</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEditSection("summary")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Information</span>
          </button>

          <button
            type="button"
            id="final-confirm-submit-btn"
            disabled={isSubmitting}
            onClick={onConfirmAndSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Transmitting to Doctor...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirm & Submit →</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: MAIN CHECKPOINTS (8 Cols) | AVATAR GUIDANCE (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: THE 5 VERIFIED CHECKPOINTS */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold tracking-wide uppercase">
                Final Verification Step
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                Review Before Submission
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Your health data is organized and ready for the attending physician. Please review the completed sections below.
              </p>
            </div>

            {/* THE 5 CHECKPOINTS GRID */}
            <div className="space-y-3 pt-2">
              {allCheckpoints.map((cp, idx) => (
                <div
                  key={cp.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          ✓ {cp.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          {cp.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cp.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                      {cp.count}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onEditSection(
                          cp.id === "documents" || cp.id === "ocr_data"
                            ? "documents"
                            : cp.id === "timeline"
                            ? "timeline"
                            : cp.id === "interview"
                            ? "interview"
                            : "summary"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-sky-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: EXTRACTED INFORMATION VS PATIENT-REPORTED (Rule 7 & 8) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>Clinical Information Sources</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Clearly distinguishing patient-reported symptoms from document-extracted records
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                OCR Data: Pending Doctor Verification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Box 1: Patient-Reported Information */}
              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                    Source: Patient-Reported (Interview)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">
                    Chief Complaint: <span className="font-normal text-slate-600">{clinicalSummary.chiefComplaint || "Not specified"}</span>
                  </p>
                  <p className="font-bold text-slate-800">
                    Duration: <span className="font-normal text-slate-600">{clinicalSummary.hpi.duration || "Recent"}</span>
                  </p>
                  <p className="font-bold text-slate-800">
                    Associated Symptoms:{" "}
                    <span className="font-normal text-slate-600">
                      {Array.isArray(clinicalSummary.hpi.associatedSymptoms)
                        ? (clinicalSummary.hpi.associatedSymptoms as string[]).join(", ")
                        : clinicalSummary.hpi.associatedSymptoms || "None"}
                    </span>
                  </p>
                  <p className="font-bold text-slate-800">
                    Known Allergies:{" "}
                    <span className="font-normal text-slate-600">
                      {Array.isArray(clinicalSummary.drugAndAllergyHistory)
                        ? clinicalSummary.drugAndAllergyHistory.join(", ")
                        : "No known drug allergies"}
                    </span>
                  </p>

                  {((clinicalSummary.painLocations && clinicalSummary.painLocations.length > 0) ||
                    (clinicalSummary.hpi.painLocations && clinicalSummary.hpi.painLocations.length > 0)) && (
                    <div className="pt-1.5 border-t border-sky-200/60 mt-1">
                      <span className="font-bold text-slate-800 block text-[11px] mb-1">
                        Body Pain Locations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(clinicalSummary.painLocations || clinicalSummary.hpi.painLocations || []).map((loc, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-sky-300 text-[10px] font-bold text-slate-800"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>{loc.displayName}</span>
                            <span className="text-slate-400">({loc.side})</span>
                            {loc.intensity !== undefined && (
                              <span className="text-rose-600 font-extrabold">{loc.intensity}/10</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2: Extracted from Document */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800">
                    Source: Extracted from Document (OCR)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">
                    Attached Records:{" "}
                    <span className="font-normal text-slate-600">
                      {medicalDocuments.length > 0
                        ? medicalDocuments.map((d) => d.title).join("; ")
                        : "None attached (skipped)"}
                    </span>
                  </p>
                  <p className="font-bold text-slate-800">
                    Medications Identified:{" "}
                    <span className="font-normal text-slate-600">
                      {(clinicalSummary.medicationHistory || []).length > 0
                        ? clinicalSummary.medicationHistory
                            .map((m) => `${m.name} (${m.dose || ""})`)
                            .join(", ")
                        : "None identified"}
                    </span>
                  </p>
                  <p className="font-bold text-slate-800">
                    Lab Tests Extracted:{" "}
                    <span className="font-normal text-slate-600">
                      {(clinicalSummary.previousInvestigations || []).length > 0
                        ? clinicalSummary.previousInvestigations
                            .map((inv) => `${inv.testName}: ${inv.value} ${inv.unit || ""}`)
                            .join(", ")
                        : "None extracted"}
                    </span>
                  </p>
                  <p className="text-[10px] text-amber-700 italic pt-1">
                    * Doctor will inspect original images and physically verify all values.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: ATTACHED ORIGINAL DOCUMENTS (PREVIEW MODAL TRIGGER) */}
          {medicalDocuments.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Preserved Original Documents ({medicalDocuments.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medicalDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {doc.filePreview ? (
                          <img
                            src={doc.filePreview}
                            alt="thumb"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 truncate">
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {doc.documentType} • {doc.date}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedDocPreview(doc)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTTOM BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              id="edit-info-final-btn"
              onClick={() => onEditSection("summary")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Information</span>
            </button>

            <button
              type="button"
              id="submit-final-intake-btn"
              disabled={isSubmitting}
              onClick={onConfirmAndSubmit}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Transmitting to Doctor Queue..." : "Confirm & Submit Intake →"}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Video AI Avatar guiding patient in selected language (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col items-center sticky top-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md w-full flex flex-col items-center text-center">
            <div className="mb-2">
              <CaseLineAvatar
                size="hero"
                character="female"
                mood={avatarMood}
                pose="summary"
                showStatusBadge={true}
              />
            </div>

            {/* Avatar Speech Bubble */}
            <div className="mt-4 relative bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center w-full">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-emerald-50 border-t border-l border-emerald-200 rotate-45" />
              <p className="relative z-10 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                "{currentGuidance}"
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] font-extrabold text-emerald-700">
                <Volume2 className={`w-3.5 h-3.5 ${avatarMood === "SPEAKING" ? "animate-pulse" : ""}`} />
                <span>{avatarMood === "SPEAKING" ? "Speaking aloud..." : "Ready for submission"}</span>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="mt-6 w-full pt-4 border-t border-slate-100 text-left space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>ABDM Encrypted & Verified</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Upon clicking Submit, your clinical intake is transmitted securely to the doctor queue and your session will automatically log out for privacy.
              </p>
            </div>
          </div>
        </div>

        {submissionError && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
            {submissionError} Please retry after reviewing the information.
          </div>
        )}
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {selectedDocPreview.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDocPreview.documentType} • {selectedDocPreview.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-xl bg-slate-900/5 p-2 flex items-center justify-center border border-slate-200 min-h-[300px]">
              {selectedDocPreview.filePreview ? (
                <img
                  src={selectedDocPreview.filePreview}
                  alt="doc"
                  className="max-h-[60vh] w-auto object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <p className="text-xs text-slate-400">No preview available</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
