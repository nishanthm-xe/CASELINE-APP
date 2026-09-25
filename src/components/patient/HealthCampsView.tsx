import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { HealthCamp } from '../../types';
import {
  Hospital,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  CheckCircle,
  CheckCircle2,
  Navigation,
  Sparkles,
  Users,
  Building,
} from 'lucide-react';

export const HealthCampsView: React.FC = () => {
  const { user, addToast } = useApp();
  const patient = user?.patientData;

  const [camps, setCamps] = useState<HealthCamp[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [registeredCampIds, setRegisteredCampIds] = useState<string[]>([]);

  const specialties = [
    { id: 'ALL', label: 'All Camps' },
    { id: 'General Medicine', label: 'General Medicine' },
    { id: 'Cardiology & Diabetes', label: 'Cardiology' },
    { id: 'Ophthalmology', label: 'Eye Care' },
    { id: 'Women Health', label: "Women's Health" },
    { id: 'Pediatric Care', label: 'Pediatric' },
    { id: 'Geriatric Care', label: 'Senior Care' },
  ];

  const fetchCamps = async () => {
    try {
      const data = await api.getHealthCamps(selectedSpecialty === 'ALL' ? undefined : selectedSpecialty);
      setCamps(Array.isArray(data) ? data : []);

      if (patient?.id) {
        const regs = await api.getHealthCampRegistrations(patient.id);
        if (Array.isArray(regs)) {
          setRegisteredCampIds(regs.map((r: any) => r.campId));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, [selectedSpecialty, patient?.id]);

  const handleRegister = async (campId: string, title: string) => {
    if (!patient) return;
    try {
      await api.registerHealthCamp(campId, patient.id);
      setRegisteredCampIds((prev) => [...prev, campId]);
      addToast(`Successfully registered for ${title}! Slot confirmed.`, 'success');
      fetchCamps();
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider">
            <Hospital className="w-4 h-4" />
            <span>Community Health Outreach</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Free Healthcare Camps & Screenings</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Locate sponsored preventive screenings, free physician consultations, and medication distribution camps.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {specialties.map((sp) => (
            <button
              key={sp.id}
              onClick={() => setSelectedSpecialty(sp.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSpecialty === sp.id
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(camps || []).map((camp: any) => {
          const title = camp.title || camp.name || 'Free Health Camp';
          const venue = camp.venue || camp.location || 'Community Health Hub';
          const time = camp.time || (camp.startTime && camp.endTime ? `${camp.startTime} - ${camp.endTime}` : '09:00 AM - 04:00 PM');
          const services = Array.isArray(camp.servicesOffered)
            ? camp.servicesOffered
            : ['General Consultation', 'Preventive Screening', 'Free Medication Dispensing'];
          const doctors = Array.isArray(camp.doctorsAttending)
            ? camp.doctorsAttending
            : ['Dr. Priya Sharma, MD', 'Volunteer Clinical Staff'];

          return (
            <div
              key={camp.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      {camp.specialization}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{title}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xl">
                    {camp.date}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Organized By</span>
                    <span className="font-semibold text-slate-800">{camp.organizer}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Venue & City</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{venue}</span>
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Time Interval</span>
                    <span className="font-semibold text-slate-800">{time}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Available Slots</span>
                    <span className="font-bold text-teal-700">{camp.availableSlots} remaining</span>
                  </div>

                  {/* Services Offered */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Services Offered:</span>
                    <div className="flex flex-wrap gap-1">
                      {services.map((svc: string, i: number) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Attending Doctors */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Attending Physicians:</span>
                    <p className="text-[11px] text-slate-700">{doctors.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
                {registeredCampIds.includes(camp.id) || camp.isRegistered ? (
                  <button
                    disabled
                    className="flex-1 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold text-center cursor-default flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Registered & Slot Confirmed</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegister(camp.id, title)}
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs text-center"
                  >
                    1-Click Register for Free
                  </button>
                )}
                <button
                  onClick={() => addToast(`Opening map directions to ${venue}...`, 'info')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5 text-teal-600" />
                  <span>Directions</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
