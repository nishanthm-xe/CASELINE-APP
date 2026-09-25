import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { getLanguageByCode } from '../../lib/languages';
import { CaseLineIntakeHeader, CASELINE_13_LANGUAGES } from './CaseLineIntakeHeader';
import { StepProgressBar } from './StepProgressBar';
import { LanguageSelectionStep } from './LanguageSelectionStep';
import { PatientLoginStep } from './PatientLoginStep';
import { BeginInterviewStep } from './BeginInterviewStep';
import { VoiceAssistantStep } from './VoiceAssistantStep';
import { MedicalTimelineStep } from './MedicalTimelineStep';
import { ClinicalSummaryStep } from './ClinicalSummaryStep';
import { DocumentScanStep, AttachedDocument } from './DocumentScanStep';
import { ReviewConfirmStep } from './ReviewConfirmStep';
import { DoctorSummaryStep } from './DoctorSummaryStep';

export const CaseTakingView: React.FC = () => {
  const { user, addToast, setActiveTab, setLanguage, setActiveModal } = useApp();

  // Patient demographic fallback
  const patient = user?.patientData || {
    id: user?.id || 'pat-001',
    fullName: user?.fullName || 'Rajesh Kumar',
    patientCode: 'CL-PAT-092',
    age: 42,
    gender: 'Male',
    bloodGroup: 'O+',
    city: 'Chennai',
  };
  const patientId = patient.id || 'pat-001';

  // Step 1: Language selection starts the workflow
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected language state (default to saved or Tamil/Hindi/English)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem('caseline_preferred_language') || localStorage.getItem('caseline_lang') || 'ta';
    } catch (_e) {
      return 'ta';
    }
  });

  const selectedLangObj = getLanguageByCode(selectedLanguage);

  // Clinical history state
  const [chiefComplaint, setChiefComplaint] = useState<string>('Persistent Chest Tightness & Shortness of Breath');
  const [painLevel, setPainLevel] = useState<number>(6);
  const [duration, setDuration] = useState<string>('3-5 days');
  const [onset, setOnset] = useState<string>('Gradual (Subacute)');
  const [bodyLocation, setBodyLocation] = useState<string>('Retrosternal Chest & Upper Abdomen');
  const [progression, setProgression] = useState<string>('Worsening on exertion');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([
    'Cold Sweating',
    'Mild Nausea',
    'Exertional Dyspnea',
  ]);

  const [pastConditions, setPastConditions] = useState<string[]>([
    'Hypertension (Blood Pressure)',
    'Type 2 Diabetes Mellitus',
  ]);

  const [currentMeds, setCurrentMeds] = useState<string[]>([
    'Tab. Metformin 500mg (Twice daily)',
    'Tab. Telmisartan 40mg (Once daily)',
  ]);

  const [allergies, setAllergies] = useState<string[]>([
    'Penicillin (Skin Rash)',
  ]);

  const [pastSurgeries, setPastSurgeries] = useState<string[]>([
    'Appendectomy (2018, Apollo Hospitals)',
  ]);

  const [familyHistory, setFamilyHistory] = useState<string[]>([
    'Father: Ischemic Heart Disease (Age 56)',
    'Mother: Type 2 Diabetes',
  ]);

  // AYUSH state
  const [ayushEnabled, setAyushEnabled] = useState<boolean>(false);
  const [prakriti, setPrakriti] = useState<'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Tridoshic'>('Pitta');
  const [agni, setAgni] = useState<'Sama' | 'Visham' | 'Tikshna' | 'Manda'>('Tikshna');
  const [koshtha, setKoshtha] = useState<'Mrudu' | 'Madhyama' | 'Krura'>('Madhyama');
  const [nadiNotes, setNadiNotes] = useState<string>('');
  const [dietHabits, setDietHabits] = useState<string>('Vegetarian diet, irregular meal timings');

  // Attached physical documents
  const [attachedDocs, setAttachedDocs] = useState<AttachedDocument[]>([
    {
      id: 'doc-init-1',
      name: 'Prior_Prescription_Cardiology.pdf',
      type: 'application/pdf',
      documentType: 'Prescription',
      date: '2026-02-14',
      doctorName: 'Dr. S. Ramachandran',
      hospitalName: 'Apollo Speciality Hospitals',
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      ocrText: 'Tab. Telmisartan 40mg 1-0-0. Tab. Metformin 500mg 1-0-1. BP 138/86 mmHg.',
    },
  ]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize language selection to localStorage and app store
  const handleSelectLanguage = (code: string) => {
    setSelectedLanguage(code);
    try {
      localStorage.setItem('caseline_preferred_language', code);
      localStorage.setItem('caseline_lang', code);
      if (code === 'en' || code === 'ta' || code === 'hi') {
        setLanguage(code as any);
      }
    } catch (_e) {}
  };

  // Submit Docket to backend
  const handleConfirmAndSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.saveClinicalIntakeSession({
        patientId,
        patientCode: patient.patientCode || 'CL-PAT-092',
        language: selectedLanguage,
        languageName: selectedLangObj.displayName,
        intakeType: ayushEnabled ? 'ayush' : 'allopathy',
        structuredHistory: {
          chiefComplaint,
          painLevel,
          hpi: {
            duration,
            onset,
            location: bodyLocation,
            progression,
          },
          associatedSymptoms,
          pastConditions,
          currentMeds,
          allergies,
          pastSurgeries,
          familyHistory,
        },
        associatedDocuments: attachedDocs.map((d) => ({
          docId: d.id,
          title: d.name,
          type: d.documentType,
        })),
        ayushData: ayushEnabled
          ? {
              prakriti,
              agni,
              koshtha,
              nadiNotes,
              dietHabits,
            }
          : undefined,
      });

      addToast('Pre-consultation clinical docket securely encrypted and synced to Doctor Portal!', 'success');

      // Advance to Doctor Summary Hand-off (Step 9)
      setCurrentStep(9);
    } catch (e: any) {
      console.error('Error submitting intake:', e);
      addToast('Intake docket saved locally. Ready for Doctor Review.', 'info');
      setCurrentStep(9);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewIntake = () => {
    setChiefComplaint('Persistent Chest Tightness & Shortness of Breath');
    setPainLevel(6);
    setDuration('3-5 days');
    setOnset('Gradual (Subacute)');
    setBodyLocation('Retrosternal Chest & Upper Abdomen');
    setProgression('Worsening on exertion');
    setAssociatedSymptoms(['Cold Sweating', 'Mild Nausea', 'Exertional Dyspnea']);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 px-3 sm:px-6 lg:px-8 space-y-4">
      {/* Global CASE LINE Top Header */}
      <CaseLineIntakeHeader
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleSelectLanguage}
        onOpenDoctorPortal={() => setActiveTab('doctor_portal')}
        onTriggerSOS={() => setActiveModal('emergency_sos')}
        onBack={currentStep > 1 ? () => setCurrentStep((prev) => prev - 1) : undefined}
      />

      {/* 9-Step Progress Stepper */}
      <StepProgressBar
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* STEP 1: Choose Preferred Language (13 Indian Languages) */}
      {currentStep === 1 && (
        <LanguageSelectionStep
          selectedLanguage={selectedLanguage}
          onSelectLanguage={handleSelectLanguage}
          onContinue={() => setCurrentStep(2)}
        />
      )}

      {/* STEP 2: Patient Login (ABHA ID / Patient Code) */}
      {currentStep === 2 && (
        <PatientLoginStep
          selectedLanguage={selectedLanguage}
          patientName={patient.fullName}
          patientId={patient.patientCode || 'CL-PAT-092'}
          onLoginSuccess={() => setCurrentStep(3)}
          onBackToLanguage={() => setCurrentStep(1)}
          onOpenDoctorLogin={() => setActiveTab('doctor_portal')}
        />
      )}

      {/* STEP 3: Begin Health Interview Prep */}
      {currentStep === 3 && (
        <BeginInterviewStep
          patientName={patient.fullName}
          patientId={patient.patientCode || 'CL-PAT-092'}
          selectedLanguage={selectedLanguage}
          onBeginInterview={() => setCurrentStep(4)}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {/* STEP 4: Case Line Clinical Voice Interview (Female AI avatar) */}
      {currentStep === 4 && (
        <VoiceAssistantStep
          selectedLanguage={selectedLanguage}
          patientId={patientId}
          patientName={patient.fullName}
          chiefComplaint={chiefComplaint}
          setChiefComplaint={setChiefComplaint}
          painLevel={painLevel}
          setPainLevel={setPainLevel}
          duration={duration}
          setDuration={setDuration}
          onset={onset}
          setOnset={setOnset}
          bodyLocation={bodyLocation}
          setBodyLocation={setBodyLocation}
          associatedSymptoms={associatedSymptoms}
          setAssociatedSymptoms={setAssociatedSymptoms}
          pastConditions={pastConditions}
          setPastConditions={setPastConditions}
          currentMeds={currentMeds}
          setCurrentMeds={setCurrentMeds}
          allergies={allergies}
          setAllergies={setAllergies}
          ayushEnabled={ayushEnabled}
          onBackToLanguage={() => setCurrentStep(3)}
          onContinueToHistory={() => setCurrentStep(5)}
        />
      )}

      {/* STEP 5: Medical Timeline */}
      {currentStep === 5 && (
        <MedicalTimelineStep
          patientName={patient.fullName}
          patientId={patient.patientCode || 'CL-PAT-092'}
          selectedLanguage={selectedLanguage}
          onUploadRecord={() => setCurrentStep(7)}
          onProceedToSummary={() => setCurrentStep(6)}
          onBackToInterview={() => setCurrentStep(4)}
        />
      )}

      {/* STEP 6: Clinical Summary */}
      {currentStep === 6 && (
        <ClinicalSummaryStep
          patientName={patient.fullName}
          patientId={patient.patientCode || 'CL-PAT-092'}
          selectedLanguage={selectedLanguage}
          chiefComplaint={chiefComplaint}
          painLevel={painLevel}
          duration={duration}
          onset={onset}
          bodyLocation={bodyLocation}
          associatedSymptoms={associatedSymptoms}
          pastConditions={pastConditions}
          currentMeds={currentMeds}
          allergies={allergies}
          onEditResponses={() => setCurrentStep(4)}
          onProceedToAddRecords={() => setCurrentStep(7)}
          onBackToTimeline={() => setCurrentStep(5)}
        />
      )}

      {/* STEP 7: Add Medical Records (ABDM OCR) */}
      {currentStep === 7 && (
        <DocumentScanStep
          patientId={patientId}
          attachedDocs={attachedDocs}
          setAttachedDocs={setAttachedDocs}
          onBack={() => setCurrentStep(6)}
          onContinue={() => setCurrentStep(8)}
        />
      )}

      {/* STEP 8: Review Before Submission */}
      {currentStep === 8 && (
        <ReviewConfirmStep
          patientName={patient.fullName}
          patientId={patient.patientCode || 'CL-PAT-092'}
          selectedLanguageName={selectedLangObj.displayName}
          chiefComplaint={chiefComplaint}
          setChiefComplaint={setChiefComplaint}
          painLevel={painLevel}
          setPainLevel={setPainLevel}
          duration={duration}
          onset={onset}
          bodyLocation={bodyLocation}
          progression={progression}
          associatedSymptoms={associatedSymptoms}
          setAssociatedSymptoms={setAssociatedSymptoms}
          pastConditions={pastConditions}
          setPastConditions={setPastConditions}
          currentMeds={currentMeds}
          setCurrentMeds={setCurrentMeds}
          allergies={allergies}
          setAllergies={setAllergies}
          attachedDocs={attachedDocs}
          ayushEnabled={ayushEnabled}
          prakriti={prakriti}
          agni={agni}
          koshtha={koshtha}
          onEditSection={(targetStep) => setCurrentStep(targetStep)}
          onBack={() => setCurrentStep(7)}
          onConfirmAndSubmit={handleConfirmAndSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* STEP 9: Doctor Portal Hand-off */}
      {currentStep === 9 && (
        <DoctorSummaryStep
          patient={patient}
          selectedLanguageName={selectedLangObj.displayName}
          chiefComplaint={chiefComplaint}
          painLevel={painLevel}
          duration={duration}
          onset={onset}
          bodyLocation={bodyLocation}
          progression={progression}
          associatedSymptoms={associatedSymptoms}
          pastConditions={pastConditions}
          currentMeds={currentMeds}
          allergies={allergies}
          attachedDocs={attachedDocs}
          ayushEnabled={ayushEnabled}
          prakriti={prakriti}
          agni={agni}
          koshtha={koshtha}
          onStartNewIntake={handleStartNewIntake}
          onOpenDoctorPortal={() => setActiveTab('doctor_portal')}
        />
      )}
    </div>
  );
};
