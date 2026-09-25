import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  InsuranceProfile,
  InsuranceClaim,
  InsuranceDocument,
  ClaimStatus,
  PolicyStatus,
  AIPolicyExplanation,
} from '../../types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Upload,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Mail,
  Hospital,
  DollarSign,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Download,
  AlertTriangle,
  Receipt,
  Lock,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  Search,
  FileCheck,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MedicalInsuranceView: React.FC = () => {
  const { user, addToast, language, setLanguage, t, setActiveTab, refreshNotifications } = useApp();
  const patientId = user?.patientData?.id || 'pat-001';

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'claims' | 'documents' | 'ai_explainer' | 'security'>('overview');

  // Core Data States
  const [profile, setProfile] = useState<InsuranceProfile | null>(null);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [documents, setDocuments] = useState<InsuranceDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Claim for Detail Modal / View
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [expiryAlert, setExpiryAlert] = useState<{ status: string; daysRemaining: number; validUntil: string } | null>(null);

  // Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [targetClaimIdForUpload, setTargetClaimIdForUpload] = useState<string | undefined>(undefined);

  // AI Policy Explainer States
  const [aiExplanation, setAiExplanation] = useState<AIPolicyExplanation | null>(null);
  const [explainingAI, setExplainingAI] = useState(false);
  const [aiLanguage, setAiLanguage] = useState<'en' | 'ta' | 'hi'>(language === 'ta' ? 'ta' : 'en');

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    insuranceProvider: '',
    policyNumber: '',
    policyType: 'Comprehensive Health Insurance',
    coverageAmount: 1000000,
    remainingCoverage: 1000000,
    deductible: '₹5,000 per policy year',
    copay: '10% for non-network',
    validFrom: '2024-04-01',
    validUntil: '2025-03-31',
    tpaName: 'Medi Assist Insurance TPA Pvt Ltd',
    tpaContact: '1800-425-9449',
    tpaEmail: 'claims@mediassist.in',
    networkHospitals: 'Apollo Hospitals, Fortis Healthcare, Manipal Hospital, Kauvery Hospital, MIOT International',
    policyStatus: 'ACTIVE' as PolicyStatus,
  });

  // New Claim Form State
  const [claimForm, setClaimForm] = useState({
    hospital: 'Apollo Speciality Hospital, Chennai',
    treatment: 'Laparoscopic Cholecystectomy & Inpatient Care',
    amountClaimed: 185000,
    dateOfTreatment: new Date().toISOString().slice(0, 10),
    notes: 'Elective surgical admission under Dr. Sundaram.',
  });
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Upload Doc Form State
  const [docForm, setDocForm] = useState({
    title: 'Hospital Itemized Invoice & Payment Receipt',
    documentType: 'CLAIM_BILL' as const,
    fileName: 'Hospital_Final_Bill_Apollo.pdf',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    claimId: '',
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Load insurance data on mount
  useEffect(() => {
    loadInsuranceData();
  }, [patientId]);

  const loadInsuranceData = async () => {
    setLoading(true);
    try {
      const [data, expiryRes] = await Promise.all([
        api.getInsuranceData(patientId),
        api.checkPolicyExpiry(patientId).catch(() => null),
      ]);

      setProfile(data.profile);
      setClaims(data.claims || []);
      setDocuments(data.documents || []);

      if (expiryRes && expiryRes.expiryStatus !== 'ACTIVE') {
        setExpiryAlert({
          status: expiryRes.expiryStatus,
          daysRemaining: expiryRes.daysRemaining,
          validUntil: expiryRes.validUntil,
        });
      } else {
        setExpiryAlert(null);
      }

      if (data.profile) {
        setProfileForm({
          insuranceProvider: data.profile.insuranceProvider,
          policyNumber: data.profile.policyNumber,
          policyType: data.profile.policyType,
          coverageAmount: data.profile.coverageAmount,
          remainingCoverage: data.profile.remainingCoverage,
          deductible: data.profile.deductible,
          copay: data.profile.copay,
          validFrom: data.profile.validFrom,
          validUntil: data.profile.validUntil,
          tpaName: data.profile.tpaName,
          tpaContact: data.profile.tpaContact,
          tpaEmail: data.profile.tpaEmail,
          networkHospitals: Array.isArray(data.profile.networkHospitals)
            ? data.profile.networkHospitals.join(', ')
            : '',
          policyStatus: data.profile.policyStatus,
        });
      }
    } catch (err: any) {
      console.error('Error fetching insurance data:', err);
      addToast(err.message || 'Failed to load insurance details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const networkArray = profileForm.networkHospitals
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean);

      const res = await api.updateInsuranceProfile(patientId, {
        ...profileForm,
        networkHospitals: networkArray,
      });

      setProfile(res.profile);
      setShowEditProfileModal(false);
      addToast('Insurance policy profile updated successfully!', 'success');
      loadInsuranceData();
    } catch (err: any) {
      addToast(err.message || 'Error saving policy', 'error');
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      addToast('Please configure your insurance profile before submitting a claim.', 'warning');
      return;
    }
    setSubmittingClaim(true);
    try {
      const res = await api.createInsuranceClaim(patientId, {
        hospital: claimForm.hospital,
        treatment: claimForm.treatment,
        amountClaimed: Number(claimForm.amountClaimed),
        dateOfTreatment: claimForm.dateOfTreatment,
        notes: claimForm.notes,
        insuranceProfileId: profile.id,
        insuranceProvider: profile.insuranceProvider,
        policyNumber: profile.policyNumber,
      });

      addToast(`Claim ${res.claim.id} submitted successfully!`, 'success');
      setShowNewClaimModal(false);
      loadInsuranceData();
      refreshNotifications();
    } catch (err: any) {
      addToast(err.message || 'Failed to submit claim', 'error');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingDoc(true);
    try {
      const res = await api.uploadInsuranceDocument(patientId, {
        title: docForm.title,
        documentType: docForm.documentType,
        fileName: docForm.fileName,
        fileSize: docForm.fileSize,
        fileType: docForm.fileType,
        claimId: targetClaimIdForUpload || docForm.claimId || undefined,
        insuranceProfileId: profile?.id,
      });

      addToast(`Document "${res.document.title}" securely uploaded!`, 'success');
      setShowUploadDocModal(false);
      setTargetClaimIdForUpload(undefined);
      loadInsuranceData();
    } catch (err: any) {
      addToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleUpdateClaimStatus = async (
    claimId: string,
    status: ClaimStatus,
    note?: string,
    amountApproved?: number
  ) => {
    try {
      await api.updateClaimStatus(patientId, claimId, {
        status,
        note,
        amountApproved,
        actor: 'Medi Assist TPA Desk',
      });
      addToast(`Claim ${claimId} transitioned to ${status}`, 'success');
      loadInsuranceData();
      refreshNotifications();

      // Refresh selected claim modal if open
      if (selectedClaim && selectedClaim.id === claimId) {
        const updatedClaims = await api.getInsuranceClaims(patientId);
        const refreshed = updatedClaims.claims.find((c) => c.id === claimId);
        if (refreshed) setSelectedClaim(refreshed);
      }
    } catch (err: any) {
      addToast(err.message || 'Status transition failed', 'error');
    }
  };

  const handleExplainWithAI = async (langOverride?: 'en' | 'ta' | 'hi') => {
    const targetLang = langOverride || aiLanguage;
    setExplainingAI(true);
    try {
      const policyData = profile || {
        insuranceProvider: profileForm.insuranceProvider || 'Star Health & Allied Insurance',
        policyType: profileForm.policyType,
        policyNumber: profileForm.policyNumber || 'SH-MED-2024-8849201',
        coverageAmount: profileForm.coverageAmount,
        deductible: profileForm.deductible,
        copay: profileForm.copay,
        networkHospitals: profileForm.networkHospitals.split(',').map((s) => s.trim()),
        policyStatus: 'ACTIVE',
      };

      const res = await api.explainInsurancePolicy(policyData, targetLang);
      setAiExplanation(res.explanation);
      addToast(
        targetLang === 'ta'
          ? 'AI பாலிசி விளக்கம் வெற்றிகரமாக உருவாக்கப்பட்டது!'
          : 'AI Policy breakdown generated successfully!',
        'success'
      );
    } catch (err: any) {
      addToast(err.message || 'Failed to generate AI policy explanation', 'error');
    } finally {
      setExplainingAI(false);
    }
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">Draft</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Submitted</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Under Review</span>;
      case 'DOCUMENTS_REQUIRED':
        return <span className="px-2.5 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3 text-orange-600" /> Documents Required</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pre-Auth Approved</span>;
      case 'PARTIALLY_APPROVED':
        return <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-teal-600" /> Partially Approved</span>;
      case 'SETTLED':
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-purple-600" /> Claim Settled</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-rose-600" /> Rejected</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  // Financial summary numbers
  const totalCoverage = profile?.coverageAmount || 1000000;
  const remainingCoverage = profile?.remainingCoverage !== undefined ? profile.remainingCoverage : 940000;
  const coveragePercent = Math.max(0, Math.min(100, Math.round((remainingCoverage / totalCoverage) * 100)));

  const totalClaimed = claims.reduce((sum, c) => sum + (c.amountClaimed || 0), 0);
  const totalSettledOrApproved = claims.reduce((sum, c) => {
    if (c.claimStatus === 'APPROVED' || c.claimStatus === 'SETTLED' || c.claimStatus === 'PARTIALLY_APPROVED') {
      return sum + (c.amountApproved || c.amountClaimed || 0);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-800/40 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                {profile?.policyStatus === 'ACTIVE' ? 'Active Coverage' : 'Medical Insurance'}
              </span>
              <span className="px-2.5 py-1 bg-slate-800/80 text-slate-300 border border-slate-700/50 rounded-full text-[11px] font-mono flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Private & Gated
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>{t.medicalInsurance || 'Medical Insurance & Coverage'}</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Store your health policy details, manage cashless pre-authorizations, track reimbursement claims, and get plain-language policy explanations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowNewClaimModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-900/30 transition-all hover:scale-102"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Claim</span>
            </button>
            <button
              onClick={() => {
                setTargetClaimIdForUpload(undefined);
                setShowUploadDocModal(true);
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-xs transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('ai_explainer');
                if (!aiExplanation) handleExplainWithAI();
              }}
              className="px-4 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-400/30 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>AI Explainer</span>
            </button>
          </div>
        </div>

        {/* Coverage Progress Bar Card in Header */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <div className="text-slate-400 font-medium text-[11px]">Insurer & Policy #</div>
            <div className="font-bold text-white text-sm truncate mt-0.5">
              {profile?.insuranceProvider || 'Star Health & Allied Insurance'}
            </div>
            <div className="text-teal-300 font-mono text-[11px] truncate">
              {profile?.policyNumber || 'SH-MED-2024-8849201'}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <div className="text-slate-400 font-medium text-[11px] flex items-center justify-between">
              <span>Remaining Coverage</span>
              <span className="text-teal-400 font-bold">{coveragePercent}% left</span>
            </div>
            <div className="font-bold text-teal-300 text-base mt-0.5 font-mono">
              ₹{remainingCoverage.toLocaleString('en-IN')}
            </div>
            <div className="w-full bg-slate-700/80 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <div className="text-slate-400 font-medium text-[11px]">Deductible & Co-Pay</div>
            <div className="font-bold text-white text-sm mt-0.5">
              {profile?.deductible || '₹5,000 / yr'}
            </div>
            <div className="text-slate-300 text-[11px]">
              Co-Pay: <span className="text-amber-300 font-medium">{profile?.copay || '10% non-network'}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs flex items-center justify-between">
            <div>
              <div className="text-slate-400 font-medium text-[11px]">Policy Validity</div>
              <div className="font-bold text-white text-xs mt-0.5">
                Until {profile?.validUntil || '31 Mar 2025'}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Protection
              </div>
            </div>
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-semibold border border-white/20 transition-all"
            >
              Edit Policy
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Policy & TPA Details</span>
        </button>

        <button
          onClick={() => setActiveSubTab('claims')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'claims'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Claims Tracker</span>
          {claims.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSubTab === 'claims' ? 'bg-white text-teal-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {claims.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('documents')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'documents'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Insurance Documents & E-Card</span>
          {documents.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSubTab === 'documents' ? 'bg-white text-teal-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {documents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveSubTab('ai_explainer');
            if (!aiExplanation) handleExplainWithAI();
          }}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'ai_explainer'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Policy Explainer (தமிழ் / EN)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'security'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Privacy & Doctor Consent</span>
        </button>
      </div>

      {/* SUB-TAB 1: OVERVIEW & POLICY DETAILS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Expiry / Renewal Alert Banner */}
          {expiryAlert && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs ${
              expiryAlert.status === 'EXPIRED'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div className="text-xs space-y-1 flex-1">
                <div className="font-bold">
                  {expiryAlert.status === 'EXPIRED'
                    ? '⚠️ Health Insurance Policy Expired'
                    : `🔔 Policy Renewal Due: Expires in ${expiryAlert.daysRemaining} day(s)`}
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Your coverage period terminates on <strong>{expiryAlert.validUntil}</strong>. Contact your TPA Desk or insurance provider to renew and preserve continuous policy benefits.
                </p>
              </div>
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs shadow-xs shrink-0"
              >
                Update Policy
              </button>
            </div>
          )}

          {/* Connected Medical Expenses Quick Link */}
          <div className="bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-transparent border border-teal-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Treatment Invoices & Out-of-Pocket Medical Expenses</h4>
                <p className="text-[11px] text-slate-600">Track consultation receipts, medicines, and non-covered hospital expenses.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-all"
            >
              <span>Open Expenses Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Policy Specifications & Network Hospitals */}
            <div className="lg:col-span-2 space-y-6">
              {/* Comprehensive Policy Specs Card */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        {profile?.insuranceProvider || 'Star Health & Allied Insurance'}
                      </h2>
                      <div className="text-xs text-slate-500">
                        {profile?.policyType || 'Family Health Optima Comprehensive Insurance'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditProfileModal(true)}
                    className="text-xs text-teal-600 hover:text-teal-800 font-bold hover:underline"
                  >
                    Modify
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block">Policy Number</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {profile?.policyNumber || 'SH-MED-2024-8849201'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Total Sum Insured</span>
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{Number(profile?.coverageAmount || 1000000).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Current Balance</span>
                    <span className="font-bold text-emerald-600 font-mono text-sm">
                      ₹{Number(profile?.remainingCoverage || 940000).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Deductible Clause</span>
                    <span className="font-bold text-slate-900">{profile?.deductible || '₹5,000 / yr'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Co-Payment Term</span>
                    <span className="font-bold text-slate-900">{profile?.copay || '10% non-network'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Coverage Period</span>
                    <span className="font-bold text-slate-900">
                      {profile?.validFrom || '01 Apr 2024'} to {profile?.validUntil || '31 Mar 2025'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                  <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Cashless Pre-Authorization:</strong> Present your policy number or digital Case Line health insurance card at any empaneled network hospital admission desk at least 48 hours before planned surgeries, or within 24 hours of an emergency admission.
                  </p>
                </div>
              </div>

              {/* Empaneled Network Hospitals */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Hospital className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-base text-slate-900">Empaneled Network Hospitals</h3>
                  </div>
                  <span className="text-xs text-slate-500">14,000+ pan-India partners</span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  These premier healthcare facilities offer instant cashless pre-authorization with direct insurer billing settlement:
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {profile?.networkHospitals && profile.networkHospitals.length > 0 ? (
                    profile.networkHospitals.map((hosp, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-indigo-50/80 text-indigo-950 border border-indigo-200/70 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Hospital className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{hosp}</span>
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="px-3 py-1.5 bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-xl text-xs font-semibold">
                        Apollo Hospitals (Greams Road & OMR)
                      </span>
                      <span className="px-3 py-1.5 bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-xl text-xs font-semibold">
                        Fortis Malar Hospital
                      </span>
                      <span className="px-3 py-1.5 bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-xl text-xs font-semibold">
                        Manipal Hospital
                      </span>
                      <span className="px-3 py-1.5 bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-xl text-xs font-semibold">
                        Kauvery Hospital
                      </span>
                      <span className="px-3 py-1.5 bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-xl text-xs font-semibold">
                        MIOT International
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Third Party Administrator (TPA) Desk & Quick Actions */}
            <div className="space-y-6">
              {/* TPA Contact Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-800">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                    TPA Assistance Desk
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold">
                    24x7 Helpdesk
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-white">
                    {profile?.tpaName || 'Medi Assist Insurance TPA Pvt Ltd'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Licensed IRDAI TPA coordinating pre-authorization tokens and hospital paperwork.
                  </p>
                </div>

                <div className="mt-5 space-y-3 text-xs">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                    <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400">Toll-Free Helpline</div>
                      <a
                        href={`tel:${profile?.tpaContact || '1800-425-9449'}`}
                        className="font-mono font-bold text-white hover:text-teal-300 text-sm"
                      >
                        {profile?.tpaContact || '1800-425-9449'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400">Claims Escalation Email</div>
                      <a
                        href={`mailto:${profile?.tpaEmail || 'claims@mediassist.in'}`}
                        className="font-medium text-white hover:text-indigo-300 truncate block text-xs"
                      >
                        {profile?.tpaEmail || 'claims@mediassist.in'}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <a
                    href={`tel:${profile?.tpaContact || '1800-425-9449'}`}
                    className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call TPA Claims Desk</span>
                  </a>
                </div>
              </div>

              {/* Quick Links Card */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Quick Operations</h4>
                <button
                  onClick={() => setActiveSubTab('claims')}
                  className="w-full p-3 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-2xl text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>View Claims Progress ({claims.length})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setActiveSubTab('documents')}
                  className="w-full p-3 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-2xl text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>View Digital Policy Card & Docs</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setActiveSubTab('security')}
                  className="w-full p-3 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-2xl text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Who Can Access My Insurance?</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CLAIMS TRACKER */}
      {activeSubTab === 'claims' && (
        <div className="space-y-6">
          {/* Claims Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Total Claims Dossiers</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono mt-1 block">
                {claims.length}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Total Amount Claimed</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono mt-1 block">
                ₹{totalClaimed.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-medium text-emerald-800 block">Sanctioned / Settled</span>
              <span className="text-xl font-extrabold text-emerald-700 font-mono mt-1 block">
                ₹{totalSettledOrApproved.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-[11px] font-medium text-amber-800 block">Active / Under Review</span>
              <span className="text-xl font-extrabold text-amber-700 font-mono mt-1 block">
                {claims.filter((c) => c.claimStatus === 'UNDER_REVIEW' || c.claimStatus === 'DOCUMENTS_REQUIRED' || c.claimStatus === 'SUBMITTED').length}
              </span>
            </div>
          </div>

          {/* Interactive Claims List */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Hospitalization & Treatment Claims</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status progression from initial submission to final TPA settlement.
                </p>
              </div>
              <button
                onClick={() => setShowNewClaimModal(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit New Claim</span>
              </button>
            </div>

            {claims.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-slate-800">No Insurance Claims Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  You have not submitted any hospitalization or reimbursement claims under this policy yet.
                </p>
                <button
                  onClick={() => setShowNewClaimModal(true)}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
                >
                  Create First Claim
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-teal-300 bg-slate-50/50 hover:bg-white transition-all space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-bold text-slate-900 text-sm">{claim.id}</span>
                          {getStatusBadge(claim.claimStatus)}
                          <span className="text-xs text-slate-500">
                            Submitted: {new Date(claim.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1.5 flex items-center gap-2">
                          <span>{claim.treatment}</span>
                          <span className="text-slate-400 font-normal">•</span>
                          <span className="text-slate-600 font-medium text-xs">{claim.hospital}</span>
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-500">Claim Amount</div>
                        <div className="text-base font-extrabold text-slate-900 font-mono">
                          ₹{claim.amountClaimed.toLocaleString('en-IN')}
                        </div>
                        {claim.amountApproved > 0 && (
                          <div className="text-xs font-bold text-emerald-600 font-mono">
                            Sanctioned: ₹{claim.amountApproved.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Progress Bar for this Claim */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
                        <span>Status Lifecycle</span>
                        <span className="text-slate-500">
                          Last Updated: {new Date(claim.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                        <div
                          className={`h-full ${
                            claim.claimStatus === 'REJECTED'
                              ? 'bg-rose-500 w-full'
                              : claim.claimStatus === 'SETTLED'
                              ? 'bg-purple-600 w-full'
                              : claim.claimStatus === 'APPROVED' || claim.claimStatus === 'PARTIALLY_APPROVED'
                              ? 'bg-emerald-500 w-4/5'
                              : claim.claimStatus === 'DOCUMENTS_REQUIRED'
                              ? 'bg-orange-500 w-3/5'
                              : claim.claimStatus === 'UNDER_REVIEW'
                              ? 'bg-amber-500 w-2/5'
                              : 'bg-blue-500 w-1/5'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Action Bar & Demo State Simulator */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Audit Timeline</span>
                        </button>

                        {claim.claimStatus === 'DOCUMENTS_REQUIRED' && (
                          <button
                            onClick={() => {
                              setTargetClaimIdForUpload(claim.id);
                              setShowUploadDocModal(true);
                            }}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs animate-pulse"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Requested Docs</span>
                          </button>
                        )}
                      </div>

                      {/* Interactive Demo TPA Controls - Per Prompt instructions */}
                      <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 p-1.5 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-slate-500 px-1">
                          Demo Workflow:
                        </span>
                        {claim.claimStatus !== 'DOCUMENTS_REQUIRED' && claim.claimStatus !== 'APPROVED' && claim.claimStatus !== 'SETTLED' && (
                          <button
                            onClick={() =>
                              handleUpdateClaimStatus(
                                claim.id,
                                'DOCUMENTS_REQUIRED',
                                'TPA assessor requested itemized pharmacy invoice and detailed doctor consultation prescription.'
                              )
                            }
                            className="px-2 py-1 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-[10px] font-bold"
                          >
                            Request Docs
                          </button>
                        )}

                        {claim.claimStatus !== 'APPROVED' && claim.claimStatus !== 'SETTLED' && (
                          <button
                            onClick={() =>
                              handleUpdateClaimStatus(
                                claim.id,
                                'APPROVED',
                                `Pre-authorization sanctioned for ₹${Math.min(claim.amountClaimed, 185000).toLocaleString('en-IN')}.`,
                                Math.min(claim.amountClaimed, 185000)
                              )
                            }
                            className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold"
                          >
                            Approve Pre-Auth
                          </button>
                        )}

                        {claim.claimStatus === 'APPROVED' && (
                          <button
                            onClick={() =>
                              handleUpdateClaimStatus(
                                claim.id,
                                'SETTLED',
                                `Payment of ₹${(claim.amountApproved || claim.amountClaimed).toLocaleString('en-IN')} disbursed directly to hospital network account.`,
                                claim.amountApproved || claim.amountClaimed
                              )
                            }
                            className="px-2 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-bold"
                          >
                            Disburse & Settle
                          </button>
                        )}

                        {claim.claimStatus !== 'REJECTED' && claim.claimStatus !== 'SETTLED' && (
                          <button
                            onClick={() =>
                              handleUpdateClaimStatus(
                                claim.id,
                                'REJECTED',
                                'Claim inadmissible under exclusion clause Section 4.3 (Elective procedure during waiting window).'
                              )
                            }
                            className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: INSURANCE DOCUMENTS & DIGITAL E-CARD */}
      {activeSubTab === 'documents' && (
        <div className="space-y-6">
          {/* Digital Health Insurance Card Preview */}
          <div className="bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-700/50 max-w-2xl mx-auto relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-teal-400">
                  Government of India • IRDAI Registered E-Card
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">
                  {profile?.insuranceProvider || 'Star Health & Allied Insurance'}
                </h3>
                <div className="text-xs text-slate-300">
                  {profile?.policyType || 'Comprehensive Family Health Optima'}
                </div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-7 h-7 text-teal-300" />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-400 font-sans">Primary Insured</div>
                <div className="text-sm font-bold text-white font-sans">
                  {user?.patientData?.fullName || 'Rajesh Sharma'}
                </div>
                <div className="text-[11px] text-teal-300">
                  ID: {user?.patientData?.patientCode || 'CASE-2026-9042'}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-sans">Policy Number</div>
                <div className="text-sm font-bold text-white">
                  {profile?.policyNumber || 'SH-MED-2024-8849201'}
                </div>
                <div className="text-[11px] text-slate-300">
                  Valid thru: {profile?.validUntil || '31/03/2025'}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-sans">Sum Insured Limit</div>
                <div className="text-sm font-bold text-emerald-300">
                  ₹{Number(profile?.coverageAmount || 1000000).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-sans">TPA Helpdesk</div>
                <div className="text-xs font-bold text-white truncate">
                  {profile?.tpaName || 'Medi Assist TPA'}
                </div>
                <div className="text-[11px] text-teal-300">
                  {profile?.tpaContact || '1800-425-9449'}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>Encrypted via Case Line Patient Portal</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Cashless Empaneled
              </span>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Stored Insurance Documents</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Private storage for insurance cards, policy schedules, hospital bills, and claim discharge summaries.
                </p>
              </div>
              <button
                onClick={() => {
                  setTargetClaimIdForUpload(undefined);
                  setShowUploadDocModal(true);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Document</span>
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-slate-800">No Documents Uploaded</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Upload your insurance card or policy schedule so they are easily accessible during hospital visits.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-[10px] font-bold">
                          {doc.documentType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{doc.title}</h4>
                      <p className="text-xs text-slate-500 font-mono truncate mt-0.5">{doc.fileName}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToast(`Opening preview for ${doc.fileName}...`, 'info')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => addToast(`Downloading ${doc.fileName}`, 'success')}
                          className="p-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AI POLICY EXPLAINER (TAMIL + ENGLISH) */}
      {activeSubTab === 'ai_explainer' && (
        <div className="space-y-6">
          {/* AI Banner & Language Controls */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-700/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-300" />
                    Powered by Gemini AI
                  </span>
                  <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-full text-[11px] font-bold">
                    Multilingual (தமிழ் / English)
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Plain-Language Insurance Policy Explainer
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Translates confusing insurance legalities, exclusions, waiting windows, and deductible clauses into plain everyday words.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center text-xs">
                  <button
                    onClick={() => {
                      setAiLanguage('en');
                      handleExplainWithAI('en');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      aiLanguage === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setAiLanguage('ta');
                      handleExplainWithAI('ta');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      aiLanguage === 'ta' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    தமிழ் (Tamil)
                  </button>
                </div>

                <button
                  onClick={() => handleExplainWithAI()}
                  disabled={explainingAI}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${explainingAI ? 'animate-spin' : ''}`} />
                  <span>{explainingAI ? 'Explaining...' : 'Re-analyze Policy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Response Presentation */}
          {explainingAI ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-xs">
              <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
              <h4 className="font-bold text-base text-slate-900">
                {aiLanguage === 'ta'
                  ? 'காப்பீட்டு பாலிசியை AI பகுப்பாய்வு செய்கிறது...'
                  : 'Analyzing insurance terms with Gemini AI...'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Reviewing coverage limits, waiting periods, pre-existing clauses, and hospital claim rules.
              </p>
            </div>
          ) : aiExplanation ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
                <h4 className="font-bold text-sm text-indigo-900 uppercase tracking-wider mb-2">
                  {aiLanguage === 'ta' ? 'பாலிசியின் சுருக்கம்' : 'Plain Language Overview'}
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {aiExplanation.policySummary}
                </p>
              </div>

              {/* What is Covered vs Exclusions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Covered */}
                <div className="bg-emerald-50/40 rounded-3xl p-6 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{aiLanguage === 'ta' ? 'என்ன சேர்க்கப்பட்டுள்ளது (கவரேஜ்)' : 'What Is Covered'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-950">
                    {aiExplanation.coverageDetails.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclusions */}
                <div className="bg-rose-50/40 rounded-3xl p-6 border border-rose-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>{aiLanguage === 'ta' ? 'விதிவிலக்குகள் (சேர்க்கப்படாதவை)' : 'Key Exclusions'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-rose-950">
                    {aiExplanation.exclusions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Waiting Periods & Deductibles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Waiting Periods */}
                <div className="bg-amber-50/40 rounded-3xl p-6 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span>{aiLanguage === 'ta' ? 'காத்திருப்பு காலங்கள்' : 'Mandatory Waiting Periods'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-amber-950">
                    {aiExplanation.waitingPeriodDetails.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deductible & Co-Pay Breakdown */}
                <div className="bg-indigo-50/40 rounded-3xl p-6 border border-indigo-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    <span>{aiLanguage === 'ta' ? 'கழிவுத்தொகை & இணை கட்டணம்' : 'Deductible & Co-Pay Breakdown'}</span>
                  </div>
                  <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                    {aiExplanation.deductibleAndCopayExplanation}
                  </p>
                </div>
              </div>

              {/* Claim Documentation Requirements Checklist */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
                  <FileCheck className="w-5 h-5 text-teal-600" />
                  <span>
                    {aiLanguage === 'ta' ? 'கோரிக்கைக்கு தேவையான ஆவணங்கள்' : 'Required Claim Documents Checklist'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {aiExplanation.claimDocumentationRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="text-slate-800 font-medium">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance Glossary */}
              {aiExplanation.generalTerminology && aiExplanation.generalTerminology.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-900 mb-3">
                    {aiLanguage === 'ta' ? 'காப்பீட்டு சொற்களஞ்சியம்' : 'Health Insurance Terminology Simplified'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {aiExplanation.generalTerminology.map((term, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-900">{term.term}</div>
                        <div className="text-slate-600 mt-1 leading-relaxed">{term.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mandatory Legal & Educational Disclaimer */}
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Disclaimer:</strong> {aiExplanation.disclaimer}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
              <h4 className="font-bold text-base text-slate-900">Understand Your Health Policy In Plain Words</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Click below to let Case Line AI break down waiting periods, co-pays, and claim paperwork in Tamil or English.
              </p>
              <button
                onClick={() => handleExplainWithAI()}
                className="mt-5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Analyze Policy Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: PRIVACY & DOCTOR ACCESS AUDIT */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Private By Default Architecture</h3>
                <p className="text-xs text-slate-500">
                  Patient data isolation and Row Level Security guarantees.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
              <p className="font-semibold">
                Your medical insurance policies and claim reimbursement records are never exposed to doctors or third parties without explicit consent.
              </p>
              <p className="text-slate-600">
                Doctors reviewing your medical chart only see diagnostic history, prescriptions, and lab tests. If a hospital pre-authorization coordinator or specialist requires your insurance details, they must send a granular consent request that you must approve.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Manage Full Consent Permissions</span>
                <span className="text-[11px] text-slate-500">
                  Review pending consent requests or revoke active doctor access at any time.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('privacy')}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Open Privacy & Consent Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLAIM DETAIL TIMELINE AUDIT */}
      <AnimatePresence>
        {selectedClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden relative my-6"
            >
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-400 font-mono">{selectedClaim.id}</span>
                    {getStatusBadge(selectedClaim.claimStatus)}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedClaim.treatment}</h3>
                  <div className="text-xs text-slate-300">{selectedClaim.hospital}</div>
                </div>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
                {/* Financial Settlement Breakdown */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-800 text-xs">Financial Settlement Breakdown</span>
                    <span className="text-[10px] text-slate-500 font-mono">TPA Reference: {selectedClaim.id}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Claimed Amount</span>
                      <span className="font-extrabold text-slate-900 text-sm font-mono block mt-0.5">
                        ₹{selectedClaim.amountClaimed.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-emerald-800 font-medium block text-[10px] uppercase">Approved Amount</span>
                      <span className="font-extrabold text-emerald-700 text-sm font-mono block mt-0.5">
                        ₹{(selectedClaim.amountApproved || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Deductible Applied</span>
                      <span className="font-bold text-slate-700 text-sm font-mono block mt-0.5">
                        {selectedClaim.amountApproved > 0 ? '₹5,000' : '₹0'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                      <span className="text-rose-800 font-medium block text-[10px] uppercase">Patient Out-of-Pocket</span>
                      <span className="font-extrabold text-rose-700 text-sm font-mono block mt-0.5">
                        ₹{(selectedClaim.patientPaid !== undefined ? selectedClaim.patientPaid : Math.max(0, selectedClaim.amountClaimed - (selectedClaim.amountApproved || 0))).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Co-pay Scheme: <strong>10% on Non-Network / Special Suite</strong></span>
                    <button
                      onClick={() => {
                        setSelectedClaim(null);
                        setActiveTab('expenses');
                      }}
                      className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View in Medical Expenses</span>
                    </button>
                  </div>
                </div>

                {/* Timeline progression */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Audit Progression Timeline</h4>
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {selectedClaim.timeline.map((item, idx) => (
                      <div key={idx} className="relative pl-8 space-y-1">
                        <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-white ring-2 ring-teal-200" />
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900">{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-slate-600">{item.description}</p>
                        <div className="text-[10px] text-slate-400 font-medium">By: {item.actor}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attached claim documents */}
                {selectedClaim.documents && selectedClaim.documents.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">Attached Claim Documents</h4>
                    <div className="space-y-2">
                      {selectedClaim.documents.map((d) => (
                        <div
                          key={d.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-teal-600" />
                            <span className="font-semibold text-slate-800">{d.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{d.fileSize}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT INSURANCE PROFILE */}
      <AnimatePresence>
        {showEditProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-base text-slate-900">Edit Insurance Profile</h3>
                </div>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Insurance Provider *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.insuranceProvider}
                    onChange={(e) => setProfileForm({ ...profileForm, insuranceProvider: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="e.g. Star Health & Allied Insurance"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Policy Number *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.policyNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, policyNumber: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                      placeholder="e.g. SH-MED-2024-8849201"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Coverage Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={profileForm.coverageAmount}
                      onChange={(e) => setProfileForm({ ...profileForm, coverageAmount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Deductible</label>
                    <input
                      type="text"
                      value={profileForm.deductible}
                      onChange={(e) => setProfileForm({ ...profileForm, deductible: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                      placeholder="e.g. ₹5,000 / yr"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Co-pay Clause</label>
                    <input
                      type="text"
                      value={profileForm.copay}
                      onChange={(e) => setProfileForm({ ...profileForm, copay: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                      placeholder="e.g. 10% non-network"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Valid From</label>
                    <input
                      type="date"
                      value={profileForm.validFrom}
                      onChange={(e) => setProfileForm({ ...profileForm, validFrom: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Valid Until</label>
                    <input
                      type="date"
                      value={profileForm.validUntil}
                      onChange={(e) => setProfileForm({ ...profileForm, validUntil: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">TPA Name</label>
                    <input
                      type="text"
                      value={profileForm.tpaName}
                      onChange={(e) => setProfileForm({ ...profileForm, tpaName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">TPA Contact Helpline</label>
                    <input
                      type="text"
                      value={profileForm.tpaContact}
                      onChange={(e) => setProfileForm({ ...profileForm, tpaContact: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Network Hospitals (comma separated)</label>
                  <textarea
                    rows={2}
                    value={profileForm.networkHospitals}
                    onChange={(e) => setProfileForm({ ...profileForm, networkHospitals: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="Apollo, Fortis, Manipal, Kauvery..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditProfileModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SUBMIT NEW CLAIM */}
      <AnimatePresence>
        {showNewClaimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-base text-slate-900">Submit New Medical Claim</h3>
                </div>
                <button
                  onClick={() => setShowNewClaimModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClaim} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admitting Hospital *</label>
                  <input
                    type="text"
                    required
                    value={claimForm.hospital}
                    onChange={(e) => setClaimForm({ ...claimForm, hospital: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Treatment / Procedure *</label>
                  <input
                    type="text"
                    required
                    value={claimForm.treatment}
                    onChange={(e) => setClaimForm({ ...claimForm, treatment: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Claim Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={claimForm.amountClaimed}
                      onChange={(e) => setClaimForm({ ...claimForm, amountClaimed: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Admission</label>
                    <input
                      type="date"
                      required
                      value={claimForm.dateOfTreatment}
                      onChange={(e) => setClaimForm({ ...claimForm, dateOfTreatment: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={claimForm.notes}
                    onChange={(e) => setClaimForm({ ...claimForm, notes: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="Brief description of surgery / inpatient stay..."
                  />
                </div>

                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-[11px]">
                  <strong>Notice:</strong> Your claim will be securely dispatched to {profile?.insuranceProvider || 'your insurer'} and tracked under your private Case Line ID.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewClaimModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    {submittingClaim ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Submit Claim Dossier</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: UPLOAD INSURANCE DOCUMENT */}
      <AnimatePresence>
        {showUploadDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-base text-slate-900">
                    {targetClaimIdForUpload ? `Attach Document to ${targetClaimIdForUpload}` : 'Upload Insurance Document'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowUploadDocModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUploadDocument} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={docForm.title}
                    onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Document Category *</label>
                    <select
                      value={docForm.documentType}
                      onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    >
                      <option value="INSURANCE_CARD">Insurance Health Card</option>
                      <option value="POLICY_SCHEDULE">Policy Schedule Booklet</option>
                      <option value="CLAIM_BILL">Hospital Final Bill / Invoice</option>
                      <option value="DISCHARGE_SUMMARY">Discharge Card / Summary</option>
                      <option value="PRE_AUTH_FORM">Cashless Pre-Auth Form</option>
                      <option value="OTHER">Other Verification Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">File Name</label>
                    <input
                      type="text"
                      value={docForm.fileName}
                      onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                </div>

                {/* Simulated File Dropzone */}
                <div className="p-6 border-2 border-dashed border-teal-300 rounded-2xl text-center bg-teal-50/40">
                  <FileText className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <span className="font-bold text-slate-800 block text-xs">Drag and drop file or browse</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">PDF, PNG, JPEG up to 15 MB</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadDocModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingDoc}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    {uploadingDoc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Upload to Private Vault</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
