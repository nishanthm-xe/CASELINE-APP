import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  FileText,
  Filter,
  Hospital,
  Pill,
  Stethoscope,
  X,
} from "lucide-react";
import { TimelineEvent } from "../types";

interface MedicalTimelineViewProps {
  events: TimelineEvent[];
  onOpenUpload?: () => void;
  isHighContrast?: boolean;
}

export const MedicalTimelineView: React.FC<MedicalTimelineViewProps> = ({
  events,
  onOpenUpload,
  isHighContrast = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);

  const categories = ["All", "Lab Test", "Doctor Consultation", "Prescription", "Hospital Admission", "Investigation"];

  const filteredEvents =
    selectedFilter === "All"
      ? events
      : events.filter((e) => e.eventType === selectedFilter);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "Lab Test":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case "Doctor Consultation":
        return <Stethoscope className="w-4 h-4 text-cyan-600" />;
      case "Prescription":
        return <Pill className="w-4 h-4 text-purple-600" />;
      case "Hospital Admission":
        return <Hospital className="w-4 h-4 text-rose-600" />;
      default:
        return <Activity className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-xl text-slate-900">
              Chronological Medical Timeline
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-cyan-100 text-cyan-800">
              {events.length} Historical Events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Previous medical admissions, consultations, tests, and prescription changes
          </p>
        </div>

        {onOpenUpload && (
          <button
            type="button"
            onClick={onOpenUpload}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === cat
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-6 pb-6">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="relative pl-6 sm:pl-8 group">
            {/* Timeline Node dot */}
            <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-white border-2 border-slate-300 group-hover:border-cyan-600 flex items-center justify-center shadow-xs transition-colors cursor-pointer">
              {getEventIcon(evt.eventType)}
            </div>

            {/* Event Card */}
            <div
              onClick={() => setActiveEvent(evt)}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-cyan-400 hover:shadow-sm cursor-pointer transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {evt.eventType}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{evt.date}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-2">{evt.summary}</p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span className="font-medium text-slate-700">{evt.institution}</span>
                {evt.doctorName && <span>• {evt.doctorName}</span>}
                {evt.abnormalValuesCount && evt.abnormalValuesCount > 0 && (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {evt.abnormalValuesCount} Abnormal Value(s)
                  </span>
                )}
                {evt.medicinesCount && (
                  <span className="text-purple-700 font-medium">
                    {evt.medicinesCount} Medicines Prescribed
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Drawer/Modal */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {activeEvent.eventType}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {activeEvent.title}
                </h3>
                <p className="text-xs text-slate-500">{activeEvent.institution} • {activeEvent.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Clinical Summary:</span>
                <p>{activeEvent.summary}</p>
              </div>

              {activeEvent.diagnosis && (
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Recorded Diagnosis:</span>
                  <p className="font-semibold text-cyan-800">{activeEvent.diagnosis}</p>
                </div>
              )}

              {activeEvent.doctorName && (
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Attending Physician:</span>
                  <p>{activeEvent.doctorName}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
