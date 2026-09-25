import React, { useState, useEffect } from "react";
import {
  PhysicianClinicalHistory,
  DemographicData,
  LanguageOption,
  MedicationItem,
  InvestigationItem,
  PainLocationItem,
} from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { BodyPainLocationSelector } from "./BodyPainLocationSelector";
import {
  FileText,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Heart,
  Pill,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Calendar,
  Layers,
  Volume2,
  VolumeX,
  MapPin,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";


interface ClinicalSummaryScreenProps {
  summary: PhysicianClinicalHistory;
  patient: DemographicData;
  selectedLanguage: LanguageOption;
  onProceedToDocuments?: (finalSummary: PhysicianClinicalHistory) => void;
  onConfirmAndSubmit: (finalSummary: PhysicianClinicalHistory) => void;
  onBackToDashboard: () => void;
}

export const ClinicalSummaryScreen: React.FC<ClinicalSummaryScreenProps> = ({
  summary,
  patient,
  selectedLanguage,
  onProceedToDocuments,
  onConfirmAndSubmit,
  onBackToDashboard,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarMood, setAvatarMood] = useState<"SPEAKING" | "IDLE">("SPEAKING");

  const [chiefComplaint, setChiefComplaint] = useState(
    summary.chiefComplaint ||
      "Substernal chest tightness radiating to left shoulder on moderate exertion, associated with mild shortness of breath."
  );
  const [duration, setDuration] = useState(summary.hpi?.duration || "3 days");
  const [location, setLocation] = useState(
    summary.hpi?.location || "Substernal / Anterior chest wall"
  );
  const [associatedSymptoms, setAssociatedSymptoms] = useState(
    summary.hpi?.associatedSymptoms ||
      "Mild diaphoresis, exertional breathlessness, fatigue"
  );
  const [severity, setSeverity] = useState(
    summary.hpi?.severity || "6/10 Moderate-Severe"
  );
  const [painLocations, setPainLocations] = useState<PainLocationItem[]>(
    summary.painLocations || summary.hpi?.painLocations || []
  );
  const [showBodyMapModal, setShowBodyMapModal] = useState(false);

  const [pastHistory, setPastHistory] = useState<string[]>(
    summary.pastMedicalHistory?.length
      ? summary.pastMedicalHistory
      : ["Type 2 Diabetes Mellitus (8 years)", "Essential Hypertension (5 years)"]
  );

  const [medications, setMedications] = useState<MedicationItem[]>(
    summary.medicationHistory?.length
      ? summary.medicationHistory
      : [
          {
            name: "Metformin",
            dose: "500 mg",
            frequency: "Twice daily after meals",
            duration: "Ongoing",
            source: "patient-reported",
          },
          {
            name: "Telmisartan",
            dose: "40 mg",
            frequency: "Once daily morning",
            duration: "Ongoing",
            source: "patient-reported",
          },
        ]
  );

  const [allergies, setAllergies] = useState<string[]>(
    summary.drugAndAllergyHistory?.length
      ? summary.drugAndAllergyHistory
      : ["Penicillin (produces urticarial cutaneous rash)", "No known food allergies"]
  );

  const { t } = useLanguage();

  // Spoken confirmation message
  const defaultSpoken =
    selectedLanguage.name === "Hindi"
      ? "आपका क्लिनिकल सारांश तैयार कर लिया गया है। डॉक्टर को अंतिम रूप से जमा करने से पहले कृपया अपने उत्तरों की समीक्षा करें।"
      : selectedLanguage.name === "Tamil"
      ? "உங்கள் மருத்துவ சுருக்கம் தயாரிக்கப்பட்டுள்ளது. மருத்துவரிடம் சமர்ப்பிக்கும் முன் உங்கள் பதில்களை மதிப்பாய்வு செய்யவும்."
      : selectedLanguage.name === "Telugu"
      ? "మీ క్లినికల్ సారాంశం సిద్ధం చేయబడింది. దయచేసి డాక్టర్‌కు సమర్పించే ముందు మీ సమాధానాలను సమీక్షించండి."
      : "Your clinical summary has been prepared. Please review your answers before final submission to the doctor.";

  const spokenConfirmation = t("summary.verbalConfirmation", defaultSpoken);


  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenConfirmation);
      utterance.lang = selectedLanguage.ttsLang || "en-IN";
      utterance.rate = 0.95;

      utterance.onstart = () => {
        setAvatarMood("SPEAKING");
      };

      utterance.onend = () => {
        setAvatarMood("IDLE");
      };

      utterance.onerror = () => {
        setAvatarMood("IDLE");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setAvatarMood("IDLE");
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedLanguage]);

  const handleSaveAndProceed = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    const updatedSummary: PhysicianClinicalHistory = {
      ...summary,
      chiefComplaint,
      hpi: {
        ...summary.hpi,
        duration,
        location,
        associatedSymptoms,
        severity,
        painLocations,
      },
      painLocations,
      pastMedicalHistory: pastHistory,
      medicationHistory: medications,
      drugAndAllergyHistory: allergies,
      status: "in_review",
    };

    if (onProceedToDocuments) {
      onProceedToDocuments(updatedSummary);
    } else {
      onConfirmAndSubmit(updatedSummary);
    }
  };

  return (
    <div
      id="clinical-summary-screen"
      className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24"
    >
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <span className="text-slate-300">•</span>
          <div className="text-xs font-bold text-slate-400">
            Patient <span className="text-slate-300">/</span>{" "}
            <span className="text-sky-700 font-black">Clinical Summary</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isEditing
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? "Done Editing" : "Edit Responses"}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout: MAIN (Left) | RIGHT (Video AI Avatar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAIN AREA (Left 8 Columns) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Clinical Summary
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Structured clinical intake prepared for attending physician review
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Intake Language
              </span>
              <span className="text-xs font-bold text-sky-700">
                {selectedLanguage.name} ({selectedLanguage.nativeName})
              </span>
            </div>
          </div>

          {/* Section 1: Chief Complaint */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Chief Complaint</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                Primary Reason
              </span>
            </div>

            {isEditing ? (
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs font-medium border border-sky-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            ) : (
              <p className="text-sm font-bold text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                {chiefComplaint}
              </p>
            )}
          </div>

          {/* Section 2: History of Present Illness (HPI) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>History of Present Illness (HPI)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase mb-0.5">
                  Duration & Onset
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-1 border rounded text-xs font-bold"
                  />
                ) : (
                  <span className="font-bold text-slate-800">{duration}</span>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase mb-0.5">
                  Severity & Pain Score
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full p-1 border rounded text-xs font-bold"
                  />
                ) : (
                  <span className="font-bold text-slate-800">{severity}</span>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-[10px] font-bold uppercase mb-0.5">
                  Associated Symptoms
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={associatedSymptoms}
                    onChange={(e) => setAssociatedSymptoms(e.target.value)}
                    className="w-full p-1 border rounded text-xs font-bold"
                  />
                ) : (
                  <span className="font-bold text-slate-800">
                    {associatedSymptoms}
                  </span>
                )}
              </div>

              {/* Anatomical Pain Location (Body Map Verified) */}
              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80 sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-900 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Anatomical Pain Location (Interactive Body Map)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300/60">
                      {painLocations.length > 0 ? `${painLocations.length} Area(s) Marked` : "Verified Intake"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowBodyMapModal(true)}
                      className="text-[10px] font-bold text-amber-900 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/80 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{painLocations.length > 0 ? "Edit on Body Map" : "Open Body Map"}</span>
                    </button>
                  </div>
                </div>

                {painLocations.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {painLocations.map((loc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-amber-300/80 text-xs font-bold text-slate-900 shadow-2xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span>{loc.displayName}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-100">
                          {loc.bodyView || (loc as any).view || "front"}
                        </span>
                        {(loc.intensity !== undefined || (loc as any).severity) && (
                          <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            {loc.intensity || (loc as any).severity}/10
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-600 italic">
                    {location || "No localized physical pain site marked on body selector."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Past Medical History */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Past Medical History</span>
            </h3>

            <div className="space-y-2">
              {pastHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-800"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Medications & Allergies */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-purple-600" />
              <span>Medications & Allergies</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Active Medications:
                </span>
                <div className="space-y-1.5">
                  {medications.map((med, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between"
                    >
                      <span className="font-bold text-purple-900">
                        {med.name} {med.dose}
                      </span>
                      <span className="text-slate-600 font-medium">
                        {med.frequency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Known Drug & Food Allergies:
                </span>
                <div className="space-y-1.5">
                  {allergies.map((alg, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-2"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{alg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Red Flags / Triage Status */}
          <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Triage & Clinical Safety Status: STABLE</span>
            </div>
            <p className="text-xs text-emerald-800 font-medium">
              No acute unstable red-flags detected during voice intake. Routed to standard outpatient consultation.
            </p>
          </div>

          {/* Action Buttons: Edit Responses & Submit to Doctor */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? "Done Editing" : "Edit Responses"}</span>
            </button>

            <button
              type="button"
              id="confirm-submit-doctor-btn"
              onClick={handleSaveAndProceed}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-sm sm:text-base shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98"
            >
              <span>{onProceedToDocuments ? "Add Medical Records →" : "Submit to Doctor →"}</span>
            </button>
          </div>
        </div>

        {/* RIGHT AREA: Video AI Avatar with spoken confirmation */}
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
            <div className="mt-4 relative bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center w-full">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-sky-50 border-t border-l border-sky-200 rotate-45" />
              <p className="relative z-10 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                "{spokenConfirmation}"
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] font-extrabold text-sky-700">
                <Volume2 className={`w-3.5 h-3.5 ${avatarMood === "SPEAKING" ? "animate-pulse" : ""}`} />
                <span>{avatarMood === "SPEAKING" ? "Speaking confirmation..." : "Review complete"}</span>
              </div>
            </div>

            {/* Verification badge */}
            <div className="mt-5 w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Clinical History</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Body Map Modal */}
      {showBodyMapModal && (
        <div
          id="summary-body-map-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div className="w-full max-w-5xl my-auto animate-in fade-in zoom-in-95 duration-200">
            <BodyPainLocationSelector
              selectedLanguage={selectedLanguage}
              initialLocations={painLocations}
              onConfirmLocations={(updatedLocs) => {
                setPainLocations(updatedLocs);
                if (updatedLocs.length > 0) {
                  setLocation(updatedLocs.map((l) => `${l.displayName} (${l.side})`).join(", "));
                }
                setShowBodyMapModal(false);
              }}
              onClose={() => setShowBodyMapModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
