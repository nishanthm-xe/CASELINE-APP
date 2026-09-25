import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { NearbyFacility } from '../../types';
import {
  MapPin,
  Hospital,
  Building2,
  Stethoscope,
  Phone,
  Navigation,
  Star,
  Clock,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const NearbyHealthcareView: React.FC = () => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'hospital' | 'clinic' | 'doctor'>('all');
  const [search, setSearch] = useState('');
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<NearbyFacility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const typeParam = activeTab === 'all' || activeTab === 'doctor' ? undefined : activeTab;
        const res = await api.getNearbyHealthcare(typeParam, search || undefined);
        const list = Array.isArray(res?.facilities) ? res.facilities : [];
        setFacilities(list);
        if (list.length > 0 && !selectedFacility) {
          setSelectedFacility(list[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, [activeTab, search]);

  const handleCall = (phone: string, name: string) => {
    addToast(`Dialing ${name} (${phone})... Connecting to triage reception.`, 'info');
  };

  const handleDirections = (name: string) => {
    addToast(`Opening navigation route to ${name} via GPS.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Healthcare Geo-Locator</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Nearby Clinics & Hospitals</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Locate accredited emergency centers, specialty clinics, and consulting practitioners within your radius.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: 'all', label: 'All Facilities', icon: Building2 },
            { id: 'hospital', label: 'Hospitals', icon: Hospital },
            { id: 'clinic', label: 'Clinics', icon: Stethoscope },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout: Interactive Map + Facilities List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List with Search */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by facility name, locality, or specialty..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
            />
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {(facilities || []).map((f) => {
              const isSelected = selectedFacility?.id === f.id;
              const displayDistance = f.distance || (f.distanceKm ? `${f.distanceKm} km` : '2.1 km');
              const displaySpecs = f.specializations || f.specialties || ['General Medicine', 'Emergency Support'];
              const displayHours = f.operatingHours || f.openHours || '24 Hours Open';
              const displayPhone = f.phone || f.phoneNumber || '+91 80 2500 0000';

              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFacility(f)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-400 shadow-sm'
                      : 'bg-white border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {f.type}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{f.name}</h3>
                      <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{f.address} • <strong className="text-teal-700">{displayDistance}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{f.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({f.reviewsCount || 120})</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {displaySpecs.map((sp, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        {sp}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{displayHours}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(displayPhone, f.name);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-teal-600" />
                        <span>Call</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirections(f.name);
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Directions</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Styled Interactive Visual Healthcare Map */}
        <div className="lg:col-span-6 sticky top-20">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900">Interactive Location Radar</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Radius: 5.0 KM</span>
            </div>

            {/* Custom Interactive Map Canvas */}
            <div className="relative h-96 w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
              {/* Radial Radar Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#14b8a618_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="absolute w-72 h-72 rounded-full border border-teal-500/20 animate-ping opacity-25" />
              <div className="absolute w-56 h-56 rounded-full border border-teal-500/30" />
              <div className="absolute w-32 h-32 rounded-full border border-teal-500/40" />

              {/* User Location Center Node */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center ring-8 ring-teal-500/30 shadow-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                </div>
                <span className="mt-2 text-[10px] font-bold text-teal-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-teal-500/30">
                  You (Bellandur)
                </span>
              </div>

              {/* Map Pins */}
              {facilities.map((fac, idx) => {
                const isSelected = selectedFacility?.id === fac.id;
                // Position pins across the radar visually
                const positions = [
                  { top: '22%', left: '26%' },
                  { top: '30%', right: '22%' },
                  { bottom: '26%', left: '30%' },
                  { bottom: '20%', right: '28%' },
                ];
                const pos = positions[idx % positions.length];

                return (
                  <div
                    key={fac.id}
                    style={{ position: 'absolute', ...pos }}
                    onClick={() => setSelectedFacility(fac)}
                    className="z-20 cursor-pointer group flex flex-col items-center"
                  >
                    <div
                      className={`p-2 rounded-xl flex items-center justify-center transition-transform ${
                        isSelected
                          ? 'bg-rose-500 text-white scale-125 shadow-lg shadow-rose-500/50 ring-4 ring-white'
                          : 'bg-white text-slate-900 group-hover:scale-110 shadow-md'
                      }`}
                    >
                      <Hospital className="w-4 h-4" />
                    </div>
                    <span
                      className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md ${
                        isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-900 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {(fac.name || 'Facility').split(' ')[0]} ({fac.distance || (fac.distanceKm ? `${fac.distanceKm} km` : '2.1 km')})
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected Pin Mini Information Drawer */}
            {selectedFacility && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{selectedFacility.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {selectedFacility.address} • {selectedFacility.operatingHours || selectedFacility.openHours || '24 Hours Open'}
                  </div>
                </div>
                <button
                  onClick={() => handleDirections(selectedFacility.name)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0"
                >
                  Navigate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
