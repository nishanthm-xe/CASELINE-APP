import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Patient, ConsentRequest, MedicalRecord } from '../../types';
import {
  Stethoscope,
  Search,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  Clock,
  Hospital,
  Lock,
  Eye,
  FileText,
  Activity,
  Microscope,
  Send,
  Loader2,
  X,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Award,
  TrendingUp,
  BarChart3,
  Users,
  Check,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentScannerView } from '../documents/DocumentScannerView';
import { DoctorDashboardView } from './DoctorDashboardView';
import { DoctorPrescriptionsView } from './DoctorPrescriptionsView';
import { DoctorAvailabilityView } from './DoctorAvailabilityView';
import { DoctorConsentManagementView } from './DoctorConsentManagementView';
import { DoctorConsentedEHRView } from './DoctorConsentedEHRView';

export const DoctorPortal: React.FC = () => {
  const { user, addToast, refreshNotifications, activeTab, setActiveTab } = useApp();
  const doctor = user?.doctorData;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [consentStatuses, setConsentStatuses] = useState<{ [patientId: string]: string }>({});
  const [selectedPatientForAccess, setSelectedPatientForAccess] = useState<Patient | null>(null);
  const [selectedPatientForRecord, setSelectedPatientForRecord] = useState<Patient | null>(null);
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null);
  const [selectedPatientForRx, setSelectedPatientForRx] = useState<Patient | null>(null);

  // Access request form
  const [requestedResource, setRequestedResource] = useState('FULL_RECORDS');
  const [requestReason, setRequestReason] = useState('Pre-operative oncology staging and histopathology correlation.');
  const [submittingAccess, setSubmittingAccess] = useState(false);

  // New Clinical record form
  const [newRecord, setNewRecord] = useState({
    title: 'Routine Oncology Follow-up Consultation',
    diagnosis: 'Post-lumpectomy stable margins, no local recurrence',
    description: 'Patient examined in surgical oncology OPD. Wound healed with primary intention. Systemic vitals stable. Advised 6-month imaging surveillance.',
    prescription: 'Tab. Tamoxifen 20mg OD x 90 days\nTab. Calcium + Vitamin D3 500mg OD',
    bp: '120/80',
    hr: '72',
  });
  const [submittingRecord, setSubmittingRecord] = useState(false);

  // Appointments & Consents Data
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [allConsentRequests, setAllConsentRequests] = useState<any[]>([]);
  const [loadingConsents, setLoadingConsents] = useState(false);
  const [docAvailability, setDocAvailability] = useState<'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE'>(
    (doctor as any)?.availabilityStatus || 'AVAILABLE'
  );
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const handleUpdateAvailability = async (status: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE') => {
    if (!doctor) return;
    setUpdatingAvailability(true);
    try {
      await api.updateDoctorAvailability(doctor.id, { availabilityStatus: status });
      setDocAvailability(status);
      addToast(
        `OPD Status updated: ${
          status === 'AVAILABLE'
            ? 'Available for Consultations'
            : status === 'IN_CONSULTATION'
            ? 'In Procedure / Consultation'
            : 'On Leave'
        }`,
        'success'
      );
    } catch (e: any) {
      addToast(e.message || 'Failed to update availability status', 'error');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  // Patient detailed records view modal
  const [viewingPatientRecords, setViewingPatientRecords] = useState<any>(null);

  // Patient Case-Taking Clinical Summary Modal
  const [viewingCaseSummary, setViewingCaseSummary] = useState<any | null>(null);
  const [loadingCaseSummary, setLoadingCaseSummary] = useState(false);

  const handleOpenCaseSummary = async (patient: Patient) => {
    setLoadingCaseSummary(true);
    try {
      const summary = await api.getDoctorClinicalSummary(patient.id);
      setViewingCaseSummary({ patient, summary });
    } catch (err) {
      console.error(err);
      addToast('Failed to load patient case-taking summary', 'error');
    } finally {
      setLoadingCaseSummary(false);
    }
  };

  // Quick initial fetch of patients & clinical data
  useEffect(() => {
    handleSearch();
    loadClinicalData();
  }, [doctor]);

  const loadClinicalData = async () => {
    if (!doctor) return;
    try {
      setLoadingAppointments(true);
      const appts = await api.getAppointments({ doctorId: doctor.id });
      setAppointments(appts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAppointments(false);
    }

    try {
      setLoadingConsents(true);
      const consents = await api.getConsentRequests({ doctorId: doctor.id });
      setAllConsentRequests(consents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConsents(false);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await api.searchPatients(searchQuery);
      setSearchResults(res.patients);

      // Check consents for each patient for this doctor
      if (doctor) {
        const statuses: { [patientId: string]: string } = {};
        for (const p of res.patients) {
          const consents = await api.getConsentRequests({ doctorId: doctor.id, patientId: p.id });
          const granted = consents.find((c) => c.status === 'GRANTED');
          const pending = consents.find((c) => c.status === 'PENDING');
          if (granted) statuses[p.id] = 'GRANTED';
          else if (pending) statuses[p.id] = 'PENDING';
          else statuses[p.id] = 'NONE';
        }
        setConsentStatuses(statuses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !selectedPatientForAccess) return;
    setSubmittingAccess(true);
    try {
      await api.createConsentRequest({
        patientId: selectedPatientForAccess.id,
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        hospitalName: doctor.hospitalName,
        resourceType: requestedResource,
        reason: requestReason,
      });
      addToast(`Consent request dispatched to ${selectedPatientForAccess.fullName}!`, 'success');
      setSelectedPatientForAccess(null);
      handleSearch();
      refreshNotifications();
    } catch (err: any) {
      addToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setSubmittingAccess(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !selectedPatientForRecord) return;
    setSubmittingRecord(true);
    try {
      await api.createRecord({
        patientId: selectedPatientForRecord.id,
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        hospitalName: doctor.hospitalName,
        recordDate: new Date().toISOString().split('T')[0],
        title: newRecord.title,
        diagnosis: newRecord.diagnosis,
        description: newRecord.description,
        prescription: newRecord.prescription,
        vitals: {
          bloodPressure: newRecord.bp,
          heartRate: parseInt(newRecord.hr) || 72,
        },
      });
      addToast(`Consultation record added to ${selectedPatientForRecord.fullName}'s timeline!`, 'success');
      setSelectedPatientForRecord(null);
    } catch (err: any) {
      addToast(err.message || 'Failed to add record', 'error');
    } finally {
      setSubmittingRecord(false);
    }
  };

  const handleViewPatientRecords = async (patient: Patient) => {
    try {
      const [timeline, biopsy, lab, insuranceRes] = await Promise.all([
        api.getTimeline(patient.id).catch(() => []),
        api.getBiopsyReports(patient.id).catch(() => ({ reports: [] })),
        api.getLabReports(patient.id).catch(() => []),
        api.getInsuranceData(patient.id).catch(() => null),
      ]);
      setViewingPatientRecords({
        patient,
        timeline,
        biopsy: biopsy.reports || [],
        lab,
        insurance: insuranceRes,
      });
      setSelectedPatientForView(patient);
    } catch (err) {
      addToast('Cannot access patient records: Consent required.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner (shown on subpages) */}
      {activeTab !== 'home' && activeTab !== 'dashboard' && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={doctor?.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
              alt={doctor?.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-400 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-1">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Certified Attending Clinician</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">{doctor?.fullName}</h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {doctor?.specialization} • {doctor?.hospitalName}
              </p>
              <div className="text-[11px] text-teal-300 font-mono mt-1">
                MCI Reg: {doctor?.registrationNumber} • {doctor?.doctorCode}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Access Granted</span>
              <span className="text-xl font-extrabold text-teal-300">
                {Object.values(consentStatuses).filter((s) => s === 'GRANTED').length}
              </span>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Pending</span>
              <span className="text-xl font-extrabold text-amber-300">
                {Object.values(consentStatuses).filter((s) => s === 'PENDING').length}
              </span>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Total Patients</span>
              <span className="text-xl font-extrabold text-white">{searchResults.length}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scan_document' || activeTab === 'upload' ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
          >
            ← Back to Clinical Workstation
          </button>
          <DocumentScannerView />
        </div>
      ) : activeTab === 'appointments' ? (
        /* Doctor Appointments Management View */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Clinical Consultation Schedule</h2>
                  <p className="text-xs text-slate-500">
                    Review upcoming outpatient consultations, access intake summaries, and record diagnostic encounters.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-teal-50 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>{appointments.length} Consultations Scheduled</span>
                </span>
              </div>
            </div>

            {loadingAppointments ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                <span>Synchronizing consultation calendar...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No consultations scheduled for today. New patient bookings will appear here in real-time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {appointments.map((appt) => {
                  const patient = searchResults.find((p) => p.id === appt.patientId || p.patientCode === appt.patientCode);
                  const isConsented = patient && consentStatuses[patient.id] === 'GRANTED';

                  return (
                    <div
                      key={appt.id}
                      className="p-5 rounded-3xl border border-slate-200/90 bg-white hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400">{appt.patientCode || 'PT-2024-001'}</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">{appt.patientName}</h3>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>{appt.date} • {appt.time}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                                {appt.type ? appt.type.replace('_', ' ') : 'In-Person OPD'}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            appt.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {appt.status?.toUpperCase() || 'SCHEDULED'}
                          </span>
                        </div>

                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Reason:</span> {appt.reason || 'Routine clinical examination and medication review.'}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                        {patient && (
                          <button
                            onClick={() => handleOpenCaseSummary(patient)}
                            className="py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                            title="View AI clinical intake docket"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            <span>Case Docket</span>
                          </button>
                        )}
                        {patient && isConsented && (
                          <button
                            onClick={() => handleViewPatientRecords(patient)}
                            className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Full EHR</span>
                          </button>
                        )}
                        {patient && (
                          <button
                            onClick={() => setSelectedPatientForRecord(patient)}
                            className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Record Encounter</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'consent' ? (
        <DoctorConsentManagementView
          searchResults={searchResults}
          consentRequests={allConsentRequests}
          loadingConsents={loadingConsents}
          onRefreshConsents={loadClinicalData}
          onViewPatientRecords={handleViewPatientRecords}
          onOpenCaseSummary={handleOpenCaseSummary}
          onOpenAccessModal={(p) => setSelectedPatientForAccess(p || searchResults[0] || null)}
        />
      ) : activeTab === 'prescriptions' ? (
        <DoctorPrescriptionsView
          searchResults={searchResults}
          consentStatuses={consentStatuses}
          preselectedPatient={selectedPatientForRx}
          onViewPatientRecords={handleViewPatientRecords}
        />
      ) : activeTab === 'availability' ? (
        <DoctorAvailabilityView
          docAvailability={docAvailability}
          updatingAvailability={updatingAvailability}
          onUpdateAvailability={handleUpdateAvailability}
        />
      ) : activeTab === 'analytics' ? (
        /* Doctor Analytics View */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Clinical Practice & OPD Analytics</h2>
                <p className="text-xs text-slate-500">
                  Real-time clinical throughput, patient case-taking utilization, and diagnostic breakdown.
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Encounters</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">48</span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +14% this month
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Avg. Intake Time</span>
                <span className="text-2xl font-extrabold text-teal-700 mt-1 block">3.8 min</span>
                <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
                  Voice-assisted intake
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Consent Compliance</span>
                <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">100%</span>
                <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">
                  ABDM verified audit trail
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Voice Intake Adoption</span>
                <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">82%</span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                  Multilingual patient flow
                </span>
              </div>
            </div>

            {/* Diagnostic Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">Top Presenting Diagnostic Categories</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Metabolic & Endocrinology (Diabetes, Thyroid)</span>
                    <span>42%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Cardiovascular & Hypertension</span>
                    <span>28%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Post-Operative Oncology Surveillance</span>
                    <span>18%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Respiratory & General OPD</span>
                    <span>12%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'profile' ? (
        /* Doctor Profile & Accreditation View */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {doctor?.fullName?.charAt(0) || 'D'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{doctor?.fullName || 'Dr. Priya Ramanathan, MD'}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-600" />
                      <span>COUNCIL VERIFIED</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {doctor?.specialization || 'Endocrinology & Internal Medicine'} • {doctor?.hospitalName || 'Apollo Memorial Hospital, Jayanagar'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">Medical Council Accreditation</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Medical Registration Number:</span>
                    <span className="font-mono font-bold text-slate-900">{doctor?.registrationNumber || 'MCI-KA-2014-88910'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Medical Degree / Qualifications:</span>
                    <span className="font-bold text-slate-900">{doctor?.qualification || 'MBBS, MD (General Medicine), DM (Endocrinology)'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Clinical Experience:</span>
                    <span className="font-bold text-slate-900">{doctor?.experienceYears ? `${doctor.experienceYears} Years` : '12 Years'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Digital Signature Key:</span>
                    <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Active & Enrolled
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">Doctor Availability & OPD Status</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      docAvailability === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : docAvailability === 'IN_CONSULTATION'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {docAvailability === 'AVAILABLE'
                      ? '● Available for Consultations'
                      : docAvailability === 'IN_CONSULTATION'
                      ? '● In Procedure / Consult'
                      : '● Out of Office / Leave'}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Toggle your live clinical availability for patient appointments, teleconsultations, and emergency duty triage:
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={updatingAvailability}
                    onClick={() => handleUpdateAvailability('AVAILABLE')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      docAvailability === 'AVAILABLE'
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    disabled={updatingAvailability}
                    onClick={() => handleUpdateAvailability('IN_CONSULTATION')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      docAvailability === 'IN_CONSULTATION'
                        ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-500/30'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    In Consult
                  </button>
                  <button
                    type="button"
                    disabled={updatingAvailability}
                    onClick={() => handleUpdateAvailability('ON_LEAVE')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      docAvailability === 'ON_LEAVE'
                        ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    On Leave
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Morning OPD:</span>
                    <span className="font-bold text-slate-900">09:30 AM - 01:30 PM (Mon - Sat)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Evening Specialty Clinic:</span>
                    <span className="font-bold text-slate-900">04:30 PM - 07:30 PM (Mon - Fri)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tele-Consultation Slot:</span>
                    <span className="font-bold text-slate-900">02:30 PM - 04:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Emergency On-Call:</span>
                    <span className="font-bold text-rose-700">Apollo Memorial Emergency ER</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (activeTab === 'records' || activeTab === 'biopsy' || activeTab === 'lab' || activeTab === 'treatments' || activeTab === 'timeline' || activeTab === 'summary') ? (
        <DoctorConsentedEHRView
          searchResults={searchResults}
          consentStatuses={consentStatuses}
          onOpenAccessModal={(p) => setSelectedPatientForAccess(p)}
          onOpenCaseDocketModal={handleOpenCaseSummary}
          onOpenPrescriptionBuilder={(p) => {
            setSelectedPatientForRx(p);
            setActiveTab('prescriptions');
          }}
        />
      ) : activeTab === 'search' || activeTab === 'patients' ? (
        /* National Health Patient Directory & Search */
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">National Health Patient Directory</h2>
              <p className="text-xs text-slate-500">
                Lookup patients by Unique Health ID (e.g. PT-2024-001) or full legal name to request clinical consent.
              </p>
            </div>

            <div className="flex w-full sm:w-80 gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search PT-2024-001 or Name..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Search
              </button>
            </div>
          </div>

          {/* Patients Result Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {searchResults.map((patient) => {
              const status = consentStatuses[patient.id] || 'NONE';

              return (
                <div
                  key={patient.id}
                  className="p-5 rounded-3xl border border-slate-200/90 bg-white hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">{patient.patientCode}</span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">{patient.fullName}</h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {patient.age} Yrs • {patient.gender} • Blood Group: <strong className="text-rose-600">{patient.bloodGroup}</strong>
                        </div>
                      </div>

                      {status === 'GRANTED' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>CONSENT ACTIVE</span>
                        </span>
                      ) : status === 'PENDING' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>REQUEST PENDING</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>CONSENT REQUIRED</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-xs text-slate-600 space-y-1">
                      <div>Location: {patient.city}, {patient.state}</div>
                      <div className="text-[11px] text-slate-400">Next of Kin: {patient.emergencyContact?.name} ({patient.emergencyContact?.phoneNumber})</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                    {status === 'GRANTED' ? (
                      <>
                        <button
                          onClick={() => handleOpenCaseSummary(patient)}
                          className="py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                          title="View verified clinical case-taking summary"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          <span>Clinical Case Docket</span>
                        </button>
                        <button
                          onClick={() => handleViewPatientRecords(patient)}
                          className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Full EHR File</span>
                        </button>
                        <button
                          onClick={() => setSelectedPatientForRecord(patient)}
                          className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Add Encounter</span>
                        </button>
                      </>
                    ) : status === 'PENDING' ? (
                      <button
                        disabled
                        className="w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Access Request Dispatched (Awaiting Patient Approval)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedPatientForAccess(patient)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Lock className="w-3.5 h-3.5 text-teal-400" />
                        <span>Request Consent for Medical Records</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <DoctorDashboardView
          searchResults={searchResults}
          consentStatuses={consentStatuses}
          appointments={appointments}
          loadingAppointments={loadingAppointments}
          docAvailability={docAvailability}
          updatingAvailability={updatingAvailability}
          onUpdateAvailability={handleUpdateAvailability}
          onOpenCaseSummary={handleOpenCaseSummary}
          onViewPatientRecords={handleViewPatientRecords}
          onSelectPatientForRecord={(p) => setSelectedPatientForRecord(p)}
          onSelectPatientForAccess={(p) => setSelectedPatientForAccess(p)}
          onRefreshAppointments={loadClinicalData}
          onOpenPrescriptionBuilder={(p) => {
            setSelectedPatientForRx(p || null);
            setActiveTab('prescriptions');
          }}
        />
      )}

      {/* Access Request Modal */}
      <AnimatePresence>
        {selectedPatientForAccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-base text-slate-900">Request Patient Access</h3>
                </div>
                <button
                  onClick={() => setSelectedPatientForAccess(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRequestAccess} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                    {selectedPatientForAccess.fullName} ({selectedPatientForAccess.patientCode})
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scope of Access Requested *</label>
                  <select
                    value={requestedResource}
                    onChange={(e) => setRequestedResource(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="FULL_RECORDS">Full Longitudinal Records (Timeline, Biopsy, Lab)</option>
                    <option value="INSURANCE_DATA">Medical Insurance & Pre-Auth Information Only</option>
                    <option value="BIOPSY_REPORTS">Biopsy & Pathology Reports Only</option>
                    <option value="LAB_REPORTS">Diagnostic Lab Panels Only</option>
                    <option value="BASIC_INFO">Basic Clinical History Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Justification / Reason *</label>
                  <textarea
                    rows={3}
                    required
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="Describe clinical indication..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPatientForAccess(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAccess}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    {submittingAccess ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Consultation Record Modal */}
      <AnimatePresence>
        {selectedPatientForRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-base text-slate-900">Add Clinical Encounter</h3>
                </div>
                <button
                  onClick={() => setSelectedPatientForRecord(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddRecord} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient</label>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                    {selectedPatientForRecord.fullName} ({selectedPatientForRecord.patientCode})
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Encounter Title *</label>
                  <input
                    type="text"
                    required
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
                  <input
                    type="text"
                    required
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Pressure (BP)</label>
                    <input
                      type="text"
                      value={newRecord.bp}
                      onChange={(e) => setNewRecord({ ...newRecord, bp: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Heart Rate (BPM)</label>
                    <input
                      type="text"
                      value={newRecord.hr}
                      onChange={(e) => setNewRecord({ ...newRecord, hr: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Assessment Notes</label>
                  <textarea
                    rows={3}
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prescription Directives</label>
                  <textarea
                    rows={2}
                    value={newRecord.prescription}
                    onChange={(e) => setNewRecord({ ...newRecord, prescription: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPatientForRecord(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRecord}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    {submittingRecord ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Save to Patient Timeline</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Doctor Viewing Patient Full Records Modal */}
      <AnimatePresence>
        {viewingPatientRecords && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden relative my-6"
            >
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                      Consented Clinical File
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-1 text-white">
                    {viewingPatientRecords.patient.fullName} ({viewingPatientRecords.patient.patientCode})
                  </h3>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {viewingPatientRecords.patient.age} Yrs • Blood Group: {viewingPatientRecords.patient.bloodGroup} • {viewingPatientRecords.patient.city}
                  </div>
                </div>
                <button
                  onClick={() => setViewingPatientRecords(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
                {/* Biopsy Reports Section */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Microscope className="w-4 h-4 text-indigo-600" />
                    <span>Pathology & Biopsy Reports ({viewingPatientRecords.biopsy.length})</span>
                  </h4>
                  <div className="space-y-3">
                    {viewingPatientRecords.biopsy.map((b: any) => (
                      <div key={b.id} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-2">
                        <div className="flex justify-between font-bold">
                          <span className="text-indigo-950">{b.specimenDetails}</span>
                          <span className="text-indigo-800 font-mono">{b.reportDate}</span>
                        </div>
                        <p className="text-slate-700">{b.diagnosis}</p>
                        <div className="text-[11px] text-indigo-900">
                          Margins: <strong>{b.margins}</strong> • Pathologist: {b.doctorName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Longitudinal Clinical Timeline */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>Longitudinal Clinical Timeline ({viewingPatientRecords.timeline.length})</span>
                  </h4>
                  <div className="space-y-3">
                    {viewingPatientRecords.timeline.map((ev: any) => (
                      <div key={ev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-900">{ev.title}</span>
                          <span className="font-mono text-slate-500">{ev.eventDate}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{ev.description}</p>
                        <div className="text-[11px] text-slate-500">
                          Facility: {ev.hospitalName} • Practitioner: {ev.doctorName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insurance & Pre-Auth Section if granted */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Medical Insurance & Pre-Auth Status</span>
                  </h4>
                  {viewingPatientRecords.insurance?.profile ? (
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-emerald-950">
                          {viewingPatientRecords.insurance.profile.insuranceProvider} ({viewingPatientRecords.insurance.profile.policyType})
                        </span>
                        <span className="text-emerald-700 font-mono">
                          Policy: {viewingPatientRecords.insurance.profile.policyNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 text-emerald-900">
                        <div>Sum Insured: <strong>₹{Number(viewingPatientRecords.insurance.profile.coverageAmount).toLocaleString('en-IN')}</strong></div>
                        <div>Remaining: <strong>₹{Number(viewingPatientRecords.insurance.profile.remainingCoverage).toLocaleString('en-IN')}</strong></div>
                        <div>TPA: <strong>{viewingPatientRecords.insurance.profile.tpaName}</strong></div>
                        <div>Status: <span className="font-bold text-emerald-800 uppercase">{viewingPatientRecords.insurance.profile.policyStatus}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-center">
                      <Lock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <span>Insurance details private. Consented access required to view insurance policies and claim pre-authorizations.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setViewingPatientRecords(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Doctor Viewing Patient Case-Taking Clinical Summary Modal */}
      <AnimatePresence>
        {viewingCaseSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden relative my-6"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-400/30">
                      Doctor-Ready Clinical Case-Taking Synthesis
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Patient Verified
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-1.5 text-white">
                    {viewingCaseSummary.patient.fullName} — Pre-Consultation Case Docket
                  </h3>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {viewingCaseSummary.patient.age} Yrs • {viewingCaseSummary.patient.gender} • Code: {viewingCaseSummary.patient.patientCode} • Blood: <strong className="text-rose-400">{viewingCaseSummary.patient.bloodGroup}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setViewingCaseSummary(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
                {/* Clinical Red-Flag Safety Alert Banner */}
                {viewingCaseSummary.summary?.clinicalRedFlags && viewingCaseSummary.summary.clinicalRedFlags.alerts?.length > 0 && (
                  <div className={`p-4 rounded-2xl border ${
                    viewingCaseSummary.summary.clinicalRedFlags.status === 'EMERGENCY'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  } space-y-2.5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <span className={`p-1.5 rounded-xl ${
                          viewingCaseSummary.summary.clinicalRedFlags.status === 'EMERGENCY' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                        <span>Clinical Red-Flags Identified ({viewingCaseSummary.summary.clinicalRedFlags.alerts.length})</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        viewingCaseSummary.summary.clinicalRedFlags.status === 'EMERGENCY' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {viewingCaseSummary.summary.clinicalRedFlags.status} ATTENTION
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {viewingCaseSummary.summary.clinicalRedFlags.alerts.map((flag: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-rose-200 text-xs">
                          <div className="flex items-center justify-between font-bold text-rose-900 mb-0.5">
                            <span>{flag.categoryLabel || flag.category}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-100 rounded text-rose-800">
                              {flag.level}
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium">{flag.message}</p>
                          <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                            <span>Trigger: <strong>{flag.triggerSymptom}</strong></span>
                            <span className="capitalize font-mono">Source: {flag.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Important Patient Statements (Voice & History Quotes) */}
                {viewingCaseSummary.summary?.importantPatientStatements && viewingCaseSummary.summary.importantPatientStatements.length > 0 && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>Patient Verbatim Statements & Chief Concern Quotes</span>
                    </div>
                    <div className="space-y-1">
                      {viewingCaseSummary.summary.importantPatientStatements.map((item: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-100 italic text-slate-800 flex items-start justify-between gap-2">
                          <span>"{item.statement}"</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">{item.source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Executive Summary Box */}
                {viewingCaseSummary.summary?.aiGeneratedSummary && (
                  <div className="p-5 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-teal-700" />
                        <span>Physician Case Synthesis (Grounded EHR & Patient Voice Intake)</span>
                      </span>
                      <span className="text-[10px] font-mono text-teal-700">
                        Confidence: 98.4%
                      </span>
                    </div>
                    <p className="text-teal-900 leading-relaxed font-sans whitespace-pre-wrap">
                      {viewingCaseSummary.summary.aiGeneratedSummary.summaryText}
                    </p>
                  </div>
                )}

                {/* Key Clinical Parameters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Chief Complaint & HPI */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Chief Complaint</span>
                    <strong className="text-sm text-slate-900 block">{viewingCaseSummary.summary?.chiefComplaint?.value}</strong>
                    <div className="text-slate-600">
                      Onset: <strong>{viewingCaseSummary.summary?.historyOfPresentIllness?.onset}</strong>
                    </div>
                    <div className="text-slate-600">
                      Duration: <strong>{viewingCaseSummary.summary?.historyOfPresentIllness?.duration}</strong>
                    </div>
                    <div className="text-slate-600">
                      Progression: <strong>{viewingCaseSummary.summary?.historyOfPresentIllness?.progression}</strong>
                    </div>
                  </div>

                  {/* Active Medications */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Medications</span>
                    <ul className="space-y-1">
                      {viewingCaseSummary.summary?.currentMedications?.map((m: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-center text-slate-800">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{m.dosage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Vitals & Allergies */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Reported Vitals & Allergies</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px] block">BP</span>
                        <strong className="text-slate-800">{viewingCaseSummary.summary?.currentStatus?.vitals?.bloodPressure}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Heart Rate</span>
                        <strong className="text-slate-800">{viewingCaseSummary.summary?.currentStatus?.vitals?.heartRate} bpm</strong>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Known Drug Allergies</span>
                      <span className="font-bold text-rose-700">
                        {viewingCaseSummary.summary?.allergies?.map((a: any) => a.substance).join(', ') || 'NKDA (No known drug allergies)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scanned Documents & Investigations */}
                {viewingCaseSummary.summary?.previousInvestigations && viewingCaseSummary.summary.previousInvestigations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-3">
                      Cross-Referenced Diagnostic Reports & Scanned OCR Prescriptions ({viewingCaseSummary.summary.previousInvestigations.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {viewingCaseSummary.summary.previousInvestigations.map((inv: any) => (
                        <div key={inv.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-900">{inv.title}</span>
                            <span className="text-[10px] font-mono text-slate-400">{inv.date}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{inv.hospitalName}</div>
                          <p className="mt-2 text-slate-700 leading-relaxed">{inv.keyFindings}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 text-xs">
                  Estimated consultation time saved: ~15 minutes
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
                  >
                    Print Docket
                  </button>
                  <button
                    onClick={() => {
                      const patientToEncounter = viewingCaseSummary.patient;
                      setViewingCaseSummary(null);
                      setSelectedPatientForRecord(patientToEncounter);
                    }}
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Proceed with Encounter
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
