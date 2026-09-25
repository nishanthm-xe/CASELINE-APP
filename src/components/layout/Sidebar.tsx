import React from 'react';
import { useApp } from '../../lib/store';
import {
  // Navigation Icons matching Section 2 & Section 3
  Home,
  UserCircle,
  ClipboardPlus,
  Mic,
  Clock,
  Folder,
  Microscope,
  FlaskConical,
  ClipboardList,
  Stethoscope,
  Hospital,
  CalendarCheck,
  Pill,
  Activity,
  QrCode,
  Siren,
  Droplets,
  HeartPulse,
  PhoneCall,
  ShieldCheck,
  Receipt,
  Users,
  Bell,
  Lock,
  Bot,
  FileSearch,
  FileText,
  FileUp,
  History,
  Settings,
  LogOut,
  UserSearch,
  CalendarClock,
  Upload,
  ChevronLeft,
  ChevronRight,
  ScanLine,
  ClipboardCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export interface NavItem {
  id: string;
  label: string;
  tooltip: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  action?: 'tab' | 'modal' | 'logout';
  modalId?: string;
  highlight?: boolean;
  danger?: boolean;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const {
    role,
    user,
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    logout,
    activeModal,
    setActiveModal,
    unreadCount,
    t,
  } = useApp();

  if (!user) return null;

  // ============================================================
  // PATIENT SIDEBAR CONFIGURATION (Strict semantic icon mapping)
  // ============================================================
  const patientGroups: NavGroup[] = [
    {
      title: 'Main',
      items: [
        {
          id: 'home',
          label: t.home || t.navHome || 'Dashboard',
          tooltip: 'Your health overview',
          icon: Home,
        },
        {
          id: 'profile',
          label: t.myProfile || t.navProfile || 'My Profile',
          tooltip: 'View and edit your personal health profile',
          icon: UserCircle,
        },
      ],
    },
    {
      title: 'Clinical',
      items: [
        {
          id: 'case_taking',
          label: 'Clinical Case-Taking',
          tooltip: 'Record your current health problem and symptoms',
          icon: ClipboardPlus,
          highlight: true,
        },
        {
          id: 'live_voice',
          label: 'Voice Assistant',
          tooltip: 'Talk to Case Line using your voice',
          icon: Mic,
          action: 'modal',
          modalId: 'live_voice',
          highlight: true,
        },
        {
          id: 'timeline',
          label: t.medicalTimeline || t.navTimeline || 'Medical Timeline',
          tooltip: 'View your medical history by date',
          icon: Clock,
          highlight: true,
        },
        {
          id: 'scan_document',
          label: 'Document Scanner',
          tooltip: 'Scan and digitize physical medical records',
          icon: ScanLine,
        },
        {
          id: 'records',
          label: t.medicalRecords || t.navRecords || 'Medical Records',
          tooltip: 'View your medical documents and records',
          icon: Folder,
        },
        {
          id: 'biopsy',
          label: t.biopsyReports || t.navBiopsy || 'Biopsy Reports',
          tooltip: 'View biopsy and histopathology reports',
          icon: Microscope,
        },
        {
          id: 'lab',
          label: t.labReports || t.navLab || 'Lab Reports',
          tooltip: 'View laboratory and blood test reports',
          icon: FlaskConical,
        },
        {
          id: 'treatments',
          label: t.treatmentHistory || t.navTreatments || 'Treatment History',
          tooltip: 'View treatment history and procedures',
          icon: ClipboardList,
        },
      ],
    },
    {
      title: 'Care & Appointments',
      items: [
        {
          id: 'doctors',
          label: t.myDoctors || t.navDoctors || 'My Doctors',
          tooltip: 'View and contact your consulting doctors',
          icon: Stethoscope,
        },
        {
          id: 'appointments',
          label: t.appointmentBooking || t.navAppointments || 'Appointments',
          tooltip: 'Book and manage doctor appointments',
          icon: CalendarCheck,
        },
        {
          id: 'nearby',
          label: t.nearbyHospitals || t.navNearby || 'Nearby Healthcare',
          tooltip: 'Find nearby clinics, hospitals and pharmacies',
          icon: Hospital,
        },
        {
          id: 'medications',
          label: t.medicationTracker || t.navMedicationTracker || 'Medication Tracker',
          tooltip: 'Track your daily medicines and doses',
          icon: Pill,
          highlight: true,
        },
      ],
    },
    {
      title: 'Emergency',
      items: [
        {
          id: 'emergency_sos',
          label: 'Emergency SOS',
          tooltip: 'Get emergency assistance immediately',
          icon: Siren,
          action: 'modal',
          modalId: 'emergency_sos',
          danger: true,
          badge: 'SOS',
        },
        {
          id: 'blood',
          label: t.bloodEmergency || t.navBloodEmergency || 'Blood Emergency',
          tooltip: 'Request blood during a medical emergency',
          icon: Droplets,
          danger: true,
          badge: 'URGENT',
        },
        {
          id: 'emergency_qr',
          label: t.emergencyQR || t.navEmergencyQR || 'Emergency QR',
          tooltip: 'Show emergency health information card',
          icon: QrCode,
          highlight: true,
        },
        {
          id: 'emergency',
          label: t.emergencyContact || 'Emergency Contact',
          tooltip: 'Call emergency contacts and ambulance',
          icon: PhoneCall,
          danger: true,
        },
      ],
    },
    {
      title: 'Health & Family',
      items: [
        {
          id: 'vitals',
          label: t.healthTrends || 'Health Analytics',
          tooltip: 'View health trends and vital analytics',
          icon: Activity,
        },
        {
          id: 'camps',
          label: t.freeHealthCamps || t.navCamps || 'Free Health Camps',
          tooltip: 'Find free community health camps',
          icon: HeartPulse,
        },
        {
          id: 'insurance',
          label: t.navInsurance || 'Insurance',
          tooltip: 'Manage health insurance policies and claims',
          icon: ShieldCheck,
        },
        {
          id: 'expenses',
          label: t.navExpenses || 'Medical Expenses',
          tooltip: 'Track medical and hospital expenses',
          icon: Receipt,
        },
        {
          id: 'family',
          label: t.navFamily || 'Family Profiles',
          tooltip: 'Manage health profiles for family members',
          icon: Users,
        },
      ],
    },
    {
      title: 'Privacy & Alerts',
      items: [
        {
          id: 'privacy',
          label: t.privacyConsent || 'Privacy & Access',
          tooltip: 'See who accessed your medical records',
          icon: Lock,
        },
        {
          id: 'notifications',
          label: t.navNotifications || 'Notifications',
          tooltip: 'View your alerts and clinical updates',
          icon: Bell,
          action: 'modal',
          modalId: 'notifications',
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
      ],
    },
    {
      title: 'Tools & AI',
      items: [
        {
          id: 'ai_assistant',
          label: 'AI Health Assistant',
          tooltip: 'Ask medical and wellness questions to AI',
          icon: Bot,
          highlight: true,
        },
        {
          id: 'report_explainer',
          label: 'AI Report Explainer',
          tooltip: 'Get AI explanations for complex test reports',
          icon: FileSearch,
          action: 'modal',
          modalId: 'report_explainer',
        },
        {
          id: 'medical_summary',
          label: t.medicalSummary || t.navMedicalSummary || 'Medical Summary',
          tooltip: 'Generate verified medical summary docket',
          icon: FileText,
          action: 'modal',
          modalId: 'medical_summary',
        },
        {
          id: 'settings',
          label: t.settings || t.navSettings || 'Settings',
          tooltip: 'Manage your account settings',
          icon: Settings,
        },
      ],
    },
  ];

  // ============================================================
  // DOCTOR SIDEBAR CONFIGURATION (Strict semantic icon mapping)
  // ============================================================
  const doctorGroups: NavGroup[] = [
    {
      title: 'Clinical Practice',
      items: [
        {
          id: 'home',
          label: 'Dashboard',
          tooltip: 'View doctor dashboard',
          icon: Home,
        },
        {
          id: 'patients',
          label: 'My Patients',
          tooltip: 'View authorized patients',
          icon: Users,
        },
        {
          id: 'search',
          label: 'Search Patient',
          tooltip: 'Find a patient',
          icon: UserSearch,
          highlight: true,
        },
        {
          id: 'appointments',
          label: 'Appointments',
          tooltip: 'Manage appointments',
          icon: CalendarCheck,
        },
        {
          id: 'availability',
          label: 'Doctor Availability',
          tooltip: 'Manage available appointment slots',
          icon: CalendarClock,
        },
        {
          id: 'prescriptions',
          label: 'Prescriptions',
          tooltip: 'Create and manage prescriptions',
          icon: FileText,
          highlight: true,
        },
      ],
    },
    {
      title: 'Patient Records & EHR',
      items: [
        {
          id: 'records',
          label: 'Patient Records',
          tooltip: 'Access consented patient health records',
          icon: Folder,
        },
        {
          id: 'summary',
          label: 'Patient Clinical Summary',
          tooltip: 'View patient clinical summary',
          icon: ClipboardCheck,
          highlight: true,
        },
        {
          id: 'timeline',
          label: 'Patient Timeline',
          tooltip: 'View medical history by date',
          icon: History,
        },
        {
          id: 'biopsy',
          label: 'Biopsy Reports',
          tooltip: 'View biopsy reports',
          icon: Microscope,
        },
        {
          id: 'lab',
          label: 'Lab Reports',
          tooltip: 'View laboratory reports',
          icon: FlaskConical,
        },
        {
          id: 'treatments',
          label: 'Treatment History',
          tooltip: 'View previous treatments',
          icon: ClipboardList,
        },
        {
          id: 'upload',
          label: 'Upload Report',
          tooltip: 'Upload a patient medical report',
          icon: FileUp,
          highlight: true,
        },
      ],
    },
    {
      title: 'Access & Analytics',
      items: [
        {
          id: 'consent',
          label: 'Consent / Access Requests',
          tooltip: 'Manage patient access permissions',
          icon: ShieldCheck,
        },
        {
          id: 'analytics',
          label: 'Analytics',
          tooltip: 'View healthcare analytics',
          icon: Activity,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          tooltip: 'View notifications',
          icon: Bell,
          action: 'modal',
          modalId: 'notifications',
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          label: 'My Profile',
          tooltip: 'Manage doctor profile',
          icon: UserCircle,
        },
        {
          id: 'settings',
          label: 'Settings',
          tooltip: 'Manage settings',
          icon: Settings,
        },
      ],
    },
  ];

  // ============================================================
  // BLOOD BANK SIDEBAR CONFIGURATION
  // ============================================================
  const bloodBankGroups: NavGroup[] = [
    {
      title: 'Operations',
      items: [
        {
          id: 'blood_inventory',
          label: 'Blood Inventory',
          tooltip: 'Live blood units stock and cross-matching',
          icon: Droplets,
          highlight: true,
        },
        {
          id: 'blood_requests',
          label: 'Trauma & SOS Alerts',
          tooltip: 'Emergency blood supply calls from hospital ERs',
          icon: Siren,
          danger: true,
          badge: 'LIVE',
        },
        {
          id: 'camps',
          label: 'Donation Camps',
          tooltip: 'Community blood donation drives and camps',
          icon: HeartPulse,
        },
        {
          id: 'nearby',
          label: 'Partner Hospitals',
          tooltip: 'Network hospitals and supply routes',
          icon: Hospital,
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          id: 'settings',
          label: 'Node Settings',
          tooltip: 'Blood bank center configuration and verification',
          icon: Settings,
        },
      ],
    },
  ];

  // Strictly enforce Patient vs Doctor vs Blood Bank separation
  let navGroups: NavGroup[] = patientGroups;
  if (role === 'doctor') navGroups = doctorGroups;
  if (role === 'bloodbank') navGroups = bloodBankGroups;

  // Handle clicking a navigation option
  const handleItemClick = (item: NavItem) => {
    if (item.action === 'logout') {
      logout();
    } else if (item.action === 'modal' && item.modalId) {
      setActiveModal(item.modalId as any);
    } else {
      setActiveTab(item.id);
    }

    // On mobile devices, automatically close the sidebar after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const isRoleDoctor = role === 'doctor';
  const isRoleBloodBank = role === 'bloodbank';

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/50 z-30 lg:hidden backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        aria-label="Main Navigation"
        className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none shadow-xs ${
          isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Role Identity Card Header */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'lg:justify-center w-full'}`}>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                isRoleDoctor
                  ? 'bg-gradient-to-tr from-indigo-600 to-sky-600 shadow-indigo-500/25'
                  : isRoleBloodBank
                  ? 'bg-gradient-to-tr from-rose-600 to-red-600 shadow-rose-500/25'
                  : 'bg-gradient-to-tr from-teal-600 to-emerald-600 shadow-teal-500/25'
              }`}
            >
              {isRoleDoctor ? (
                <Stethoscope className="w-5 h-5" strokeWidth={2} />
              ) : isRoleBloodBank ? (
                <Droplets className="w-5 h-5" strokeWidth={2} />
              ) : (
                <UserCircle className="w-5 h-5" strokeWidth={2} />
              )}
            </div>

            {isSidebarOpen && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                  <span>{isRoleDoctor ? 'Doctor Portal' : isRoleBloodBank ? 'Blood Bank Grid' : 'Patient Portal'}</span>
                </div>
                <div
                  className={`text-[11px] font-mono font-bold truncate ${
                    isRoleDoctor ? 'text-indigo-600' : isRoleBloodBank ? 'text-rose-600' : 'text-teal-700'
                  }`}
                >
                  {isRoleDoctor
                    ? user.doctorData?.doctorCode || 'DR-000001'
                    : isRoleBloodBank
                    ? 'BB-NODE-001'
                    : user.patientData?.patientCode || 'PT-000001'}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sidebar Collapse Toggle */}
          {isSidebarOpen && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              title="Collapse sidebar for wider view"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Button (Desktop Only) */}
        {!isSidebarOpen && (
          <div className="hidden lg:flex justify-center py-2 border-b border-slate-100 bg-slate-50/40">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items by Category Groups */}
        <nav
          className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
          aria-label="Sidebar Menu"
        >
          {navGroups.map((group, groupIndex) => (
            <div key={group.title || groupIndex} className="space-y-1">
              {/* Group Title or subtle divider */}
              {isSidebarOpen ? (
                group.title && (
                  <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none flex items-center justify-between">
                    <span>{group.title}</span>
                  </div>
                )
              ) : (
                groupIndex > 0 && <div className="h-px bg-slate-100 mx-2 my-1.5" aria-hidden="true" />
              )}

              {/* Group Navigation Links */}
              {group.items.map((item) => {
                const IconComponent = item.icon;

                // Check active state
                const isTabActive = item.action !== 'modal' && activeTab === item.id;
                const isModalActive = item.action === 'modal' && item.modalId && activeModal === item.modalId;
                const isActive = isTabActive || isModalActive;

                return (
                  <div key={item.id} className="relative group">
                    <button
                      type="button"
                      id={`sidebar-link-${item.id}`}
                      onClick={() => handleItemClick(item)}
                      title={isSidebarOpen ? item.tooltip : undefined}
                      aria-label={`${item.label} - ${item.tooltip}`}
                      aria-current={isActive ? 'page' : undefined}
                      tabIndex={0}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                        isRoleDoctor
                          ? 'focus-visible:ring-indigo-500'
                          : isRoleBloodBank
                          ? 'focus-visible:ring-rose-500'
                          : 'focus-visible:ring-teal-500'
                      } ${
                        isActive
                          ? isRoleDoctor
                            ? 'bg-indigo-50/90 text-indigo-950 font-bold border-l-4 border-indigo-600 shadow-2xs'
                            : isRoleBloodBank
                            ? 'bg-rose-50/90 text-rose-950 font-bold border-l-4 border-rose-600 shadow-2xs'
                            : 'bg-teal-50/90 text-teal-950 font-bold border-l-4 border-teal-600 shadow-2xs'
                          : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100/70 border-l-4 border-transparent'
                      } ${!isSidebarOpen ? 'lg:justify-center lg:px-1.5' : ''}`}
                    >
                      {/* Standardized 20px vector icon container */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isActive
                            ? isRoleDoctor
                              ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                              : isRoleBloodBank
                              ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30'
                              : 'bg-teal-600 text-white shadow-xs shadow-teal-600/30'
                            : item.danger
                            ? 'text-rose-600 bg-rose-50/80 group-hover:bg-rose-100 group-hover:text-rose-700'
                            : item.highlight
                            ? isRoleDoctor
                              ? 'text-indigo-600 bg-indigo-50/80 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                              : 'text-teal-600 bg-teal-50/80 group-hover:bg-teal-100 group-hover:text-teal-700'
                            : 'text-slate-500 bg-slate-100/60 group-hover:bg-slate-200/70 group-hover:text-slate-800'
                        }`}
                      >
                        <IconComponent className="w-5 h-5 shrink-0" strokeWidth={2} />
                      </div>

                      {/* Label and Badge (When Expanded) */}
                      {isSidebarOpen && (
                        <div className="flex-1 min-w-0 text-left flex items-center justify-between gap-1.5">
                          <span className="truncate text-[13px] leading-tight">{item.label}</span>
                          {item.badge ? (
                            <span
                              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 tracking-wider ${
                                item.danger
                                  ? 'bg-rose-600 text-white animate-pulse'
                                  : isRoleDoctor
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}
                            >
                              {item.badge}
                            </span>
                          ) : isActive ? (
                            <span
                              aria-hidden="true"
                              className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md shrink-0 tracking-wider ${
                                isRoleDoctor
                                  ? 'bg-indigo-100/90 text-indigo-700 border border-indigo-200'
                                  : isRoleBloodBank
                                  ? 'bg-rose-100/90 text-rose-700 border border-rose-200'
                                  : 'bg-teal-100/90 text-teal-700 border border-teal-200'
                              }`}
                            >
                              Active
                            </span>
                          ) : null}
                        </div>
                      )}
                    </button>

                    {/* Accessible Floating Tooltip (When Collapsed on Desktop) */}
                    {!isSidebarOpen && (
                      <div
                        role="tooltip"
                        className="hidden lg:group-hover:flex flex-col absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in-50 zoom-in-95 border border-slate-700/60"
                      >
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-rose-500 text-white rounded font-bold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-300 font-normal mt-0.5">
                          {item.tooltip}
                        </div>
                        {/* Pointing caret */}
                        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-l border-b border-slate-700/60" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1.5">
          <button
            type="button"
            id="sidebar-logout-btn"
            onClick={logout}
            title={isSidebarOpen ? "Sign out" : undefined}
            aria-label="Logout - Sign out"
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors min-h-[44px] group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              !isSidebarOpen ? 'lg:justify-center lg:px-1.5' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
              <LogOut className="w-5 h-5 shrink-0" strokeWidth={2} />
            </div>

            {isSidebarOpen && (
              <span className="truncate text-left text-[13px] font-bold">
                Logout
              </span>
            )}

            {/* Tooltip for logout when collapsed */}
            {!isSidebarOpen && (
              <div
                role="tooltip"
                className="hidden lg:group-hover:flex flex-col absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in-50 zoom-in-95 border border-slate-700/60"
              >
                <div className="font-bold text-rose-400">Logout</div>
                <div className="text-[11px] text-slate-300 font-normal mt-0.5">
                  Sign out
                </div>
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-l border-b border-slate-700/60" />
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
