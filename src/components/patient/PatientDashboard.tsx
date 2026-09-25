import React, { useEffect, useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  MedicalTimelineEvent,
  MedicalRecord,
  BiopsyReport,
  LabReport,
  Doctor,
  BloodEmergencyRequest,
} from '../../types';
import {
  User,
  ShieldCheck,
  Clock,
  ClipboardList,
  Microscope,
  FlaskConical,
  Stethoscope,
  Droplets,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
  PhoneCall,
  Lock,
  ChevronRight,
  ExternalLink,
  Activity,
  FileCheck2,
  ScanLine,
  Mic,
  Layers,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { LoadingState, EmptyState } from '../common/ViewState';
import { getLanguageByCode } from '../../lib/languages';

export const PatientDashboard: React.FC = () => {
  const { user, setActiveTab, setActiveModal, language } = useApp();
  const patient = user?.patientData;

  const currentLangCode = (() => {
    try {
      return localStorage.getItem('caseline_preferred_language') || localStorage.getItem('caseline_lang') || language || 'ta';
    } catch {
      return language || 'ta';
    }
  })();
  const currentLangObj = getLanguageByCode(currentLangCode);
  const currentLanguageName = `${currentLangObj.nativeName} (${currentLangObj.displayName})`;

  const [timeline, setTimeline] = useState<MedicalTimelineEvent[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [biopsies, setBiopsies] = useState<BiopsyReport[]>([]);
  const [labs, setLabs] = useState<LabReport[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bloodReqs, setBloodReqs] = useState<BloodEmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient) return;
    const loadDashboardData = async () => {
      try {
        const [tl, rec, bio, lb, doc, bReq] = await Promise.all([
          api.getTimeline(patient.id).catch(() => []),
          api.getRecords(patient.id).catch(() => []),
          api.getBiopsyReports(patient.id).catch(() => ({ reports: [] })),
          api.getLabReports(patient.id).catch(() => []),
          api.getDoctors().catch(() => []),
          api.getBloodEmergencies(patient.id).catch(() => []),
        ]);
        setTimeline(Array.isArray(tl) ? tl : []);
        setRecords(Array.isArray(rec) ? rec : []);
        setBiopsies(Array.isArray(bio?.reports) ? bio.reports : Array.isArray(bio) ? bio : []);
        setLabs(Array.isArray(lb) ? lb : []);
        setDoctors(Array.isArray(doc) ? doc : []);
        setBloodReqs(Array.isArray(bReq) ? bReq : []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [patient]);

  if (!patient) {
    return (
      <EmptyState
        icon={User}
        title="Patient Profile Not Found"
        description="Please select or log in to your verified patient account to access your sovereign health records and case-taking workflow."
        actionText="Log In as Patient"
        onAction={() => setActiveModal('login')}
      />
    );
  }

  if (loading) {
    return (
      <LoadingState
        message="Loading your health overview..."
        subtext="Securely fetching your sovereign medical timeline, reports, active prescriptions, and case-taking history."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. WELCOME BANNER */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-sky-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-600/60 text-teal-200 text-xs font-semibold mb-3 border border-teal-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Lifelong Health Vault Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {patient.fullName} 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-teal-100 leading-relaxed">
            Here's an overview of your health journey. All your medical records, biopsy diagnostics,
            and doctor authorizations are safely encrypted under your personal sovereign control.
          </p>
        </div>
      </div>

      {/* PRE-CONSULTATION CLINICAL INTAKE & DOCUMENT SCAN HERO ACTION CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-7 border border-teal-500/30 shadow-lg text-white space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider">
              <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Unified Pre-Consultation Flow</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Pre-Consultation Clinical Intake & Document Scan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Complete your intake interview and digitize prior medical records before meeting your physician. Spoken symptoms and scanned physical reports are synthesized into one verified, doctor-ready clinical docket.
            </p>
          </div>

          {/* Language & Safety Pill */}
          <div className="shrink-0 flex flex-col sm:items-end gap-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-slate-400">Intake Language:</span>
              <span className="text-teal-300 font-bold text-xs">{currentLanguageName}</span>
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span>Doctor-supervised • Red-flag triage</span>
            </span>
          </div>
        </div>

        {/* The Two Connected Primary Action Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-stretch">
          {/* Action 1: Clinical Intake */}
          <div className="bg-slate-900/80 border border-teal-500/30 hover:border-teal-400/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400">Step 1</span>
                    <h3 className="text-base font-bold text-white">Clinical Intake</h3>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Voice + Touch + Text
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Speak or type symptoms in your preferred language. AI guides adaptive questions for pain location, severity, duration, medications, and red-flag alerts.
              </p>

              <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Adaptive questioning (avoids repetitive questions)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Automatic red-flag emergency symptom detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Patient reviews & confirms answers before submission</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('case_taking')}
                className="w-full px-5 py-3 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Start Clinical Intake</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Action 2: Document Scan */}
          <div className="bg-slate-900/80 border border-teal-500/30 hover:border-teal-400/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center shrink-0">
                    <ScanLine className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400">Step 2</span>
                    <h3 className="text-base font-bold text-white">Document Scan</h3>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Upload / Camera + OCR
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Scan prior prescriptions, lab tests, biopsy reports, or discharge summaries. Automated OCR extracts dates, dosages, and diagnostic values for patient review.
              </p>

              <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Supports Camera, PDF, JPG, and PNG uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Extracts diagnosis, medicines, lab values & dosages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Unverified until patient checks & confirms details</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('scan_document')}
                className="w-full px-5 py-3 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 hover:border-white/30 shadow-md flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <ScanLine className="w-4 h-4 text-teal-300" />
                <span>Scan Physical Records</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Workflow Synthesis: VOICE/TOUCH + DOCUMENTS -> COMBINED HISTORY -> DOCTOR-READY SUMMARY */}
        <div className="relative z-10 pt-4 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-teal-300 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Connected Pre-Consultation Flow</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
              Automatically synthesized into consulting doctor's docket
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider truncate">
                  Voice / Touch Intake
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Adaptive symptoms & pain
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
                <ScanLine className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider truncate">
                  Medical Documents
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  OCR scan & patient check
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider truncate">
                  Combined History
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Symptoms + lab evidence
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider truncate">
                  Doctor-Ready Summary
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Structured OPD case docket
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Medical Ethics Notice */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Clinical Decision Support Prototype • All OCR is verified by patient before physician review</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Emergency symptoms trigger immediate 112 / 108 SOS assistance
            </span>
          </div>
        </div>
      </div>

      {/* 2. PATIENT PROFILE CARD & QUICK STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Profile Details Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-base">
                  {patient.fullName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{patient.fullName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                      VERIFIED
                    </span>
                  </div>
                  <div className="text-xs font-mono text-teal-600 font-semibold">{patient.patientCode}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Age & Gender</span>
                <span className="font-semibold text-slate-800">{patient.age} yrs • {patient.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Date of Birth</span>
                <span className="font-semibold text-slate-800">{patient.dob}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Blood Group</span>
                <span className="font-bold text-rose-600 px-2 py-0.5 bg-rose-50 rounded border border-rose-100">
                  {patient.bloodGroup}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Location</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-teal-600" />
                  <span>{patient.city}, {patient.state}</span>
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Aadhaar (Masked)</span>
                <span className="font-mono text-slate-700">•••• •••• 3912</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100">
            <button
              id="patient-profile-full-view-btn"
              onClick={() => setActiveTab('profile')}
              className="w-full py-2 px-3 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Full Health Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Animated Metric Stat Cards */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Medical Records',
              count: records.length || 6,
              icon: ClipboardList,
              color: 'teal',
              tab: 'records',
              subtext: 'Consultations & notes',
            },
            {
              label: 'Biopsy Reports',
              count: biopsies.length || 2,
              icon: Microscope,
              color: 'indigo',
              tab: 'biopsy',
              subtext: 'Histology & tissue exams',
            },
            {
              label: 'Lab Reports',
              count: labs.length || 4,
              icon: FlaskConical,
              color: 'sky',
              tab: 'lab',
              subtext: 'Blood, CBC, & Lipids',
            },
            {
              label: 'My Doctors',
              count: doctors.length || 3,
              icon: Stethoscope,
              color: 'emerald',
              tab: 'doctors',
              subtext: 'Attending specialists',
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                onClick={() => setActiveTab(stat.tab)}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors flex items-center justify-center shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                    {stat.count}
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{stat.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{stat.subtext}</div>
                </div>
              </div>
            );
          })}

          {/* Quick Action Hub & Ecosystem Shortcuts */}
          <div className="col-span-2 sm:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Smart Health Ecosystem Tools:</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Instant Access</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setActiveModal('emergency_sos')}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 shadow-2xs flex flex-col items-start gap-1 transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span>Emergency SOS</span>
                </div>
                <span className="text-[10px] font-normal text-rose-600/80">Broadcast trauma alert</span>
              </button>

              <button
                onClick={() => setActiveTab('emergency_qr')}
                className="p-2.5 bg-white hover:bg-teal-50 text-teal-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs flex flex-col items-start gap-1 transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Emergency QR</span>
                </div>
                <span className="text-[10px] font-normal text-slate-500">First-responder access</span>
              </button>

              <button
                onClick={() => setActiveTab('medications')}
                className="p-2.5 bg-white hover:bg-teal-50 text-teal-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs flex flex-col items-start gap-1 transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Medication Rx</span>
                </div>
                <span className="text-[10px] font-normal text-slate-500">Adherence & reminders</span>
              </button>

              <button
                onClick={() => setActiveTab('vitals')}
                className="p-2.5 bg-white hover:bg-teal-50 text-teal-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs flex flex-col items-start gap-1 transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Health Trends</span>
                </div>
                <span className="text-[10px] font-normal text-slate-500">BP, Sugar, SpO2 logs</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/60">
              <button
                onClick={() => setActiveTab('insurance')}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold rounded-xl border border-indigo-200 shadow-2xs flex items-center gap-1.5"
              >
                <span>🛡️ Medical Insurance</span>
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5"
              >
                <span>📅 Book Doctor</span>
              </button>
              <button
                onClick={() => setActiveTab('family')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5"
              >
                <span>👨‍👩‍👧 Family Hub</span>
              </button>
              <button
                onClick={() => setActiveModal('report_explainer')}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 shadow-2xs flex items-center gap-1.5"
              >
                <span>✨ AI Report Explainer</span>
              </button>
              <button
                onClick={() => setActiveModal('medical_summary')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5"
              >
                <span>📄 Doctor Patient Summary</span>
              </button>
              <button
                id="dash-scan-document-btn"
                onClick={() => setActiveTab('scan_document')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition"
              >
                <span>📷 Scan / Import Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VERTICAL TIMELINE PREVIEW & ACTIVE EMERGENCY BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Vertical Timeline Preview (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Recent Medical Timeline</h3>
                <p className="text-[11px] text-slate-500">Chronological history of diagnoses & reports</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('timeline')}
              className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View All ({timeline.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200/80">
            {(timeline || []).slice(0, 3).map((event: any) => (
              <div key={event.id} className="relative group">
                <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-teal-600 ring-4 ring-teal-50" />
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-teal-50/20 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{event.title}</span>
                    <span className="text-[11px] font-mono text-slate-500">{event.eventDate || event.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{event.description}</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      {event.doctorName} • <span className="font-medium text-slate-700">{event.hospitalName}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-100/70 text-teal-800 font-semibold uppercase text-[10px]">
                      {event.category || event.eventType || 'Medical Event'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Emergency Blood & Health Camps Preview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Blood Requests */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-xs text-slate-900">Blood Emergency Status</span>
              </div>
              <button
                onClick={() => setActiveTab('blood')}
                className="text-xs text-teal-600 hover:underline font-semibold"
              >
                Track
              </button>
            </div>

            {bloodReqs.length > 0 ? (
              <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-950">
                    {bloodReqs[0].bloodGroup} ({bloodReqs[0].unitsRequired} Units)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-600 text-white">
                    {bloodReqs[0].status}
                  </span>
                </div>
                <div className="text-[11px] text-rose-800">
                  Hospital: <strong>{bloodReqs[0].hospitalName}</strong>
                </div>
                <div className="text-[10px] text-rose-600 font-mono">
                  Requested: {new Date(bloodReqs[0].createdAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">
                No active blood emergency requests.
              </div>
            )}
          </div>

          {/* Emergency Contact Quick Widget */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Next of Kin Emergency Contact
            </div>
            <div className="text-sm font-bold text-white">
              {patient.emergencyContact?.name || 'Meera Sharma'} ({patient.emergencyContact?.relationship || 'Spouse'})
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1">
              {patient.emergencyContact?.phone || patient.emergencyContact?.phoneNumber || '+91 9876543211'}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => setActiveModal('emergency_call')}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Next-of-Kin</span>
              </button>
              <button
                onClick={() => setActiveTab('emergency')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
