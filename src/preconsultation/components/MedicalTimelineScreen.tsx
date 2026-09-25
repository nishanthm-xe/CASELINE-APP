import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  Calendar,
  Clock,
  FileSpreadsheet,
  FileText,
  Filter,
  Hospital,
  Pill,
  Stethoscope,
  X,
  Upload,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { TimelineEvent, LanguageOption } from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";

interface MedicalTimelineScreenProps {
  events: TimelineEvent[];
  selectedLanguage: LanguageOption;
  onOpenUpload: () => void;
  onBackToDashboard: () => void;
  onContinueToIntake?: () => void;
  onProceedToSummary?: () => void;
}

export const MedicalTimelineScreen: React.FC<MedicalTimelineScreenProps> = ({
  events,
  selectedLanguage,
  onOpenUpload,
  onBackToDashboard,
  onContinueToIntake,
  onProceedToSummary,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);

  const categories = [
    "All",
    "Doctor Consultation",
    "Investigation",
    "Hospital Admission",
    "Lab Test",
  ];

  const filteredEvents =
    selectedFilter === "All"
      ? events
      : events.filter((e) => e.eventType === selectedFilter);

  // Group events by Year (2026, 2024, 2022, 2019)
  const groupedByYear = filteredEvents.reduce<Record<string, TimelineEvent[]>>(
    (acc, ev) => {
      const year = ev.date ? ev.date.substring(0, 4) : "2026";
      if (!acc[year]) acc[year] = [];
      acc[year].push(ev);
      return acc;
    },
    {}
  );

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  const getEventIcon = (type: string) => {
    switch (type) {
      case "Lab Test":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case "Doctor Consultation":
        return <Stethoscope className="w-4 h-4 text-sky-600" />;
      case "Prescription":
        return <Pill className="w-4 h-4 text-purple-600" />;
      case "Hospital Admission":
        return <Hospital className="w-4 h-4 text-rose-600" />;
      default:
        return <Activity className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div
      id="medical-timeline-screen"
      className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28"
    >
      {/* Top Header Card with Exact Breadcrumb & Female Avatar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <CaseLineAvatar
              size="md"
              character="female"
              mood="IDLE"
              pose="timeline"
              showStatusBadge={false}
            />
          </div>

          <div>
            {/* Exact Reference Breadcrumb */}
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <span className="text-slate-300">•</span>
              <div className="text-xs font-bold text-slate-400">
                Patient <span className="text-slate-300">/</span>{" "}
                <span className="text-sky-700 font-black">Medical Timeline</span>
              </div>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Medical Timeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Chronological sequence of your medical history & clinical consultations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenUpload}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Record</span>
          </button>
          {onProceedToSummary ? (
            <button
              type="button"
              id="timeline-proceed-summary-top-btn"
              onClick={onProceedToSummary}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Proceed to Clinical Summary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onContinueToIntake || onBackToDashboard}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Continue to Intake</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === cat
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Chronological Sequence Cards (Exact Reference Items) */}
      <div className="space-y-6">
        {sortedYears.map((year) => (
          <div key={year} className="space-y-3">
            {/* Year Badge */}
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-xl bg-sky-700 text-white font-black text-xs tracking-wider shadow-2xs">
                {year}
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Events for this Year */}
            <div className="relative border-l-2 border-sky-300 ml-4 sm:ml-5 space-y-4">
              {groupedByYear[year].map((evt) => (
                <div key={evt.id} className="relative pl-6 sm:pl-7 group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-[17px] top-3 w-8 h-8 rounded-full bg-white border-2 border-sky-500 group-hover:border-sky-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer">
                    {getEventIcon(evt.eventType)}
                  </div>

                  {/* Card */}
                  <div
                    onClick={() => setActiveEvent(evt)}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-slate-900">
                          {year} - {evt.title}
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                          {evt.eventType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{evt.date}</span>
                      </div>
                    </div>

                    {/* Hospital & Attending Doctor Badges */}
                    <div className="flex flex-wrap items-center gap-2 my-2 text-xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold">
                        <Hospital className="w-3.5 h-3.5 text-sky-600" />
                        <span>Hospital: {evt.institution}</span>
                      </div>

                      {evt.doctorName && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 text-sky-800 font-bold">
                          <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                          <span>Doctor: {evt.doctorName}</span>
                        </div>
                      )}
                    </div>

                    {/* Details: exact reference description */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-400 block mb-0.5">
                        Details:
                      </span>
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                        {evt.summary}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        {evt.diagnosis && (
                          <span className="text-[11px] font-bold text-slate-500">
                            Diagnosis: <strong className="text-slate-700">{evt.diagnosis}</strong>
                          </span>
                        )}
                      </div>

                      <span className="text-sky-600 font-bold flex items-center gap-1 hover:underline">
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Primary Action Button at Bottom */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
          {onProceedToSummary
            ? "Your medical timeline is synchronized with your health intake answers."
            : "Ready to answer clinical questions for your physician review?"}
        </div>
        {onProceedToSummary ? (
          <button
            type="button"
            id="timeline-proceed-summary-bottom-btn"
            onClick={onProceedToSummary}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to Clinical Summary →</span>
          </button>
        ) : (
          <button
            type="button"
            id="timeline-continue-intake-btn"
            onClick={onContinueToIntake || onBackToDashboard}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Continue to Intake →</span>
          </button>
        )}
      </div>

      {/* Modal Dialog for Event Details */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  {activeEvent.eventType}
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  {activeEvent.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {activeEvent.institution} • {activeEvent.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-extrabold text-slate-900 block mb-1">
                  Details:
                </span>
                <p className="leading-relaxed font-semibold">{activeEvent.summary}</p>
              </div>

              {activeEvent.diagnosis && (
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                  <span className="font-bold text-sky-900 block mb-0.5">
                    Recorded Diagnosis:
                  </span>
                  <p className="font-extrabold text-sky-800">
                    {activeEvent.diagnosis}
                  </p>
                </div>
              )}

              {activeEvent.doctorName && (
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Attending Physician:
                  </span>
                  <p className="font-medium text-slate-600">
                    {activeEvent.doctorName}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
