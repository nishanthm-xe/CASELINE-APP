import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Droplets,
  ShieldCheck,
  ShieldAlert,
  X,
  CheckCheck,
  Clock,
  Trash2,
  Archive,
  MessageSquare,
  Pill,
  Tent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    setActiveTab,
    t,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'emergency') return (n.type as string) === 'blood_emergency' || (n.type as string).includes('sos');
    if (filterType === 'consent') return (n.type as string).includes('consent') || (n.type as string).includes('access');
    if (filterType === 'medical') return (n.type as string) === 'report_uploaded' || (n.type as string).includes('medication') || (n.type as string) === 'prescription';
    if (filterType === 'appointment') return (n.type as string).includes('appointment');
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'consent_request':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'consent_granted':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'consent_denied':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'report_uploaded':
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 'appointment':
      case 'appointment_confirmed':
      case 'appointment_reminder':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'blood_emergency':
      case 'blood_accepted':
        return <Droplets className="w-4 h-4 text-rose-600" />;
      case 'medication_reminder':
      case 'medication':
        return <Pill className="w-4 h-4 text-purple-600" />;
      case 'health_camp':
        return <Tent className="w-4 h-4 text-teal-600" />;
      case 'doctor_message':
        return <MessageSquare className="w-4 h-4 text-sky-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-sky-600" />;
    }
  };

  const handleNotificationClick = (item: any) => {
    if (!item.isRead) {
      markNotificationAsRead(item.id);
    }
    onClose();
    if (item.type === 'blood_emergency' || item.type === 'blood_accepted') {
      setActiveTab('blood');
    } else if (item.type.includes('appointment')) {
      setActiveTab('appointments');
    } else if (item.type === 'report_uploaded') {
      setActiveTab('timeline');
    } else if (item.type.includes('consent') || item.type.includes('access')) {
      setActiveTab('privacy');
    } else if (item.type.includes('medication')) {
      setActiveTab('medications');
    }
  };

  return (
    <div id="notification-center-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">{t.smartNotifications}</h2>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread alert(s)` : 'All alerts caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                title="Mark All as Read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="px-2 py-1 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                title="Archive All Notifications"
              >
                <Archive className="w-3 h-3" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'emergency', label: 'Emergencies' },
            { id: 'consent', label: 'Doctor Access' },
            { id: 'medical', label: 'Reports & Rx' },
            { id: 'appointment', label: 'Appointments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                filterType === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No notifications matching this category.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl transition-all flex items-start gap-3 group ${
                  !item.isRead ? 'bg-teal-50/40 hover:bg-teal-50' : 'hover:bg-slate-50'
                }`}
              >
                <div
                  onClick={() => handleNotificationClick(item)}
                  className="mt-0.5 p-2 bg-white rounded-lg border border-slate-200 shadow-xs shrink-0 cursor-pointer"
                >
                  {getIcon(item.type)}
                </div>

                <div
                  onClick={() => handleNotificationClick(item)}
                  className="flex-1 min-w-0 space-y-0.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${!item.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{item.message}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  {!item.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-teal-600 rounded transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors opacity-70 group-hover:opacity-100"
                    title="Archive notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Real-time database alerts</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
