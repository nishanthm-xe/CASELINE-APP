import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  Settings,
  Bell,
  Shield,
  RotateCcw,
  CheckCircle2,
  Lock,
  Smartphone,
  Eye,
  Loader2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { addToast } = useApp();
  const [resetting, setResetting] = useState(false);

  const [notifications, setNotifications] = useState({
    emergencyAlerts: true,
    consentRequests: true,
    reportUploads: true,
    emailDigest: false,
  });

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await api.resetDemo();
      addToast('Demo database successfully re-seeded to initial preloaded state!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      addToast('Failed to reset demo', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>Application Configuration</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">Platform Settings</h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Configure security defaults, real-time clinical notification triggers, and demo environment state.
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-sm text-slate-900">Notification Channels</h3>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              key: 'emergencyAlerts',
              title: 'Emergency Blood & 108 Alarms',
              desc: 'High-priority auditory and SMS alerts for time-critical emergency requests.',
            },
            {
              key: 'consentRequests',
              title: 'Practitioner Consent Requests',
              desc: 'Instant notifications whenever an attending physician requests report access.',
            },
            {
              key: 'reportUploads',
              title: 'Diagnostic Report Uploads',
              desc: 'Notifications when new lab assays or biopsy histopathology results are published.',
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div>
                <div className="font-bold text-slate-900">{item.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={(notifications as any)[item.key]}
                onChange={(e) =>
                  setNotifications({ ...notifications, [item.key]: e.target.checked })
                }
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Demo Environment Management */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <RotateCcw className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-sm text-slate-900">System Sandbox & Reset Environment</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Need to restore the initial test scenario? Clicking the button below resets all patient timelines,
          biopsy records, doctor consent states, and emergency blood requisitions back to default preloaded values.
        </p>

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
        >
          {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          <span>{resetting ? 'Re-seeding Demo Database...' : 'Reset Demo Database to Initial State'}</span>
        </button>
      </div>
    </div>
  );
};
