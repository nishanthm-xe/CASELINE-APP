import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { Language } from '../../types';
import {
  Activity,
  Bell,
  Menu,
  PhoneCall,
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Droplets,
  Stethoscope,
  ChevronDown,
  Languages,
  Radio,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const {
    user,
    role,
    activeTab,
    setActiveTab,
    toggleSidebar,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    logout,
    loginDemoPatient,
    loginDemoDoctor,
    loginDemoBloodBank,
    setActiveModal,
    language,
    setLanguage,
    t,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'consent_request':
      case 'consent_granted':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case 'report_uploaded':
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'blood_emergency':
        return <Droplets className="w-4 h-4 text-rose-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-sky-600" />;
    }
  };

  const getLangLabel = (code: Language) => {
    switch (code) {
      case 'ta':
        return 'தமிழ்';
      case 'hi':
        return 'हिन्दी';
      default:
        return 'EN';
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              id="sidebar-toggle-btn"
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => {
              if (user) {
                setActiveTab('home');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  CASE<span className="text-teal-600 ml-1">LINE</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 rounded border border-teal-200/60">
                  Health OS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Navigation (When Logged Out) */}
        {!user && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#hero" className="hover:text-teal-600 transition-colors">{t.home}</a>
            <a href="#features" className="hover:text-teal-600 transition-colors">{t.medicalTimeline}</a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">{t.emergencyQR}</a>
            <a href="#privacy" className="hover:text-teal-600 transition-colors">{t.privacyConsent}</a>
            <a href="#emergency" className="hover:text-teal-600 transition-colors">{t.bloodEmergency}</a>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Multilingual Selector (English, Tamil, Hindi) */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
              title="Select Ecosystem Language"
            >
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              <span>{getLangLabel(language)}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 overflow-hidden text-xs"
                >
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-teal-50 ${
                      language === 'en' ? 'font-bold text-teal-700 bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('ta');
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-teal-50 ${
                      language === 'ta' ? 'font-bold text-teal-700 bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>தமிழ் (Tamil)</span>
                    {language === 'ta' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('hi');
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-teal-50 ${
                      language === 'hi' ? 'font-bold text-teal-700 bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    {language === 'hi' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!user ? (
            <>
              {/* Quick Demo Shortcuts for Hackathon Evaluation */}
              <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg border border-slate-200">
                <button
                  id="nav-demo-patient-btn"
                  onClick={loginDemoPatient}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-white rounded transition-all flex items-center gap-1"
                  title="Instant Demo Patient Login"
                >
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Patient</span>
                </button>
                <button
                  id="nav-demo-doctor-btn"
                  onClick={loginDemoDoctor}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-white rounded transition-all flex items-center gap-1"
                  title="Instant Demo Doctor Login"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Doctor</span>
                </button>
                <button
                  id="nav-demo-bloodbank-btn"
                  onClick={loginDemoBloodBank}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-white rounded transition-all flex items-center gap-1"
                  title="Instant Demo Blood Bank Center Login"
                >
                  <Droplets className="w-3.5 h-3.5 text-rose-600" />
                  <span>Blood Bank</span>
                </button>
              </div>

              <button
                id="landing-live-voice-btn"
                onClick={() => setActiveModal('live_voice')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition-all"
                title="Live Voice Conversation (gemini-3.1-flash-live-preview)"
              >
                <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                <span>Live Voice AI</span>
              </button>

              <button
                id="landing-login-btn"
                onClick={() => setActiveModal('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t.login}
              </button>
              <button
                id="landing-get-started-btn"
                onClick={() => setActiveModal('role_select')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm shadow-teal-600/20 transition-all hover:shadow-md"
              >
                {t.register}
              </button>
            </>
          ) : (
            <>
              {/* Authenticated Portal Identity Badge */}
              <div className="hidden xl:flex items-center gap-2">
                {role === 'patient' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200/80 text-teal-800 rounded-lg text-xs font-semibold">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>Patient Health Portal</span>
                  </span>
                )}
                {role === 'doctor' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200/80 text-indigo-800 rounded-lg text-xs font-semibold">
                    <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Doctor Clinical Workstation</span>
                  </span>
                )}
                {role === 'bloodbank' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200/80 text-rose-800 rounded-lg text-xs font-semibold">
                    <Droplets className="w-3.5 h-3.5 text-rose-600" />
                    <span>Blood Bank Registry</span>
                  </span>
                )}
              </div>

              {/* High-Impact Persistent Emergency SOS Button */}
              <button
                id="emergency-sos-primary-btn"
                onClick={() => setActiveModal('emergency_sos')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-lg shadow-sm shadow-rose-600/30 transition-all animate-pulse"
                title="Open Emergency SOS Broadcast Mode"
              >
                <Radio className="w-3.5 h-3.5 text-white" />
                <span>{t.sosEmergency}</span>
              </button>

              {/* Quick AI Live Voice Conversation (gemini-3.1-flash-live-preview) */}
              <button
                id="nav-live-voice-btn"
                onClick={() => setActiveModal('live_voice')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 hover:from-teal-700 hover:to-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md group"
                title="Start Real-time Voice Conversation with gemini-3.1-flash-live-preview"
              >
                <Radio className="w-3.5 h-3.5 text-teal-200 animate-pulse" />
                <span>Live Voice AI</span>
                <span className="hidden sm:inline px-1 py-0.2 rounded text-[9px] bg-white/20 text-white font-mono">Live</span>
              </button>

              {/* Quick AI Report Explainer shortcut */}
              <button
                onClick={() => setActiveModal('report_explainer')}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                title="Explain Lab or Biopsy Report with AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>AI Explainer</span>
              </button>

              {/* Summary Docket trigger */}
              <button
                onClick={() => setActiveModal('medical_summary')}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                title="Generate Verified Clinical Medical Summary"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-slate-600" />
                <span>{t.medicalSummary}</span>
              </button>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  id="notifications-bell-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                    >
                      <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">{t.smartNotifications}</span>
                          {unreadCount > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              setActiveModal('notifications');
                            }}
                            className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
                          >
                            Open Center
                          </button>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationAsRead(n.id);
                                if (n.linkAction) {
                                  setActiveTab(n.linkAction);
                                  setShowNotifications(false);
                                }
                              }}
                              className={`p-3.5 text-left hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 ${
                                !n.isRead ? 'bg-teal-50/40' : ''
                              }`}
                            >
                              <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
                                {getNotifIcon(n.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                                    {n.title}
                                  </h4>
                                  {!n.isRead && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile Pill */}
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover border border-teal-400"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                    <span>{user.fullName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {role === 'patient'
                      ? user.patientData?.patientCode || 'PT-000001'
                      : role === 'doctor'
                      ? user.doctorData?.doctorCode || 'DR-000001'
                      : 'BB-0001'}
                  </div>
                </div>

                <button
                  id="navbar-logout-btn"
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
