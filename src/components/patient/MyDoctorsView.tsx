import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Doctor } from '../../types';
import {
  Stethoscope,
  Hospital,
  Award,
  Calendar,
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const MyDoctorsView: React.FC = () => {
  const { setActiveTab, addToast } = useApp();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDoctors()
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = (doctorName: string) => {
    addToast(`Appointment booking request sent to ${doctorName}! Clinic coordinator will contact you shortly.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Authorized Medical Care Team</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">My Attending Physicians</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Specialists and consultants who have provided clinical evaluation and maintain consent credentials.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('privacy')}
          className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Lock className="w-4 h-4 text-teal-600" />
          <span>Audit Consent Permissions</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(doctors || []).map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <img
                  src={doc.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                  alt={doc.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-sm font-bold text-slate-900">{doc.fullName}</h3>
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 block">{doc.specialization}</span>
                  <span className="text-[11px] font-mono text-slate-400">{doc.doctorCode}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Hospital</span>
                  <span className="font-semibold text-slate-800 text-right">{doc.hospitalName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Qualifications</span>
                  <span className="font-semibold text-slate-800 text-right">{doc.qualification}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Experience</span>
                  <span className="font-semibold text-slate-800">{doc.experienceYears} Years</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Reg Number</span>
                  <span className="font-mono text-slate-700">{doc.registrationNumber}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => handleBook(doc.fullName)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs text-center"
              >
                Book Appointment
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                title="View Doctor Consent"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
