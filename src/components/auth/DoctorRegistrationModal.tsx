import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  X,
  Stethoscope,
  ShieldCheck,
  Award,
  Hospital,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

export const DoctorRegistrationModal: React.FC = () => {
  const { activeModal, setActiveModal, login, addToast } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedCertName, setUploadedCertName] = useState<string | null>('nmc_medical_council_certificate.pdf');

  const [formData, setFormData] = useState({
    fullName: 'Dr. Arjun Mehta',
    dob: '1982-11-20',
    gender: 'Male',
    mobile: '9845123456',
    email: 'arjun.mehta@example.com',
    registrationNumber: 'KMC-74291',
    specialization: 'Oncologist',
    qualification: 'MBBS, MD (Internal Medicine), DM (Medical Oncology)',
    experienceYears: 14,
    hospitalName: 'Manipal Comprehensive Cancer Center',
    hospitalAddress: '98 HAL Airport Road, Bengaluru',
    password: 'password123',
    confirmPassword: 'password123',
  });

  if (activeModal !== 'doctor_reg') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.registerDoctor({
        ...formData,
        certificateUrl: uploadedCertName,
      });
      addToast(`Doctor registration complete! ID: ${res.user.doctorData.doctorCode}`, 'success');
      await login(formData.email, formData.password, 'doctor');
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="doctor-registration-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 relative my-8"
      >
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Accreditation & Enrollment</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Practitioner Registration</h2>
          <p className="text-xs text-slate-600 mt-1">
            Access authorized patient longitudinal health records and provide consent-governed care.
          </p>

          <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
              <span>Credentials & Practice</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-slate-200" />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
              <span>Verification & Account</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="e.g. Dr. Arjun Mehta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Registration Number (Council) *</label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                    placeholder="e.g. KMC-74291 / MCI-48192"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Specialization *</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  >
                    {[
                      'Oncologist',
                      'Pathologist / Histopathologist',
                      'Cardiologist',
                      'General Physician',
                      'Orthopedic Surgeon',
                      'Neurologist',
                      'Gastroenterologist',
                      'Dermatologist',
                      'Pediatrician',
                      'Endocrinologist',
                    ].map((sp) => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications *</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="e.g. MBBS, MD, DM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Affiliated Hospital / Clinic *</label>
                  <input
                    type="text"
                    required
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="e.g. Manipal Hospital, Bengaluru"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic Address</label>
                  <input
                    type="text"
                    value={formData.hospitalAddress}
                    onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="Hospital campus street and city"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <span>Next: Certificate & Security</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="doctor@hospital.org"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Contact *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="10-digit mobile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Certificate Upload Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medical Registration Certificate (PDF or Image)
                </label>
                <div className="p-4 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/40 text-center hover:bg-indigo-50/70 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1.5" />
                  <div className="text-xs font-semibold text-indigo-950">
                    {uploadedCertName ? uploadedCertName : 'Click to select or drag & drop certificate'}
                  </div>
                  <div className="text-[11px] text-indigo-700/80 mt-0.5">
                    State Council registration or NMC practicing license
                  </div>
                  {uploadedCertName && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <FileCheck className="w-3.5 h-3.5" /> File Ready for Instant Evaluation
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{submitting ? 'Registering...' : 'Register Practitioner & Open Portal'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};
