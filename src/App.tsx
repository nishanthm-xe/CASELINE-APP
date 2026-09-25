import React from 'react';
import { AppProvider, useApp } from './lib/store';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/ToastContainer';

// Public Landing
import { LandingPage } from './components/landing/LandingPage';

// Patient Views
import { PreConsultationFlow } from './components/preconsultation/PreConsultationFlow';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { MedicalTimelineView } from './components/patient/MedicalTimelineView';
import { BiopsyReportsView } from './components/patient/BiopsyReportsView';
import { LabReportsView } from './components/patient/LabReportsView';
import { TreatmentHistoryView } from './components/patient/TreatmentHistoryView';
import { MedicalRecordsView } from './components/patient/MedicalRecordsView';
import { MyDoctorsView } from './components/patient/MyDoctorsView';
import { NearbyHealthcareView } from './components/patient/NearbyHealthcareView';
import { BloodEmergencyView } from './components/patient/BloodEmergencyView';
import { HealthCampsView } from './components/patient/HealthCampsView';
import { EmergencyContactView } from './components/patient/EmergencyContactView';
import { PrivacyConsentView } from './components/patient/PrivacyConsentView';
import { PatientProfileView } from './components/patient/PatientProfileView';
import { SettingsView } from './components/patient/SettingsView';

// Advanced Ecosystem Views
import { EmergencyQRView } from './components/emergency/EmergencyQRView';
import { MedicationTrackerView } from './components/medications/MedicationTrackerView';
import { HealthTrendsView } from './components/analytics/HealthTrendsView';
import { FamilyManagementView } from './components/family/FamilyManagementView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { BloodBankDashboardView } from './components/bloodbank/BloodBankDashboardView';
import { MedicalInsuranceView } from './components/insurance/MedicalInsuranceView';
import { MedicalExpensesView } from './components/expenses/MedicalExpensesView';
import { DocumentScannerView } from './components/documents/DocumentScannerView';

// Doctor View
import { DoctorPortal } from './components/doctor/DoctorPortal';
import { AccessDeniedView } from './components/common/AccessDeniedView';

// AI Assistant
import { AIHealthAssistant } from './components/ai/AIHealthAssistant';

// Modals
import { RoleSelectionModal } from './components/auth/RoleSelectionModal';
import { PatientRegistrationModal } from './components/auth/PatientRegistrationModal';
import { DoctorRegistrationModal } from './components/auth/DoctorRegistrationModal';
import { LoginModal } from './components/auth/LoginModal';
import { EmergencyCallModal } from './components/modals/EmergencyCallModal';
import { EmergencySOSModal } from './components/emergency/EmergencySOSModal';
import { MedicalSummaryModal } from './components/summary/MedicalSummaryModal';
import { AIReportExplainerModal } from './components/ai/AIReportExplainerModal';
import { LiveVoiceModal } from './components/ai/LiveVoiceModal';
import { NotificationCenterModal } from './components/notifications/NotificationCenterModal';
import { PublicEmergencyPage } from './components/emergency/PublicEmergencyPage';

// Common Components
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Icons
import { Sparkles, PhoneCall, Bot, AlertTriangle, Radio } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, activeTab, setActiveTab, activeModal, setActiveModal } = useApp();

  // If scanning an emergency QR code directly via URL query parameter (?emergency_token=...)
  const emergencyToken = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('emergency_token') : null;
  if (emergencyToken) {
    return (
      <PublicEmergencyPage
        qrToken={emergencyToken}
        onExit={() => {
          window.history.replaceState({}, '', window.location.pathname);
          window.location.reload();
        }}
      />
    );
  }

  // If unauthenticated, render the high-impact Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Navbar />
        <main className="flex-1">
          <LandingPage />
        </main>
        <RoleSelectionModal />
        <PatientRegistrationModal />
        <DoctorRegistrationModal />
        <LoginModal />
        <EmergencyCallModal />
        <EmergencySOSModal isOpen={activeModal === 'emergency_sos'} onClose={() => setActiveModal(null)} />
        <MedicalSummaryModal isOpen={activeModal === 'medical_summary'} onClose={() => setActiveModal(null)} />
        <AIReportExplainerModal isOpen={activeModal === 'report_explainer'} onClose={() => setActiveModal(null)} />
        <LiveVoiceModal isOpen={activeModal === 'live_voice'} onClose={() => setActiveModal(null)} />
        <NotificationCenterModal isOpen={activeModal === 'notifications'} onClose={() => setActiveModal(null)} />
        <ToastContainer />
      </div>
    );
  }

  // If authenticated as Blood Bank Center
  if (user.role?.toLowerCase() === 'bloodbank') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-64 shrink-0">
              <Sidebar />
            </div>
            <main className="flex-1 w-full min-w-0">
              {activeTab === 'camps' ? (
                <HealthCampsView />
              ) : activeTab === 'nearby' ? (
                <NearbyHealthcareView />
              ) : (
                <BloodBankDashboardView />
              )}
            </main>
          </div>
        </div>
        <EmergencySOSModal isOpen={activeModal === 'emergency_sos'} onClose={() => setActiveModal(null)} />
        <LiveVoiceModal isOpen={activeModal === 'live_voice'} onClose={() => setActiveModal(null)} />
        <NotificationCenterModal isOpen={activeModal === 'notifications'} onClose={() => setActiveModal(null)} />
        <ToastContainer />
      </div>
    );
  }

  // If authenticated as Doctor, render Doctor Portal with role sidebar and route protection
  if (user.role?.toLowerCase() === 'doctor') {
    const renderDoctorView = () => {
      const patientOnlyTabs = [
        'case_taking',
        'clinical_intake',
        'medications',
        'insurance',
        'expenses',
        'family',
        'emergency_qr',
        'emergency_sos',
        'emergency',
        'nearby',
        'blood',
        'camps',
        'vitals',
        'doctors',
        'privacy',
      ];
      if (patientOnlyTabs.includes(activeTab)) {
        return <AccessDeniedView attemptedTab={activeTab} requiredRole="patient" />;
      }

      switch (activeTab) {
        case 'home':
        case 'dashboard':
        case 'patients':
        case 'search':
        case 'appointments':
        case 'records':
        case 'biopsy':
        case 'lab':
        case 'treatments':
        case 'timeline':
        case 'consent':
        case 'analytics':
        case 'prescriptions':
        case 'availability':
        case 'summary':
        case 'profile':
          return <DoctorPortal />;
        case 'scan_document':
        case 'upload':
          return <DocumentScannerView />;
        case 'settings':
          return <SettingsView />;
        default:
          return <DoctorPortal />;
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-64 shrink-0">
              <Sidebar />
            </div>
            <main className="flex-1 w-full min-w-0">
              <ErrorBoundary viewName={activeTab}>
                {renderDoctorView()}
              </ErrorBoundary>
            </main>
          </div>
        </div>
        <EmergencyCallModal />
        <EmergencySOSModal isOpen={activeModal === 'emergency_sos'} onClose={() => setActiveModal(null)} />
        <MedicalSummaryModal isOpen={activeModal === 'medical_summary'} onClose={() => setActiveModal(null)} />
        <AIReportExplainerModal isOpen={activeModal === 'report_explainer'} onClose={() => setActiveModal(null)} />
        <LiveVoiceModal isOpen={activeModal === 'live_voice'} onClose={() => setActiveModal(null)} />
        <NotificationCenterModal isOpen={activeModal === 'notifications'} onClose={() => setActiveModal(null)} />
        <ToastContainer />
      </div>
    );
  }

  // Full-screen CASE LINE pre-consultation workflow.
  // This intentionally bypasses the main dashboard shell so the imported interface
  // remains visually identical to the supplied CASE LINE workflow screens.
  if (activeTab === 'case_taking' || activeTab === 'clinical_intake' || activeTab === 'scan_document') {
    return (
      <PreConsultationFlow
        initialScreen={activeTab === 'scan_document' ? 'document-scan' : 'welcome'}
      />
    );
  }

  // Patient Authenticated Dashboard with Left Navigation Sidebar
  const renderPatientView = () => {
    const doctorOnlyTabs = [
      'patients',
      'search',
      'upload',
      'consent',
      'analytics',
      'doctor_portal',
    ];
    if (doctorOnlyTabs.includes(activeTab)) {
      return <AccessDeniedView attemptedTab={activeTab} requiredRole="doctor" />;
    }

    switch (activeTab) {
      case 'home':
      case 'dashboard':
        return <PatientDashboard />;
      case 'timeline':
        return <MedicalTimelineView />;
      case 'scan_document':
        return <DocumentScannerView />;
      case 'emergency_sos':
        return <EmergencyQRView />;
      case 'emergency_qr':
        return <EmergencyQRView />;
      case 'medications':
        return <MedicationTrackerView />;
      case 'insurance':
        return <MedicalInsuranceView />;
      case 'expenses':
        return <MedicalExpensesView />;
      case 'vitals':
        return <HealthTrendsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'family':
        return <FamilyManagementView />;
      case 'biopsy':
        return <BiopsyReportsView />;
      case 'lab':
        return <LabReportsView />;
      case 'treatments':
        return <TreatmentHistoryView />;
      case 'records':
        return <MedicalRecordsView />;
      case 'doctors':
        return <MyDoctorsView />;
      case 'nearby':
        return <NearbyHealthcareView />;
      case 'blood':
        return <BloodEmergencyView />;
      case 'blood_inventory':
        return <BloodBankDashboardView />;
      case 'camps':
        return <HealthCampsView />;
      case 'ai_assistant':
        return <AIHealthAssistant />;
      case 'emergency':
        return <EmergencyContactView />;
      case 'privacy':
        return <PrivacyConsentView />;
      case 'profile':
        return <PatientProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Collapsible Left Navigation Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <Sidebar />
          </div>

          {/* Dynamic Content View Container */}
          <main className="flex-1 w-full min-w-0">
            <ErrorBoundary viewName={activeTab}>
              {renderPatientView()}
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Floating Action Buttons for Quick Live Voice AI & Health Assistant */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        <button
          id="floating-live-voice-btn"
          onClick={() => setActiveModal('live_voice')}
          className="bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 hover:from-teal-600 hover:to-indigo-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 group border-2 border-white/20"
          title="Start Live Voice Conversation (gemini-3.1-flash-live-preview)"
        >
          <Radio className="w-5 h-5 text-teal-200 animate-pulse" />
          <span className="text-xs font-bold hidden sm:inline">Live Voice AI</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-white/20 text-white">Live API</span>
        </button>

        {activeTab !== 'ai_assistant' && (
          <button
            id="floating-ai-assistant-btn"
            onClick={() => setActiveTab('ai_assistant')}
            className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 group border border-slate-700"
            title="Open AI Health Assistant"
          >
            <Bot className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-semibold hidden sm:inline pr-1">Ask AI</span>
          </button>
        )}
      </div>

      {/* Global Modals & Notifications */}
      <RoleSelectionModal />
      <PatientRegistrationModal />
      <DoctorRegistrationModal />
      <LoginModal />
      <EmergencyCallModal />
      <EmergencySOSModal isOpen={activeModal === 'emergency_sos'} onClose={() => setActiveModal(null)} />
      <MedicalSummaryModal isOpen={activeModal === 'medical_summary'} onClose={() => setActiveModal(null)} />
      <AIReportExplainerModal isOpen={activeModal === 'report_explainer'} onClose={() => setActiveModal(null)} />
      <LiveVoiceModal isOpen={activeModal === 'live_voice'} onClose={() => setActiveModal(null)} />
      <NotificationCenterModal isOpen={activeModal === 'notifications'} onClose={() => setActiveModal(null)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Unable to load this page" fallbackDescription="An unexpected error occurred. You can reload the application or return to the main dashboard.">
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
