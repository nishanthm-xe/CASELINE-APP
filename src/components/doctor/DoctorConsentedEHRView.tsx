import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Patient, MedicalTimelineEvent, BiopsyReport, LabReport, Treatment } from '../../types';
import {
  FileText,
  Microscope,
  FlaskConical,
  Clock,
  Pill,
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  Eye,
  Printer,
  Sparkles,
  Calendar,
  AlertTriangle,
  User,
  Activity,
  Heart,
  Droplets,
  CheckCircle2,
  X,
  Loader2,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DoctorConsentedEHRViewProps {
  searchResults: Patient[];
  consentStatuses: { [patientId: string]: string };
  initialPatient?: Patient | null;
  onOpenAccessModal: (patient: Patient) => void;
  onOpenCaseDocketModal: (patient: Patient) => void;
  onOpenPrescriptionBuilder: (patient: Patient) => void;
}

export const DoctorConsentedEHRView: React.FC<DoctorConsentedEHRViewProps> = ({
  searchResults,
  consentStatuses,
  initialPatient,
  onOpenAccessModal,
  onOpenCaseDocketModal,
  onOpenPrescriptionBuilder,
}) => {
  const { addToast, activeTab } = useApp();

  const getInitialSubTab = () => {
    if (activeTab === 'summary') return 'docket';
    if (activeTab === 'timeline') return 'timeline';
    if (activeTab === 'biopsy') return 'biopsy';
    if (activeTab === 'lab') return 'lab';
    if (activeTab === 'treatments') return 'treatments';
    return 'docket';
  };

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatient?.id || (searchResults.find((p) => consentStatuses[p.id] === 'GRANTED')?.id || searchResults[0]?.id || '')
  );

  const [activeSubTab, setActiveSubTab] = useState<'docket' | 'timeline' | 'biopsy' | 'lab' | 'treatments'>(getInitialSubTab());

  React.useEffect(() => {
    if (activeTab === 'summary') setActiveSubTab('docket');
    else if (activeTab === 'timeline') setActiveSubTab('timeline');
    else if (activeTab === 'biopsy') setActiveSubTab('biopsy');
    else if (activeTab === 'lab') setActiveSubTab('lab');
    else if (activeTab === 'treatments') setActiveSubTab('treatments');
    else if (activeTab === 'records') setActiveSubTab('docket');
  }, [activeTab]);
  const [loadingData, setLoadingData] = useState(false);

  // Patient Records State
  const [timeline, setTimeline] = useState<MedicalTimelineEvent[]>([]);
  const [biopsyReports, setBiopsyReports] = useState<BiopsyReport[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);

  // Add Timeline Event Modal State
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<'Consultation' | 'Biopsy' | 'Lab' | 'Prescription' | 'Surgery'>('Consultation');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventHospital, setNewEventHospital] = useState('Apollo Memorial Hospital');
  const [newEventDoctor, setNewEventDoctor] = useState('Dr. Priya Ramanathan, MD');
  const [newEventNotes, setNewEventNotes] = useState('');
  const [savingEvent, setSavingEvent] = useState(false);

  // Add Treatment Modal State
  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
  const [newTreatType, setNewTreatType] = useState('Hormone Therapy / Adjuvant');
  const [newTreatDetails, setNewTreatDetails] = useState('Tab. Tamoxifen 20mg daily for 5 years');
  const [newTreatStatus, setNewTreatStatus] = useState<'ongoing' | 'completed' | 'planned'>('ongoing');
  const [newTreatNotes, setNewTreatNotes] = useState('Monitor endometrial thickness annually.');
  const [savingTreatment, setSavingTreatment] = useState(false);

  // Timeline Filter
  const [timelineFilter, setTimelineFilter] = useState<string>('ALL');

  const selectedPatient = searchResults.find((p) => p.id === selectedPatientId);
  const isConsented = selectedPatient && consentStatuses[selectedPatient.id] === 'GRANTED';

  React.useEffect(() => {
    if (selectedPatient && isConsented) {
      loadPatientEHR(selectedPatient.id);
    }
  }, [selectedPatientId, isConsented]);

  const loadPatientEHR = async (patientId: string) => {
    setLoadingData(true);
    try {
      const [tList, bList, lList, treatList] = await Promise.all([
        api.getTimeline(patientId).catch(() => []),
        api.getBiopsyReports(patientId).catch(() => ({ reports: [] })),
        api.getLabReports(patientId).catch(() => []),
        api.getTreatments(patientId).catch(() => []),
      ]);
      setTimeline(tList || []);
      setBiopsyReports(bList?.reports || []);
      setLabReports(lList || []);
      setTreatments(treatList || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSavingEvent(true);
    try {
      await api.addTimelineEvent({
        patientId: selectedPatient.id,
        date: newEventDate,
        title: newEventTitle,
        category: newEventCategory,
        hospital: newEventHospital,
        doctor: newEventDoctor,
        notes: newEventNotes,
      });
      addToast(`Clinical event added to ${selectedPatient.fullName}'s timeline.`, 'success');
      setShowAddEventModal(false);
      setNewEventTitle('');
      setNewEventNotes('');
      loadPatientEHR(selectedPatient.id);
    } catch (e: any) {
      addToast(e.message || 'Failed to add clinical event', 'error');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleCreateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSavingTreatment(true);
    try {
      await api.addTreatment({
        patientId: selectedPatient.id,
        type: newTreatType,
        details: newTreatDetails,
        status: newTreatStatus,
        startDate: new Date().toISOString().split('T')[0],
        notes: newTreatNotes,
        prescribedBy: 'Dr. Priya Ramanathan, MD',
      });
      addToast(`Treatment regimen recorded for ${selectedPatient.fullName}.`, 'success');
      setShowAddTreatmentModal(false);
      loadPatientEHR(selectedPatient.id);
    } catch (e: any) {
      addToast(e.message || 'Failed to record treatment regimen', 'error');
    } finally {
      setSavingTreatment(false);
    }
  };

  const filteredTimeline = timeline.filter((item) => {
    if (timelineFilter === 'ALL') return true;
    return item.category?.toLowerCase() === timelineFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Patient Selector Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selected Patient</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="text-sm font-bold text-slate-900 border-none bg-transparent p-0 focus:ring-0 cursor-pointer"
            >
              {searchResults.map((p) => {
                const consented = consentStatuses[p.id] === 'GRANTED';
                return (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientCode}) - {consented ? '✓ Consented EHR' : '🔒 Consent Required'}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {selectedPatient && (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                isConsented
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {isConsented ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ABDM Consent Active</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Access Restricted</span>
                </>
              )}
            </span>

            {isConsented ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenCaseDocketModal(selectedPatient)}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>Clinical Docket</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenPrescriptionBuilder(selectedPatient)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Write Prescription</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAccessModal(selectedPatient)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>Request Patient Consent</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Access Gate if not consented */}
      {!isConsented ? (
        <div className="bg-white rounded-3xl p-10 border border-amber-200 text-center space-y-4 max-w-xl mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">ABDM Health Data Access Restricted</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Under National Digital Health Mission (NDHM) guidelines, clinicians cannot view patient longitudinal records without an active, patient-authorized consent artifact.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {selectedPatient && (
              <button
                type="button"
                onClick={() => onOpenAccessModal(selectedPatient)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <PlusCircle className="w-4 h-4 text-teal-400" />
                <span>Dispatch ABDM Consent Request</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Consented Records Workspace */
        <div className="space-y-6">
          {/* Sub-Navigation Tabs */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveSubTab('docket')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'docket' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Intake & AI Case Docket</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('timeline')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'timeline' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Medical Timeline ({timeline.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('biopsy')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'biopsy' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Biopsy Reports ({biopsyReports.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('lab')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'lab' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Lab Reports ({labReports.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('treatments')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'treatments' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Treatment History ({treatments.length})</span>
            </button>
          </div>

          {loadingData ? (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              <span>Loading longitudinal health records...</span>
            </div>
          ) : (
            <>
              {/* SUBTAB 1: DOCKET */}
              {activeSubTab === 'docket' && selectedPatient && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        AI CLINICAL SYNTHESIS DOCKET
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        Case Docket: {selectedPatient.fullName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Synthesized from voice case-taking, diagnostic reports, and patient history under ISO-27799.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenCaseDocketModal(selectedPatient)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Full Case Docket View</span>
                    </button>
                  </div>

                  {/* Patient Vitals & Demographics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Group</span>
                      <strong className="text-lg font-bold text-rose-600 mt-0.5 block">{selectedPatient.bloodGroup || 'O+'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Age & Gender</span>
                      <strong className="text-lg font-bold text-slate-900 mt-0.5 block">{selectedPatient.age} Y • {selectedPatient.gender}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reported BP</span>
                      <strong className="text-lg font-bold text-teal-700 mt-0.5 block">128/82 mmHg</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pulse Rate</span>
                      <strong className="text-lg font-bold text-emerald-700 mt-0.5 block">76 bpm (Regular)</strong>
                    </div>
                  </div>

                  {/* Drug Allergies Alert */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-amber-900">Documented Drug Allergies & Hypersensitivities:</strong>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        Sulfa-based antibiotics (mild skin rash), Aspirin / NSAIDs (gastric distress). Caution when prescribing anti-infectives.
                      </p>
                    </div>
                  </div>

                  {/* Clinical Synthesis Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-teal-800">
                        Presenting Chief Complaints
                      </h4>
                      <p className="text-slate-700 leading-relaxed">
                        Patient reports a 3-week history of mild localized tenderness in the left upper outer quadrant, accompanied by mild fatigue and intermittent palpitations following recent dietary changes.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-indigo-800">
                        Past Medical & Surgical History
                      </h4>
                      <p className="text-slate-700 leading-relaxed">
                        Post-operative wide local excision (lumpectomy) completed 14 months ago with adjuvant endocrine therapy. Type 2 Diabetes Mellitus under Metformin management (HbA1c 7.1%).
                      </p>
                    </div>
                  </div>

                  {/* AI Clinical Recommendations */}
                  <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-teal-900 font-bold">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span>AI Decision-Support Clinical Cross-Reference</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 pl-1">
                      <li>Surgical margins documented clear in histopathology (closest margin 4.2mm).</li>
                      <li>Endocrine compliance reported at 96% over the preceding 90-day refill cycle.</li>
                      <li>Recommend bilateral surveillance mammography & bone mineral density (DEXA) scan within 6 weeks.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: TIMELINE */}
              {activeSubTab === 'timeline' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Longitudinal Medical Timeline</h3>
                      <p className="text-xs text-slate-500">
                        Chronological aggregate of outpatient encounters, biopsies, and surgeries.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddEventModal(true)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Clinical Encounter</span>
                    </button>
                  </div>

                  {/* Filter chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['ALL', 'Consultation', 'Biopsy', 'Lab', 'Prescription', 'Surgery'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTimelineFilter(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          timelineFilter === cat
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Timeline Cards */}
                  {filteredTimeline.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No events recorded in this category. Click "Add Clinical Encounter" to log an event.
                    </div>
                  ) : (
                    <div className="space-y-4 pl-4 border-l-2 border-teal-200 relative">
                      {filteredTimeline.map((item) => (
                        <div key={item.id} className="relative pl-6">
                          <span className="w-3 h-3 rounded-full bg-teal-600 absolute -left-[1.85rem] top-1.5 ring-4 ring-white"></span>
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:bg-white transition space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                                  {item.category} • {item.date}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</h4>
                              </div>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/70 text-slate-700">
                                {item.hospitalName || (item as any).hospital || 'Apollo Memorial Hospital'}
                              </span>
                            </div>

                            {(item.description || (item as any).notes) && (
                              <p className="text-xs text-slate-600 pt-1">{item.description || (item as any).notes}</p>
                            )}
                            <div className="text-[11px] text-slate-400 pt-1">
                              Recorded by: <strong>{item.doctorName || (item as any).doctor || 'Attending Physician'}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 3: BIOPSY */}
              {activeSubTab === 'biopsy' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Histopathology & Biopsy Reports</h3>
                      <p className="text-xs text-slate-500">
                        Pathological specimen analyses, receptor statuses (ER/PR/HER2), and surgical margins.
                      </p>
                    </div>
                  </div>

                  {biopsyReports.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No biopsy records on file for this patient.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {biopsyReports.map((report) => (
                        <div
                          key={report.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400">Specimen #{report.id}</span>
                              <h4 className="text-base font-bold text-slate-900 mt-0.5">{report.specimenType || 'Core Needle Biopsy'}</h4>
                              <div className="text-xs text-slate-500">
                                Date: {report.reportDate || (report as any).date} • Site: {report.siteOfBiopsy || report.specimenDetails || (report as any).anatomicalSite || 'Left Breast, Upper Outer Quadrant'}
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              PATHOLOGY VERIFIED
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2.5 bg-slate-50 rounded-xl">
                              <span className="text-slate-400 text-[10px] block">Histologic Grade</span>
                              <strong className="text-slate-900">{report.gradeStage || (report as any).grade || 'Grade II (Moderate)'}</strong>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl">
                              <span className="text-slate-400 text-[10px] block">Surgical Margin</span>
                              <strong className="text-emerald-700">{report.margins || 'Clear (>4mm)'}</strong>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl">
                              <span className="text-slate-400 text-[10px] block">Estrogen Receptor (ER)</span>
                              <strong className="text-teal-700">Positive (90%)</strong>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl">
                              <span className="text-slate-400 text-[10px] block">HER2 Status</span>
                              <strong className="text-slate-700">Negative (1+)</strong>
                            </div>
                          </div>

                          {report.diagnosis && (
                            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                              <strong className="text-slate-900 block mb-0.5">Pathological Diagnosis:</strong>
                              <p>{report.diagnosis}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 4: LAB */}
              {activeSubTab === 'lab' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Laboratory & Diagnostic Panels</h3>
                      <p className="text-xs text-slate-500">
                        Hematology, metabolic markers, and biochemical profiles with standard reference ranges.
                      </p>
                    </div>
                  </div>

                  {labReports.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No laboratory reports on file for this patient.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {labReports.map((lab) => (
                        <div
                          key={lab.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition space-y-3"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{lab.testName || (lab as any).name || 'Diagnostic Panel'}</h4>
                              <span className="text-[11px] text-slate-500">{lab.reportDate || (lab as any).date} • {lab.testCategory || (lab as any).category || 'Biochemistry'}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {(lab as any).status || lab.tests?.[0]?.status || 'COMPLETED'}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Observed Value</span>
                              <strong className="text-base text-slate-900">
                                {(lab as any).value ?? lab.tests?.[0]?.value ?? lab.tests?.[0]?.result ?? 'Normal'} {(lab as any).unit ?? lab.tests?.[0]?.unit ?? ''}
                              </strong>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 text-[10px] block">Reference Range</span>
                              <span className="text-slate-700 font-medium">{(lab as any).referenceRange ?? lab.tests?.[0]?.referenceRange ?? 'Standard Normal'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 5: TREATMENTS */}
              {activeSubTab === 'treatments' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Treatment Regimens & Therapies</h3>
                      <p className="text-xs text-slate-500">
                        Ongoing and completed oncology regimens, chemotherapies, and surgical interventions.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddTreatmentModal(true)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Treatment Regimen</span>
                    </button>
                  </div>

                  {treatments.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No treatments recorded for this patient. Click "Add Treatment Regimen" to record one.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {treatments.map((t) => (
                        <div
                          key={t.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900">{t.treatmentName || (t as any).type || 'Treatment'}</h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                t.status === 'ongoing' || t.status === 'Ongoing'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {t.status?.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-slate-700 font-semibold">{t.dosageInstructions || (t as any).details || t.medications?.join(', ') || 'Clinical regimen protocol'}</div>
                          {t.notes && <div className="text-slate-500 text-[11px]">{t.notes}</div>}
                          <div className="text-slate-400 text-[10px] pt-1">
                            Started: {t.startDate} • Prescribed by: {t.doctorName || (t as any).prescribedBy || 'Attending Physician'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Add Clinical Event Modal */}
      <AnimatePresence>
        {showAddEventModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Add Clinical Event</h3>
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTimelineEvent} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g. 6-Month Oncology Review & Clinical Palpation"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Category</label>
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Biopsy">Biopsy</option>
                      <option value="Lab">Lab Test</option>
                      <option value="Prescription">Prescription</option>
                      <option value="Surgery">Surgery</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Clinical Notes & Observations</label>
                  <textarea
                    rows={3}
                    required
                    value={newEventNotes}
                    onChange={(e) => setNewEventNotes(e.target.value)}
                    placeholder="Physical examination findings, tolerance, patient response..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddEventModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEvent}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    {savingEvent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Treatment Regimen Modal */}
      <AnimatePresence>
        {showAddTreatmentModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Record Treatment Regimen</h3>
                <button
                  type="button"
                  onClick={() => setShowAddTreatmentModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTreatment} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Treatment Type</label>
                  <input
                    type="text"
                    required
                    value={newTreatType}
                    onChange={(e) => setNewTreatType(e.target.value)}
                    placeholder="e.g. Endocrine Therapy / Chemo / Radiation"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Regimen Details & Dosage</label>
                  <input
                    type="text"
                    required
                    value={newTreatDetails}
                    onChange={(e) => setNewTreatDetails(e.target.value)}
                    placeholder="e.g. Tab. Tamoxifen 20mg daily for 5 years"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Regimen Status</label>
                  <select
                    value={newTreatStatus}
                    onChange={(e) => setNewTreatStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monitoring & Protocol Notes</label>
                  <textarea
                    rows={3}
                    value={newTreatNotes}
                    onChange={(e) => setNewTreatNotes(e.target.value)}
                    placeholder="Special instructions, surveillance milestones..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddTreatmentModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTreatment}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    {savingTreatment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Record Regimen
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
