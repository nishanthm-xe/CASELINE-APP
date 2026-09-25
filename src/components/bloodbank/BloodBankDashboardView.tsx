import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { BloodGroupStock, EmergencySOS } from '../../types';
import {
  Droplets,
  Plus,
  Minus,
  AlertTriangle,
  Ambulance,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  Heart,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import { motion } from 'motion/react';

export const BloodBankDashboardView: React.FC = () => {
  const { addToast } = useApp();
  const [inventory, setInventory] = useState<BloodGroupStock[]>([]);
  const [activeSOSList, setActiveSOSList] = useState<EmergencySOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [inv, sos] = await Promise.all([
        api.getBloodInventory(),
        api.getActiveSOS(),
      ]);
      let items: BloodGroupStock[] = [];
      if (Array.isArray(inv)) {
        items = inv as BloodGroupStock[];
      } else if (inv && typeof inv === 'object') {
        items = Object.entries(inv).map(([bg, u]) => {
          const count = Number(u) || 0;
          const status = count <= 3 ? 'critical' : count <= 7 ? 'low' : 'adequate';
          return { bloodGroup: bg, unitsAvailable: count, status };
        });
      }
      setInventory(items);
      setActiveSOSList(sos || []);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to load blood bank operations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStock = async (bloodGroup: string, change: number) => {
    const currentItem = inventory.find((i) => i.bloodGroup === bloodGroup);
    if (!currentItem) return;
    const newUnits = Math.max(0, currentItem.unitsAvailable + change);

    try {
      const res = await api.updateBloodStock(bloodGroup, newUnits);
      setInventory((prev) =>
        prev.map((item) => (item.bloodGroup === bloodGroup ? (res.inventory as BloodGroupStock) : item))
      );
      addToast(`Updated ${bloodGroup} inventory to ${newUnits} units`, 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to update blood inventory', 'error');
    }
  };

  const handleDispatchUnits = (sosId: string, patientName: string, bloodGroup: string) => {
    handleUpdateStock(bloodGroup, -2);
    addToast(`2 units of ${bloodGroup} allocated & dispatched to ${patientName}`, 'success');
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Connecting to State Blood Transfusion Inventory Grid...</p>
      </div>
    );
  }

  const totalUnits = inventory.reduce((acc, curr) => acc + curr.unitsAvailable, 0);
  const criticalShortages = inventory.filter((i) => i.status === 'critical' || i.status === 'low');

  return (
    <div id="blood-bank-dashboard-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Blood Bank & Emergency Dispatch Hub</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-100 text-rose-800 rounded-full">
                  Real-Time Grid
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Karnataka State Transfusion Service Node • Bangalore Red Cross Blood Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Grid</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Reserve Units</span>
          <div className="text-3xl font-black text-rose-700 mt-2">{totalUnits}</div>
          <div className="text-xs text-slate-500 mt-1">Units tested & cross-matched</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Critical Blood Shortages</span>
          <div className="text-3xl font-black text-amber-600 mt-2">{criticalShortages.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            {criticalShortages.length > 0
              ? `Groups: ${criticalShortages.map((i) => i.bloodGroup).join(', ')}`
              : 'All groups sufficient'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active SOS Dispatches</span>
          <div className="text-3xl font-black text-indigo-700 mt-2">{activeSOSList.length}</div>
          <div className="text-xs text-slate-500 mt-1">Real-time trauma emergency broadcasts</div>
        </div>
      </div>

      {/* Real-Time Blood Stock Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Blood Group Stock Counters</h2>
            <p className="text-xs text-slate-500">Click + or - to adjust stock upon collection or transfusion</p>
          </div>
          <span className="text-xs font-mono text-slate-400">8 Groups Tracked</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {inventory.map((item) => (
            <div
              key={item.bloodGroup}
              className={`p-4 rounded-xl border transition-all ${
                item.status === 'critical'
                  ? 'bg-rose-50/50 border-rose-300'
                  : item.status === 'low'
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-slate-900">{item.bloodGroup}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    item.status === 'critical'
                      ? 'bg-rose-600 text-white'
                      : item.status === 'low'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-3">
                <span className="text-2xl font-black text-slate-900">{item.unitsAvailable}</span>
                <span className="text-xs text-slate-500 font-semibold">units</span>
              </div>

              {/* Increments */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <button
                  onClick={() => handleUpdateStock(item.bloodGroup, -1)}
                  className="flex-1 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 text-xs font-bold flex items-center justify-center transition-colors"
                  title="Dispense 1 Unit"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleUpdateStock(item.bloodGroup, 1)}
                  className="flex-1 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
                  title="Add 1 Unit"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incoming SOS Trauma Broadcasts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ambulance className="w-5 h-5 text-rose-600" />
              <span>Incoming Emergency Traumas (SOS Transfusion Requests)</span>
            </h2>
            <p className="text-xs text-slate-500">Coordinate emergency blood supply with dispatched 108 ambulances</p>
          </div>
          <span className="px-2 py-0.5 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
            {activeSOSList.length} Active
          </span>
        </div>

        {activeSOSList.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
            No active emergency SOS requests requiring immediate blood dispatch.
          </div>
        ) : (
          <div className="space-y-3">
            {activeSOSList.map((sos) => (
              <div
                key={sos.id}
                className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{sos.patientName}</span>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      Required: {sos.bloodGroup || 'O+'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">ID: {sos.patientCode}</span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sos.locationAddress}</span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-4 pt-1">
                    <span>Assigned Center: <strong>{sos.assignedHospital}</strong></span>
                    <span>Ambulance ETA: <strong className="text-rose-700">{sos.ambulanceEtaMinutes} mins</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDispatchUnits(sos.id, sos.patientName, sos.bloodGroup || 'O+')}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Droplets className="w-4 h-4" />
                    <span>Dispatch 2 Units</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
