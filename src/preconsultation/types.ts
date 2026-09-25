export type UserRole = "patient" | "doctor";
export type ActiveRole = "patient" | "doctor";

export type PatientScreen =
  | "welcome"
  | "language"
  | "language-selection"
  | "login"
  | "begin-interview"
  | "dashboard"
  | "interview"
  | "timeline"
  | "records"
  | "summary"
  | "document-scan"
  | "ocr-review"
  | "final-review"
  | "confirmation"
  | "submission"
  | "verification"
  | "settings"
  | "persistent-avatar"
  | "continuing-care";

// Deterministic 4-level Triage Architecture
export type TriageLevel = "EMERGENCY" | "URGENT_CARE" | "PRIMARY_CARE" | "SELF_CARE";

// Explicit negative findings status
export type FindingPresence = "PRESENT" | "ABSENT" | "UNKNOWN" | "NOT_ASKED";

export interface StructuredFinding {
  id: string;
  category: "symptom" | "sign" | "risk_factor" | "red_flag";
  concept: string; // e.g. "Retrosternal Chest Tightness", "Radiation to Jaw", "Fever", "Cough"
  status: FindingPresence; // PRESENT (+) | ABSENT (-) | UNKNOWN (?) | NOT_ASKED
  details?: string;
  source: "PATIENT_VOICE" | "PATIENT_TOUCH" | "DOCUMENT_OCR" | "MANUAL_CORRECTION" | "STAFF_ENTRY" | "AI_INFERRED";
  confidenceScore?: number;
  snomedCode?: string;
}

// Vitals Pathway
export type VitalProvenance = "PATIENT_REPORTED" | "CAREGIVER_REPORTED" | "DEVICE_INTEGRATION" | "STAFF_ENTERED";

export interface VitalMeasurement {
  id: string;
  type: "BP_SYSTOLIC" | "BP_DIASTOLIC" | "PULSE" | "RESPIRATORY_RATE" | "TEMPERATURE" | "SPO2" | "BLOOD_GLUCOSE";
  name: string;
  value: number;
  unit: string;
  isAbnormal: boolean;
  normalRange: string;
  provenance: VitalProvenance;
  timestamp: string;
  deviceInfo?: string;
}

export interface PatientVitalsSummary {
  bpSystolic?: number;
  bpDiastolic?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  tempUnit?: "°F" | "°C";
  spO2?: number;
  bloodGlucose?: number;
  glucoseType?: "Random" | "Fasting" | "Post-Prandial";
  recordedAt: string;
  provenance: VitalProvenance;
  abnormalFlags: string[];
}

// Contradiction / Discrepancy Detection
export interface ClinicalDiscrepancy {
  id: string;
  type: "MEDICATION_MISMATCH" | "DENIED_CONDITION_FOUND_IN_RECORD" | "INVESTIGATION_CONTRADICTION" | "SYMPTOM_TIMELINE_INCONSISTENCY";
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  patientStatement?: string;
  conflictingRecordSource?: string;
  conflictingValue?: string;
  reconciliationNote?: string;
  isResolved?: boolean;
}

// Caregiver Assistance
export interface CaregiverInfo {
  isAssisted: boolean;
  caregiverName?: string;
  relationship?: "Spouse" | "Son" | "Daughter" | "Sibling" | "Parent" | "ASHA Worker" | "Friend" | "Other";
  phone?: string;
}

// Complaint Sufficiency Evaluation
export interface SufficiencyScore {
  overallPercent: number;
  criteriaMet: string[];
  criteriaMissing: string[];
  isSufficientForTriage: boolean;
}

// Triage Evaluation Model
export interface TriageEvaluation {
  level: TriageLevel;
  score: number;
  matchedRules: string[];
  requiresHumanTriage: boolean;
  displayTitle: string;
  publicSafetyAdviceEn: string;
  publicSafetyAdviceLocalized?: string;
  staffAlertReason: string;
  emergencyTransferRequired: boolean;
  suggestedDisposition: string;
  evaluatedAt: string;
}

export type AvatarMood =
  | "IDLE"
  | "LISTENING"
  | "PROCESSING"
  | "SPEAKING"
  | "ERROR"
  | "COMPLETED";

export type InterviewState =
  | "IDLE"
  | "READY"
  | "LISTENING"
  | "PROCESSING"
  | "SPEAKING"
  | "ERROR";

export type AvatarPose =
  | "idle"
  | "welcome"
  | "language"
  | "login"
  | "dashboard"
  | "interview"
  | "listening"
  | "processing"
  | "speaking"
  | "error"
  | "summary"
  | "document"
  | "review"
  | "confirmation"
  | "settings"
  | "timeline";

export type VerificationStatus =
  | "PENDING_VERIFICATION"
  | "UNDER_VERIFICATION"
  | "NEEDS_CORRECTION"
  | "VERIFIED"
  | "SENT_TO_DOCTOR"
  | "COMPLETED";

export interface VoiceSettings {
  gender: "female" | "male";
  speed: "slow" | "normal" | "fast";
  rate: number;
  autoSpeak: boolean;
  audioChime: boolean;
  avatarId: string;
  preferredRegionalLangCode?: string;
  bilingualMode?: boolean;
  regionalDialect?: string;
  speechSensitivity?: "standard" | "high";
}

export interface AppointmentItem {
  id: string;
  doctorName: string;
  department: string;
  hospital: string;
  date: string;
  time: string;
  status: "Confirmed" | "Completed" | "Cancelled";
  type: "In-Person" | "Tele-consultation";
}

export interface MedicationTrackerItem {
  id: string;
  name: string;
  dose: string;
  timing: "Morning" | "Afternoon" | "Night";
  instructions: string;
  taken: boolean;
  timeTaken?: string;
}

export interface HealthTrendPoint {
  date: string;
  systolic: number;
  diastolic: number;
  fastingSugar: number;
  cholesterol: number;
}

export interface DemographicData {
  name: string;
  age: number | string;
  gender: "Male" | "Female" | "Other" | string;
  phone: string;
  patientId: string;
  abhaId?: string;
  aadhaarLast4?: string;
  bloodGroup?: string;
}

export interface LanguageOption {
  code: string;
  locale: string;
  name: string;
  nativeName: string;
  ttsLang: string;
  samplePhrase: string;
  script?: string;
  flagOrIcon?: string;
}

export interface ConsentRecord {
  consentId: string;
  patientId: string;
  purpose: string;
  status: "granted" | "declined" | "revoked";
  timestamp: string;
  audioExplanationPlayed: boolean;
  revocable: boolean;
}

export interface InterviewMessage {
  id: string;
  sender: "ai" | "patient";
  category?: string;
  text: string;
  textInEnglish?: string;
  touchOptions?: string[];
  selectedOption?: string;
  isRedFlag?: boolean;
  redFlagReason?: string;
  rationale?: string; // Clinical "Why this question?" rationale
  timestamp: string;
  source: "voice" | "touch" | "text" | "ai";
}

export interface PainLocationItem {
  id?: string;
  bodyView: "front" | "back";
  region: string;
  side: "left" | "right" | "center" | "bilateral";
  displayName: string;
  coordinates?: {
    x: number;
    y: number;
  };
  confirmedByPatient: boolean;
  intensity?: number;
  character?: string;
}

export interface HPIStructure {
  onset: string;
  duration: string;
  location: string;
  painLocation?: PainLocationItem;
  painLocations?: PainLocationItem[];
  character: string;
  severity: string;
  timing: string;
  progression: string;
  aggravatingFactors: string;
  relievingFactors: string;
  associatedSymptoms: string;
}

export interface MedicationItem {
  id?: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  source: "patient-reported" | "extracted-from-document";
  instructions?: string;
  needsReview?: boolean;
  confidence?: number;
}

export interface InvestigationItem {
  id?: string;
  testName: string;
  value: string;
  unit?: string;
  referenceRange: string;
  status: "within_range" | "above_range" | "below_range" | "undetermined";
  interpretation?: string;
  date?: string;
}

export interface AYUSHAssessment {
  prakriti: string;
  vikriti: string;
  sara: string;
  samhanana: string;
  pramana: string;
  satmya: string;
  sattva: string;
  aharaShakti: string;
  vyayamaShakti: string;
  vaya: string;
  aharaVihara: string;
}

export interface RedFlagAlert {
  id?: string;
  symptom: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE";
  actionTaken: string;
  detectedAt?: string;
}

export interface PhysicianClinicalHistory {
  id: string;
  patientId: string;
  patientInfo: DemographicData;
  chiefComplaint: string;
  hpi: HPIStructure;
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  medicationHistory: MedicationItem[];
  drugAndAllergyHistory: string[];
  familyHistory: string[];
  personalHistory: {
    diet: string;
    sleep: string;
    occupation: string;
    habits: string;
    lifestyle: string;
  };
  reviewOfSystems: {
    cardiovascular: string;
    respiratory: string;
    gastrointestinal: string;
    neurological: string;
    musculoskeletal: string;
    general: string;
  };
  previousInvestigations: InvestigationItem[];
  documentSummary: string;
  ayushAssessment: AYUSHAssessment;
  isAyushEnabled: boolean;
  redFlagAlerts: RedFlagAlert[];
  painLocations?: PainLocationItem[];
  triageLevel?: TriageLevel;
  triageEvaluation?: TriageEvaluation;
  vitals?: PatientVitalsSummary;
  vitalsList?: VitalMeasurement[];
  structuredFindings?: StructuredFinding[];
  discrepancies?: ClinicalDiscrepancy[];
  caregiverInfo?: CaregiverInfo;
  sufficiency?: SufficiencyScore;
  physicianNotes?: string;
  physicianImpression?: string;
  status: "draft_ai" | "in_review" | "verified_physician" | "rejected";
  verifiedByDoctor?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  title: string;
  documentType:
    | "Prescription"
    | "Laboratory report"
    | "Discharge summary"
    | "Scan / investigation report"
    | "Medical report"
    | "Other Medical Record";
  date: string;
  institutionOrDoctor: string;
  filePreview?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  rawText?: string;
  extractedDiagnoses: string[];
  extractedMedicines: MedicationItem[];
  extractedInvestigations: InvestigationItem[];
  proceduresMentioned: string[];
  allergiesMentioned: string[];
  treatmentInformation?: string;
  relevantClinicalNotes?: string;
  isHandwritten?: boolean;
  handwritingReadability?: "clear" | "partially_readable" | "unreadable";
  unreadableSections?: string[];
  needsVerification?: boolean;
  uncertainFields?: string[];
  patientConfirmed?: boolean;
  patientCorrections?: Record<string, any>;
  status: "pending" | "processing" | "needs_review" | "processed" | "verified";
  confidenceScore: number;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string;
  eventType: "Lab Test" | "Doctor Consultation" | "Prescription" | "Hospital Admission" | "Surgery" | "Investigation";
  title: string;
  institution: string;
  doctorName?: string;
  summary: string;
  diagnosis?: string;
  medicinesCount?: number;
  abnormalValuesCount?: number;
  documentId?: string;
}

export interface PatientQueueItem {
  patientId: string;
  name: string;
  age: number | string;
  gender: string;
  abhaId: string;
  chiefComplaint: string;
  waitingMinutes: number;
  hasRedFlag: boolean;
  redFlagSeverity?: "CRITICAL" | "HIGH" | "MODERATE";
  triageLevel?: TriageLevel;
  historyStatus: "Not Started" | "In Progress" | "Ready for Review" | "Verified by Doctor";
  historyCompletionPercent: number;
  isAyushMode: boolean;
  submittedAt: string;
}
