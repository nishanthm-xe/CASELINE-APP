import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, Patient, Doctor, NotificationItem, Language } from '../types';
import { translations, Translations } from './i18n';
import { api } from './api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export type ActiveModalType =
  | 'role_select'
  | 'patient_reg'
  | 'doctor_reg'
  | 'login'
  | 'emergency_call'
  | 'emergency_sos'
  | 'report_explainer'
  | 'medical_summary'
  | 'notifications'
  | 'live_voice'
  | null;

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone: string;
  phoneNumber?: string;
  avatarUrl?: string;
  patientData?: Patient;
  doctorData?: Doctor;
}

interface AppContextType {
  user: AppUser | null;
  role: UserRole | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  login: (ident: string, pass: string, targetRole?: UserRole) => Promise<void>;
  loginDemoPatient: () => Promise<void>;
  loginDemoDoctor: () => Promise<void>;
  loginDemoBloodBank: () => Promise<void>;
  logout: () => void;
  selectedDoctorPatientId: string | null;
  setSelectedDoctorPatientId: (id: string | null) => void;
  activeModal: ActiveModalType;
  setActiveModal: (modal: ActiveModalType) => void;
  updateUserPatientData: (patient: Patient) => void;
  explainingReport: any;
  setExplainingReport: (report: any) => void;
  showNotificationCenter: boolean;
  setShowNotificationCenter: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('caseline_lang');
      if (saved === 'ta' || saved === 'hi' || saved === 'en') return saved;
      return 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('caseline_lang', lang);
    } catch (e) {
      console.warn('Failed to save language preference', e);
    }
  };

  const t = translations[language] || translations.en;

  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('caseline_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState<UserRole | null>(() => {
    try {
      const saved = localStorage.getItem('caseline_role');
      return (saved as UserRole) || null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedDoctorPatientId, setSelectedDoctorPatientId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [explainingReport, setExplainingReport] = useState<any>(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const targetId = user.role === 'patient' ? user.patientData?.id : user.doctorData?.id;
      const data = await api.getNotifications(targetId || user.id);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 12000);
      return () => clearInterval(interval);
    }
  }, [user, refreshNotifications]);

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    try {
      const targetId = user.role === 'patient' ? user.patientData?.id : user.doctorData?.id;
      await api.markAllNotificationsRead(targetId || user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      addToast('All notifications marked as read', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => {
        const item = prev.find((n) => n.id === id);
        if (item && !item.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
      addToast('Notification archived', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const targetId = user?.role === 'patient' ? user.patientData?.id : user?.doctorData?.id;
      await api.clearAllNotifications(targetId || user?.id);
      setNotifications([]);
      setUnreadCount(0);
      addToast('All notifications cleared', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const login = async (identifier: string, password: string, targetRole?: UserRole) => {
    try {
      const res = await api.login(identifier, password, targetRole);
      setUser(res.user);
      setRole(res.user.role);
      setActiveTab('home');
      setActiveModal(null);
      try {
        localStorage.setItem('caseline_user', JSON.stringify(res.user));
        localStorage.setItem('caseline_role', res.user.role);
        if (res.token) {
          localStorage.setItem('caseline_token', res.token);
        }
      } catch (e) {
        console.warn('localStorage save failed', e);
      }
      addToast(`Welcome back, ${res.user.fullName}!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const loginDemoPatient = async () => {
    try {
      await login('patient@example.com', 'demo123', 'patient');
    } catch (e) {
      console.error(e);
    }
  };

  const loginDemoDoctor = async () => {
    try {
      await login('doctor@example.com', 'demo123', 'doctor');
    } catch (e) {
      console.error(e);
    }
  };

  const loginDemoBloodBank = async () => {
    try {
      await login('bloodbank@caseline.in', 'demo123', 'bloodbank');
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setActiveTab('home');
    setSelectedDoctorPatientId(null);
    setNotifications([]);
    setUnreadCount(0);
    try {
      localStorage.removeItem('caseline_user');
      localStorage.removeItem('caseline_role');
      localStorage.removeItem('caseline_token');
    } catch (e) {
      console.warn('localStorage remove failed', e);
    }
    addToast('Logged out successfully', 'info');
  };

  const updateUserPatientData = (updated: Patient) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        fullName: updated.fullName,
        patientData: updated,
      };
    });
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        notifications,
        unreadCount,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        toasts,
        addToast,
        removeToast,
        login,
        loginDemoPatient,
        loginDemoDoctor,
        loginDemoBloodBank,
        logout,
        selectedDoctorPatientId,
        setSelectedDoctorPatientId,
        activeModal,
        setActiveModal,
        updateUserPatientData,
        explainingReport,
        setExplainingReport,
        showNotificationCenter,
        setShowNotificationCenter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
