import React from 'react';
import { useApp } from '../../lib/store';
import {
  Activity,
  ShieldCheck,
  Clock,
  Microscope,
  FlaskConical,
  Lock,
  Droplets,
  Hospital,
  Bot,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  FileText,
  FileCheck,
  Sparkles,
  Users,
  Stethoscope,
} from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const { setActiveModal, loginDemoPatient, loginDemoDoctor } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948808_1px,transparent_1px),linear-gradient(to_bottom,#0d948808_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-6 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Certified Healthcare Record Architecture & Consent OS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
                Your Health. <br />
                Your History. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-sky-600 to-indigo-600">
                  Your Complete Control.
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                CASE LINE unites your lifelong medical events into an interactive chronological timeline,
                provides consent-governed doctor access to biopsy and lab reports, coordinates rapid blood emergencies,
                and offers evidence-informed AI triage.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                <button
                  id="hero-get-started-btn"
                  onClick={() => setActiveModal('role_select')}
                  className="px-6 py-3.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/25 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-login-btn"
                  onClick={() => setActiveModal('login')}
                  className="px-5 py-3.5 text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  Sign In to Account
                </button>

                <button
                  id="hero-instant-demo-patient"
                  onClick={loginDemoPatient}
                  className="px-4 py-3.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Explore live patient dashboard with preloaded timeline, biopsy reports, and blood tracker"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Instant Patient Demo</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-6 border-t border-slate-200/70 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Patient-Controlled RBAC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Full Audit Trail</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Instant 108 Emergency Protocol</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive UI Showcase Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/90 relative"
              >
                {/* Header of mock card */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-sm">
                      RS
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Rajesh Sharma</span>
                        <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-bold border border-teal-200">
                          VERIFIED
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400">PT-000001 • 38 yrs • O+</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Consent Protected</span>
                  </div>
                </div>

                {/* Vertical Timeline Preview Snippet */}
                <div className="space-y-3 mb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Medical Timeline
                  </div>

                  <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200">
                    {/* Item 1 */}
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-teal-600 ring-4 ring-teal-50 flex items-center justify-center" />
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">Histopathology Excision Biopsy</span>
                          <span className="text-[10px] text-slate-400">May 18, 2024</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Dr. Ananya Roy • Clear margins, benign pleomorphic adenoma.
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-sky-500 ring-4 ring-sky-50" />
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">Comprehensive Metabolic Panel</span>
                          <span className="text-[10px] text-slate-400">Jan 10, 2024</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Normal liver function, HbA1c 5.6%, eGFR &gt; 90.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions on mock card */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={loginDemoPatient}
                    className="py-2 px-3 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors text-center"
                  >
                    Open Full Patient View
                  </button>
                  <button
                    onClick={loginDemoDoctor}
                    className="py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors text-center"
                  >
                    Open Doctor Portal
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/70">
              Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Eight Pillars of Modern Health Continuity
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Engineered to replace fragmented paper files with an immutable, patient-owned clinical record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: 'Vertical Medical Timeline',
                desc: 'Chronological visual stream of every consultation, diagnosis, surgery, and vital recorded across your lifetime.',
                color: 'teal',
              },
              {
                icon: Microscope,
                title: 'Biopsy & Histology Reports',
                desc: 'Structured biopsy records detailing specimen source, microscopic findings, margins, and diagnostic conclusions.',
                color: 'indigo',
              },
              {
                icon: FlaskConical,
                title: 'Diagnostic Lab Reports',
                desc: 'Integrated blood tests, lipid panels, and metabolic parameters with automated abnormal range flags.',
                color: 'sky',
              },
              {
                icon: Lock,
                title: 'Doctor Consent Control',
                desc: 'Patients maintain sovereign authority. Grant, deny, or revoke access to sensitive records with one click.',
                color: 'amber',
              },
              {
                icon: Droplets,
                title: 'Emergency Blood Dispatch',
                desc: 'Instant broadcast for all 8 blood groups with live blood bank stock tracking and hospital dispatch coordination.',
                color: 'rose',
              },
              {
                icon: Hospital,
                title: 'Free Health Camps',
                desc: 'Community health outreach locator with specialty filtering and 1-click patient registration.',
                color: 'emerald',
              },
              {
                icon: Bot,
                title: 'Clinical AI Assistant',
                desc: 'Evidence-informed triage for home care, symptom monitoring, and emergency escalation warnings.',
                color: 'cyan',
              },
              {
                icon: PhoneCall,
                title: 'Instant 108 Emergency',
                desc: 'One-touch emergency dispatch simulator with rapid telemetry handover of patient blood group & allergies.',
                color: 'red',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-900">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: 5-STEP PROCESS */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/70">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              How CASE LINE Safeguards Your Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Enroll & Verify',
                desc: 'Generate your permanent Patient ID (e.g. PT-000001) with emergency contact and identity safeguards.',
              },
              {
                step: '02',
                title: 'Doctor Uploads',
                desc: 'Accredited doctors upload consultation summaries, lab results, and biopsy specimens securely.',
              },
              {
                step: '03',
                title: 'Timeline Synthesis',
                desc: 'Events automatically arrange into a clean, searchable chronological medical timeline.',
              },
              {
                step: '04',
                title: 'Consent Governance',
                desc: 'Other doctors must submit consent requests before viewing sensitive diagnostics.',
              },
              {
                step: '05',
                title: 'Lifesaving Dispatch',
                desc: 'Broadcast emergency blood requirements and access immediate 108 ambulance coordination.',
              },
            ].map((s, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 relative">
                <div className="text-2xl font-black text-teal-600/30 mb-2 font-mono">{s.step}</div>
                <h4 className="font-bold text-sm text-slate-900 mb-1.5">{s.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY & CONSENT GUARANTEE SECTION */}
      <section id="privacy" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
                Sovereign Patient Privacy
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                Your medical data belongs to you. Always.
              </h2>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Unlike traditional hospital portals where records are trapped in proprietary silos,
                CASE LINE places the patient at the center. Doctors cannot view your sensitive biopsy reports
                or confidential lab results without your explicit, time-bounded permission.
              </p>

              <div className="mt-8 space-y-3.5">
                {[
                  'Granular permission toggles: Grant access for 24 hours, 7 days, or revoke immediately.',
                  'Detailed audit logging tracks exactly who accessed which record, when, and from which IP.',
                  'No biometric data collected or retained. Identity verified via mock UIDAI demo mechanism.',
                  'Role-Based Access Control enforced at the API and database policy layers.',
                ].map((pt, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-300 leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 bg-slate-800/80 rounded-3xl border border-slate-700 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-teal-400" />
                    <span className="font-bold text-sm text-white">Active Doctor Access Controls</span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-900/50 px-2 py-0.5 rounded">
                    ENFORCED
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Dr. Priya Sharma (Oncologist)</div>
                      <div className="text-[11px] text-slate-400">Requesting: Biopsy & Histopathology Reports</div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold">
                      GRANTED
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Dr. Vikram Rao (Cardiologist)</div>
                      <div className="text-[11px] text-slate-400">Requesting: ECG & Cardiac Enzymes</div>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-bold">
                      PENDING APPROVAL
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-800/60 text-[11px] text-teal-200">
                  Patients receive instant notification when a doctor requests record access and can revoke permissions at any moment.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-sky-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Take Ownership of Your Health Journey Today
          </h2>
          <p className="mt-3 text-sm sm:text-base text-teal-100 max-w-xl mx-auto">
            Experience the unified healthcare SaaS designed for patient sovereignty and seamless clinical collaboration.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveModal('patient_reg')}
              className="px-6 py-3 bg-white text-teal-900 font-bold text-xs rounded-xl shadow-lg hover:bg-teal-50 transition-all"
            >
              Enroll as New Patient
            </button>
            <button
              onClick={() => setActiveModal('doctor_reg')}
              className="px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl transition-all border border-teal-400/40"
            >
              Doctor Registration
            </button>
            <button
              onClick={loginDemoPatient}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl transition-all shadow-lg"
            >
              Launch Instant Demo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-10 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-200">CASE LINE Health OS</span>
            <span>• Comprehensive Healthcare SaaS Platform</span>
          </div>
          <div className="text-slate-500">
            © {new Date().getFullYear()} CASE LINE. All patient data simulated for demonstration.
          </div>
        </div>
      </footer>
    </div>
  );
};
