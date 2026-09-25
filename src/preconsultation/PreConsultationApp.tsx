import React, { useState, useEffect } from "react";
import { AbdmModal } from "./components/AbdmModal";
import { DoctorDashboard } from "./components/DoctorDashboard";
import { DocumentUploadModal } from "./components/DocumentUploadModal";
import { EmergencySOSModal } from "./components/EmergencySOSModal";
import { NavigationHeader } from "./components/NavigationHeader";
import { BottomNavBar } from "./components/BottomNavBar";

// Patient Screens
import { WelcomeScreen } from "./components/WelcomeScreen";
import { LanguageSelectionScreen } from "./components/LanguageSelectionScreen";
import { LoginScreen } from "./components/LoginScreen";
import { BeginHealthInterviewScreen } from "./components/BeginHealthInterviewScreen";
import { PatientDashboardScreen } from "./components/PatientDashboardScreen";
import { VoiceHealthInterviewScreen } from "./components/VoiceHealthInterviewScreen";
import { MedicalTimelineScreen } from "./components/MedicalTimelineScreen";
import { MedicalRecordsUploadScreen } from "./components/MedicalRecordsUploadScreen";
import { ClinicalSummaryScreen } from "./components/ClinicalSummaryScreen";
import { DocumentScanScreen } from "./components/DocumentScanScreen";
import { OcrReviewScreen } from "./components/OcrReviewScreen";
import { FinalReviewScreen } from "./components/FinalReviewScreen";
import { SubmissionConfirmationScreen } from "./components/SubmissionConfirmationScreen";
import { ContinuingCareScreen } from "./components/ContinuingCareScreen";
import { VoiceAvatarSettingsScreen } from "./components/VoiceAvatarSettingsScreen";

import {
  DEMO_DOCUMENTS,
  DEMO_PATIENT,
  DEMO_QUEUE,
  DEMO_TIMELINE,
  INITIAL_PHYSICIAN_SUMMARY,
} from "./data/demoData";
import { SUPPORTED_LANGUAGES } from "./data/languages";
import {
  generateStructuredHistory,
  logoutPatient,
  submitIntakeData,
} from "./services/apiService";
import { api } from "../lib/api";
import {
  ActiveRole,
  DemographicData,
  InterviewMessage,
  LanguageOption,
  MedicalDocument,
  PatientQueueItem,
  PatientScreen,
  PhysicianClinicalHistory,
  RedFlagAlert,
  TimelineEvent,
  UserRole,
  VoiceSettings,
  PainLocationItem,
} from "./types";
import {
  normalizeInvestigationItem,
  normalizeMedicationItem,
} from "./utils/investigationUtils";
import { useLanguage } from "./context/LanguageContext";

interface PreConsultationAppProps {
  initialScreen?: PatientScreen;
}

export default function App({ initialScreen = "welcome" }: PreConsultationAppProps) {
  // 1. Language State - Strictly Persisted Global State via LanguageContext
  const { languageOption: selectedLanguage, setLanguage: handleSelectLanguage } =
    useLanguage();

  // 2. Navigation & Role State
  const [currentScreen, setCurrentScreen] = useState<PatientScreen>(initialScreen);
  const [activeRole, setActiveRole] = useState<ActiveRole>("patient");

  const [isAyushMode, setIsAyushMode] = useState<boolean>(true);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isLargeText, setIsLargeText] = useState<boolean>(false);

  // 3. Voice & Avatar Preferences State
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem("caseline_voice_settings");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      gender: "female",
      speed: "normal",
      rate: 1.0,
      audioChime: true,
      autoSpeak: true,
      avatarId: "caseline-default",
      bilingualMode: true,
      regionalDialect: "Standard / Conversational",
      speechSensitivity: "standard",
    };
  });

  const handleUpdateVoiceSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    try {
      localStorage.setItem("caseline_voice_settings", JSON.stringify(newSettings));
    } catch (e) {}
  };

  // 4. Clinical State
  const [patient, setPatient] = useState<DemographicData>(DEMO_PATIENT);
  const [interviewMessages, setInterviewMessages] = useState<InterviewMessage[]>([]);
  const [redFlags, setRedFlags] = useState<RedFlagAlert[]>(
    INITIAL_PHYSICIAN_SUMMARY.redFlagAlerts || []
  );
  const [clinicalSummary, setClinicalSummary] =
    useState<PhysicianClinicalHistory>(INITIAL_PHYSICIAN_SUMMARY);
  const [timelineEvents, setTimelineEvents] =
    useState<TimelineEvent[]>(DEMO_TIMELINE);
    useEffect(() => {
  const loadPatientTimeline = async () => {
    const patientId = patient.patientId;

    if (!patientId) return;

    try {
      const events = await api.getTimeline(patientId);
      setTimelineEvents(events.map((event) => ({
        id: event.id,
        patientId: event.patientId,
        date: event.date || event.eventDate || "Date not available",
        eventType: (event.eventType || "Investigation") as TimelineEvent["eventType"],
        title: event.title,
        institution: event.hospitalName || "Medical Centre",
        summary: event.description || "Clinical timeline event.",
        documentId: event.reportAttachment?.id,
      })));
    } catch (error) {
      console.warn("Failed to load patient timeline:", error);
    }
  };

  loadPatientTimeline();
}, [patient.patientId]);
  const [medicalDocuments, setMedicalDocuments] =
    useState<MedicalDocument[]>(DEMO_DOCUMENTS);
  const [currentProcessedDoc, setCurrentProcessedDoc] =
    useState<MedicalDocument | null>(null);
  const [isSubmittingToDoctor, setIsSubmittingToDoctor] =
    useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [caseReferenceId, setCaseReferenceId] = useState<string>("CASE-2026-IN8821");

  // Doctor Queue State
  const [queue, setQueue] = useState<PatientQueueItem[]>(DEMO_QUEUE);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("PID-2026-8819");

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isAbdmModalOpen, setIsAbdmModalOpen] = useState(false);

  // Add Document handler with normalization & timeline sync
  const handleAddDocument = (doc: MedicalDocument) => {
    const normalizedInvs = (doc.extractedInvestigations || []).map((inv, idx) =>
      normalizeInvestigationItem(inv, doc.date, idx)
    );
    const normalizedMeds = (doc.extractedMedicines || []).map((med, idx) =>
      normalizeMedicationItem(med, idx)
    );

    const verifiedDoc: MedicalDocument = {
      ...doc,
      extractedInvestigations: normalizedInvs,
      extractedMedicines: normalizedMeds,
    };

    setMedicalDocuments((prev) => [verifiedDoc, ...prev]);

    // Check abnormal findings
    const abnormalInvs = normalizedInvs.filter(
      (i) => i.status === "above_range" || i.status === "below_range"
    );

    let timelineSummary = "";
    if (abnormalInvs.length > 0) {
      const abnormalHighlights = abnormalInvs
        .slice(0, 3)
        .map(
          (inv) =>
            `${inv.testName} (${inv.value} ${inv.unit || ""} - ${
              inv.status === "above_range" ? "High" : "Low"
            })`
        )
        .join(", ");
      timelineSummary = `Abnormal: ${abnormalHighlights}${
        abnormalInvs.length > 3 ? ` +${abnormalInvs.length - 3} more` : ""
      }. `;
    }
    if (doc.extractedDiagnoses.length > 0) {
      timelineSummary += `Diagnoses: ${doc.extractedDiagnoses.join(", ")}`;
    } else if (!timelineSummary) {
      timelineSummary = "Clinical investigation record verified and attached.";
    }

    const newTimelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      patientId: patient.patientId,
      date: doc.date,
      eventType: doc.documentType.includes("Lab")
        ? "Lab Test"
        : doc.documentType.includes("Prescription")
        ? "Prescription"
        : "Investigation",
      title: doc.title,
      institution: doc.institutionOrDoctor,
      summary: timelineSummary.trim(),
      diagnosis: doc.extractedDiagnoses[0] || undefined,
      abnormalValuesCount: abnormalInvs.length,
      medicinesCount: normalizedMeds.length,
      documentId: doc.id,
    };
    setTimelineEvents((prev) => [newTimelineEvent, ...prev]);

    // Synchronize to clinical summary
    setClinicalSummary((prev) => {
      const medMap = new Map<string, (typeof normalizedMeds)[0]>();
      prev.medicationHistory.forEach((m) =>
        medMap.set(m.name.toLowerCase().trim(), m)
      );
      normalizedMeds.forEach((m) =>
        medMap.set(m.name.toLowerCase().trim(), m)
      );

      const invMap = new Map<string, (typeof normalizedInvs)[0]>();
      prev.previousInvestigations.forEach((inv) => {
        const key = `${inv.testName.toLowerCase().trim()}::${inv.date || "unknown"}`;
        invMap.set(key, inv);
      });
      normalizedInvs.forEach((inv) => {
        const key = `${inv.testName.toLowerCase().trim()}::${inv.date || "unknown"}`;
        invMap.set(key, inv);
      });

      return {
        ...prev,
        medicationHistory: Array.from(medMap.values()),
        previousInvestigations: Array.from(invMap.values()),
      };
    });
  };

  // Interview Completed Handler - Transitions to Medical Timeline
  const handleInterviewComplete = async (
    messages: InterviewMessage[],
    flags: RedFlagAlert[]
  ) => {
    setInterviewMessages(messages);
    if (flags.length > 0) setRedFlags(flags);

    generateStructuredHistory({
      patient,
      conversationHistory: messages,
      extractedDocuments: medicalDocuments,
      isAyushMode,
      redFlags: flags,
    }).then((structured) => {
      if (structured) {
        setClinicalSummary(structured);
      }
    });

    // Step in exact intake flow: Voice Interview -> Medical Timeline
    setCurrentScreen("timeline");
  };

  // Doctor Submit / Confirmation Handler
  const handleConfirmAndSubmitToDoctor = async (
    finalSummary: PhysicianClinicalHistory
  ) => {
    setSubmissionError(null);
    setClinicalSummary(finalSummary);
    const newRefId = `CASE-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    setCaseReferenceId(newRefId);

    // Real API submission to backend
    try {
      const token = localStorage.getItem("caseline_auth_token") || undefined;
      await submitIntakeData({
        patient,
        selectedLanguage,
        conversationHistory: interviewMessages,
        clinicalSummary: finalSummary,
        redFlags,
        token,
      });
    } catch (e: any) {
      const message = e?.message || "Unable to submit the intake to the doctor queue.";
      console.warn("Intake API submit:", e);
      setSubmissionError(message);
      return;
    }

    // Update queue item in doctor portal
    setQueue((prev) =>
      prev.map((q) =>
        q.patientId === patient.patientId
          ? {
              ...q,
              historyStatus: "Ready for Review",
              historyCompletionPercent: 100,
              hasRedFlag: redFlags.length > 0,
            }
          : q
      )
    );

    setCurrentScreen("confirmation");
  };

  // Kiosk Logout & Reset: Clears tokens, temporary interview state, patient data
  const handleKioskLogout = async () => {
    // 1. Cancel ongoing speech synthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // 2. Call backend session logout
    try {
      const token = localStorage.getItem("caseline_auth_token");
      if (token) {
        await logoutPatient(token);
      }
    } catch (e) {}

    // 3. Clear storage tokens and session data
    localStorage.removeItem("caseline_auth_token");
    localStorage.removeItem("caseline_session_patient");

    // 4. Reset patient and temporary interview state
    setInterviewMessages([]);
    setRedFlags([]);
    setClinicalSummary(INITIAL_PHYSICIAN_SUMMARY);
    setPatient(DEMO_PATIENT);
    setCaseReferenceId("CASE-2026-IN8821");

    // 5. Navigate back to Welcome Animation
    setCurrentScreen("welcome");
  };

  return (
    <div
      id="caseline-app-root"
      className={`min-h-screen font-sans transition-colors ${
        isHighContrast
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      } ${isLargeText ? "text-lg" : "text-base"}`}
    >
      {/* Universal Navigation Header */}
      <NavigationHeader
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        selectedLanguage={selectedLanguage}
        patient={patient}
        activeRole={activeRole}
        onToggleRole={() =>
          setActiveRole((prev: ActiveRole) =>
            prev === "patient" ? "doctor" : "patient"
          )
        }
        onTriggerSos={() => setIsSosModalOpen(true)}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        isLargeText={isLargeText}
        onToggleLargeText={() => setIsLargeText(!isLargeText)}
      />

      {/* Main View Router */}
      <main className="w-full">
        {activeRole === "doctor" ? (
          /* Doctor Portal View */
          <DoctorDashboard
            queue={queue}
            selectedPatientId={selectedPatientId}
            onSelectPatient={(id) => {
              setSelectedPatientId(id);
              if (id === DEMO_PATIENT.patientId) {
                setClinicalSummary(INITIAL_PHYSICIAN_SUMMARY);
              }
            }}
            currentSummary={clinicalSummary}
            onUpdateSummary={setClinicalSummary}
            timelineEvents={timelineEvents}
            medicalDocuments={medicalDocuments}
            onAddDocument={handleAddDocument}
            isHighContrast={isHighContrast}
          />
        ) : (
          /* Patient Flow Screens */
          <div>
            {/* Screen 1: Welcome Animation Screen */}
            {currentScreen === "welcome" && (
              <WelcomeScreen
                selectedLanguage={selectedLanguage}
                onSelectLanguage={() => setCurrentScreen("language-selection")}
                onGetStarted={() => setCurrentScreen("language-selection")}
              />
            )}

            {/* Screen 2: Language Selection + Video Avatar */}
            {currentScreen === "language-selection" && (
              <LanguageSelectionScreen
                currentLanguage={selectedLanguage}
                onSelectLanguage={(lang) => {
                  handleSelectLanguage(lang);
                }}
                onConfirm={() => setCurrentScreen("login")}
                onBack={() => setCurrentScreen("welcome")}
              />
            )}

            {/* Screen 3: Patient Login + Video Avatar */}
            {currentScreen === "login" && (
              <LoginScreen
                currentLanguage={selectedLanguage}
                defaultPatient={patient}
                onLoginSuccess={(loggedPatient, token) => {
                  setPatient(loggedPatient);
                  if (token) {
                    try {
                      localStorage.setItem("caseline_auth_token", token);
                      localStorage.setItem(
                        "caseline_session_patient",
                        JSON.stringify(loggedPatient)
                      );
                    } catch (e) {}
                  }
                  setCurrentScreen("begin-interview");
                }}
                onBack={() => setCurrentScreen("language-selection")}
                onSwitchToDoctor={() => setActiveRole("doctor")}
              />
            )}

            {/* Screen 4: Begin Health Interview */}
            {currentScreen === "begin-interview" && (
              <BeginHealthInterviewScreen
                patient={patient}
                selectedLanguage={selectedLanguage}
                onStartInterview={() => setCurrentScreen("interview")}
                onBack={() => setCurrentScreen("login")}
              />
            )}

            {/* Screen 5: Patient Dashboard Screen (Secondary Navigation) */}
            {currentScreen === "dashboard" && (
              <PatientDashboardScreen
                patient={patient}
                selectedLanguage={selectedLanguage}
                clinicalSummary={clinicalSummary}
                documents={medicalDocuments}
                onNavigate={setCurrentScreen}
                onOpenLanguageSelector={() =>
                  setCurrentScreen("language-selection")
                }
                onEmergencySOS={() => setIsSosModalOpen(true)}
                verificationStatus="READY_FOR_CARE"
              />
            )}

            {/* Screen 6: Adaptive Voice & Touch Health Interview + Video Avatar */}
            {currentScreen === "interview" && (
              <VoiceHealthInterviewScreen
                patient={patient}
                selectedLanguage={selectedLanguage}
                isAyushMode={isAyushMode}
                character={voiceSettings.gender}
                voiceSettings={voiceSettings}
                onToggleAyushMode={() => setIsAyushMode(!isAyushMode)}
                onInterviewComplete={handleInterviewComplete}
                onTriggerSos={() => setIsSosModalOpen(true)}
                onBackToDashboard={() => setCurrentScreen("begin-interview")}
                onOpenVoiceSettings={() => setCurrentScreen("settings")}
              />
            )}

            {/* Screen 7: Medical Timeline */}
            {currentScreen === "timeline" && (
              <MedicalTimelineScreen
                events={timelineEvents}
                selectedLanguage={selectedLanguage}
                onOpenUpload={() => setCurrentScreen("records")}
                onBackToDashboard={() => setCurrentScreen("interview")}
                onContinueToIntake={() => setCurrentScreen("interview")}
                onProceedToSummary={() => setCurrentScreen("summary")}
              />
            )}

            {/* Screens 8: Medical Documents Upload & OCR Review */}
            {currentScreen === "records" && (
              <MedicalRecordsUploadScreen
                patientId={patient.patientId}
                selectedLanguage={selectedLanguage}
                existingDocuments={medicalDocuments}
                onAddDocument={handleAddDocument}
                onBackToDashboard={() => setCurrentScreen("timeline")}
              />
            )}

            {/* Screen 9: Clinical Summary + Video Avatar Confirmation */}
            {currentScreen === "summary" && (
              <ClinicalSummaryScreen
                summary={clinicalSummary}
                patient={patient}
                selectedLanguage={selectedLanguage}
                onProceedToDocuments={(updatedSummary) => {
                  setClinicalSummary(updatedSummary);
                  setCurrentScreen("document-scan");
                }}
                onConfirmAndSubmit={(updatedSummary) => {
                  setClinicalSummary(updatedSummary);
                  setCurrentScreen("document-scan");
                }}
                onBackToDashboard={() => setCurrentScreen("timeline")}
              />
            )}

            {/* Screen 10: Document Scan & OCR Screen */}
            {currentScreen === "document-scan" && (
              <DocumentScanScreen
                patient={patient}
                selectedLanguage={selectedLanguage}
                existingDocuments={medicalDocuments}
                onDocumentProcessed={(processedDoc) => {
                  handleAddDocument(processedDoc);
                  setCurrentProcessedDoc(processedDoc);
                  setCurrentScreen("ocr-review");
                }}
                onSkipToFinalReview={() => setCurrentScreen("final-review")}
                onBackToSummary={() => setCurrentScreen("summary")}
                onRemoveDocument={(docId) => {
                  setMedicalDocuments((prev) => prev.filter((d) => d.id !== docId));
                  setTimelineEvents((prev) => prev.filter((t) => t.documentId !== docId));
                }}
                onViewDocumentReview={(doc) => {
                  setCurrentProcessedDoc(doc);
                  setCurrentScreen("ocr-review");
                }}
              />
            )}

            {/* Screen 11: OCR Review & Patient Confirmation */}
            {currentScreen === "ocr-review" && (
              <OcrReviewScreen
                document={currentProcessedDoc || medicalDocuments[0] || DEMO_DOCUMENTS[0]}
                patient={patient}
                selectedLanguage={selectedLanguage}
                onConfirmDocument={(confirmedDoc) => {
                  setMedicalDocuments((prev) =>
                    prev.map((d) => (d.id === confirmedDoc.id ? confirmedDoc : d))
                  );
                  setCurrentScreen("final-review");
                }}
                onScanAnotherDocument={() => setCurrentScreen("document-scan")}
                onCancelOrBack={() => setCurrentScreen("document-scan")}
              />
            )}

            {/* Screen 12: Final Clinical Summary Review */}
            {currentScreen === "final-review" && (
              <FinalReviewScreen
                patient={patient}
                selectedLanguage={selectedLanguage}
                clinicalSummary={clinicalSummary}
                medicalDocuments={medicalDocuments}
                timelineEvents={timelineEvents}
                isSubmitting={isSubmittingToDoctor}
                submissionError={submissionError}
                onConfirmAndSubmit={async () => {
                  setIsSubmittingToDoctor(true);
                  try {
                    await handleConfirmAndSubmitToDoctor(clinicalSummary);
                  } finally {
                    setIsSubmittingToDoctor(false);
                  }
                }}
                onEditSection={(section) => {
                  if (section === "interview") setCurrentScreen("interview");
                  else if (section === "timeline") setCurrentScreen("timeline");
                  else if (section === "documents") setCurrentScreen("document-scan");
                  else if (section === "summary") setCurrentScreen("summary");
                }}
              />
            )}

            {/* Screen 10: Submission Screen + Countdown + Auto-Logout */}
            {currentScreen === "confirmation" && (
              <SubmissionConfirmationScreen
                patient={patient}
                selectedLanguage={selectedLanguage}
                referenceId={caseReferenceId}
                onLogout={handleKioskLogout}
                onSwitchToDoctorView={() => setActiveRole("doctor")}
              />
            )}

            {/* Screen 17: Continuing Care Modules */}
            {currentScreen === "continuing-care" && (
              <ContinuingCareScreen
                patient={patient}
                selectedLanguage={selectedLanguage}
                onNavigate={setCurrentScreen}
                onTriggerSos={() => setIsSosModalOpen(true)}
              />
            )}

            {/* Screen 19: Voice & Avatar Settings / Persistent Avatar Showcase */}
            {(currentScreen === "settings" || currentScreen === "persistent-avatar") && (
              <VoiceAvatarSettingsScreen
                settings={voiceSettings}
                onUpdateSettings={handleUpdateVoiceSettings}
                selectedLanguage={selectedLanguage}
                onSelectLanguage={handleSelectLanguage}
                onBackToDashboard={() => setCurrentScreen("dashboard")}
                onStartInterview={() => setCurrentScreen("interview")}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar for Mobile/Tablet */}
      {activeRole === "patient" && (
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          selectedLanguage={selectedLanguage}
        />
      )}

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddDocument={handleAddDocument}
        patientId={patient.patientId}
        isHighContrast={isHighContrast}
      />

      <EmergencySOSModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        patient={patient}
        historySummary={clinicalSummary}
      />

      <AbdmModal
        isOpen={isAbdmModalOpen}
        onClose={() => setIsAbdmModalOpen(false)}
        patient={patient}
        summary={clinicalSummary}
      />
    </div>
  );
}
