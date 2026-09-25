import { LanguageOption } from "../types";

export type SupportedLanguageCode =
  | "en"
  | "hi"
  | "ta"
  | "te"
  | "kn"
  | "ml"
  | "bn"
  | "mr"
  | "gu"
  | "pa"
  | "or"
  | "as"
  | "ur";

export interface ActiveLanguageSession {
  selectedLanguage: string; // e.g. "Tamil"
  selectedLocale: string;   // e.g. "ta-IN"
  selectedVoiceLocale: string; // e.g. "ta-IN"
  languageCode: string;
  nativeName: string;
}

export interface CommonTranslations {
  continue: string;
  back: string;
  next: string;
  start: string;
  beginInterview: string;
  confirm: string;
  cancel: string;
  edit: string;
  save: string;
  submit: string;
  retry: string;
  skip: string;
  change: string;
  clear: string;
  select: string;
  upload: string;
  scanDocument: string;
  takePhoto: string;
  chooseFile: string;
  delete: string;
  remove: string;
  finish: string;
  logout: string;
  yes: string;
  no: string;
  close: string;
  done: string;
  loading: string;
  saving: string;
  submitting: string;
  error: string;
  success: string;
  required: string;
  all: string;
  search: string;
  filter: string;
}

export interface NavTranslations {
  dashboard: string;
  voiceIntake: string;
  timeline: string;
  documents: string;
  care: string;
  settings: string;
  doctorPortal: string;
  patientApp: string;
  sos: string;
  switchRole: string;
}

export interface WelcomeTranslations {
  title: string;
  tagline: string;
  welcomeBubble: string;
  welcomeTitle: string;
  welcomeDesc: string;
  feat1: string;
  feat2: string;
  feat3: string;
  feat4: string;
  getStarted: string;
  login: string;
  highlightAi: string;
  highlightAiDesc: string;
  highlightLang: string;
  highlightLangDesc: string;
  highlightFriendly: string;
  highlightFriendlyDesc: string;
  highlightSpeed: string;
  highlightSpeedDesc: string;
  highlightSecure: string;
  highlightSecureDesc: string;
}

export interface LanguageTranslations {
  title: string;
  subtitle: string;
  continueBtn: string;
  indianLanguagesCount: string;
  sampleVoice: string;
  currentLangLabel: string;
}

export interface LoginTranslations {
  patientLogin: string;
  doctorLogin: string;
  patientId: string;
  patientIdPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  loginBtn: string;
  registerText: string;
  registerBtn: string;
  doctorStationNote: string;
  verbalGuidance: string;
  invalidIdError: string;
  invalidPassError: string;
  loginSuccess: string;
  loginFailed: string;
}

export interface DashboardTranslations {
  hello: string;
  whatWouldYouLike: string;
  clinicalStatus: string;
  readyForIntake: string;
  documentsOnFile: string;
  startHealthInterview: string;
  interviewCardDesc: string;
  speakIn: string;
  beginIntake: string;
  medicalTimeline: string;
  timelineCardDesc: string;
  viewTimeline: string;
  uploadRecords: string;
  uploadCardDesc: string;
  uploadNew: string;
  doctorSummary: string;
  summaryCardDesc: string;
  review: string;
  voiceAvatarSettings: string;
  continuingCareTitle: string;
  appointments: string;
  medications: string;
  healthTrends: string;
}

export interface InterviewTranslations {
  breadcrumb: string;
  questionOf: string;
  of: string;
  completed: string;
  emergencyAlertTitle: string;
  emergencyAlertDesc: string;
  emergencySosBtn: string;
  tapToSpeak: string;
  tapToStop: string;
  listening: string;
  processing: string;
  speakingAloud: string;
  avatarReady: string;
  quickSuggestions: string;
  typeAnswerPlaceholder: string;
  send: string;
  conversationHistory: string;
  reviewSummary: string;
  finishAndReview: string;
  repeatQuestion: string;
  ayushMode: string;
  highContrast: string;
  largeText: string;
  clinicalIntent: string;
  speechUnsupported: string;
  micDenied: string;
  micError: string;
  offlineNotice: string;
  promptPainLocation: string;
}

export interface BodyMapTranslations {
  title: string;
  subtitle: string;
  frontView: string;
  backView: string;
  patientsRight: string;
  patientsLeft: string;
  tapPrompt: string;
  confirmationPrompt: string;
  yesConfirm: string;
  changeArea: string;
  clearSelection: string;
  addAnotherArea: string;
  doneContinuing: string;
  confirmedAreas: string;
  severityLabel: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;
  quickSelector: string;
  regions: Record<string, string>;
}

export interface EmergencyTranslations {
  alertTitle: string;
  urgentNotice: string;
  immediateNotice: string;
  callingStaff: string;
  staffAlertActive: string;
  emergencyAdvice: string;
  sosBtn: string;
  closeBtn: string;
  callEmergency: string;
  hospitalStaffNotification: string;
}

export interface VitalsTranslations {
  title: string;
  subtitle: string;
  bp: string;
  bpSystolic: string;
  bpDiastolic: string;
  pulse: string;
  temp: string;
  spo2: string;
  glucose: string;
  respRate: string;
  unitsExplanation: string;
  enterVitals: string;
  saveVitals: string;
  normalRange: string;
  abnormalHigh: string;
  abnormalLow: string;
  staffVerificationNote: string;
  selfReportedNote: string;
  validationError: string;
}

export interface DocumentsTranslations {
  title: string;
  subtitle: string;
  scanPrescription: string;
  uploadReport: string;
  cameraPrompt: string;
  uploadButton: string;
  visibilityInstruction: string;
  analyzingOcr: string;
  extractedDataTitle: string;
  unclearTextWarning: string;
  reviewAndConfirm: string;
  confirmButton: string;
  reuploadButton: string;
  skipToFinalReview: string;
  removeDoc: string;
}

export interface OcrReviewTranslations {
  title: string;
  subtitle: string;
  verifyExtracted: string;
  dateLabel: string;
  institutionLabel: string;
  diagnosisLabel: string;
  medicinesLabel: string;
  investigationsLabel: string;
  unclearFieldsNotice: string;
  editValue: string;
  confirmAndProceed: string;
  scanAnother: string;
}

export interface SummaryTranslations {
  title: string;
  subtitle: string;
  physicianDraftBadge: string;
  editSummary: string;
  saveAndSubmit: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  medicationHistory: string;
  allergiesTitle: string;
  familyHistory: string;
  painLocationsTitle: string;
  vitalsTitle: string;
  editPrompt: string;
  saveChanges: string;
  cancelEdit: string;
}

export interface FinalReviewTranslations {
  title: string;
  subtitle: string;
  reviewBeforeSubmit: string;
  submitToDoctor: string;
  editSection: string;
  readyToSubmitBadge: string;
  submittingNotice: string;
}

export interface ConfirmationTranslations {
  title: string;
  desc: string;
  referenceIdLabel: string;
  whatHappensNext: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  returnToDashboard: string;
  viewDoctorStation: string;
  autoLogoutCountdown: string;
  logoutBtn: string;
}

export interface CareTranslations {
  appointmentsTitle: string;
  medicationsTitle: string;
  healthTrendsTitle: string;
  upcomingVisits: string;
  adherenceNotice: string;
  vitalsTrend: string;
}

export interface SettingsTranslations {
  title: string;
  avatarPreview: string;
  voiceGender: string;
  femaleVoice: string;
  maleVoice: string;
  voiceSpeed: string;
  speedSlow: string;
  speedNormal: string;
  speedFast: string;
  currentLanguage: string;
  testVoice: string;
  saveSettings: string;
  settingsSaved: string;
}

export interface ErrorTranslations {
  micPermissionDenied: string;
  networkUnavailable: string;
  aiUnavailable: string;
  ocrFailed: string;
  uploadFailed: string;
  sessionExpired: string;
  saveFailed: string;
  submissionFailed: string;
  generalError: string;
  pleaseTryAgain: string;
}

export interface FullLanguageTranslation {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  locale: string;
  voiceLocale: string;
  common: CommonTranslations;
  nav: NavTranslations;
  welcome: WelcomeTranslations;
  language: LanguageTranslations;
  login: LoginTranslations;
  dashboard: DashboardTranslations;
  interview: InterviewTranslations;
  bodyMap: BodyMapTranslations;
  emergency: EmergencyTranslations;
  vitals: VitalsTranslations;
  documents: DocumentsTranslations;
  ocrReview: OcrReviewTranslations;
  summary: SummaryTranslations;
  finalReview: FinalReviewTranslations;
  confirmation: ConfirmationTranslations;
  care: CareTranslations;
  settings: SettingsTranslations;
  errors: ErrorTranslations;
}
