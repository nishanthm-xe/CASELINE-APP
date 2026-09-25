import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  MedicalExpense,
  MedicalExpenseCategory,
  InsuranceClaim,
  MedicalRecord,
  MedicalTimelineEvent,
} from '../../types';
import {
  Receipt,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Calendar,
  Building2,
  Hospital,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  ExternalLink,
  Filter,
  Search,
  Trash2,
  Edit3,
  Paperclip,
  ChevronRight,
  Sparkles,
  RefreshCw,
  CreditCard,
  Wallet,
  Percent,
  Eye,
  X,
  Link2,
  DollarSign,
  ArrowRight,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES: { label: string; value: MedicalExpenseCategory; color: string; bg: string }[] = [
  { label: 'Consultation', value: 'Consultation', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { label: 'Hospitalization', value: 'Hospitalization', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  { label: 'Lab Test', value: 'Lab Test', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { label: 'Scan / Imaging', value: 'Scan / Imaging', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  { label: 'Medicine', value: 'Medicine', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { label: 'Surgery', value: 'Surgery', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  { label: 'Emergency', value: 'Emergency', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  { label: 'Other', value: 'Other', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
];

export const MedicalExpensesView: React.FC = () => {
  const { user, addToast, language, t, setActiveTab } = useApp();
  const patientId = user?.patientData?.id || 'pat-001';

  // State
  const [expenses, setExpenses] = useState<MedicalExpense[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<MedicalTimelineEvent[]>([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    insuranceCovered: 0,
    outOfPocket: 0,
    currentMonthExpenses: 0,
    currentYearExpenses: 0,
    categoryBreakdown: {} as Record<string, number>,
    expenseCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [hospitalFilter, setHospitalFilter] = useState<string>('');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'month' | 'year'>('all');
  const [claimLinkedFilter, setClaimLinkedFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<MedicalExpense | null>(null);
  const [selectedRecordForPreview, setSelectedRecordForPreview] = useState<any | null>(null);
  const [selectedClaimForPreview, setSelectedClaimForPreview] = useState<InsuranceClaim | null>(null);
  const [selectedReceiptForPreview, setSelectedReceiptForPreview] = useState<any | null>(null);
  const [filingClaimForExpense, setFilingClaimForExpense] = useState<MedicalExpense | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: 'Consultation' as MedicalExpenseCategory,
    hospitalOrClinic: 'Apollo Speciality Hospital, Chennai',
    description: '',
    amount: 1500,
    insuranceCoveredAmount: 0,
    patientPaidAmount: 1500,
    paymentStatus: 'PAID' as MedicalExpense['paymentStatus'],
    linkedRecordId: '',
    linkedClaimId: '',
    notes: '',
    receiptFileName: '',
    receiptFileSize: '1.2 MB',
  });

  // Load Data
  const loadExpensesData = async () => {
    try {
      setLoading(true);
      const [expRes, insRes, recordsRes, timelineRes] = await Promise.all([
        api.getMedicalExpenses(patientId, {
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          hospital: hospitalFilter || undefined,
          claimLinked: claimLinkedFilter === 'Yes' ? 'true' : claimLinkedFilter === 'No' ? 'false' : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          timeframe: timeframeFilter !== 'all' ? timeframeFilter : undefined,
        }),
        api.getInsuranceData(patientId).catch(() => ({ profile: null, claims: [], documents: [] })),
        api.getRecords(patientId).catch(() => []),
        api.getTimeline(patientId).catch(() => []),
      ]);

      setExpenses(expRes.expenses || []);
      setSummary(expRes.summary);
      setClaims(insRes.claims || []);
      setRecords(Array.isArray(recordsRes) ? recordsRes : []);
      setTimelineEvents(Array.isArray(timelineRes) ? timelineRes : []);
    } catch (err: any) {
      console.error('Failed to load expenses:', err);
      addToast(err.message || 'Failed to load medical expense records', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExpensesData();
  }, [categoryFilter, hospitalFilter, timeframeFilter, claimLinkedFilter, statusFilter]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      category: 'Consultation',
      hospitalOrClinic: 'Apollo Speciality Hospital, Chennai',
      description: 'Senior Physician Consultation & Blood Pressure Review',
      amount: 1200,
      insuranceCoveredAmount: 0,
      patientPaidAmount: 1200,
      paymentStatus: 'PAID',
      linkedRecordId: '',
      linkedClaimId: '',
      notes: '',
      receiptFileName: '',
      receiptFileSize: '1.2 MB',
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (expense: MedicalExpense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      hospitalOrClinic: expense.hospitalOrClinic,
      description: expense.description,
      amount: expense.amount,
      insuranceCoveredAmount: expense.insuranceCoveredAmount,
      patientPaidAmount: expense.patientPaidAmount,
      paymentStatus: expense.paymentStatus,
      linkedRecordId: expense.linkedRecordId || '',
      linkedClaimId: expense.linkedClaimId || '',
      notes: expense.notes || '',
      receiptFileName: expense.receiptDocument?.fileName || '',
      receiptFileSize: expense.receiptDocument?.fileSize || '1.2 MB',
    });
    setShowAddModal(true);
  };

  // Auto calculate patient paid
  const handleAmountChange = (newAmount: number) => {
    const covered = Number(formData.insuranceCoveredAmount) || 0;
    const patientPaid = Math.max(0, newAmount - covered);
    setFormData((prev) => ({
      ...prev,
      amount: newAmount,
      patientPaidAmount: patientPaid,
    }));
  };

  const handleCoveredChange = (newCovered: number) => {
    const total = Number(formData.amount) || 0;
    const patientPaid = Math.max(0, total - newCovered);
    setFormData((prev) => ({
      ...prev,
      insuranceCoveredAmount: newCovered,
      patientPaidAmount: patientPaid,
    }));
  };

  // Save Expense (Create or Update)
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedRecord =
        records.find((r) => r.id === formData.linkedRecordId) ||
        timelineEvents.find((t) => t.id === formData.linkedRecordId);

      const payload: Partial<MedicalExpense> = {
        date: formData.date,
        category: formData.category,
        hospitalOrClinic: formData.hospitalOrClinic,
        description: formData.description || `${formData.category} at ${formData.hospitalOrClinic}`,
        amount: Number(formData.amount),
        insuranceCoveredAmount: Number(formData.insuranceCoveredAmount || 0),
        patientPaidAmount: Number(formData.patientPaidAmount),
        paymentStatus: formData.paymentStatus,
        linkedRecordId: formData.linkedRecordId || undefined,
        linkedRecordTitle: selectedRecord ? selectedRecord.title : undefined,
        linkedClaimId: formData.linkedClaimId || undefined,
        notes: formData.notes || undefined,
      };

      if (formData.receiptFileName) {
        payload.receiptDocument = {
          fileName: formData.receiptFileName,
          fileSize: formData.receiptFileSize || '1.5 MB',
          fileType: 'application/pdf',
          fileUrl: `/secure-docs/receipts/${formData.receiptFileName}`,
          uploadedAt: new Date().toISOString(),
        };
      }

      if (editingExpense) {
        await api.updateMedicalExpense(patientId, editingExpense.id, payload);
        addToast('Medical expense updated successfully!', 'success');
      } else {
        await api.createMedicalExpense(patientId, payload);
        addToast('New medical expense added successfully!', 'success');
      }

      setShowAddModal(false);
      loadExpensesData();
    } catch (err: any) {
      addToast(err.message || 'Error saving medical expense', 'error');
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this medical expense record?')) return;
    try {
      await api.deleteMedicalExpense(patientId, expenseId);
      addToast('Medical expense record deleted.', 'info');
      loadExpensesData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  // 1-Click File Insurance Claim for Expense
  const handleFileClaimForExpense = async (expense: MedicalExpense) => {
    try {
      const res = await api.linkExpenseToClaim(patientId, expense.id, { createNewClaim: true });
      addToast(
        `Insurance claim #${res.claim.id} created and linked to this expense!`,
        'success'
      );
      setFilingClaimForExpense(null);
      loadExpensesData();
    } catch (err: any) {
      addToast(err.message || 'Failed to submit claim from expense', 'error');
    }
  };

  // Upload receipt to expense
  const handleSimulateReceiptUpload = async (expenseId: string) => {
    const mockFileName = `Medical_Bill_${expenseId}_${Date.now().toString().slice(-4)}.pdf`;
    try {
      await api.uploadExpenseReceipt(patientId, expenseId, {
        fileName: mockFileName,
        fileSize: '1.8 MB',
        fileType: 'application/pdf',
        fileUrl: `/secure-docs/receipts/${mockFileName}`,
      });
      addToast(`Receipt bill ${mockFileName} attached to expense!`, 'success');
      loadExpensesData();
    } catch (err: any) {
      addToast(err.message || 'Failed to upload receipt document', 'error');
    }
  };

  // Filtered expenses based on client-side search query
  const displayedExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const q = searchQuery.toLowerCase();
    return expenses.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.hospitalOrClinic.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.linkedRecordTitle && e.linkedRecordTitle.toLowerCase().includes(q)) ||
        (e.linkedClaimId && e.linkedClaimId.toLowerCase().includes(q))
    );
  }, [expenses, searchQuery]);

  // Pending claims calculation
  const pendingClaimsTotal = useMemo(() => {
    return expenses
      .filter((e) => e.paymentStatus === 'CLAIM_PENDING' || (e.linkedClaimId && e.insuranceCoveredAmount === 0))
      .reduce((sum, e) => sum + (e.amount - e.insuranceCoveredAmount), 0);
  }, [expenses]);

  const coveragePercent = summary.totalExpenses > 0
    ? Math.min(100, Math.round((summary.insuranceCovered / summary.totalExpenses) * 100))
    : 0;

  return (
    <div id="medical-expenses-view" className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-xs">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {language === 'ta' ? 'மருத்துவ செலவுகள் கண்காணிப்பாளர்' : 'Medical Expenses Tracker'}
                </h1>
                <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-[11px] font-bold rounded-full border border-teal-200">
                  Finance
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ta'
                  ? 'சிகிச்சை செலவுகள், காப்பீட்டுத் தொகை, நேரடி செலவுகள் மற்றும் ரசீதுகளை கண்காணிக்கவும்.'
                  : 'Track treatment bills, health insurance reimbursements, out-of-pocket spending, and tax invoices.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            id="refresh-expenses-btn"
            onClick={() => {
              setRefreshing(true);
              loadExpensesData();
            }}
            disabled={refreshing}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
            title="Refresh expense data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            id="switch-to-insurance-btn"
            onClick={() => setActiveTab('insurance')}
            className="px-3.5 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>View Insurance Claims</span>
          </button>

          <button
            id="add-expense-modal-btn"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 4 FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Medical Expenses */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Medical Expense
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-black text-slate-900 font-mono">
            ₹{summary.totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{summary.expenseCount} total record(s)</span>
            <span className="text-slate-700 font-medium">This year: ₹{summary.currentYearExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card 2: Covered by Insurance */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Covered by Insurance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-black text-emerald-600 font-mono">
            ₹{summary.insuranceCovered.toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
            <span>Coverage Ratio</span>
            <span>{coveragePercent}% Insured</span>
          </div>
        </div>

        {/* Card 3: Out-of-Pocket Expense */}
        <div className="bg-white rounded-3xl p-5 border border-rose-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
              Out-of-Pocket Paid
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-black text-rose-600 font-mono">
            ₹{summary.outOfPocket.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Direct patient spending</span>
            <span className="font-semibold text-rose-700">
              {100 - coveragePercent}% of total
            </span>
          </div>
        </div>

        {/* Card 4: Pending Reimbursements / Claims */}
        <div className="bg-white rounded-3xl p-5 border border-amber-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Pending Reimbursement
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-black text-amber-600 font-mono">
            ₹{pendingClaimsTotal.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-amber-800 flex items-center justify-between">
            <span>Claims under TPA audit</span>
            <button
              onClick={() => {
                setStatusFilter('CLAIM_PENDING');
                setClaimLinkedFilter('Yes');
              }}
              className="text-amber-900 font-bold hover:underline"
            >
              Filter pending
            </button>
          </div>
        </div>
      </div>

      {/* MONTHLY BREAKDOWN & CATEGORY STRIP */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Category Spending Breakdown
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>
              This Month: <strong className="text-slate-900 font-mono">₹{summary.currentMonthExpenses.toLocaleString('en-IN')}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Year-to-Date: <strong className="text-slate-900 font-mono">₹{summary.currentYearExpenses.toLocaleString('en-IN')}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {CATEGORIES.map((cat) => {
            const amount = summary.categoryBreakdown[cat.value] || 0;
            const isSelected = categoryFilter === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(isSelected ? 'All' : cat.value)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'ring-2 ring-teal-500 bg-teal-50/50 border-teal-300'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/80'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500 truncate">{cat.label}</div>
                <div className="text-xs font-bold text-slate-900 font-mono mt-1">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTERS & SEARCH TOOLBAR */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses, hospital, diagnosis, bills..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Timeframe */}
          <div>
            <select
              value={timeframeFilter}
              onChange={(e) => setTimeframeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Dates</option>
              <option value="month">Current Month</option>
              <option value="year">Current Year (2026)</option>
            </select>
          </div>

          {/* Claim Linked Filter */}
          <div>
            <select
              value={claimLinkedFilter}
              onChange={(e) => setClaimLinkedFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Insurance Status</option>
              <option value="Yes">Linked to Insurance Claim</option>
              <option value="No">Unclaimed (Out-of-Pocket)</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Payment Statuses</option>
              <option value="PAID">Paid in Full</option>
              <option value="CLAIM_PENDING">Claim Pending</option>
              <option value="REIMBURSED">Reimbursed</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PENDING">Pending Payment</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(categoryFilter !== 'All' || claimLinkedFilter !== 'All' || statusFilter !== 'All' || timeframeFilter !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
            <span className="text-slate-400 font-medium">Active filters:</span>
            {categoryFilter !== 'All' && (
              <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full font-medium flex items-center gap-1">
                Category: {categoryFilter}
                <button onClick={() => setCategoryFilter('All')} className="hover:text-teal-950">×</button>
              </span>
            )}
            {claimLinkedFilter !== 'All' && (
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-medium flex items-center gap-1">
                Claim: {claimLinkedFilter}
                <button onClick={() => setClaimLinkedFilter('All')} className="hover:text-indigo-950">×</button>
              </span>
            )}
            {statusFilter !== 'All' && (
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('All')} className="hover:text-amber-950">×</button>
              </span>
            )}
            {timeframeFilter !== 'all' && (
              <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 rounded-full font-medium flex items-center gap-1">
                Timeframe: {timeframeFilter}
                <button onClick={() => setTimeframeFilter('all')} className="hover:text-slate-950">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 rounded-full font-medium flex items-center gap-1">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-slate-950">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setCategoryFilter('All');
                setClaimLinkedFilter('All');
                setStatusFilter('All');
                setTimeframeFilter('all');
                setSearchQuery('');
              }}
              className="text-teal-700 hover:text-teal-900 font-bold ml-1"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* ITEMIZED EXPENSE LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Loading medical expenses ledger...</p>
          </div>
        ) : displayedExpenses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No medical expenses found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No medical expenses match your filter criteria. Click "Add Expense" to log consultation fees, pharmacy purchases, or hospital invoices.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Expense</span>
            </button>
          </div>
        ) : (
          displayedExpenses.map((expense) => {
            const catConfig = CATEGORIES.find((c) => c.value === expense.category) || CATEGORIES[7];
            const linkedClaim = claims.find((c) => c.id === expense.linkedClaimId);

            return (
              <motion.div
                key={expense.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-teal-200 p-5 shadow-xs transition-all hover:shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catConfig.bg} ${catConfig.color}`}>
                        {expense.category}
                      </span>

                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {expense.date}
                      </span>

                      {/* Payment Status Badge */}
                      {expense.paymentStatus === 'PAID' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      )}
                      {expense.paymentStatus === 'CLAIM_PENDING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Claim Pending
                        </span>
                      )}
                      {expense.paymentStatus === 'REIMBURSED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Reimbursed
                        </span>
                      )}
                      {expense.paymentStatus === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Pending Payment
                        </span>
                      )}
                      {expense.paymentStatus === 'PARTIALLY_PAID' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Partially Paid
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{expense.description}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Hospital className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{expense.hospitalOrClinic}</span>
                    </div>

                    {/* Linked Record & Linked Claim Pills */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {expense.linkedRecordId && (
                        <button
                          onClick={() => {
                            const rec =
                              records.find((r) => r.id === expense.linkedRecordId) ||
                              timelineEvents.find((t) => t.id === expense.linkedRecordId);
                            if (rec) setSelectedRecordForPreview(rec);
                            else addToast('Referenced clinical record not found', 'info');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                          title="Click to inspect referenced clinical report"
                        >
                          <FileText className="w-3 h-3 text-teal-600" />
                          <span>Record: {expense.linkedRecordTitle || expense.linkedRecordId}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </button>
                      )}

                      {expense.linkedClaimId ? (
                        <button
                          onClick={() => {
                            if (linkedClaim) {
                              setSelectedClaimForPreview(linkedClaim);
                            } else {
                              setActiveTab('insurance');
                            }
                          }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                          title="Click to view insurance claim dossier"
                        >
                          <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          <span>Claim: {expense.linkedClaimId}</span>
                          {linkedClaim && (
                            <span className="font-bold text-[10px] uppercase">
                              ({linkedClaim.claimStatus})
                            </span>
                          )}
                          <ExternalLink className="w-2.5 h-2.5 text-indigo-400" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFileClaimForExpense(expense)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Auto-file reimbursement claim with insurer"
                        >
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          <span>File Insurance Claim</span>
                          <ArrowRight className="w-3 h-3 text-amber-600" />
                        </button>
                      )}

                      {/* Receipt Document */}
                      {expense.receiptDocument ? (
                        <button
                          onClick={() => setSelectedReceiptForPreview(expense.receiptDocument)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-medium flex items-center gap-1.5"
                          title="View attached bill receipt"
                        >
                          <Paperclip className="w-3 h-3 text-emerald-600" />
                          <span>{expense.receiptDocument.fileName}</span>
                          <Eye className="w-2.5 h-2.5 text-emerald-500" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSimulateReceiptUpload(expense.id)}
                          className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-teal-700 hover:underline flex items-center gap-1"
                          title="Upload medical bill receipt"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>Attach Receipt</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Amounts & Actions */}
                  <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-center border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 gap-3 min-w-[210px]">
                    <div className="text-right">
                      <div className="text-base font-black text-slate-900 font-mono">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-end gap-2">
                        <span>
                          Covered:{' '}
                          <strong className="text-emerald-600 font-mono">
                            ₹{expense.insuranceCoveredAmount.toLocaleString('en-IN')}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Out-of-Pocket:{' '}
                          <strong className="text-rose-600 font-mono">
                            ₹{expense.patientPaidAmount.toLocaleString('en-IN')}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(expense)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-all"
                        title="Edit expense details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT MEDICAL EXPENSE */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingExpense ? 'Edit Medical Expense' : 'Log New Medical Expense'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Record hospital bills, medicines, consultations, and out-of-pocket costs.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Date of Expense</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hospital / Clinic */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hospital / Clinic / Pharmacy</label>
                  <input
                    type="text"
                    required
                    value={formData.hospitalOrClinic}
                    onChange={(e) => setFormData({ ...formData, hospitalOrClinic: e.target.value })}
                    placeholder="e.g. Apollo Speciality Hospital, MedPlus Pharmacy"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Treatment / Item Description</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Comprehensive Lipid Profile & HbA1c screening"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                {/* Financials Grid: Amount, Covered, Out-of-pocket */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Total Bill (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.amount}
                      onChange={(e) => handleAmountChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-800 font-semibold mb-1">Insurance Covered (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.insuranceCoveredAmount}
                      onChange={(e) => handleCoveredChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-rose-800 font-semibold mb-1">Out-of-Pocket (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.patientPaidAmount}
                      onChange={(e) => setFormData({ ...formData, patientPaidAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-rose-300 text-rose-700 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="PAID">Paid in Full</option>
                    <option value="CLAIM_PENDING">Claim Pending with Insurer</option>
                    <option value="REIMBURSED">Reimbursed to Bank Account</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="PENDING">Payment Pending / Due</option>
                  </select>
                </div>

                {/* Link to Medical Record */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Link with Clinical Record / Lab Test
                  </label>
                  <select
                    value={formData.linkedRecordId}
                    onChange={(e) => setFormData({ ...formData, linkedRecordId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="">-- No Linked Medical Record --</option>
                    {records.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.category || (r as any).recordType || 'Record'}) - {r.date || (r as any).recordDate || 'Recent'}
                      </option>
                    ))}
                    {timelineEvents.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.type || (t as any).eventType || 'Event'}) - {t.date}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Link to Insurance Claim */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Link with Insurance Claim
                  </label>
                  <select
                    value={formData.linkedClaimId}
                    onChange={(e) => setFormData({ ...formData, linkedClaimId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="">-- Unclaimed / Direct Out-of-Pocket --</option>
                    {claims.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.treatment} ({c.claimStatus}) - ₹{c.amountClaimed.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Receipt Attachment Input */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Attach Bill / Invoice Receipt
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.receiptFileName}
                      onChange={(e) => setFormData({ ...formData, receiptFileName: e.target.value })}
                      placeholder="e.g. Apollo_Invoice_Oct2026.pdf"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          receiptFileName: `Receipt_${formData.category}_${Date.now().toString().slice(-4)}.pdf`,
                        })
                      }
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap"
                    >
                      Attach Sample
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Notes / Pharmacy Details</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Paid via UPI; includes 30-day prescription refill."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingExpense ? 'Save Changes' : 'Record Expense'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: REFERENCED CLINICAL RECORD PREVIEW */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedRecordForPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedRecordForPreview.title}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Category: {selectedRecordForPreview.category || selectedRecordForPreview.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecordForPreview(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date</span>
                    <span className="font-bold text-slate-800">{selectedRecordForPreview.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Doctor / Hospital</span>
                    <span className="font-bold text-slate-800">
                      {selectedRecordForPreview.doctorName || selectedRecordForPreview.hospitalName || 'Attending Physician'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Clinical Summary / Impression</span>
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-200/80 leading-relaxed">
                    {selectedRecordForPreview.description || selectedRecordForPreview.summary || 'Clinical investigation confirmed no acute pathology.'}
                  </div>
                </div>

                {selectedRecordForPreview.findings && (
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1">Diagnostic Findings</span>
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-200/80 leading-relaxed">
                      {selectedRecordForPreview.findings}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedRecordForPreview(null);
                    setActiveTab('timeline');
                  }}
                  className="text-xs text-teal-600 hover:text-teal-800 font-bold flex items-center gap-1"
                >
                  <span>Open in Medical Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedRecordForPreview(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 3: CONNECTED INSURANCE CLAIM DETAILS */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedClaimForPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Claim: {selectedClaimForPreview.id}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Policy: {selectedClaimForPreview.policyNumber}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClaimForPreview(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Settlement Breakdown Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Claim Status</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 text-[11px]">
                    {selectedClaimForPreview.claimStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Claimed Amount</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      ₹{selectedClaimForPreview.amountClaimed.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[10px] uppercase font-semibold">Approved Amount</span>
                    <span className="font-bold text-emerald-600 text-sm font-mono">
                      ₹{(selectedClaimForPreview.amountApproved || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hospital</span>
                    <span className="font-medium text-slate-800 truncate block">
                      {selectedClaimForPreview.hospital}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-700 block text-[10px] uppercase font-semibold">Patient Paid</span>
                    <span className="font-bold text-rose-600 text-sm font-mono">
                      ₹{(selectedClaimForPreview.patientPaid || (selectedClaimForPreview.amountClaimed - (selectedClaimForPreview.amountApproved || 0))).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Treatment Description</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-200/80">
                  {selectedClaimForPreview.treatment}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedClaimForPreview(null);
                    setActiveTab('insurance');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 text-xs"
                >
                  <span>Open Full Claim Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedClaimForPreview(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 4: RECEIPT DOCUMENT VIEWER */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedReceiptForPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 truncate max-w-[240px]">
                      {selectedReceiptForPreview.fileName}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      {selectedReceiptForPreview.fileSize || '1.5 MB'} • Encrypted Vault
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReceiptForPreview(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Document Mock View */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <FileText className="w-12 h-12 text-teal-600 mx-auto" />
                <div className="text-xs font-bold text-slate-900">
                  {selectedReceiptForPreview.fileName}
                </div>
                <p className="text-[11px] text-slate-500">
                  Itemized Final Hospital Invoice & Tax Bill receipt voucher verified on Case Line.
                </p>
                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-full text-[10px]">
                  ✓ Verified Digital Hash
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    addToast(`Downloading ${selectedReceiptForPreview.fileName}...`, 'info');
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Voucher</span>
                </button>
                <button
                  onClick={() => setSelectedReceiptForPreview(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
