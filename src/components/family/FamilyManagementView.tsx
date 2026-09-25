import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { FamilyMember, ChildHealthMilestone } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  Baby,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Heart,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FamilyManagementView: React.FC = () => {
  const { user, addToast, t } = useApp();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);

  // New member form
  const [newMember, setNewMember] = useState({
    name: 'Sunita Sharma',
    relationship: 'Mother',
    age: 62,
    gender: 'Female',
    bloodGroup: 'B+',
    accessLevel: 'guardian' as const,
    allergies: 'Penicillin, Dust',
    conditions: 'Hypertension',
  });

  // New milestone form
  const [newMilestone, setNewMilestone] = useState({
    title: 'MMR Vaccine 2nd Dose',
    type: 'vaccine' as const,
    date: new Date().toISOString().split('T')[0],
    description: 'Measles, Mumps, and Rubella booster administered by pediatrician.',
    status: 'completed' as const,
  });

  const patientId = user?.role === 'patient' ? user.patientData?.id : user?.id || 'pat-001';

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await api.getFamilyMembers(patientId);
      setMembers(data || []);
      if (data && data.length > 0 && !selectedMember) {
        setSelectedMember(data[0]);
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to load family members', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [patientId]);

  const handleCreateMember = async () => {
    try {
      const res = await api.addFamilyMember(patientId, {
        fullName: newMember.name,
        name: newMember.name,
        relationship: newMember.relationship,
        age: Number(newMember.age),
        gender: newMember.gender,
        bloodGroup: newMember.bloodGroup,
        accessLevel: newMember.accessLevel,
        allergies: newMember.allergies.split(',').map((s) => s.trim()).filter(Boolean),
        conditions: newMember.conditions.split(',').map((s) => s.trim()).filter(Boolean),
      });

      setShowAddMemberModal(false);
      await loadMembers();
      setSelectedMember(res.member);
      addToast(`${res.member.fullName || res.member.name || 'Member'} added to family health ecosystem`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to add family member', 'error');
    }
  };

  const handleAddMilestone = async () => {
    if (!selectedMember) return;
    try {
      const res = await api.addChildTimelineMilestone(patientId, selectedMember.id, newMilestone);
      setSelectedMember(res.member);
      setMembers((prev) => prev.map((m) => (m.id === res.member.id ? res.member : m)));
      setShowAddMilestoneModal(false);
      addToast('Child health milestone recorded', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to record milestone', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Synchronizing multi-generational family health circle...</p>
      </div>
    );
  }

  return (
    <div id="family-management-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.familyProfiles}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized health management for your children, elderly parents, and dependents with granular role-based consent.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddMemberModal(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm shadow-teal-600/20 flex items-center gap-1.5 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Member Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((member) => {
          const isSelected = selectedMember?.id === member.id;
          const memberName = member.fullName || member.name || 'Family Member';
          const memberInitial = (memberName || 'M').charAt(0);
          const relStr = member.relationship || 'Dependent';
          const isChildRel =
            relStr.toLowerCase().includes('son') ||
            relStr.toLowerCase().includes('daughter') ||
            relStr.toLowerCase().includes('child');
          const accessStr = (member.accessLevel || 'Guardian').replace('_', ' ');

          return (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-50/70 border-teal-500 shadow-sm ring-2 ring-teal-500/20'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isChildRel ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {memberInitial}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{memberName}</div>
                    <div className="text-xs text-slate-500">
                      {relStr} • {member.age} yrs
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {member.bloodGroup || 'O+'}
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="capitalize">{accessStr}</span>
                <span className="font-semibold text-teal-700">{member.gender || 'Not specified'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Member Detail View */}
      {selectedMember && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Member Profile Overview */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedMember.fullName || selectedMember.name || 'Family Member'}
                </h2>
                <div className="text-xs text-slate-500">{selectedMember.relationship} of Primary Account</div>
              </div>
              <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-mono font-bold">
                {selectedMember.bloodGroup || 'O+'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Age / Gender:</span>
                <span className="font-semibold text-slate-800">
                  {selectedMember.age} years / {selectedMember.gender || 'Male'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Access Authority:</span>
                <span className="font-semibold text-teal-700 capitalize">
                  {(selectedMember.accessLevel || 'Guardian').replace('_', ' ')}
                </span>
              </div>
              <div className="py-1.5 border-b border-slate-100">
                <span className="text-slate-500 block mb-1">Known Allergies:</span>
                <div className="flex flex-wrap gap-1">
                  {(selectedMember.allergies || []).length > 0 ? (
                    (selectedMember.allergies || []).map((a, i) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-semibold">
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">No allergies recorded</span>
                  )}
                </div>
              </div>
              <div className="py-1.5">
                <span className="text-slate-500 block mb-1">Medical Conditions:</span>
                <div className="flex flex-wrap gap-1">
                  {((selectedMember.conditions && selectedMember.conditions.length > 0) || (selectedMember as any).medicalHistoryNotes) ? (
                    (selectedMember.conditions && selectedMember.conditions.length > 0
                      ? selectedMember.conditions
                      : [(selectedMember as any).medicalHistoryNotes]
                    ).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">No chronic conditions</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Consent & health proxy active for medical decision making.</span>
            </div>
          </div>

          {/* Child Health Timeline / Milestones */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Baby className="w-5 h-5 text-amber-600" />
                  <span>Child Health & Immunization Timeline</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pediatric vaccination checkpoints, growth percentiles, and developmental milestones.
                </p>
              </div>

              <button
                onClick={() => setShowAddMilestoneModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Log Milestone / Vaccine</span>
              </button>
            </div>

            {/* Milestones List */}
            {((selectedMember.childTimeline && selectedMember.childTimeline.length > 0) ||
              ((selectedMember as any).childHealthTimeline && (selectedMember as any).childHealthTimeline.length > 0)) ? (
              <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6 py-2">
                {(selectedMember.childTimeline || (selectedMember as any).childHealthTimeline || []).map((item: any) => {
                  const evType = (item.category || item.type || 'milestone').toLowerCase();
                  const evDesc = item.details || item.description || '';
                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Node */}
                      <div
                        className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                          item.status === 'completed' || item.verified
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-amber-500'
                        }`}
                      />

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{item.title}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                evType.includes('vaccin')
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : evType.includes('growth')
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : 'bg-sky-50 text-sky-700 border border-sky-200'
                              }`}
                            >
                              {item.category || item.type || 'Milestone'}
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{item.date}</span>
                          </span>
                        </div>

                        {evDesc && <p className="text-xs text-slate-600">{evDesc}</p>}
                        {item.doctorOrClinic && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Stethoscope className="w-3 h-3 text-teal-600" />
                            <span>{item.doctorOrClinic}</span>
                          </div>
                        )}

                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="capitalize font-medium text-slate-500">
                            Status: {item.status || (item.verified ? 'completed' : 'scheduled')}
                          </span>
                          {(item.status === 'completed' || item.verified) && (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Administration
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                No child health milestones recorded for this member. Click "Log Milestone / Vaccine" to add immunization records.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 bg-teal-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  <span className="font-bold text-sm">Add Family Dependent</span>
                </div>
                <button onClick={() => setShowAddMemberModal(false)} className="text-white/80 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      placeholder="Son, Daughter, Mother..."
                      value={newMember.relationship}
                      onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={newMember.age}
                      onChange={(e) => setNewMember({ ...newMember, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={newMember.gender}
                      onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={newMember.bloodGroup}
                      onChange={(e) => setNewMember({ ...newMember, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Access Authorization Level</label>
                  <select
                    value={newMember.accessLevel}
                    onChange={(e: any) => setNewMember({ ...newMember, accessLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="guardian">Legal Guardian (Full Management)</option>
                    <option value="full">Full Clinical View</option>
                    <option value="emergency_only">Emergency Profile Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allergies (comma separated)</label>
                  <input
                    type="text"
                    value={newMember.allergies}
                    onChange={(e) => setNewMember({ ...newMember, allergies: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Known Conditions (comma separated)</label>
                  <input
                    type="text"
                    value={newMember.conditions}
                    onChange={(e) => setNewMember({ ...newMember, conditions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMember}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  Create Member
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Milestone Modal */}
      <AnimatePresence>
        {showAddMilestoneModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 bg-teal-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Baby className="w-5 h-5" />
                  <span className="font-bold text-sm">Log Health Milestone for {selectedMember.name}</span>
                </div>
                <button onClick={() => setShowAddMilestoneModal(false)} className="text-white/80 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Milestone Title</label>
                  <input
                    type="text"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    placeholder="e.g. MMR Booster, Weight 12kg check..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={newMilestone.type}
                      onChange={(e: any) => setNewMilestone({ ...newMilestone, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="vaccine">Immunization / Vaccine</option>
                      <option value="growth">Growth & Height/Weight</option>
                      <option value="visit">Pediatric Clinic Visit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date Administered</label>
                    <input
                      type="date"
                      value={newMilestone.date}
                      onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description / Clinic Notes</label>
                  <textarea
                    rows={2}
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMilestone}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  Save Milestone
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
