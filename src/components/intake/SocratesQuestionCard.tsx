import React, { useState } from 'react';
import { HelpCircle, Sparkles, ChevronDown, ChevronUp, Stethoscope, CheckCircle2 } from 'lucide-react';

export interface SocratesPhase {
  id: string;
  letter: 'S' | 'O' | 'C' | 'R' | 'A' | 'T' | 'E' | 'S';
  name: string;
  clinicalPurpose: string;
}

export const SOCRATES_PHASES: SocratesPhase[] = [
  { id: 'site', letter: 'S', name: 'Site', clinicalPurpose: 'Identifies primary anatomical focus and dermatomal localization.' },
  { id: 'onset', letter: 'O', name: 'Onset', clinicalPurpose: 'Differentiates acute emergency presentations from insidious or chronic conditions.' },
  { id: 'character', letter: 'C', name: 'Character', clinicalPurpose: 'Determines somatic, neuropathic, or visceral etiology.' },
  { id: 'radiation', letter: 'R', name: 'Radiation', clinicalPurpose: 'Detects nerve root compression or referred visceral ischemia (e.g. cardiac pain radiating to arm/jaw).' },
  { id: 'associations', letter: 'A', name: 'Associations', clinicalPurpose: 'Evaluates systemic involvement, autonomic response, and organ-specific signs.' },
  { id: 'timing', letter: 'T', name: 'Timing', clinicalPurpose: 'Assesses diurnal variation, periodicity, and duration profile.' },
  { id: 'exacerbating', letter: 'E', name: 'Exacerbating / Relieving', clinicalPurpose: 'Tests mechanical, postural, metabolic, or pharmacological triggers.' },
  { id: 'severity', letter: 'S', name: 'Severity', clinicalPurpose: 'Objectifies functional impairment and guides triage escalation.' },
];

interface SocratesQuestionCardProps {
  currentQuestion: string;
  activePhase?: 'S' | 'O' | 'C' | 'R' | 'A' | 'T' | 'E' | 'S' | 'site' | 'onset' | 'character' | 'radiation' | 'associations' | 'timing' | 'exacerbating' | 'severity';
  clinicalRationale?: string;
  quickReplies: string[];
  onSelectQuickReply: (reply: string) => void;
  languageName?: string;
}

export const SocratesQuestionCard: React.FC<SocratesQuestionCardProps> = ({
  currentQuestion,
  activePhase = 'S',
  clinicalRationale,
  quickReplies,
  onSelectQuickReply,
  languageName = 'English',
}) => {
  const [showRationale, setShowRationale] = useState(false);

  const activeSocrates =
    SOCRATES_PHASES.find((p) => p.id === activePhase || p.letter === activePhase) ||
    SOCRATES_PHASES[0];

  const defaultRationale =
    clinicalRationale ||
    `Doctors use the clinical ${activeSocrates.name} assessment to understand: ${activeSocrates.clinicalPurpose} This reduces consultation time and prevents missed critical diagnoses.`;

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-teal-500/30 shadow-lg space-y-4">
      {/* SOCRATES Stepper Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-teal-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
            Clinical SOCRATES Framework
          </span>
        </div>

        {/* Phase Pill Tracker */}
        <div className="flex items-center gap-1">
          {SOCRATES_PHASES.map((phase) => {
            const isActive = phase.id === activeSocrates.id;
            return (
              <span
                key={phase.id}
                title={`${phase.name}: ${phase.clinicalPurpose}`}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
                  isActive
                    ? 'bg-teal-400 text-slate-950 ring-2 ring-teal-300/50 scale-105'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {phase.letter}
              </span>
            );
          })}
        </div>
      </div>

      {/* Current Assistant Question */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Phase: {activeSocrates.name} ({activeSocrates.letter})
          </span>

          {/* "Why this question?" Tooltip / Toggle */}
          <button
            type="button"
            onClick={() => setShowRationale(!showRationale)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-teal-300 font-semibold transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why this question?</span>
            {showRationale ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Question Text */}
        <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
          "{currentQuestion}"
        </p>

        {/* Expandable Clinical Rationale */}
        {showRationale && (
          <div className="p-3 bg-teal-950/60 border border-teal-500/40 rounded-xl text-xs text-teal-100 space-y-1">
            <span className="font-bold text-teal-300 block">Physician Rationale:</span>
            <p className="leading-relaxed text-[11px]">{defaultRationale}</p>
          </div>
        )}
      </div>

      {/* Quick-Tap Pill Options */}
      {quickReplies.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Quick-Tap Responses (or speak into mic):</span>
            <span className="text-teal-300 font-semibold">{languageName}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectQuickReply(reply)}
                className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/40 text-xs font-semibold transition-all hover:scale-102 active:scale-98 text-left cursor-pointer shadow-xs"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
