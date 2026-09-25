export type UserRole = 'patient' | 'doctor' | 'bloodbank';
export type Language = 'en' | 'ta' | 'hi';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  profileId: string;
  patientCode: string; // e.g. PT-000001
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  aadhaarLast4: string; // demo masked identifier
  address: string;
  city: string;
  state: string;
  pincode: string;
  isVerified: boolean;
  avatarUrl?: string;
  mobile?: string;
  allergies?: string[];
  criticalConditions?: string[];
  emergencyContact?: EmergencyContact;
  createdAt: string;
}

export interface Doctor {
  id: string;
  profileId: string;
  doctorCode: string; // e.g. DR-000001
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  registrationNumber: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  hospitalName: string;
  hospitalAddress: string;
  verificationStatus: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  rating: number;
  availableTimings: string;
  avatarUrl?: string;
  certificateUrl?: string;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  phone: string;
  phoneNumber?: string;
  email: string;
  address: string;
  bloodGroup: string;
}

export type TimelineEventType =
  | 'Consultation'
  | 'Biopsy Report'
  | 'Lab Test'
  | 'Treatment'
  | 'Surgery'
  | 'Prescription'
  | 'Follow-up';

export interface MedicalTimelineEvent {
  id: string;
  patientId: string;
  date: string; // e.g. "2026-09-04"
  eventDate?: string;
  eventType: TimelineEventType;
  type?: string;
  category?: string;
  title: string;
  doctorName: string;
  doctorId?: string;
  hospitalName: string;
  description: string;
  reportAttachment?: {
    id: string;
    type: 'biopsy' | 'lab' | 'prescription' | 'scan';
    fileName: string;
    fileSize?: string;
    summary?: string;
  };
  metadata?: Record<string, any>;
  isUnverified?: boolean;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  hospitalName: string;
  recordType?: 'Consultation' | 'Diagnosis' | 'Prescription' | 'Discharge Summary';
  title: string;
  description: string;
  recordDate: string;
  date?: string;
  category?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number | string;
    temperature?: string;
    oxygenSaturation?: string;
    weight?: string;
  };
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
    weight?: string;
  };
  createdAt: string;
}

export interface BiopsyReport {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  medicalRecordId?: string;
  hospitalName: string;
  specimenType?: string;
  specimenDetails?: string;
  siteOfBiopsy?: string;
  collectionDate?: string;
  reportDate: string;
  pathologistName?: string;
  histopathologicalFindings?: string;
  clinicalHistory?: string;
  macroscopic?: string;
  microscopic?: string;
  diagnosis: string;
  gradeStage?: string;
  margins?: string;
  status?: 'Benign' | 'Malignant' | 'Inconclusive' | 'Normal';
  isSensitive?: boolean; // requires consent for viewing by other doctors
  attachmentUrl?: string;
  fileName?: string;
  createdAt: string;
}

export interface LabReportTestItem {
  testName?: string;
  parameter?: string;
  result?: string;
  value?: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low' | 'Abnormal' | string;
}

export interface LabReport {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  medicalRecordId?: string;
  hospitalName: string;
  testCategory?: string;
  testName?: string;
  reportDate: string;
  tests?: LabReportTestItem[];
  results?: LabReportTestItem[];
  pathologistSummary?: string;
  isSensitive?: boolean;
  attachmentUrl?: string;
  fileName?: string;
  createdAt?: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  hospitalName?: string;
  treatmentName: string;
  medications: string[];
  dosage?: string;
  dosageInstructions: string;
  startDate: string;
  endDate?: string;
  status: 'Ongoing' | 'Completed' | 'Paused' | string;
  notes: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  specialty?: string;
  appointmentDate: string; // e.g. "2026-09-04 10:30 AM"
  appointmentTime?: string;
  type?: string;
  purpose: string;
  reason?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  hospitalName: string;
  notes?: string;
  createdAt: string;
}

export interface ConsentRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  hospitalName: string;
  resourceType: 'All Medical Records' | 'Biopsy Reports' | 'Lab Reports' | 'Complete Profile';
  resourceId?: string;
  reason: string;
  status: 'PENDING' | 'GRANTED' | 'DENIED' | 'REVOKED';
  requestedAt: string;
  grantedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
  patientId?: string;
  doctorName?: string;
  hospitalName?: string;
  recordViewed?: string;
  permissionStatus?: string;
  accessExpiry?: string;
}

export interface NearbyFacility {
  id: string;
  name: string;
  type: 'Clinic' | 'Hospital' | 'Diagnostic Center';
  address: string;
  city?: string;
  distanceKm?: number;
  distance?: string;
  rating: number;
  reviewsCount?: number;
  openHours?: string;
  operatingHours?: string;
  phone: string;
  phoneNumber?: string;
  emergency24x7?: boolean;
  latitude?: number;
  longitude?: number;
  specialties?: string[];
  specializations?: string[];
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone?: string;
  phoneNumber?: string;
  distanceKm?: number;
  distance?: string;
  latitude?: number;
  longitude?: number;
  operatingHours?: string;
  inventory?: Record<string, number>;
  availableStock?: Record<string, number>;
  lastUpdated?: string;
}

export interface BloodEmergencyRequest {
  id: string; // e.g. REQ-000001
  patientId: string;
  patientName: string;
  patientCode: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  unitsRequired: number;
  hospitalName: string;
  hospitalLocation?: string;
  contactNumber?: string;
  requiredAt?: string;
  emergencyLevel?: 'CRITICAL' | 'URGENT' | 'STANDARD';
  urgency?: 'IMMEDIATE' | 'URGENT' | 'TODAY';
  additionalNotes?: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'RESERVED' | 'COLLECTED' | 'REJECTED' | 'CANCELLED';
  allocatedBloodBank?: string;
  statusUpdatedAt?: string;
  createdAt: string;
}

export interface HealthCamp {
  id: string;
  name?: string;
  title?: string;
  organizer: string;
  specialization: 'General' | 'Eye' | 'Dental' | 'Pediatric' | "Women's Health" | 'Senior Care' | 'General Medicine' | 'Cardiology & Diabetes' | 'Ophthalmology' | 'Women Health' | 'Pediatric Care' | 'Geriatric Care' | 'Other' | string;
  date: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  location?: string;
  venue?: string;
  contact?: string;
  totalSlots?: number;
  availableSlots: number;
  description?: string;
  isRegistered?: boolean;
  servicesOffered?: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'consent_request' | 'consent_granted' | 'consent_denied' | 'report_uploaded' | 'appointment' | 'blood_emergency' | 'health_camp' | 'system' | 'prescription';
  isRead: boolean;
  linkAction?: string;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isEmergencyAlert?: boolean;
  quickActionUsed?: string;
}

// -------------------------------------------------------------
// NEW FEATURE TYPES (Prescription, Vitals, SOS, QR, Family, etc.)
// -------------------------------------------------------------

export interface MedicationSchedule {
  morning: boolean;
  afternoon: boolean;
  evening?: boolean;
  night: boolean;
}

export type FoodTiming = 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD' | 'ANYTIME';

export interface MedicationItem {
  id: string;
  medicineName: string;
  dosage: string; // e.g., "500 mg", "1 tablet"
  frequency: string; // e.g., "Twice a day", "Once daily at night"
  schedule?: MedicationSchedule;
  foodTiming?: FoodTiming;
  timing?: string;
  timeSlots?: ('morning' | 'afternoon' | 'evening' | 'night')[];
  durationDays: number;
  remainingDays?: number;
  startDate?: string;
  endDate?: string;
  instructions?: string;
  status?: 'Active' | 'Completed' | 'Discontinued' | string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization?: string;
  hospitalName: string;
  diagnosis: string;
  doctorNotes?: string;
  notes?: string;
  medications: MedicationItem[];
  prescribedDate: string;
  issuedDate?: string;
  validUntil?: string;
  status: 'Active' | 'Completed' | 'Archived' | string;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  patientId: string;
  medicationId: string;
  medicineName: string;
  dosage: string;
  date: string; // YYYY-MM-DD
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  status: 'taken' | 'skipped' | 'upcoming';
  scheduledTime?: string;
  recordedAt?: string;
  timestamp?: string;
}

export interface HealthMeasurement {
  id: string;
  patientId: string;
  recordedAt: string;
  date?: string;
  type?: string;
  value?: number;
  unit?: string;
  status?: string;
  statusIndicator?: 'Improving' | 'Stable' | 'Needs Attention';
  mealContext?: string;
  systolic?: number;
  diastolic?: number;
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  bloodGlucose?: number; // mg/dL
  heartRate?: number; // bpm
  weightKg?: number;
  temperatureF?: number;
  oxygenSaturationSpO2?: number; // %
  notes?: string;
}

export interface EmergencyProfile {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  bloodGroup: string;
  dob?: string;
  age?: number;
  gender?: string;
  allergies: string[];
  criticalConditions: string[];
  currentMedications: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  emergencyMedicalNote?: string;
  organDonorStatus?: string;
  medicalImplants?: string;
  preferredHospital?: string;
  qrToken: string;
  qrEnabled: boolean;
  dataVisibility: {
    showAllergies: boolean;
    showConditions: boolean;
    showMedications: boolean;
    showContact: boolean;
  };
  qrAccessHistory: Array<{
    id: string;
    accessedAt: string;
    viewerRole: string;
    location?: string;
    fullAccessRequested?: boolean;
  }>;
  lastUpdated: string;
}

export interface SOSActivationEvent {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  bloodGroup: string;
  activatedAt: string;
  status: 'ACTIVE' | 'RESOLVED';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  locationAddress?: string;
  assignedHospital?: string;
  ambulanceEtaMinutes?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  contactsNotified: boolean;
  respondersDispatched?: boolean;
}

export interface ChildHealthTimelineEvent {
  id: string;
  date: string;
  category: 'Vaccination' | 'Growth' | 'Pediatric Visit' | 'Allergy' | 'Milestone';
  title: string;
  details: string;
  doctorOrClinic?: string;
  verified?: boolean;
}

export interface FamilyMember {
  id: string;
  primaryUserId: string;
  fullName: string;
  name?: string;
  relationship: 'Child' | 'Parent' | 'Spouse' | 'Sibling' | 'Elderly Dependent' | 'Other';
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  allergies: string[];
  conditions?: string[];
  accessLevel?: 'Full' | 'View Only' | 'Emergency Only' | string;
  emergencyContact?: string;
  medicalHistoryNotes?: string;
  isChild?: boolean;
  childHealthTimeline?: ChildHealthTimelineEvent[];
  childTimeline?: ChildHealthTimelineEvent[] | any[];
  createdAt: string;
}

export interface BloodStockItem {
  bloodGroup: string;
  unitsAvailable: number;
  status: 'critical' | 'low' | 'adequate' | string;
  lastUpdated?: string;
}
export type BloodGroupStock = BloodStockItem;
export type EmergencySOS = SOSActivationEvent;
export type ChildHealthMilestone = ChildHealthTimelineEvent;

export interface MedicalSummaryData {
  generatedAt: string;
  patient: {
    fullName: string;
    patientCode: string;
    age: number;
    gender: string;
    bloodGroup: string;
    phone: string;
    address: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  allergies: string[];
  criticalConditions: string[];
  activeMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    timing: string;
  }>;
  recentVitals?: {
    bloodPressure?: string;
    bloodGlucose?: string;
    heartRate?: string;
    oxygenSaturation?: string;
    recordedAt?: string;
  };
  recentConsultations: Array<{
    date: string;
    doctorName: string;
    hospitalName: string;
    diagnosis: string;
  }>;
  recentLabReports: Array<{
    date: string;
    testName: string;
    summary: string;
  }>;
}

export interface AIReportExplanation {
  id: string;
  reportId: string;
  language: Language;
  summary: string;
  explanation?: string;
  medicalTermsExplained: Array<{
    term: string;
    explanation: string;
  }>;
  parametersBreakdown: Array<{
    testName: string;
    value: string;
    referenceRange: string;
    interpretation: string;
  }>;
  questionsForDoctor: string[];
  keyFindings?: string[];
  abnormalOrFlagged?: string[];
  safeLifestyleGuidance?: string[];
  disclaimer: string;
  createdAt: string;
}

// ==========================================================
// MEDICAL INSURANCE MODULE TYPES
// ==========================================================
export type ClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_REQUIRED'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'SETTLED';

export type PolicyStatus =
  | 'ACTIVE'
  | 'RENEWAL_DUE'
  | 'EXPIRED'
  | 'PENDING_VERIFICATION'
  | 'LAPSED';

export interface InsuranceDocument {
  id: string;
  insuranceProfileId?: string;
  claimId?: string;
  patientId: string;
  documentType:
    | 'insurance_card'
    | 'policy_document'
    | 'discharge_summary'
    | 'hospital_bill'
    | 'CLAIM_BILL'
    | 'prescription'
    | 'investigation_report'
    | 'other';
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  isPrivate: boolean;
  uploadedAt: string;
}

export interface InsuranceProfile {
  id: string;
  patientId: string;
  insuranceProvider: string;
  policyNumber: string;
  policyType: string;
  coverageAmount: number;
  remainingCoverage?: number;
  deductible: string;
  copay: string;
  validFrom: string;
  validUntil: string;
  tpaName: string;
  tpaContact: string;
  tpaEmail?: string;
  networkHospitals: string[];
  policyStatus: PolicyStatus;
  insuranceCardUrl?: string;
  policyDocumentUrl?: string;
  documents?: InsuranceDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ClaimTimelineItem {
  status: ClaimStatus;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  insuranceProfileId: string;
  insuranceProvider: string;
  policyNumber: string;
  hospital: string;
  treatment: string;
  treatmentRecordId?: string;
  dateOfTreatment: string;
  amountClaimed: number;
  amountApproved: number;
  patientPaid?: number;
  claimStatus: ClaimStatus;
  submittedDate: string;
  lastUpdated: string;
  notes: string;
  requiredDocuments: string[];
  documents: InsuranceDocument[];
  timeline: ClaimTimelineItem[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================================
// MEDICAL EXPENSES MODULE TYPES
// ==========================================================
export type MedicalExpenseCategory =
  | 'Consultation'
  | 'Hospitalization'
  | 'Lab Test'
  | 'Scan / Imaging'
  | 'Medicine'
  | 'Surgery'
  | 'Emergency'
  | 'Other';

export type ExpensePaymentStatus =
  | 'PAID'
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'CLAIM_PENDING'
  | 'REIMBURSED';

export interface MedicalExpenseReceipt {
  fileName: string;
  fileUrl?: string;
  fileSize?: string;
  fileType?: string;
  uploadedAt?: string;
}

export interface MedicalExpense {
  id: string;
  patientId: string;
  date: string;
  category: MedicalExpenseCategory;
  hospitalOrClinic: string;
  description: string;
  amount: number;
  insuranceCoveredAmount: number;
  patientPaidAmount: number;
  paymentStatus: ExpensePaymentStatus;
  linkedRecordId?: string; // Links to Medical Record / Treatment / Lab Test
  linkedRecordTitle?: string;
  linkedClaimId?: string; // Links to Insurance Claim
  receiptDocument?: MedicalExpenseReceipt;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIPolicyExplanation {
  id: string;
  insuranceProfileId: string;
  language: Language;
  policySummary: string;
  coverageDetails: string[];
  exclusions: string[];
  waitingPeriodDetails: string[];
  deductibleAndCopayExplanation: string;
  claimDocumentationRequirements: string[];
  generalTerminology: Array<{
    term: string;
    explanation: string;
  }>;
  disclaimer: string;
  generatedAt: string;
}

// Patient Case-Taking Software Types
export type IntakeMode = 'modern' | 'ayush';

export interface AyushIntakeData {
  prakriti?: string; // Vata / Pitta / Kapha / Dwandwaja / Tridoshaja
  vikriti?: string; // Current doshic aggravation
  agni?: string; // Sama / Vishama / Tikshna / Manda
  koshtha?: string; // Krura / Madhyama / Mridu
  ahara?: string; // Diet habits, taste preference, fasting, viruddha ahara
  vihara?: string; // Daily routine, sleep patterns (Nidra), physical exertion (Vyayama)
  nidana?: string; // Causative factors identified by patient
  samprapti?: string; // Progression of illness
  trividhaPariksha?: {
    darshana?: string; // Visual inspection signs
    sparshana?: string; // Tactile / temperature / palpation
    prashna?: string; // Patient responses to inquiry
  };
  ashtavidhaPariksha?: {
    nadi?: string; // Pulse
    mutra?: string; // Urine
    mala?: string; // Stool
    jihva?: string; // Tongue
    shabda?: string; // Voice
    sparsha?: string; // Skin touch
    druk?: string; // Eyes/vision
    akruti?: string; // General physical build
  };
  dashavidhaPariksha?: {
    dushya?: string;
    desha?: string;
    bala?: string;
    kala?: string;
    anala?: string;
    prakriti?: string;
    vaya?: string;
    sattva?: string;
    satmya?: string;
    ahara?: string;
  };
}

export interface StructuredClinicalHistory {
  chiefComplaint: string;
  historyOfPresentIllness: {
    onset?: string;
    duration?: string;
    progression?: string;
    location?: string;
    character?: string;
    severity?: string; // e.g. 1-10 or Mild/Moderate/Severe
    aggravatingFactors?: string;
    relievingFactors?: string;
    associatedSymptoms?: string[];
    patientVerbatim?: string;
  };
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  medicationHistory: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
  }>;
  allergyHistory: Array<{
    substance: string;
    reaction?: string;
    severity?: 'Mild' | 'Moderate' | 'Severe';
  }>;
  familyHistory: string[];
  personalSocialHistory: {
    diet?: string;
    smoking?: string;
    alcohol?: string;
    occupation?: string;
    sleepPattern?: string;
    physicalActivity?: string;
  };
  reviewOfSystems: {
    constitutional?: string; // Fever, chills, weight loss
    cardiorespiratory?: string; // Chest pain, cough, shortness of breath
    gastrointestinal?: string; // Nausea, abdominal pain, bowel changes
    neurological?: string; // Headache, dizziness, numbness
    musculoskeletal?: string; // Joint pain, stiffness
    other?: string;
  };
  previousInvestigations: string[];
  previousTreatments: string[];
  currentSymptoms: string[];
}

export interface ClinicalIntakeSession {
  id: string;
  patientId: string;
  patientCode: string;
  intakeType: IntakeMode; // Modern Medicine vs Ayurveda / AYUSH
  language: string; // Indian language code e.g. 'hi', 'ta', 'en'
  languageName?: string;
  conversationTranscript: Array<{
    id: string;
    sender: 'ai' | 'patient';
    text: string;
    originalLanguageText?: string;
    timestamp: string;
    isVoice?: boolean;
    audioUrl?: string;
  }>;
  structuredHistory: StructuredClinicalHistory;
  ayushData?: AyushIntakeData;
  emergencyFlagTriggered?: boolean;
  emergencyDetails?: string;
  patientConfirmed: boolean;
  patientConfirmedAt?: string;
  associatedDocuments?: Array<{
    docId: string;
    title: string;
    type: string;
  }>;
  summaryDocketUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorClinicalSummary {
  patientOverview: {
    id: string;
    patientCode: string;
    fullName: string;
    age: number;
    gender: string;
    bloodGroup: string;
    city: string;
    emergencyContact?: EmergencyContact;
    criticalConditions?: string[];
  };
  chiefComplaint: {
    value: string;
    sourceId?: string;
    sourceType?: string;
  };
  historyOfPresentIllness: {
    onset?: string;
    duration?: string;
    progression?: string;
    associatedSymptoms?: string[];
    details?: string;
    sourceId?: string;
  };
  pastMedicalHistory: Array<{ condition: string; source?: string; sourceId?: string }>;
  pastSurgicalHistory: Array<{ surgery: string; date?: string; source?: string; sourceId?: string }>;
  currentMedications: Array<{ name: string; dosage?: string; source?: string; sourceId?: string }>;
  allergies: Array<{ substance: string; severity?: string; source?: string }>;
  previousInvestigations: Array<{
    id: string;
    title: string;
    type: 'lab' | 'biopsy' | 'scan' | 'ocr_doc';
    date: string;
    hospitalName?: string;
    keyFindings?: string;
    sourceUrl?: string;
    fileData?: string;
  }>;
  previousTreatments: Array<{ treatment: string; date?: string; doctor?: string }>;
  recentTimeline: Array<{
    id: string;
    date: string;
    title: string;
    type: string;
    hospital: string;
  }>;
  currentStatus: {
    symptoms: string[];
    vitals?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: string;
      oxygenSaturation?: string;
      recordedDate?: string;
    };
    recentReportsCount: number;
    upcomingAppointmentsCount: number;
  };
  emergencyInfo: {
    bloodGroup: string;
    allergies: string[];
    criticalNotes?: string;
  };
  insuranceAuthorized: boolean;
  insuranceDetails?: {
    provider?: string;
    policyNumber?: string;
    sumInsured?: number;
    status?: string;
  };
  clinicalRedFlags?: {
    status: 'NORMAL' | 'URGENT' | 'EMERGENCY';
    evaluatedAt: string;
    alerts: Array<{
      id: string;
      level: 'NORMAL' | 'URGENT' | 'EMERGENCY';
      category: 'breathing_chest' | 'neurological' | 'severe_bleeding' | 'altered_consciousness' | 'severe_allergic' | 'severe_pain' | 'critical_lab' | 'other';
      categoryLabel: string;
      message: string;
      triggerSymptom: string;
      recordedAt: string;
      source: 'voice' | 'text' | 'document' | 'intake';
      sourceDetails?: string;
      patientConfirmed: boolean;
      originalResponse?: string;
      documentId?: string;
    }>;
  };
  importantPatientStatements?: Array<{
    statement: string;
    source: 'voice' | 'text' | 'document';
    recordedAt: string;
  }>;
  aiGeneratedSummary?: {
    summaryText: string;
    confidenceNote: string;
    generatedAt: string;
    isAiGenerated: boolean;
    patientFriendlySummary?: string;
    patientPreparationTips?: string[];
  };
}

export interface ClinicalRedFlagAlert {
  id: string;
  level: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  category: 'breathing_chest' | 'neurological' | 'severe_bleeding' | 'altered_consciousness' | 'severe_allergic' | 'severe_pain' | 'critical_lab' | 'other';
  categoryLabel: string;
  message: string;
  triggerSymptom: string;
  recordedAt: string;
  source: 'voice' | 'text' | 'document' | 'intake';
  sourceDetails?: string;
  patientConfirmed: boolean;
  originalResponse?: string;
  documentId?: string;
}

export interface OcrExtractedFields {
  patientName?: string;
  hospitalOrClinic?: string;
  doctorName?: string;
  documentDate?: string;
  documentType?: 'prescription' | 'lab_report' | 'biopsy' | 'discharge_summary' | 'imaging' | 'consultation_note' | 'medical_certificate' | 'insurance_document' | 'other';
  diagnosis?: string;
  symptoms?: string[];
  medicines?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
  }>;
  labParameters?: Array<{
    parameter: string;
    value: string;
    unit?: string;
    referenceRange?: string;
    status?: 'normal' | 'high' | 'low' | 'critical';
  }>;
  biopsyFindings?: {
    specimen?: string;
    diagnosis?: string;
    marginStatus?: string;
    mitoticRate?: string;
  };
  procedureNames?: string[];
  investigationNames?: string[];
  redFlagsDetected?: string[];
  notes?: string;
}


