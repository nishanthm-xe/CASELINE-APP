import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Language } from '../../types';
import {
  Sparkles,
  Languages,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  X,
  Send,
  Loader2,
  Stethoscope,
  HeartHandshake,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialReportText?: string;
  reportType?: string;
}

const SAMPLE_REPORTS = [
  {
    title: 'Complete Blood Count (CBC) & Metabolic Panel',
    type: 'Lab Report',
    text: `CLINICAL LAB REPORT
Patient: Rajesh Sharma | Age: 42 | Gender: Male
HbA1c: 7.8 % (Elevated; Normal < 5.7%)
Fasting Plasma Glucose: 148 mg/dL (Elevated; Normal 70-99 mg/dL)
Hemoglobin: 14.2 g/dL (Normal: 13.5-17.5 g/dL)
Total WBC Count: 11,200 cells/mcL (Mildly elevated; Normal 4,000-11,000)
Serum Creatinine: 0.9 mg/dL (Normal: 0.7-1.3 mg/dL)
eGFR: > 90 mL/min/1.73m2 (Normal kidney function)
Lipid Profile: Total Cholesterol 210 mg/dL, LDL 135 mg/dL, HDL 42 mg/dL.`,
  },
  {
    title: 'Excision Biopsy Histopathology',
    type: 'Biopsy Report',
    text: `HISTOPATHOLOGY EXAMINATION REPORT
Specimen: Left Breast Core Needle Biopsy
Clinical Impression: Palpable firm mobile nodule, Upper Outer Quadrant (2.1 cm).
Microscopic Examination:
Sections show proliferation of both glandular epithelial elements and stromal connective tissue.
Stromal cells show intracanalicular and pericanalicular pattern without nuclear atypia, mitotic figures, or necrosis.
No evidence of ductal carcinoma in situ (DCIS) or invasive malignancy.
Surgical margins are clear.
DIAGNOSIS: Consistent with Benign Fibroadenoma.`,
  },
];

export const AIReportExplainerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialReportText,
  reportType = 'lab',
}) => {
  const { language, setLanguage, addToast, t } = useApp();
  const [reportInput, setReportInput] = useState(initialReportText || SAMPLE_REPORTS[0].text);
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'en');
  const [explaining, setExplaining] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (initialReportText) {
      setReportInput(initialReportText);
    }
  }, [initialReportText]);

  useEffect(() => {
    if (isOpen && reportInput) {
      handleAnalyze(selectedLang);
    }
  }, [isOpen]);

  const handleAnalyze = async (targetLang = selectedLang) => {
    if (!reportInput.trim()) {
      addToast('Please input report text to analyze', 'error');
      return;
    }

    setExplaining(true);
    try {
      const res = await api.explainReport({ text: reportInput, reportType }, targetLang);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to analyze report', 'error');
    } finally {
      setExplaining(false);
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setSelectedLang(newLang);
    handleAnalyze(newLang);
  };

  if (!isOpen) return null;

  return (
    <div id="ai-report-explainer-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-sky-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-100 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>AI Clinical Report Explainer</span>
                <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  Gemini 2.5 Flash
                </span>
              </h2>
              <p className="text-xs text-teal-100">
                Transforms complex medical findings, biopsy markers, and lab values into clear plain language.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-white/20 p-1 rounded-xl text-xs">
              <Languages className="w-3.5 h-3.5 text-teal-100 ml-1.5" />
              {(['en', 'ta', 'hi'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    selectedLang === lang
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}
                </button>
              ))}
            </div>

            <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Sample quick picks */}
          <div>
            <div className="text-slate-500 font-semibold mb-1.5 flex items-center justify-between">
              <span>Quick Sample Medical Reports:</span>
              <span className="text-[11px] text-teal-600">Or paste your clinical report text below</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_REPORTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setReportInput(sample.text);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 rounded-lg text-slate-700 font-medium border border-slate-200 text-xs transition-colors"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Report Input Area */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">Lab / Biopsy / Diagnostic Text</label>
            <textarea
              rows={4}
              value={reportInput}
              onChange={(e) => setReportInput(e.target.value)}
              placeholder="Paste laboratory results, blood analysis, biopsy findings or ultrasound conclusions here..."
              className="w-full p-3 font-mono text-[11px] border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 bg-slate-50"
            />
            <div className="flex justify-end">
              <button
                onClick={() => handleAnalyze(selectedLang)}
                disabled={explaining}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                {explaining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Clinical Findings...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Explain in {selectedLang === 'en' ? 'English' : selectedLang === 'ta' ? 'Tamil' : 'Hindi'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Structured Analysis Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-2 border-t border-slate-200"
            >
              {/* Plain Language Summary */}
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Plain-Language Patient Summary</span>
                </div>
                <p className="text-slate-800 text-xs leading-relaxed font-medium">
                  {result.summary}
                </p>
              </div>

              {/* Key Findings & Abnormalities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Findings */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Key Clinical Observations</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {result.keyFindings?.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Flagged / Abnormalities */}
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Parameters Requiring Review</span>
                  </div>
                  <ul className="space-y-1 text-amber-800 list-disc list-inside">
                    {result.abnormalOrFlagged?.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Questions for Doctor */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>Questions to Ask Your Doctor</span>
                </div>
                <ul className="space-y-1 text-indigo-800 list-disc list-inside">
                  {result.questionsForDoctor?.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              {/* Safe Lifestyle Guidance */}
              {result.safeLifestyleGuidance && result.safeLifestyleGuidance.length > 0 && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <span>General Supportive Wellness Guidance</span>
                  </div>
                  <ul className="space-y-1 text-emerald-800 list-disc list-inside">
                    {result.safeLifestyleGuidance?.map((g: string, i: number) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Critical Safety Disclaimer */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 text-[11px] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Medical Disclaimer:</strong> {result.disclaimer || 'This AI analysis is for educational and informational interpretation only. It does NOT establish a doctor-patient relationship, prescribe medication, or substitute for consultation with a licensed medical professional.'}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
          >
            Close Explainer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
