import { Language } from '../types';

export interface Translations {
  // Navigation & Tabs
  navHome: string;
  navDashboard: string;
  navEmergencySOS: string;
  navEmergencyQR: string;
  navTimeline: string;
  navAppointments: string;
  navPrescriptions: string;
  navMedicationTracker: string;
  navHealthTrends: string;
  navReports: string;
  navBiopsy: string;
  navLab: string;
  navTreatments: string;
  navRecords: string;
  navDoctors: string;
  navNearby: string;
  navBloodEmergency: string;
  navCamps: string;
  navAIAssistant: string;
  navFamily: string;
  navMedicalSummary: string;
  navNotifications: string;
  navConsent: string;
  navProfile: string;
  navSettings: string;
  navInsurance: string;
  medicalInsurance: string;
  insurance: string;
  claimsTracker: string;
  aiPolicyExplainer: string;
  navExpenses: string;
  medicalExpenses: string;
  expenses: string;
  totalExpenses: string;
  insuranceCovered: string;
  outOfPocket: string;

  // Header & Controls
  searchPlaceholder: string;
  emergency108: string;
  demoPatient: string;
  demoDoctor: string;
  demoBloodBank: string;
  switchRole: string;
  login: string;
  getStarted: string;
  logout: string;

  // Emergency & SOS
  sosTitle: string;
  sosSubtitle: string;
  sosButtonActive: string;
  sosButtonInactive: string;
  requestLocation: string;
  locationShared: string;
  bloodGroup: string;
  knownAllergies: string;
  criticalConditions: string;
  activeMedications: string;
  emergencyContact: string;
  preferredHospital: string;
  dial108: string;
  dial112: string;
  shareEmergencyProfile: string;

  // QR Card
  qrCardTitle: string;
  qrCardSubtitle: string;
  regenerateQR: string;
  toggleQRAccess: string;
  qrAccessHistory: string;
  requestFullAccess: string;
  qrScannerNotice: string;

  // Prescriptions & Meds
  todaysMedicines: string;
  adherenceRate: string;
  morningSlot: string;
  afternoonSlot: string;
  eveningSlot: string;
  nightSlot: string;
  taken: string;
  skipped: string;
  upcoming: string;
  beforeFood: string;
  afterFood: string;
  prescribedBy: string;

  // Appointments
  bookAppointment: string;
  selectSpecialization: string;
  selectDoctor: string;
  selectHospital: string;
  selectDate: string;
  selectTime: string;
  confirmBooking: string;
  upcomingAppointments: string;
  reschedule: string;
  cancelAppointment: string;

  // Health Trends
  healthTrendsTitle: string;
  logNewVitals: string;
  bloodPressure: string;
  bloodGlucose: string;
  heartRate: string;
  oxygenSaturation: string;
  bodyWeight: string;
  trendImproving: string;
  trendStable: string;
  trendNeedsAttention: string;

  // Family Profiles
  familyTitle: string;
  addFamilyMember: string;
  childHealthTimeline: string;
  vaccinations: string;
  pediatricVisits: string;
  growthRecords: string;

  // AI Explainer
  explainReport: string;
  aiExplainingTitle: string;
  keyFindings: string;
  questionsForDoctor: string;
  medicalDisclaimer: string;

  // Common UI
  save: string;
  cancel: string;
  loading: string;
  download: string;
  print: string;
  share: string;
  status: string;

  // Aliases for Navigation and Views
  home: string;
  myProfile: string;
  medicalTimeline: string;
  emergencySOS: string;
  emergencyQR: string;
  medicationTracker: string;
  healthTrends: string;
  appointmentBooking: string;
  familyProfiles: string;
  medicalRecords: string;
  biopsyReports: string;
  labReports: string;
  treatmentHistory: string;
  myDoctors: string;
  nearbyHospitals: string;
  bloodEmergency: string;
  freeHealthCamps: string;
  privacyConsent: string;
  settings: string;
  medicalSummary: string;
  smartNotifications: string;
  sosEmergency: string;
  sosActivated: string;
  register: string;
  safeLifestyleGuidance: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    navHome: 'Dashboard',
    navDashboard: 'Dashboard',
    navEmergencySOS: 'Emergency SOS',
    navEmergencyQR: 'Emergency QR Card',
    navTimeline: 'Medical Timeline',
    navAppointments: 'Appointments',
    navPrescriptions: 'Prescriptions',
    navMedicationTracker: 'Medication Tracker',
    navHealthTrends: 'Health Trends',
    navReports: 'Diagnostic Reports',
    navBiopsy: 'Biopsy Reports',
    navLab: 'Lab Reports',
    navTreatments: 'Treatment History',
    navRecords: 'Medical Records',
    navDoctors: 'My Doctors',
    navNearby: 'Nearby Healthcare',
    navBloodEmergency: 'Blood Emergency',
    navCamps: 'Health Camps',
    navAIAssistant: 'AI Health Assistant',
    navFamily: 'Family & Dependents',
    navMedicalSummary: 'Medical Summary',
    navNotifications: 'Notifications',
    navConsent: 'Consent & Access',
    navProfile: 'Patient Profile',
    navSettings: 'Settings',

    // Aliases
    home: 'Home',
    myProfile: 'My Profile',
    medicalTimeline: 'Medical Timeline',
    emergencySOS: 'Emergency SOS',
    emergencyQR: 'Emergency QR Card',
    medicationTracker: 'Medication Tracker',
    healthTrends: 'Health Trends',
    appointmentBooking: 'Appointments',
    familyProfiles: 'Family & Dependents',
    medicalRecords: 'Medical Records',
    biopsyReports: 'Biopsy Reports',
    labReports: 'Lab Reports',
    treatmentHistory: 'Treatment History',
    myDoctors: 'My Doctors',
    nearbyHospitals: 'Nearby Facilities',
    bloodEmergency: 'Blood Emergency',
    freeHealthCamps: 'Health Camps',
    privacyConsent: 'Privacy & Consent',
    settings: 'Settings',
    medicalSummary: 'Medical Summary',
    smartNotifications: 'Smart Notifications',
    sosEmergency: 'Emergency SOS',
    sosActivated: 'SOS Activated',
    register: 'Register',
    safeLifestyleGuidance: 'Lifestyle Guidance',

    searchPlaceholder: 'Search records, doctors, test reports...',
    emergency108: 'Emergency 108',
    demoPatient: 'Demo Patient',
    demoDoctor: 'Demo Doctor',
    demoBloodBank: 'Demo Blood Bank',
    switchRole: 'Switch Role',
    login: 'Login',
    getStarted: 'Get Started',
    logout: 'Logout',

    sosTitle: 'Emergency SOS Mode',
    sosSubtitle: 'Immediate triage profile and real-time emergency responder dispatch',
    sosButtonActive: '🚨 SOS ACTIVE - DISPATCHING',
    sosButtonInactive: 'TAP TO ACTIVATE EMERGENCY SOS',
    requestLocation: 'Allow GPS Location Access',
    locationShared: 'Location Coordinates Transmitted',
    bloodGroup: 'Blood Group',
    knownAllergies: 'Known Allergies',
    criticalConditions: 'Critical Conditions',
    activeMedications: 'Active Medications',
    emergencyContact: 'Emergency Contact',
    preferredHospital: 'Preferred Hospital',
    dial108: 'Call 108 Ambulance',
    dial112: 'Call 112 National Helpline',
    shareEmergencyProfile: 'Share Emergency Profile',

    qrCardTitle: 'Emergency QR Health Card',
    qrCardSubtitle: 'Authorized first responders scan this token to view non-sensitive emergency health details',
    regenerateQR: 'Regenerate QR Token',
    toggleQRAccess: 'QR Profile Active',
    qrAccessHistory: 'QR Access Audit History',
    requestFullAccess: 'Request Full Medical Access',
    qrScannerNotice: 'Notice: Only emergency essentials are visible. Complete clinical history requires patient biometric/consent authentication.',

    todaysMedicines: "Today's Medicine Schedule",
    adherenceRate: 'Adherence Rate',
    morningSlot: 'Morning (08:00 AM)',
    afternoonSlot: 'Afternoon (01:00 PM)',
    eveningSlot: 'Evening (06:00 PM)',
    nightSlot: 'Night (09:30 PM)',
    taken: 'Taken',
    skipped: 'Skipped',
    upcoming: 'Upcoming',
    beforeFood: 'Before Food',
    afterFood: 'After Food',
    prescribedBy: 'Prescribed by',

    bookAppointment: 'Book Doctor Consultation',
    selectSpecialization: 'Specialization',
    selectDoctor: 'Select Doctor',
    selectHospital: 'Hospital / Clinic',
    selectDate: 'Select Date',
    selectTime: 'Available Slot',
    confirmBooking: 'Confirm Appointment',
    upcomingAppointments: 'Upcoming Consultations',
    reschedule: 'Reschedule',
    cancelAppointment: 'Cancel Appointment',

    healthTrendsTitle: 'Health Trends & Biomarkers',
    logNewVitals: 'Record New Vitals',
    bloodPressure: 'Blood Pressure',
    bloodGlucose: 'Blood Glucose',
    heartRate: 'Heart Rate',
    oxygenSaturation: 'Oxygen Saturation (SpO2)',
    bodyWeight: 'Weight',
    trendImproving: 'Improving',
    trendStable: 'Stable',
    trendNeedsAttention: 'Needs Attention',

    familyTitle: 'Family & Dependent Health Profiles',
    addFamilyMember: 'Add Dependent Profile',
    childHealthTimeline: 'Child Health Timeline',
    vaccinations: 'Immunization / Vaccines',
    pediatricVisits: 'Pediatric Visits',
    growthRecords: 'Growth Metrics',

    explainReport: 'Explain This Report',
    aiExplainingTitle: 'AI Clinical Report Explainer',
    keyFindings: 'Key Findings in Plain Language',
    questionsForDoctor: 'Suggested Questions for Your Doctor',
    medicalDisclaimer: 'This AI explanation is for educational purposes only and is not a medical diagnosis. Always consult your healthcare provider.',

    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    download: 'Download PDF',
    print: 'Print Summary',
    share: 'Share Link',
    status: 'Status',
    navInsurance: 'Medical Insurance',
    medicalInsurance: 'Medical Insurance & Coverage',
    insurance: 'Insurance',
    claimsTracker: 'Claims Tracker',
    aiPolicyExplainer: 'AI Policy Explainer',
    navExpenses: 'Medical Expenses',
    medicalExpenses: 'Medical Expenses Tracker',
    expenses: 'Expenses',
    totalExpenses: 'Total Medical Expense',
    insuranceCovered: 'Insurance Covered',
    outOfPocket: 'Out of Pocket',
  },

  ta: {
    navHome: 'முகப்பு',
    navDashboard: 'முகப்பு',
    navEmergencySOS: 'அவசர SOS',
    navEmergencyQR: 'அவசர QR அட்டை',
    navTimeline: 'மருத்துவ காலவரிசை',
    navAppointments: 'மருத்துவ முன்பதிவு',
    navPrescriptions: 'மருந்து சீட்டுகள்',
    navMedicationTracker: 'மருந்து கண்காணிப்பாளர்',
    navHealthTrends: 'உடல்நல போக்குகள்',
    navReports: 'ஆய்வக அறிக்கைகள்',
    navBiopsy: 'பயாப்ஸி அறிக்கைகள்',
    navLab: 'இரத்தப் பரிசோதனை',
    navTreatments: 'சிகிச்சை வரலாறு',
    navRecords: 'மருத்துவ பதிவுகள்',
    navDoctors: 'என் மருத்துவர்கள்',
    navNearby: 'அருகிலுள்ள மருத்துவமனைகள்',
    navBloodEmergency: 'அவசர இரத்த வங்கி',
    navCamps: 'இலவச மருத்துவ முகாம்கள்',
    navAIAssistant: 'AI மருத்துவ உதவியாளர்',
    navFamily: 'குடும்ப உறுப்பினர்கள்',
    navMedicalSummary: 'மருத்துவ சுருக்கம்',
    navNotifications: 'அறிவிப்புகள்',
    navConsent: 'அனுமதி & தரவு பகிர்வு',
    navProfile: 'நோயாளி சுயவிவரம்',
    navSettings: 'அமைப்புகள்',

    // Aliases
    home: 'முகப்பு',
    myProfile: 'என் சுயவிவரம்',
    medicalTimeline: 'மருத்துவ காலவரிசை',
    emergencySOS: 'அவசர SOS',
    emergencyQR: 'அவசர QR அட்டை',
    medicationTracker: 'மருந்து கண்காணிப்பாளர்',
    healthTrends: 'உடல்நல போக்குகள்',
    appointmentBooking: 'மருத்துவ முன்பதிவு',
    familyProfiles: 'குடும்ப உறுப்பினர்கள்',
    medicalRecords: 'மருத்துவ பதிவுகள்',
    biopsyReports: 'பயாப்ஸி அறிக்கைகள்',
    labReports: 'இரத்தப் பரிசோதனை',
    treatmentHistory: 'சிகிச்சை வரலாறு',
    myDoctors: 'என் மருத்துவர்கள்',
    nearbyHospitals: 'அருகிலுள்ள மருத்துவமனைகள்',
    bloodEmergency: 'அவசர இரத்த வங்கி',
    freeHealthCamps: 'இலவச மருத்துவ முகாம்கள்',
    privacyConsent: 'அனுமதி & பாதுகாப்பு',
    settings: 'அமைப்புகள்',
    medicalSummary: 'மருத்துவ சுருக்கம்',
    smartNotifications: 'அறிவிப்புகள்',
    sosEmergency: 'அவசர SOS',
    sosActivated: 'SOS இயக்கப்பட்டது',
    register: 'பதிவு செய்யவும்',
    safeLifestyleGuidance: 'வாழ்க்கை முறை வழிகாட்டுதல்',

    searchPlaceholder: 'பதிவுகள், மருத்துவர்கள், அறிக்கைகளைத் தேடவும்...',
    emergency108: 'அவசரம் 108',
    demoPatient: 'மாதிரி நோயாளி',
    demoDoctor: 'மாதிரி மருத்துவர்',
    demoBloodBank: 'இரத்த வங்கி',
    switchRole: 'பாத்திரம் மாற்றவும்',
    login: 'உள்நுழையவும்',
    getStarted: 'தொடங்கவும்',
    logout: 'வெளியேறு',

    sosTitle: 'அவசர SOS நிலை',
    sosSubtitle: 'உடனடி அவசர உதவி மற்றும் இருப்பிட தகவல் பரிமாற்றம்',
    sosButtonActive: '🚨 SOS இயக்கப்பட்டது',
    sosButtonInactive: 'அவசர SOS-ஐ இயக்க தொடவும்',
    requestLocation: 'GPS இருப்பிட அனுமதியை வழங்கவும்',
    locationShared: 'இருப்பிட தகவல் அனுப்பப்பட்டது',
    bloodGroup: 'இரத்த வகை',
    knownAllergies: 'அலர்ஜி விவரங்கள்',
    criticalConditions: 'முக்கிய நோய்கள்',
    activeMedications: 'தற்போதைய மருந்துகள்',
    emergencyContact: 'அவசர தொடர்பு நபர்',
    preferredHospital: 'விருப்பமான மருத்துவமனை',
    dial108: '108 ஆம்புலன்ஸ் அழைக்கவும்',
    dial112: '112 உதவி எண் அழைக்கவும்',
    shareEmergencyProfile: 'அவசர விவரத்தை பகிரவும்',

    qrCardTitle: 'அவசர QR மருத்துவ அட்டை',
    qrCardSubtitle: 'முதலுதவி பணியாளர்கள் இந்த குறியீட்டை ஸ்கேன் செய்து அவசர தகவலை அணுகலாம்',
    regenerateQR: 'புதிய QR உருவாக்கு',
    toggleQRAccess: 'QR அட்டை இயக்கத்தில் உள்ளது',
    qrAccessHistory: 'QR அணுகல் வரலாறு',
    requestFullAccess: 'முழு மருத்துவ அணுகலை கோரவும்',
    qrScannerNotice: 'குறிப்பு: அத்தியாவசிய அவசர தகவல் மட்டுமே காண்பிக்கப்படும். முழு விவரத்திற்கு நோயாளியின் ஒப்புதல் தேவை.',

    todaysMedicines: 'இன்றைய மருந்து அட்டவணை',
    adherenceRate: 'மருந்து உட்கொள்ளும் விகிதம்',
    morningSlot: 'காலை (08:00 AM)',
    afternoonSlot: 'மதியம் (01:00 PM)',
    eveningSlot: 'மாலை (06:00 PM)',
    nightSlot: 'இரவு (09:30 PM)',
    taken: 'எடுத்துக்கொண்டேன்',
    skipped: 'தவிர்த்தேன்',
    upcoming: 'வரவிருக்கும்',
    beforeFood: 'உணவுக்கு முன்',
    afterFood: 'உணவுக்கு பின்',
    prescribedBy: 'பரிந்துரைத்த மருத்துவர்',

    bookAppointment: 'மருத்துவர் ஆலோசனை முன்பதிவு',
    selectSpecialization: 'மருத்துவப் பிரிவு',
    selectDoctor: 'மருத்துவரைத் தேர்ந்தெடுக்கவும்',
    selectHospital: 'மருத்துவமனை',
    selectDate: 'தேதியைத் தேர்ந்தெடுக்கவும்',
    selectTime: 'நேரம்',
    confirmBooking: 'முன்பதிவை உறுதிப்படுத்தவும்',
    upcomingAppointments: 'வரவிருக்கும் சந்திப்புகள்',
    reschedule: 'நேரம் மாற்றவும்',
    cancelAppointment: 'முன்பதிவை ரத்து செய்யவும்',

    healthTrendsTitle: 'உடல்நல அளவீடுகள் & போக்குகள்',
    logNewVitals: 'புதிய அளவீட்டைப் பதிவு செய்யவும்',
    bloodPressure: 'இரத்த அழுத்தம் (BP)',
    bloodGlucose: 'சர்க்கரை அளவு',
    heartRate: 'இதயத் துடிப்பு',
    oxygenSaturation: 'ஆக்ஸிஜன் அளவு (SpO2)',
    bodyWeight: 'உடல் எடை',
    trendImproving: 'முன்னேற்றம்',
    trendStable: 'நிலையானது',
    trendNeedsAttention: 'கவனம் தேவை',

    familyTitle: 'குடும்ப உறுப்பினர் மருத்துவ விவரங்கள்',
    addFamilyMember: 'புதிய உறுப்பினரைச் சேர்க்கவும்',
    childHealthTimeline: 'குழந்தை நல காலவரிசை',
    vaccinations: 'தடுப்பூசி விவரங்கள்',
    pediatricVisits: 'குழந்தை நல மருத்துவர் பரிசோதனை',
    growthRecords: 'வளர்ச்சி அளவீடுகள்',

    explainReport: 'அறிக்கையை விளக்குங்கள்',
    aiExplainingTitle: 'AI மருத்துவ அறிக்கை விளக்கம்',
    keyFindings: 'எளிய தமிழில் முக்கிய முடிவுகள்',
    questionsForDoctor: 'மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்',
    medicalDisclaimer: 'இந்த AI விளக்கம் கல்வி நோக்கங்களுக்காக மட்டுமே. இது மருத்துவ நோயறிதல் அல்ல. மருத்துவரை அணுகவும்.',

    save: 'சேமிக்க',
    cancel: 'ரத்து',
    loading: 'ஏற்றுகிறது...',
    download: 'PDF பதிவிறக்கம்',
    print: 'அச்சிடுக',
    share: 'பகிர்க',
    status: 'நிலை',
    navInsurance: 'மருத்துவ காப்பீடு',
    medicalInsurance: 'மருத்துவ காப்பீடு & கவரேஜ்',
    insurance: 'காப்பீடு',
    claimsTracker: 'கோரிக்கை கண்காணிப்பாளர்',
    aiPolicyExplainer: 'AI பாலிசி விளக்கம்',
    navExpenses: 'மருத்துவ செலவுகள்',
    medicalExpenses: 'மருத்துவ செலவுகள் கண்காணிப்பாளர்',
    expenses: 'செலவுகள்',
    totalExpenses: 'மொத்த மருத்துவ செலவு',
    insuranceCovered: 'காப்பீடு செலுத்தியது',
    outOfPocket: 'கைச்செலவு (Out of Pocket)',
  },

  hi: {
    navHome: 'डैशबोर्ड',
    navDashboard: 'डैशबोर्ड',
    navEmergencySOS: 'आपातकालीन SOS',
    navEmergencyQR: 'इमरजेंसी QR कार्ड',
    navTimeline: 'मेडिकल टाइमलाइन',
    navAppointments: 'अपॉइंटमेंट्स',
    navPrescriptions: 'प्रिस्क्रिप्शन',
    navMedicationTracker: 'दवा ट्रैकर',
    navHealthTrends: 'स्वास्थ्य रुझान',
    navReports: 'डायग्नोस्टिक रिपोर्ट्स',
    navBiopsy: 'बायोप्सी रिपोर्ट्स',
    navLab: 'लैब रिपोर्ट्स',
    navTreatments: 'उपचार इतिहास',
    navRecords: 'मेडिकल रिकॉर्ड्स',
    navDoctors: 'मेरे डॉक्टर्स',
    navNearby: 'नजदीकी अस्पताल',
    navBloodEmergency: 'इमरजेंसी ब्लड बैंक',
    navCamps: 'स्वास्थ्य शिविर',
    navAIAssistant: 'AI हेल्थ असिस्टेंट',
    navFamily: 'परिवार और आश्रित',
    navMedicalSummary: 'मेडिकल सारांश',
    navNotifications: 'सूचनाएं',
    navConsent: 'सहमति और डेटा शेयरिंग',
    navProfile: 'मरीज प्रोफाइल',
    navSettings: 'सेटिंग्स',

    // Aliases
    home: 'होम',
    myProfile: 'मेरी प्रोफाइल',
    medicalTimeline: 'मेडिकल टाइमलाइन',
    emergencySOS: 'आपातकालीन SOS',
    emergencyQR: 'इमरजेंसी QR कार्ड',
    medicationTracker: 'दवा ट्रैकर',
    healthTrends: 'स्वास्थ्य रुझान',
    appointmentBooking: 'अपॉइंटमेंट्स',
    familyProfiles: 'परिवार और आश्रित',
    medicalRecords: 'मेडिकल रिकॉर्ड्स',
    biopsyReports: 'बायोप्सी रिपोर्ट्स',
    labReports: 'लैब रिपोर्ट्स',
    treatmentHistory: 'उपचार इतिहास',
    myDoctors: 'मेरे डॉक्टर्स',
    nearbyHospitals: 'नजदीकी अस्पताल',
    bloodEmergency: 'इमरजेंसी ब्लड बैंक',
    freeHealthCamps: 'स्वास्थ्य शिविर',
    privacyConsent: 'सहमति और सुरक्षा',
    settings: 'सेटिंग्स',
    medicalSummary: 'मेडिकल सारांश',
    smartNotifications: 'सूचनाएं',
    sosEmergency: 'आपातकालीन SOS',
    sosActivated: 'SOS सक्रिय',
    register: 'रजिस्टर करें',
    safeLifestyleGuidance: 'जीवनशैली मार्गदर्शन',

    searchPlaceholder: 'रिकॉर्ड, डॉक्टर, टेस्ट रिपोर्ट खोजें...',
    emergency108: 'आपातकालीन 108',
    demoPatient: 'डेमो मरीज',
    demoDoctor: 'डेमो डॉक्टर',
    demoBloodBank: 'डेमो ब्लड बैंक',
    switchRole: 'रोल बदलें',
    login: 'लॉग इन',
    getStarted: 'शुरू करें',
    logout: 'लॉग आउट',

    sosTitle: 'इमरजेंसी SOS मोड',
    sosSubtitle: 'त्वरित आपातकालीन सहायता और लोकेशन प्रसारण',
    sosButtonActive: '🚨 SOS सक्रिय है - सहायता भेजी जा रही है',
    sosButtonInactive: 'इमरजेंसी SOS सक्रिय करने के लिए टैप करें',
    requestLocation: 'GPS लोकेशन की अनुमति दें',
    locationShared: 'लोकेशन सफलतापूर्वक भेजी गई',
    bloodGroup: 'रक्त समूह',
    knownAllergies: 'ज्ञात एलर्जी',
    criticalConditions: 'गंभीर चिकित्सीय स्थिति',
    activeMedications: 'वर्तमान दवाएं',
    emergencyContact: 'आपातकालीन संपर्क',
    preferredHospital: 'पसंदीदा अस्पताल',
    dial108: '108 एम्बुलेंस को कॉल करें',
    dial112: '112 राष्ट्रीय हेल्पलाइन',
    shareEmergencyProfile: 'इमरजेंसी प्रोफाइल साझा करें',

    qrCardTitle: 'इमरजेंसी QR हेल्थ कार्ड',
    qrCardSubtitle: 'आपातकालीन प्रतिक्रियाकर्ता इस कोड को स्कैन कर जरूरी स्वास्थ्य जानकारी देख सकते हैं',
    regenerateQR: 'नया QR टोकन बनाएं',
    toggleQRAccess: 'QR प्रोफाइल सक्रिय है',
    qrAccessHistory: 'QR एक्सेस ऑडिट इतिहास',
    requestFullAccess: 'पूर्ण मेडिकल एक्सेस का अनुरोध करें',
    qrScannerNotice: 'नोट: केवल आपातकालीन आवश्यक जानकारी दिखाई देती है। संपूर्ण इतिहास के लिए मरीज की सहमति आवश्यक है।',

    todaysMedicines: 'आज की दवाओं का शेड्यूल',
    adherenceRate: 'दवा अनुपालन दर',
    morningSlot: 'सुबह (08:00 AM)',
    afternoonSlot: 'दोपहर (01:00 PM)',
    eveningSlot: 'शाम (06:00 PM)',
    nightSlot: 'रात (09:30 PM)',
    taken: 'ले ली',
    skipped: 'छोड़ दी',
    upcoming: 'आगामी',
    beforeFood: 'भोजन से पहले',
    afterFood: 'भोजन के बाद',
    prescribedBy: 'द्वारा निर्धारित',

    bookAppointment: 'डॉक्टर से परामर्श बुक करें',
    selectSpecialization: 'विशेषज्ञता',
    selectDoctor: 'डॉक्टर चुनें',
    selectHospital: 'अस्पताल / क्लिनिक',
    selectDate: 'तारीख चुनें',
    selectTime: 'उपलब्ध समय',
    confirmBooking: 'अपॉइंटमेंट की पुष्टि करें',
    upcomingAppointments: 'आगामी परामर्श',
    reschedule: 'समय बदलें',
    cancelAppointment: 'अपॉइंटमेंट रद्द करें',

    healthTrendsTitle: 'स्वास्थ्य रुझान और बायोमार्कर',
    logNewVitals: 'नए वाइटल्स दर्ज करें',
    bloodPressure: 'रक्तचाप (BP)',
    bloodGlucose: 'ब्लड शुगर',
    heartRate: 'हृदय गति (पल्स)',
    oxygenSaturation: 'ऑक्सीजन स्तर (SpO2)',
    bodyWeight: 'वजन',
    trendImproving: 'सुधार हो रहा है',
    trendStable: 'स्थिर',
    trendNeedsAttention: 'ध्यान देने योग्य',

    familyTitle: 'पारिवारिक स्वास्थ्य प्रोफाइल',
    addFamilyMember: 'नया सदस्य जोड़ें',
    childHealthTimeline: 'शिशु स्वास्थ्य टाइमलाइन',
    vaccinations: 'टीकाकरण रिकॉर्ड',
    pediatricVisits: 'बाल रोग विशेषज्ञ परामर्श',
    growthRecords: 'शारीरिक विकास मेट्रिक्स',

    explainReport: 'इस रिपोर्ट को समझाइए',
    aiExplainingTitle: 'AI मेडिकल रिपोर्ट विश्लेषक',
    keyFindings: 'सरल भाषा में मुख्य परिणाम',
    questionsForDoctor: 'डॉक्टर से पूछने योग्य सवाल',
    medicalDisclaimer: 'यह AI स्पष्टीकरण केवल सूचनात्मक उद्देश्य के लिए है। यह चिकित्सीय निदान नहीं है। डॉक्टर से परामर्श लें।',

    save: 'सहेजें',
    cancel: 'रद्द करें',
    loading: 'लोड हो रहा है...',
    download: 'PDF डाउनलोड',
    print: 'प्रिंट करें',
    share: 'साझा करें',
    status: 'स्थिति',
    navInsurance: 'मेडिकल इंश्योरेंस',
    medicalInsurance: 'मेडिकल इंश्योरेंस और कवरेज',
    insurance: 'बीमा',
    claimsTracker: 'दावा ट्रैकर',
    aiPolicyExplainer: 'AI पॉलिसी विश्लेषक',
    navExpenses: 'चिकित्सा व्यय',
    medicalExpenses: 'चिकित्सा व्यय ट्रैकर',
    expenses: 'खर्च',
    totalExpenses: 'कुल चिकित्सा खर्च',
    insuranceCovered: 'बीमा द्वारा कवर',
    outOfPocket: 'अपनी जेब से खर्च',
  },
};
