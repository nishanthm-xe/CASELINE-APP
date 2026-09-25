import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  FileText,
  Filter,
  Leaf,
  Plus,
  Search,
  ShieldAlert,
  Stethoscope,
  User,
  Users,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";
import { DEMO_DOCUMENTS, DEMO_QUEUE, DEMO_TIMELINE, INITIAL_PHYSICIAN_SUMMARY } from "../data/demoData";
import { MedicalDocument, PatientQueueItem, PhysicianClinicalHistory, TimelineEvent, PatientVitalsSummary, VitalMeasurement } from "../types";
import { DocumentUploadModal } from "./DocumentUploadModal";
import { MedicalTimelineView } from "./MedicalTimelineView";
import { PhysicianSummaryView } from "./PhysicianSummaryView";
import { ClinicalBriefModal } from "./ClinicalBriefModal";
import { VitalsCaptureModal } from "./VitalsCaptureModal";
import { fetchTriageAlerts, resolveTriageAlert, runRedFlagTestSuite } from "../services/apiService";

interface DoctorDashboardProps {
  queue: PatientQueueItem[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  currentSummary: PhysicianClinicalHistory;
  onUpdateSummary: (updated: PhysicianClinicalHistory) => void;
  timelineEvents: TimelineEvent[];
  medicalDocuments: MedicalDocument[];
  onAddDocument: (doc: MedicalDocument) => void;
  isHighContrast?: boolean;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  queue,
  selectedPatientId,
  onSelectPatient,
  currentSummary,
  onUpdateSummary,
  timelineEvents,
  medicalDocuments,
  onAddDocument,
  isHighContrast = false,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "timeline" | "documents" | "ayush" | "triage">("summary");
  const [filterMode, setFilterMode] = useState<"all" | "urgent" | "ready">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(currentSummary.status === "verified_physician");
  const [triageAlerts, setTriageAlerts] = useState<any[]>([]);
  const [isLoadingTriage, setIsLoadingTriage] = useState(false);
  const [testSuiteResults, setTestSuiteResults] = useState<any | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadTriageAlerts = async () => {
    setIsLoadingTriage(true);
    try {
      const data = await fetchTriageAlerts();
      setTriageAlerts(data);
    } catch (e) {
      console.warn("Failed to load triage alerts", e);
    } finally {
      setIsLoadingTriage(false);
    }
  };

  useEffect(() => {
    loadTriageAlerts();
    const interval = setInterval(loadTriageAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    setResolvingId(alertId);
    try {
      await resolveTriageAlert(alertId, "Acknowledged and resolved by clinician at triage desk.");
      await loadTriageAlerts();
    } catch (e) {
      console.warn("Failed to resolve alert", e);
    } finally {
      setResolvingId(null);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await runRedFlagTestSuite();
      setTestSuiteResults(res);
    } catch (e) {
      console.warn("Test suite execution failed", e);
    } finally {
      setIsRunningTests(false);
    }
  };

  const filteredQueue = queue.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (filterMode === "urgent") return p.hasRedFlag;
    if (filterMode === "ready") return p.historyStatus === "Ready for Review";
    return true;
  });

  const selectedQueuePatient =
    queue.find((p) => p.patientId === selectedPatientId) || queue[0];

  const handleVerify = () => {
    const updated: PhysicianClinicalHistory = {
      ...currentSummary,
      status: "verified_physician",
    };
    onUpdateSummary(updated);
    setIsVerified(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-5 px-3 sm:px-6">
      {/* Doctor Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Physician Outpatient Clinical Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Dr. K. S. Rao, MD, DM • OPD Room 4 • Apollo Heart & Vascular Institute
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsBriefModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>30s Clinical Brief</span>
          </button>

          <span className="text-xs font-semibold text-slate-500">
            Waiting Queue: {queue.length} Patients
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Grid Layout: Left Queue Sidebar (4 cols) & Right Work Area (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Queue & Triage List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Queue Search & Quick Triage Filter */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, MRN, complaint..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterMode === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All ({queue.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("urgent")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                  filterMode === "urgent"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                <AlertOctagon className="w-3 h-3" />
                <span>Urgent ({queue.filter((q) => q.hasRedFlag).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("ready")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterMode === "ready"
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Ready
              </button>
            </div>
          </div>

          {/* Patient Cards in Queue */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredQueue.map((item) => {
              const isSelected = item.patientId === selectedPatientId;

              return (
                <div
                  key={item.patientId}
                  onClick={() => onSelectPatient(item.patientId)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                      : item.hasRedFlag
                      ? "bg-rose-50/40 border-rose-300 hover:bg-rose-50"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {item.age} Y • {item.gender} • {item.patientId}
                      </p>
                    </div>

                    {item.hasRedFlag ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                        <AlertOctagon className="w-3 h-3" />
                        RED FLAG
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {item.submittedAt}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium line-clamp-2 my-1">
                    {item.chiefComplaint}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Waited {item.waitingMinutes} mins
                    </span>

                    <span
                      className={`font-semibold ${
                        item.historyStatus === "Verified by Doctor"
                          ? "text-emerald-700"
                          : item.historyStatus === "Ready for Review"
                          ? "text-cyan-700"
                          : "text-amber-700"
                      }`}
                    >
                      {item.historyStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Patient Comprehensive Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {/* Workspace Patient Banner */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-slate-900">
                  {selectedQueuePatient.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                  {selectedQueuePatient.patientId}
                </span>
                {isVerified && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Doctor Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ABHA: {selectedQueuePatient.abhaId || "91-4523-8891-2304"} • Chief Concern: {selectedQueuePatient.chiefComplaint}
              </p>
            </div>

            {/* Quick CDS Actions & Doctor Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsBriefModalOpen(true)}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>30s Brief & Verifier</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVitalsModalOpen(true)}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    Vitals: {currentSummary.vitals?.bpSystolic ? `${currentSummary.vitals.bpSystolic}/${currentSummary.vitals.bpDiastolic}` : "Capture"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "summary"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Clinical History Draft
                </button>
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "timeline"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Timeline ({timelineEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "documents"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Documents ({medicalDocuments.length})
              </button>
              {currentSummary.isAyushEnabled && (
                <button
                  type="button"
                  onClick={() => setActiveTab("ayush")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === "ayush"
                      ? "bg-amber-100 text-amber-900 shadow-xs"
                      : "text-amber-700 hover:text-amber-900"
                  }`}
                >
                  <Leaf className="w-3 h-3 text-amber-600" />
                  <span>AYUSH</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("triage")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "triage"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-rose-700 hover:text-rose-900 hover:bg-rose-50"
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Triage Early Warning</span>
                {triageAlerts.filter((a) => a.status === "ACTIVE").length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-700 text-[10px] font-black animate-pulse">
                    {triageAlerts.filter((a) => a.status === "ACTIVE").length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Tab Views */}
          {activeTab === "summary" && (
            <PhysicianSummaryView
              summary={currentSummary}
              onUpdateSummary={onUpdateSummary}
              onVerifyAndSave={handleVerify}
              isHighContrast={isHighContrast}
            />
          )}

          {activeTab === "timeline" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <MedicalTimelineView
                events={timelineEvents}
                onOpenUpload={() => setIsUploadModalOpen(true)}
                isHighContrast={isHighContrast}
              />
            </div>
          )}

          {activeTab === "documents" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Uploaded Medical Documents & Diagnostic OCR
                  </h3>
                  <p className="text-xs text-slate-500">
                    Laboratory profiles, cardiology prescriptions, and ECG tracings
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medicalDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {doc.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {doc.documentType}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      {doc.institutionOrDoctor} • {doc.date}
                    </p>

                    {doc.extractedDiagnoses.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Diagnoses:</span>
                        <div className="flex flex-wrap gap-1">
                          {doc.extractedDiagnoses.map((d, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-medium">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {doc.extractedInvestigations.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Key Values:</span>
                        <div className="space-y-0.5">
                          {doc.extractedInvestigations.slice(0, 3).map((inv, i) => (
                            <div key={i} className="flex justify-between text-[11px]">
                              <span className="text-slate-600">{inv.testName}:</span>
                              <span className={`font-mono font-bold ${inv.status === "above_range" ? "text-rose-600" : "text-slate-800"}`}>
                                {inv.value} {inv.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ayush" && (
            <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-base text-amber-950">
                  Ayurveda / AYUSH Dashavidha Pariksha Complete Profile
                </h3>
              </div>
              <p className="text-xs text-amber-800">
                Holistic metabolic and constitutional assessment captured during clinical intake.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-950">
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <strong>Prakriti (Constitutional Type):</strong>
                  <p className="mt-0.5">{currentSummary.ayushAssessment.prakriti}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <strong>Vikriti (Pathological Imbalance):</strong>
                  <p className="mt-0.5">{currentSummary.ayushAssessment.vikriti}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <strong>Sara & Samhanana (Tissue & Body Frame):</strong>
                  <p className="mt-0.5">{currentSummary.ayushAssessment.sara} • {currentSummary.ayushAssessment.samhanana}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <strong>Ahara Shakti & Vyayama Shakti (Digestion & Strength):</strong>
                  <p className="mt-0.5">{currentSummary.ayushAssessment.aharaShakti} • {currentSummary.ayushAssessment.vyayamaShakti}</p>
                </div>
              </div>
            </div>
          )}

          {/* Active Tab: Triage Early Warning Desk */}
          {activeTab === "triage" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6">
              {/* Header with Run Automated Tests */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <h3 className="font-extrabold text-base text-slate-900">
                      Emergency Early Warning & Clinical Triage Desk
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time safety alerting for early hospital triage. Not a diagnosis.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadTriageAlerts}
                    disabled={isLoadingTriage}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isLoadingTriage ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRunTests}
                    disabled={isRunningTests}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isRunningTests ? "Running 8 Rules..." : "Run Diagnostic Test Suite"}</span>
                  </button>
                </div>
              </div>

              {/* Automated Red-Flag Test Suite Results Panel */}
              {testSuiteResults && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="font-extrabold text-xs tracking-wider uppercase text-emerald-400">
                        Deterministic Clinical Test Suite ({testSuiteResults.passed}/{testSuiteResults.totalTests} Passed)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Executed at {new Date(testSuiteResults.executedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {testSuiteResults.results?.map((res: any) => (
                      <div
                        key={res.testId}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                          res.passed
                            ? "bg-slate-800/80 border-emerald-500/40 text-slate-200"
                            : "bg-rose-950/60 border-rose-500 text-rose-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-[11px] text-white">
                            {res.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                              res.level === "URGENT"
                                ? "bg-rose-600 text-white"
                                : res.level === "PRIORITY"
                                ? "bg-amber-500 text-white"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {res.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic mb-1">
                          Input: "{res.input}"
                        </p>
                        <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/50">
                          <span>Rule: {res.matchedRules.join(", ") || "None (ROUTINE)"}</span>
                          <span className="text-emerald-400 font-bold">✓ PASS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Triage Alerts Feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Active & Recent Triage Notifications ({triageAlerts.length})</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Real-time hospital bedside / OPD queue escalation
                  </span>
                </div>

                {triageAlerts.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                    <p className="font-bold text-slate-700">No active urgent triage alerts</p>
                    <p className="mt-0.5 text-slate-500">
                      All ongoing patient interviews are within routine OPD parameters.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {triageAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          alert.status === "ACTIVE"
                            ? alert.level === "URGENT"
                              ? "bg-rose-50/70 border-rose-300 shadow-xs"
                              : "bg-amber-50/70 border-amber-300 shadow-xs"
                            : "bg-slate-50 border-slate-200 opacity-70"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                alert.level === "URGENT"
                                  ? "bg-rose-600 text-white animate-pulse"
                                  : "bg-amber-500 text-white"
                              }`}
                            >
                              {alert.level === "URGENT"
                                ? "URGENT TRIAGE REVIEW"
                                : "PRIORITY TRIAGE REVIEW"}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-900">
                              CASE ID: {alert.caseId}
                            </span>
                            <span className="text-xs text-slate-500">
                              • {alert.patientName} ({alert.patientAge} Y / {alert.patientGender})
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Reason / Trigger */}
                        <div className="space-y-1.5 text-xs mb-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{alert.staffAlertReason}</span>
                          </div>

                          {alert.patientStatement && (
                            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200 text-slate-800">
                              <span className="font-bold text-slate-500 text-[10px] uppercase block mb-0.5">
                                Original Patient Statement ({alert.source === "voice" ? "Voice Response" : "Touch / Text"}):
                              </span>
                              <span className="italic font-medium">"{alert.patientStatement}"</span>
                            </div>
                          )}

                          {alert.detectedSymptoms && alert.detectedSymptoms.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              <span className="text-[11px] font-semibold text-slate-500">
                                Detected Symptoms:
                              </span>
                              {alert.detectedSymptoms.map((sym: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-900 text-[10px] font-bold"
                                >
                                  {sym}
                                </span>
                              ))}
                            </div>
                          )}

                          {alert.relevantContext && (
                            <p className="text-[11px] text-slate-600">
                              <span className="font-semibold text-slate-700">Relevant Context:</span> {alert.relevantContext}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                          <span className="text-[11px] text-slate-500">
                            Status: <strong className="uppercase">{alert.status}</strong>
                            {alert.resolutionNote && ` • ${alert.resolutionNote}`}
                          </span>

                          {alert.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => handleResolveAlert(alert.id)}
                              disabled={resolvingId === alert.id}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>
                                {resolvingId === alert.id ? "Resolving..." : "Acknowledge & Resolve Alert"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OCR Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddDocument={onAddDocument}
        patientId={selectedPatientId}
        isHighContrast={isHighContrast}
      />

      {/* 30s One-Page Clinical Brief & Side-by-Side Verifier Modal */}
      <ClinicalBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        summary={currentSummary}
        onUpdateSummary={onUpdateSummary}
        isHighContrast={isHighContrast}
      />

      {/* Vitals Capture Modal with Provenance & Normal Range Flags */}
      <VitalsCaptureModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        currentVitals={currentSummary.vitals}
        onSaveVitals={(vitals, measurements) => {
          const updated: PhysicianClinicalHistory = {
            ...currentSummary,
            vitals,
          };
          onUpdateSummary(updated);
        }}
        isHighContrast={isHighContrast}
      />
    </div>
  );
};
