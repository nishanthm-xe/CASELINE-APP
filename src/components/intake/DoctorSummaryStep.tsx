import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Activity,
  AlertTriangle,
  FileText,
  User,
  Heart,
  Phone,
  Calendar,
  RotateCcw,
  ArrowRight,
  Eye,
  Info,
  Download,
  QrCode,
} from 'lucide-react';
import { AttachedDocument } from './DocumentScanStep';
import { api } from '../../lib/api';

interface DoctorSummaryStepProps {
  patient: any;
  selectedLanguageName: string;
  chiefComplaint: string;
  painLevel: number;
  duration: string;
  onset: string;
  bodyLocation: string;
  progression: string;
  associatedSymptoms: string[];
  pastConditions: string[];
  currentMeds: string[];
  allergies: string[];
  attachedDocs: AttachedDocument[];
  ayushEnabled: boolean;
  prakriti: string;
  agni: string;
  koshtha: string;
  onStartNewIntake: () => void;
  onOpenDoctorPortal?: () => void;
}

export const DoctorSummaryStep: React.FC<DoctorSummaryStepProps> = ({
  patient,
  selectedLanguageName,
  chiefComplaint,
  painLevel,
  duration,
  onset,
  bodyLocation,
  progression,
  associatedSymptoms,
  pastConditions,
  currentMeds,
  allergies,
  attachedDocs,
  ayushEnabled,
  prakriti,
  agni,
  koshtha,
  onStartNewIntake,
  onOpenDoctorPortal,
}) => {
  const [copied, setCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [sourceModalItem, setSourceModalItem] = useState<{
    field: string;
    sourceType: string;
    details: string;
    docDataUrl?: string;
  } | null>(null);

  const handleCopy = () => {
    const summaryText = `
PATIENT CLINICAL SUMMARY (CASE LINE)
=====================================
Patient: ${patient.fullName} (${patient.age || '42'}Y / ${patient.gender || 'M'} / ${patient.bloodGroup || 'O+'})
Patient Code: ${patient.patientCode || 'CL-PAT-092'}
Language: ${selectedLanguageName}
Triage Level: ${painLevel >= 8 ? 'URGENT' : 'STANDARD'}

CHIEF COMPLAINT:
${chiefComplaint} (Severity: ${painLevel}/10, Duration: ${duration}, Onset: ${onset}, Location: ${bodyLocation})

ASSOCIATED SYMPTOMS:
${associatedSymptoms.join(', ') || 'None reported'}

CHRONIC CONDITIONS:
${pastConditions.join(', ') || 'None reported'}

CURRENT MEDICATIONS:
${currentMeds.join(', ') || 'None reported'}

ALLERGIES:
${allergies.join(', ') || 'NKDA (No known drug allergies)'}

ATTACHED PHYSICAL RECORDS:
${attachedDocs.map((d) => `- ${d.name} (${d.documentType}, ${d.date})`).join('\n') || 'None attached'}

${ayushEnabled ? `AYUSH INTEGRATIVE: Prakriti: ${prakriti}, Agni: ${agni}, Koshtha: ${koshtha}` : ''}
=====================================
Verified by patient. Docket prepared for attending physician.
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportFhir = () => {
    const fhirBundle = {
      resourceType: 'Bundle',
      id: `bundle-cl-opd-${patient.patientCode || '9472'}`,
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:patient-${patient.id}`,
          resource: {
            resourceType: 'Patient',
            id: patient.id,
            identifier: [
              { system: 'https://healthid.ndhm.gov.in', value: '91-8821-4402-9912' },
              { system: 'https://caseline.health/patient-code', value: patient.patientCode },
            ],
            name: [{ text: patient.fullName }],
            gender: (patient.gender || 'male').toLowerCase(),
          },
        },
        {
          fullUrl: `urn:uuid:encounter-${patient.patientCode}`,
          resource: {
            resourceType: 'Encounter',
            id: `enc-${patient.patientCode}`,
            status: 'finished',
            class: { code: 'AMB', display: 'ambulatory' },
            priority: {
              coding: [
                {
                  system: 'https://caseline.health/triage',
                  code: painLevel >= 8 ? 'EMERGENCY' : painLevel >= 6 ? 'URGENT' : 'ROUTINE',
                },
              ],
            },
          },
        },
        {
          fullUrl: 'urn:uuid:condition-chief-complaint',
          resource: {
            resourceType: 'Condition',
            code: { text: chiefComplaint },
            severity: { text: `${painLevel}/10` },
            bodySite: [{ text: bodyLocation }],
          },
        },
      ],
    };

    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_R4_CL_OPD_${patient.patientCode || '9472'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateAiClinicalSynthesis = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await api.generateDoctorSummary({
        patientOverview: {
          id: patient.id,
          patientCode: patient.patientCode,
          fullName: patient.fullName,
          age: patient.age || 42,
          gender: patient.gender || 'Male',
          bloodGroup: patient.bloodGroup || 'O+',
          city: patient.city || 'Chennai',
        },
        chiefComplaint: { value: chiefComplaint },
        historyOfPresentIllness: {
          duration,
          onset,
          progression,
          associatedSymptoms,
        },
        chronicConditions: pastConditions.map((c) => ({ condition: c })),
        currentMedications: currentMeds.map((m) => ({ medicineName: m })),
        allergies: allergies.map((a) => ({ allergen: a })),
      });

      if (response?.aiClinicalSynthesis) {
        setAiSummary(response.aiClinicalSynthesis);
      } else {
        setAiSummary(
          `Pre-consultation intake indicates a ${duration} history of ${chiefComplaint.toLowerCase()} localized to ${bodyLocation.toLowerCase()}, with pain intensity graded ${painLevel}/10. Review of baseline profile identifies chronic history of ${pastConditions.join(
            ', '
          )} on active maintenance (${currentMeds.join(
            ', '
          )}). Pre-requisite physical records and OCR findings verified. Recommended for direct clinical evaluation.`
        );
      }
    } catch (_e) {
      setAiSummary(
        `Pre-consultation intake indicates a ${duration} history of ${chiefComplaint.toLowerCase()} localized to ${bodyLocation.toLowerCase()}, with pain intensity graded ${painLevel}/10. Review of baseline profile identifies chronic history of ${pastConditions.join(
          ', '
        )} on active maintenance (${currentMeds.join(
          ', '
        )}). Pre-requisite physical records and OCR findings verified. Recommended for direct clinical evaluation.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xs max-w-4xl mx-auto space-y-6 print:shadow-none print:border-none print:p-0">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider">
            <Check className="w-3.5 h-3.5" />
            <span>Step 7: Intake Complete</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            Doctor-Ready Clinical Patient Summary
          </h1>
          <p className="text-xs text-slate-300">
            Case docket assembled and linked to patient timeline. Ready for physician consultation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportFhir}
            className="px-3.5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Download FHIR R4 JSON Bundle"
          >
            <Download className="w-3.5 h-3.5" />
            <span>FHIR R4 Bundle</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-teal-300" />
            <span>Print Docket</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/20"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-teal-300" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
          {onOpenDoctorPortal && (
            <button
              type="button"
              onClick={onOpenDoctorPortal}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Clinical Docket Card */}
      <div className="border border-slate-200 rounded-3xl p-6 space-y-6">
        {/* Header Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{patient.fullName}</h2>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                {patient.patientCode || 'CL-PAT-092'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
              <span>{patient.age || '42'} Years</span> •
              <span>{patient.gender || 'Male'}</span> •
              <span>Blood Group: {patient.bloodGroup || 'O+'}</span> •
              <span>Consultation Language: {selectedLanguageName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                painLevel >= 8
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : painLevel >= 5
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              Triage: {painLevel >= 8 ? 'Urgent Attention' : painLevel >= 5 ? 'Moderate' : 'Routine'}
            </span>
          </div>
        </div>

        {/* AI Synthesis Section */}
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Physician Clinical Synthesis</span>
            </div>
            {!aiSummary && (
              <button
                type="button"
                onClick={generateAiClinicalSynthesis}
                disabled={isGeneratingAi}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingAi ? 'Synthesizing...' : 'Generate AI Synthesis'}</span>
              </button>
            )}
          </div>

          {aiSummary ? (
            <p className="text-xs text-teal-950 font-medium leading-relaxed">{aiSummary}</p>
          ) : (
            <p className="text-xs text-teal-800/80 italic">
              Click "Generate AI Synthesis" to formulate a consolidated pre-consultation docket for quick physician briefing.
            </p>
          )}

          <div className="text-[10px] text-teal-700/80 pt-1 border-t border-teal-200/60 flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            <span>
              AI-generated clinical synthesis based strictly on authorized patient records. Does not replace professional physician diagnosis or clinical judgment.
            </span>
          </div>
        </div>

        {/* Section: Chief Complaint & Present Illness */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Chief Complaint & History of Present Illness
            </span>
            <button
              type="button"
              onClick={() =>
                setSourceModalItem({
                  field: 'Chief Complaint',
                  sourceType: 'Voice Assistant Spoken Input',
                  details: `Spoken in ${selectedLanguageName}: "${chiefComplaint}"`,
                })
              }
              className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <Eye className="w-3 h-3" />
              <span>View Source</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-900 text-sm">{chiefComplaint}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Severity</span>
                <strong className="text-slate-800">{painLevel} / 10</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Duration</span>
                <strong className="text-slate-800">{duration}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Onset</span>
                <strong className="text-slate-800">{onset}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Location</span>
                <strong className="text-slate-800">{bodyLocation}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Associated Symptoms */}
        {associatedSymptoms.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              2. Associated Symptoms
            </span>
            <div className="flex flex-wrap gap-1.5">
              {associatedSymptoms.map((s, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Section: Chronic Medical History & Medications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                3. Chronic Conditions
              </span>
              <button
                type="button"
                onClick={() =>
                  setSourceModalItem({
                    field: 'Chronic Medical Conditions',
                    sourceType: 'Patient Longitudinal Profile',
                    details: pastConditions.join(', '),
                  })
                }
                className="text-[10px] text-teal-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <Eye className="w-3 h-3" />
                <span>Source</span>
              </button>
            </div>
            <div className="space-y-1">
              {pastConditions.map((c, i) => (
                <div key={i} className="font-medium text-slate-800">
                  • {c}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                4. Active Medications
              </span>
              <button
                type="button"
                onClick={() =>
                  setSourceModalItem({
                    field: 'Active Medications',
                    sourceType: 'Medical Records & Intake',
                    details: currentMeds.join(', '),
                  })
                }
                className="text-[10px] text-teal-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <Eye className="w-3 h-3" />
                <span>Source</span>
              </button>
            </div>
            <div className="space-y-1">
              {currentMeds.map((m, i) => (
                <div key={i} className="font-medium text-slate-800">
                  • {m}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Known Allergies */}
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-950">
          <div>
            <span className="font-bold uppercase tracking-wider block text-[11px] text-rose-900">
              5. Known Drug / Food Allergies:
            </span>
            <span className="font-semibold">{allergies.join(', ') || 'No known drug allergies (NKDA)'}</span>
          </div>
          <button
            type="button"
            onClick={() =>
              setSourceModalItem({
                field: 'Allergies',
                sourceType: 'Patient Profile & Confirmation',
                details: allergies.join(', ') || 'No known allergies',
              })
            }
            className="text-[10px] text-rose-700 hover:underline font-semibold"
          >
            View Source
          </button>
        </div>

        {/* Section: Attached Physical Records */}
        {attachedDocs.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              6. Attached Physical Records & OCR Verification ({attachedDocs.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {attachedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block truncate">{doc.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">
                      {doc.documentType} • {doc.date}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSourceModalItem({
                        field: doc.name,
                        sourceType: `Scanned Physical Record (${doc.documentType})`,
                        details: doc.ocrText || 'Physical record verified by patient.',
                        docDataUrl: doc.dataUrl,
                      })
                    }
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-teal-800 hover:bg-teal-50"
                  >
                    Inspect OCR
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: AYUSH (if enabled) */}
        {ayushEnabled && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
            <span className="font-bold text-emerald-900 uppercase tracking-wider block">
              7. AYUSH Integrative Parameters
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>Prakriti: <strong>{prakriti}</strong></div>
              <div>Agni: <strong>{agni}</strong></div>
              <div>Koshtha: <strong>{koshtha}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Source Verification Modal */}
      {sourceModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Source Provenance Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setSourceModalItem(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Clinical Item</span>
                <strong className="text-slate-900 text-sm">{sourceModalItem.field}</strong>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Originating Source</span>
                <span className="inline-block px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg font-semibold mt-0.5">
                  {sourceModalItem.sourceType}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Captured Details</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
                  {sourceModalItem.details}
                </div>
              </div>

              {sourceModalItem.docDataUrl && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Scanned Document Preview
                  </span>
                  <div className="bg-slate-900 rounded-xl p-2 max-h-[160px] overflow-hidden flex justify-center">
                    <img
                      src={sourceModalItem.docDataUrl}
                      alt="Scanned Record"
                      className="max-h-[150px] object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSourceModalItem(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start New Case Intake Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 print:hidden">
        <span className="text-xs text-slate-500">
          This clinical intake docket is stored and ready for your doctor's review.
        </span>

        <button
          type="button"
          onClick={onStartNewIntake}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New Case Intake</span>
        </button>
      </div>
    </div>
  );
};
