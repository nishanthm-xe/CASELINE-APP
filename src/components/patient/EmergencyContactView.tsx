import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  AlertTriangle,
  PhoneCall,
  User,
  Heart,
  Home,
  Mail,
  Edit2,
  CheckCircle2,
  Save,
  Loader2,
} from 'lucide-react';

export const EmergencyContactView: React.FC = () => {
  const { user, setActiveModal, addToast, updateUserPatientData } = useApp();
  const patient = user?.patientData;
  const initialContact = patient?.emergencyContact;

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: initialContact?.name || 'Meera Sharma',
    relationship: initialContact?.relationship || 'Spouse',
    phoneNumber: initialContact?.phone || initialContact?.phoneNumber || '+91 9876543211',
    email: initialContact?.email || 'meera.s@example.com',
    address: initialContact?.address || 'Flat 402, Green Glen Heights, Bengaluru',
    bloodGroup: initialContact?.bloodGroup || 'B+',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setSubmitting(true);
    try {
      const res = await api.updateEmergencyContact(patient.id, formData);
      updateUserPatientData(res.patient);
      setIsEditing(false);
      addToast('Emergency contact details successfully updated!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update contact', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Lifeline Coordination</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Emergency Contact & Next of Kin</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            This contact receives automated SMS/telephonic dispatch alerts when you trigger 108 emergency workflows.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Contact'}</span>
        </button>
      </div>

      {/* Main Profile Card or Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        {!isEditing ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-xl">
                  {(formData.name || 'Emergency Contact').split(' ').filter(Boolean).map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{formData.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      {formData.relationship}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Primary Emergency Proxy</div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('emergency_call')}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Contact Now</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-slate-400 block text-[11px]">Direct Phone Number</span>
                <span className="text-sm font-mono font-bold text-slate-900">{formData.phoneNumber}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="text-sm font-semibold text-slate-900">{formData.email}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-slate-400 block text-[11px]">Blood Group (Donor Ready)</span>
                <span className="text-sm font-bold text-rose-600">{formData.bloodGroup}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-slate-400 block text-[11px]">Residential Address</span>
                <span className="text-xs font-semibold text-slate-900">{formData.address}</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship *</label>
                <input
                  type="text"
                  required
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{submitting ? 'Saving...' : 'Save Emergency Contact'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
