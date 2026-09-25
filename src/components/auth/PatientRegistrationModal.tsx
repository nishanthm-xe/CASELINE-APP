import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  X,
  User,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Home,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PatientRegistrationModal: React.FC = () => {
  const { activeModal, setActiveModal, login, addToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: 'Rajesh Sharma',
    dob: '1988-05-14',
    age: 38,
    gender: 'Male',
    mobile: '9876543210',
    email: 'rajesh.new@example.com',
    aadhaarNumber: '8492 5104 3912',
    bloodGroup: 'O+',
    // Contact
    address: 'Flat 402, Green Glen Heights, Outer Ring Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    // Emergency Contact
    emergencyName: 'Meera Sharma',
    emergencyRelation: 'Spouse',
    emergencyPhone: '9876543211',
    emergencyEmail: 'meera.s@example.com',
    emergencyAddress: 'Flat 402, Green Glen Heights, Bengaluru',
    emergencyBloodGroup: 'B+',
    // Password
    password: 'password123',
    confirmPassword: 'password123',
  });

  // Mock Aadhaar Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('8492');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  if (activeModal !== 'patient_reg') return null;

  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobVal = e.target.value;
    const calculated = calculateAge(dobVal);
    setFormData((prev) => ({ ...prev, dob: dobVal, age: calculated }));
  };

  const handleVerifyAadhaarMock = () => {
    setShowOtpModal(true);
  };

  const handleConfirmOtp = () => {
    setVerifyingOtp(true);
    setTimeout(() => {
      setVerifyingOtp(false);
      setAadhaarVerified(true);
      setShowOtpModal(false);
      addToast('Demo Aadhaar Identity successfully verified! (UIDAI mock)', 'success');
    }, 900);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.registerPatient(formData);
      addToast(`Patient account created! Patient ID: ${res.user.patientData.patientCode}`, 'success');
      // Auto login
      await login(formData.email, formData.password, 'patient');
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="patient-registration-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
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

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>New Patient Enrollment</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Create Patient Health Profile</h2>
          <p className="text-xs text-slate-600 mt-1">
            Build your private, lifelong medical repository and emergency profile.
          </p>

          {/* Stepper */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 1 ? 'text-teal-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
              <span>Personal Details</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-slate-200" />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 2 ? 'text-teal-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
              <span>Emergency Contact</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-slate-200" />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 3 ? 'text-teal-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>3</span>
              <span>Security</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Personal Details & Contact */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="e.g. Rajesh Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={handleDobChange}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Auto)</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.age}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e: any) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="10-digit mobile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e: any) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Demo Aadhaar Identity Section */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    Demo Identity Verification (Mock UIDAI)
                  </span>
                  {aadhaarVerified && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-sky-800 leading-tight mb-2">
                  Demo verification — not connected to UIDAI. No biometric or fingerprint data is collected.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-sky-300 bg-white font-mono"
                    placeholder="12-digit Aadhaar Number"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAadhaarMock}
                    disabled={aadhaarVerified}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      aadhaarVerified
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-2xs'
                    }`}
                  >
                    {aadhaarVerified ? 'Verified' : 'Verify via OTP'}
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="Street, apartment, locality"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="City"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="State"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <span>Next: Emergency Contact</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Emergency Contact */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Emergency contact information is vital for first responders and urgent blood coordination in clinical events.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship *</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="e.g. Spouse, Parent, Sibling"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="Emergency phone number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.emergencyEmail}
                    onChange={(e) => setFormData({ ...formData, emergencyEmail: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Landmark</label>
                  <input
                    type="text"
                    value={formData.emergencyAddress}
                    onChange={(e) => setFormData({ ...formData, emergencyAddress: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    placeholder="Residential address"
                  />
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
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <span>Next: Account Security</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Account Security */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password *</label>
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

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-slate-900">Security & Encryption Summary:</div>
                <div className="text-[11px] text-slate-600 leading-relaxed flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Unique Patient ID (e.g. PT-000001) will be generated.</span>
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Doctors cannot view private reports without explicit consent.</span>
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Passwords are salted & hashed server-side.</span>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{submitting ? 'Registering...' : 'Complete Registration & Open Dashboard'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </form>

        {/* Mock OTP Verification Modal */}
        <AnimatePresence>
          {showOtpModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 mx-auto flex items-center justify-center mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Demo OTP Verification</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Enter the demo verification OTP sent to your registered mobile ending in <strong>3210</strong>.
                </p>

                <div className="my-4">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-36 mx-auto px-4 py-2.5 text-center text-xl font-mono tracking-widest font-bold rounded-xl border-2 border-teal-500 bg-teal-50/50"
                  />
                  <div className="text-[10px] text-teal-700 mt-1 font-semibold">Demo auto-code: 8492</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmOtp}
                    disabled={verifyingOtp}
                    className="flex-1 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs flex items-center justify-center gap-1"
                  >
                    {verifyingOtp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{verifyingOtp ? 'Verifying...' : 'Verify OTP'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
