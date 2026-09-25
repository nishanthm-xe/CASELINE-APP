import {
  Patient,
  Doctor,
  MedicalTimelineEvent,
  MedicalRecord,
  BiopsyReport,
  LabReport,
  Treatment,
  Appointment,
  ConsentRequest,
  AuditLog,
  NearbyFacility,
  BloodBank,
  BloodEmergencyRequest,
  HealthCamp,
  NotificationItem,
  Prescription,
  MedicationLog,
  HealthMeasurement,
  EmergencyProfile,
  SOSActivationEvent,
  FamilyMember,
  ChildHealthTimelineEvent,
  MedicalSummaryData,
  AIReportExplanation,
  InsuranceProfile,
  InsuranceClaim,
  InsuranceDocument,
  ClaimStatus,
  AIPolicyExplanation,
  MedicalExpense,
  MedicalExpenseCategory,
  Language,
  UserRole,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {};
  if (extra) {
    if (extra instanceof Headers) {
      extra.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(extra)) {
      extra.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, extra);
    }
  }

  try {
    const rawUser =
  localStorage.getItem('caseline_user') ||
  localStorage.getItem('caseline_session_patient');

const role =
  localStorage.getItem('caseline_role') || 'patient';

const token =
  localStorage.getItem('caseline_token') ||
  localStorage.getItem('caseline_auth_token');

if (rawUser) {
  const user = JSON.parse(rawUser);

  const activeRole = user.role || role;

  const patientId =
    user.patientData?.caseLinePatientId || user.patientData?.case_line_patient_id || user.patientData?.id ||
    user.patientData?.patientId ||
    user.caseLinePatientId ||
    user.patientId ||
    user.id;

  headers['x-user-role'] = activeRole;

  if (activeRole === 'patient') {
    headers['x-user-id'] = patientId;
    headers['x-patient-id'] = patientId;
  }

  if (activeRole === 'doctor' && user.doctorData?.id) {
    headers['x-doctor-id'] = user.doctorData.id;
    headers['x-user-id'] = user.doctorData.id;
  }
}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }

  return headers;
}

function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const customHeaders = init?.headers;
  const mergedHeaders = getAuthHeaders(customHeaders);
  return fetch(input, {
    ...init,
    headers: mergedHeaders,
  });
}


export const api = {
  // Auth
  async login(identifier: string, password: string, role?: UserRole) {
    const res = await authFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Authentication failed');
    }
    return res.json();
  },

  async registerPatient(data: any) {
    const res = await authFetch(`${API_BASE}/auth/register-patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Patient registration failed');
    }
    return res.json();
  },

  async registerDoctor(data: any) {
    const res = await authFetch(`${API_BASE}/auth/register-doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Doctor registration failed');
    }
    return res.json();
  },

  // Patients
  async getPatient(id: string): Promise<Patient> {
    const res = await authFetch(`${API_BASE}/patients/${id}`);
    if (!res.ok) throw new Error('Patient not found');
    return res.json();
  },

  async updateEmergencyContact(patientId: string, contactData: any) {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/emergency-contact`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    if (!res.ok) throw new Error('Failed to update emergency contact');
    return res.json();
  },

  async getTimeline(patientId: string): Promise<MedicalTimelineEvent[]> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/timeline?format=mobile`);
    if (!res.ok) throw new Error('Failed to load timeline');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.timelineEvents || []);
  },

  async getRecords(patientId: string): Promise<MedicalRecord[]> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/records`);
    if (!res.ok) throw new Error('Failed to load records');
    return res.json();
  },

  async getBiopsyReports(patientId: string, doctorId?: string): Promise<{ consentRequired: boolean; reports: BiopsyReport[] }> {
    const url = doctorId ? `${API_BASE}/patients/${patientId}/biopsy-reports?doctorId=${doctorId}` : `${API_BASE}/patients/${patientId}/biopsy-reports`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to load biopsy reports');
    return res.json();
  },

  async getLabReports(patientId: string): Promise<LabReport[]> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/lab-reports`);
    if (!res.ok) throw new Error('Failed to load lab reports');
    return res.json();
  },

  async getTreatments(patientId: string): Promise<Treatment[]> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/treatments`);
    if (!res.ok) throw new Error('Failed to load treatments');
    return res.json();
  },

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    const res = await authFetch(`${API_BASE}/doctors`);
    if (!res.ok) throw new Error('Failed to load doctors');
    return res.json();
  },

  async getDoctor(id: string): Promise<Doctor> {
    const res = await authFetch(`${API_BASE}/doctors/${id}`);
    if (!res.ok) throw new Error('Doctor not found');
    return res.json();
  },

  async updateDoctorAvailability(doctorId: string, data: { availabilityStatus?: string; opdSchedule?: string }) {
    const res = await authFetch(`${API_BASE}/doctors/${doctorId}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update doctor availability');
    return res.json();
  },

  async updateDoctorProfile(doctorId: string, data: Partial<Doctor>) {
    const res = await authFetch(`${API_BASE}/doctors/${doctorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update doctor profile');
    return res.json();
  },

  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    const res = await authFetch(`${API_BASE}/doctors/${doctorId}/appointments`);
    if (!res.ok) throw new Error('Failed to load appointments');
    return res.json();
  },

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const res = await authFetch(`${API_BASE}/appointments/${appointmentId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update appointment status');
    return res.json();
  },

  async searchPatient(query: string, doctorId?: string) {
    const url = doctorId ? `${API_BASE}/search-patient?q=${encodeURIComponent(query)}&doctorId=${doctorId}` : `${API_BASE}/search-patient?q=${encodeURIComponent(query)}`;
    const res = await authFetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Search failed' }));
      throw new Error(err.error || 'Patient not found');
    }
    return res.json();
  },

  async searchPatients(query?: string): Promise<{ patients: Patient[] }> {
    const url = query ? `${API_BASE}/patients?q=${encodeURIComponent(query)}` : `${API_BASE}/patients`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to fetch patients');
    const patients = await res.json();
    return { patients };
  },

  // Consent
  async requestConsent(data: { doctorId: string; patientId: string; resourceType: string; reason?: string; doctorName?: string; hospitalName?: string }) {
    const res = await authFetch(`${API_BASE}/consent/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to request consent');
    return res.json();
  },

  async createConsentRequest(data: { doctorId: string; patientId: string; resourceType: string; reason?: string; doctorName?: string; hospitalName?: string }) {
    return this.requestConsent(data);
  },

  async createRecord(data: any): Promise<{ success: boolean; record: MedicalRecord }> {
    const res = await authFetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create clinical record');
    return res.json();
  },

  async respondConsent(consentRequestId: string, decision: 'GRANTED' | 'DENIED' | 'REVOKED') {
    const res = await authFetch(`${API_BASE}/consent/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentRequestId, decision }),
    });
    if (!res.ok) throw new Error('Failed to update consent');
    return res.json();
  },

  async getConsentRequests(params: { patientId?: string; doctorId?: string }): Promise<ConsentRequest[]> {
    const q = new URLSearchParams(params as any).toString();
    const res = await authFetch(`${API_BASE}/consent/requests?${q}`);
    if (!res.ok) throw new Error('Failed to load consent requests');
    return res.json();
  },

  async cancelConsentRequest(consentRequestId: string) {
    const res = await authFetch(`${API_BASE}/consent/requests/${consentRequestId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to cancel consent request');
    return res.json();
  },

  async demoApproveConsent(consentRequestId: string) {
    const res = await authFetch(`${API_BASE}/consent/demo-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentRequestId }),
    });
    if (!res.ok) throw new Error('Failed to approve consent request');
    return res.json();
  },

  // Upload Report
  async uploadReport(data: any) {
    const res = await authFetch(`${API_BASE}/reports/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload report');
    }
    return res.json();
  },

  // Healthcare Facilities
  async getNearbyHealthcare(type?: string, search?: string): Promise<{ facilities: NearbyFacility[]; doctors: any[] }> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    const res = await authFetch(`${API_BASE}/healthcare/nearby?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load nearby healthcare');
    return res.json();
  },

  // Blood Banks & Emergency
  async getBloodBanks(bloodGroup?: string): Promise<BloodBank[]> {
    const url = bloodGroup ? `${API_BASE}/blood-banks?bloodGroup=${encodeURIComponent(bloodGroup)}` : `${API_BASE}/blood-banks`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to load blood banks');
    return res.json();
  },

  async createBloodEmergency(data: any): Promise<{ success: boolean; request: BloodEmergencyRequest }> {
    const res = await authFetch(`${API_BASE}/blood-emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit emergency blood request');
    return res.json();
  },

  async getBloodEmergencies(patientId?: string): Promise<BloodEmergencyRequest[]> {
    const url = patientId ? `${API_BASE}/blood-emergency?patientId=${patientId}` : `${API_BASE}/blood-emergency`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to load blood emergencies');
    return res.json();
  },

  async updateBloodEmergencyStatus(requestId: string, status: string, bloodBankName?: string) {
    const res = await authFetch(`${API_BASE}/blood-emergency/${requestId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, bloodBankName }),
    });
    if (!res.ok) throw new Error('Failed to update blood emergency status');
    return res.json();
  },

  // Health Camps
  async getHealthCamps(specialization?: string): Promise<HealthCamp[]> {
    const url = specialization ? `${API_BASE}/health-camps?specialization=${encodeURIComponent(specialization)}` : `${API_BASE}/health-camps`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to load health camps');
    return res.json();
  },

  async registerHealthCamp(campId: string, patientId: string) {
    const res = await authFetch(`${API_BASE}/health-camps/${campId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Failed to register for camp');
    }
    return res.json();
  },

  async getHealthCampRegistrations(patientId: string): Promise<any[]> {
    const res = await authFetch(`${API_BASE}/health-camps/registrations/${patientId}`);
    if (!res.ok) return [];
    return res.json();
  },

  // Notifications
  async getNotifications(userId?: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const url = userId ? `${API_BASE}/notifications?userId=${userId}` : `${API_BASE}/notifications`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to load notifications');
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await authFetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  async markAllNotificationsRead(userId?: string) {
    const res = await authFetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async deleteNotification(id: string) {
    const res = await authFetch(`${API_BASE}/notifications/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async clearAllNotifications(userId?: string) {
    const url = userId ? `${API_BASE}/notifications?userId=${userId}` : `${API_BASE}/notifications`;
    const res = await authFetch(url, { method: 'DELETE' });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(userId?: string): Promise<AuditLog[]> {
    const url = userId ? `${API_BASE}/audit-logs?userId=${userId}` : `${API_BASE}/audit-logs`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
  },

  // AI Assistant
  async askAIAssistant(prompt: string, patientName?: string, history?: any[]) {
    const res = await authFetch(`${API_BASE}/ai-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, patientName, history }),
    });
    if (!res.ok) throw new Error('AI Assistant response error');
    return res.json();
  },

  // Reset Demo
  async resetDemo() {
    const res = await authFetch(`${API_BASE}/reset-demo`, { method: 'POST' });
    return res.json();
  },

  // -------------------------------------------------------------
  // EMERGENCY SOS & QR HEALTH CARD
  // -------------------------------------------------------------
  async getEmergencyProfile(patientId: string): Promise<EmergencyProfile> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/emergency-profile`);
    if (!res.ok) throw new Error('Failed to load emergency profile');
    return res.json();
  },

  async updateEmergencyProfile(patientId: string, data: Partial<EmergencyProfile>) {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/emergency-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update emergency profile');
    return res.json();
  },

  async triggerSOS(patientId: string, location?: { latitude: number; longitude: number; address?: string }): Promise<SOSActivationEvent> {
    const res = await authFetch(`${API_BASE}/emergency/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, location }),
    });
    if (!res.ok) throw new Error('Failed to activate emergency SOS');
    return res.json();
  },

  async getActiveSOSEvents(): Promise<SOSActivationEvent[]> {
    const res = await authFetch(`${API_BASE}/emergency/sos/active`);
    if (!res.ok) throw new Error('Failed to load active SOS events');
    return res.json();
  },

  async resolveSOSEvent(sosId: string) {
    const res = await authFetch(`${API_BASE}/emergency/sos/${sosId}/resolve`, { method: 'POST' });
    return res.json();
  },

  async getQRCardPublic(token: string, viewerRole: string = 'First Responder') {
    const res = await authFetch(`${API_BASE}/emergency/qr/${token}?viewerRole=${encodeURIComponent(viewerRole)}`);
    if (!res.ok) throw new Error('Emergency QR card not found or disabled');
    return res.json();
  },

  async regenerateQR(patientId: string) {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/regenerate-qr`, { method: 'POST' });
    return res.json();
  },

  async toggleQRAccess(patientId: string, enabled: boolean) {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/toggle-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    return res.json();
  },

  // -------------------------------------------------------------
  // PRESCRIPTIONS & MEDICATION TRACKER
  // -------------------------------------------------------------
  async getPrescriptions(patientId?: string, doctorId?: string): Promise<Prescription[]> {
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (doctorId) params.append('doctorId', doctorId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await authFetch(`${API_BASE}/prescriptions${query}`);
    if (!res.ok) throw new Error('Failed to load prescriptions');
    return res.json();
  },

  async createPrescription(data: Partial<Prescription>) {
    const res = await authFetch(`${API_BASE}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create prescription');
    return res.json();
  },

  async addTimelineEvent(data: any) {
    const res = await authFetch(`${API_BASE}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to record timeline event');
    return res.json();
  },

  async addTreatment(data: any) {
    const res = await authFetch(`${API_BASE}/treatments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to record treatment regimen');
    return res.json();
  },

  async getTodayMedications(patientId: string): Promise<{ logs: MedicationLog[]; adherenceRate: number }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/medications/today`);
    if (!res.ok) throw new Error('Failed to load medication schedule');
    return res.json();
  },

  async logMedicationAdherence(patientId: string, medId: string, data: any) {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/medications/${medId}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update medication adherence');
    return res.json();
  },

  // -------------------------------------------------------------
  // HEALTH TRENDS & BIOMARKERS
  // -------------------------------------------------------------
  async getHealthMeasurements(patientId: string): Promise<HealthMeasurement[]> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/vitals`);
    if (!res.ok) throw new Error('Failed to load health measurements');
    return res.json();
  },

  async logHealthMeasurement(patientId: string, measurement: Partial<HealthMeasurement>) {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(measurement),
    });
    if (!res.ok) throw new Error('Failed to save health measurement');
    return res.json();
  },

  // -------------------------------------------------------------
  // APPOINTMENTS
  // -------------------------------------------------------------
  async getAppointments(params?: { patientId?: string; doctorId?: string }): Promise<Appointment[]> {
    const query = new URLSearchParams();
    if (params?.patientId) query.append('patientId', params.patientId);
    if (params?.doctorId) query.append('doctorId', params.doctorId);
    const res = await authFetch(`${API_BASE}/appointments?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load appointments');
    return res.json();
  },

  async bookAppointment(data: Partial<Appointment>): Promise<Appointment> {
    const res = await authFetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Booking failed' }));
      throw new Error(err.error || 'Failed to book appointment');
    }
    return res.json();
  },

  async rescheduleAppointment(id: string, appointmentDate: string, notes?: string) {
    const res = await authFetch(`${API_BASE}/appointments/${id}/reschedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentDate, notes }),
    });
    if (!res.ok) throw new Error('Failed to reschedule appointment');
    return res.json();
  },

  async cancelAppointment(id: string, reason?: string) {
    const res = await authFetch(`${API_BASE}/appointments/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to cancel appointment');
    return res.json();
  },

  // -------------------------------------------------------------
  // FAMILY & DEPENDENT PROFILES
  // -------------------------------------------------------------
  async getFamilyMembers(primaryUserId: string): Promise<FamilyMember[]> {
    const res = await authFetch(`${API_BASE}/family/${primaryUserId}`);
    if (!res.ok) throw new Error('Failed to load family members');
    return res.json();
  },

  async addFamilyMember(primaryUserId: string, data: any): Promise<{ success: boolean; member: FamilyMember }> {
    const res = await authFetch(`${API_BASE}/family/${primaryUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add family member');
    return res.json();
  },

  async updateFamilyMember(primaryUserId: string, memberId: string, data: Partial<FamilyMember>) {
    const res = await authFetch(`${API_BASE}/family/${primaryUserId}/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update family member');
    return res.json();
  },

  async removeFamilyMember(primaryUserId: string, memberId: string) {
    const res = await authFetch(`${API_BASE}/family/${primaryUserId}/members/${memberId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async addChildTimelineEvent(primaryUserId: string, memberId: string, event: Partial<ChildHealthTimelineEvent>): Promise<{ success: boolean; member: FamilyMember }> {
    const res = await authFetch(`${API_BASE}/family/${primaryUserId}/members/${memberId}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return res.json();
  },

  // -------------------------------------------------------------
  // MEDICAL SUMMARY GENERATOR
  // -------------------------------------------------------------
  async getMedicalSummary(patientId: string): Promise<MedicalSummaryData> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/medical-summary`);
    if (!res.ok) throw new Error('Failed to generate medical summary');
    return res.json();
  },

  // -------------------------------------------------------------
  // AI REPORT EXPLAINER
  // -------------------------------------------------------------
  async explainReport(reportData: any, language: Language = 'en'): Promise<AIReportExplanation> {
    const res = await authFetch(`${API_BASE}/ai/explain-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportData, language }),
    });
    if (!res.ok) throw new Error('Failed to explain report');
    return res.json();
  },

  // -------------------------------------------------------------
  // BLOOD BANK INVENTORY
  // -------------------------------------------------------------
  async getBloodInventory(): Promise<Record<string, number>> {
    const res = await authFetch(`${API_BASE}/blood-inventory`);
    if (!res.ok) throw new Error('Failed to load blood inventory');
    return res.json();
  },

  async updateBloodInventory(inventory: Record<string, number>) {
    const res = await authFetch(`${API_BASE}/blood-inventory`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventory }),
    });
    return res.json();
  },

  // Convenience Aliases
  async getPatientVitals(patientId: string): Promise<HealthMeasurement[]> {
    return this.getHealthMeasurements(patientId);
  },

  async logVitalMeasurement(patientId: string, data: Partial<HealthMeasurement>) {
    return this.logHealthMeasurement(patientId, data);
  },

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    return this.bookAppointment(data);
  },

  async updateAppointment(id: string, data: any) {
    if (data.status === 'CANCELLED' || data.reason) {
      return this.cancelAppointment(id, data.reason);
    }
    return this.rescheduleAppointment(id, data.appointmentDate || data.date, data.notes);
  },

  async getActiveSOS(): Promise<SOSActivationEvent[]> {
    return this.getActiveSOSEvents();
  },

  async updateBloodStock(bloodGroupOrInventory: string | Record<string, number>, units?: number) {
    if (typeof bloodGroupOrInventory === 'string') {
      const current = await this.getBloodInventory();
      current[bloodGroupOrInventory] = units || 0;
      await this.updateBloodInventory(current);
      const u = units || 0;
      return {
        inventory: {
          bloodGroup: bloodGroupOrInventory,
          unitsAvailable: u,
          status: u < 5 ? 'Critical' : u < 15 ? 'Low' : 'Adequate',
          lastRestocked: 'Just now',
        },
      };
    }
    return this.updateBloodInventory(bloodGroupOrInventory);
  },

  async regenerateEmergencyQR(patientId: string) {
    return this.regenerateQR(patientId);
  },

  async scanEmergencyQR(token: string, viewerRole: string = 'First Responder') {
    return this.getQRCardPublic(token, viewerRole);
  },

  async triggerEmergencySOS(patientIdOrData: any, location?: { latitude: number; longitude: number; address?: string }) {
    if (typeof patientIdOrData === 'object') {
      const pid = patientIdOrData.patientId || 'pat-001';
      const loc = {
        latitude: patientIdOrData.latitude,
        longitude: patientIdOrData.longitude,
        address: patientIdOrData.locationAddress || patientIdOrData.address,
      };
      return this.triggerSOS(pid, loc);
    }
    return this.triggerSOS(patientIdOrData, location);
  },

  async resolveSOS(sosId: string) {
    return this.resolveSOSEvent(sosId);
  },

  async addChildTimelineMilestone(primaryUserId: string, memberId: string, event: Partial<ChildHealthTimelineEvent>) {
    return this.addChildTimelineEvent(primaryUserId, memberId, event);
  },

  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    return this.getPrescriptions(patientId);
  },

  async getPatientMedicationLogs(patientId: string): Promise<{ logs: MedicationLog[]; adherenceRate: number }> {
    return this.getTodayMedications(patientId);
  },

  async logMedicationStatus(patientId: string, medId: string, data: any) {
    return this.logMedicationAdherence(patientId, medId, data);
  },

  // ==========================================
  // MEDICAL INSURANCE MODULE API METHODS
  // ==========================================

  async getInsuranceData(
    patientId: string,
    requester?: { role: UserRole; id: string }
  ): Promise<{
    profile: InsuranceProfile | null;
    claims: InsuranceClaim[];
    documents: InsuranceDocument[];
  }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (requester) {
      headers['x-user-role'] = requester.role;
      headers['x-user-id'] = requester.id;
    }
    const res = await authFetch(`${API_BASE}/patients/${patientId}/insurance`, {
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch insurance data' }));
      throw new Error(err.error || 'Failed to fetch insurance data');
    }
    return res.json();
  },

  async updateInsuranceProfile(
    patientId: string,
    profileData: Partial<InsuranceProfile>
  ): Promise<{ success: boolean; profile: InsuranceProfile }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/insurance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update insurance profile' }));
      throw new Error(err.error || 'Failed to update insurance profile');
    }
    return res.json();
  },

  async uploadInsuranceDocument(
    patientId: string,
    docData: Partial<InsuranceDocument>
  ): Promise<{ success: boolean; document: InsuranceDocument }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/insurance/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to upload insurance document' }));
      throw new Error(err.error || 'Failed to upload insurance document');
    }
    return res.json();
  },

  async getInsuranceClaims(patientId: string): Promise<{ success: boolean; claims: InsuranceClaim[] }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/insurance/claims`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch insurance claims' }));
      throw new Error(err.error || 'Failed to fetch insurance claims');
    }
    return res.json();
  },

  async createInsuranceClaim(
    patientId: string,
    claimData: Partial<InsuranceClaim>
  ): Promise<{ success: boolean; claim: InsuranceClaim }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/insurance/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create insurance claim' }));
      throw new Error(err.error || 'Failed to create insurance claim');
    }
    return res.json();
  },

  async updateClaimStatus(
    patientId: string,
    claimId: string,
    updateData: {
      status: ClaimStatus;
      note?: string;
      amountApproved?: number;
      actor?: string;
    }
  ): Promise<{ success: boolean; claim: InsuranceClaim }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/insurance/claims/${claimId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update claim status' }));
      throw new Error(err.error || 'Failed to update claim status');
    }
    return res.json();
  },

  async explainInsurancePolicy(
    policyDetails: any,
    language: Language = 'en'
  ): Promise<{ success: boolean; explanation: AIPolicyExplanation }> {
    const res = await authFetch(`${API_BASE}/ai/explain-policy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policyDetails, language }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to explain policy' }));
      throw new Error(err.error || 'Failed to explain policy');
    }
    return res.json();
  },

  async checkPolicyExpiry(patientId: string): Promise<{
    success: boolean;
    expiryStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
    daysRemaining: number;
    validUntil: string;
    notificationSent: boolean;
    profile: InsuranceProfile;
  }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/insurance/check-expiry`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to check policy expiry' }));
      throw new Error(err.error || 'Failed to check policy expiry');
    }
    return res.json();
  },

  // ==========================================
  // MEDICAL EXPENSES MODULE API METHODS
  // ==========================================

  async getMedicalExpenses(
    patientId: string,
    filters?: {
      category?: string;
      hospital?: string;
      claimLinked?: string;
      status?: string;
      timeframe?: 'month' | 'year' | 'all';
    },
    requester?: { role: UserRole; id: string }
  ): Promise<{
    success: boolean;
    expenses: MedicalExpense[];
    summary: {
      totalExpenses: number;
      insuranceCovered: number;
      outOfPocket: number;
      currentMonthExpenses: number;
      currentYearExpenses: number;
      categoryBreakdown: Record<string, number>;
      expenseCount: number;
    };
  }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (requester) {
      headers['x-user-role'] = requester.role;
      headers['x-user-id'] = requester.id;
    } else {
      try {
        const stored = localStorage.getItem('caseline_user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u.role) headers['x-user-role'] = u.role;
          const pid = u.patientData?.id || u.doctorData?.id || u.id;
          if (pid) headers['x-user-id'] = pid;
        }
      } catch (e) {}
    }

    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.hospital) params.set('hospital', filters.hospital);
    if (filters?.claimLinked !== undefined) params.set('claimLinked', filters.claimLinked);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.timeframe) params.set('timeframe', filters.timeframe);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await authFetch(`${API_BASE}/patients/${patientId}/expenses${query}`, {
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to load medical expenses' }));
      throw new Error(err.error || 'Failed to load medical expenses');
    }
    return res.json();
  },

  async createMedicalExpense(
    patientId: string,
    expenseData: Partial<MedicalExpense>
  ): Promise<{ success: boolean; expense: MedicalExpense }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const stored = localStorage.getItem('caseline_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role) headers['x-user-role'] = u.role;
        const pid = u.patientData?.id || u.id;
        if (pid) headers['x-user-id'] = pid;
      }
    } catch (e) {}

    const res = await authFetch(`${API_BASE}/patients/${patientId}/expenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(expenseData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create medical expense' }));
      throw new Error(err.error || 'Failed to create medical expense');
    }
    return res.json();
  },

  async updateMedicalExpense(
    patientId: string,
    expenseId: string,
    expenseData: Partial<MedicalExpense>
  ): Promise<{ success: boolean; expense: MedicalExpense }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/expenses/${expenseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update medical expense' }));
      throw new Error(err.error || 'Failed to update medical expense');
    }
    return res.json();
  },

  async deleteMedicalExpense(
    patientId: string,
    expenseId: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete medical expense' }));
      throw new Error(err.error || 'Failed to delete medical expense');
    }
    return res.json();
  },

  async uploadExpenseReceipt(
    patientId: string,
    expenseId: string,
    receiptData: { fileName: string; fileSize?: string; fileType?: string; fileUrl?: string }
  ): Promise<{ success: boolean; expense: MedicalExpense; receiptDocument: any }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/expenses/${expenseId}/receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to upload expense receipt' }));
      throw new Error(err.error || 'Failed to upload expense receipt');
    }
    return res.json();
  },

  async linkExpenseToClaim(
    patientId: string,
    expenseId: string,
    options: { claimId?: string; createNewClaim?: boolean }
  ): Promise<{ success: boolean; expense: MedicalExpense; claim: InsuranceClaim }> {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/expenses/${expenseId}/link-claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to link expense to insurance claim' }));
      throw new Error(err.error || 'Failed to link expense to insurance claim');
    }
    return res.json();
  },

  // Document Scanning & Import
  async getScannedDocuments(patientId: string) {
    const res = await authFetch(`${API_BASE}/patients/${patientId}/scanned-documents`);
    if (!res.ok) throw new Error('Failed to load scanned documents');
    return res.json();
  },

  async extractDocumentOcr(data: { fileData?: string; mimeType?: string; fileName?: string }) {
    const res = await authFetch(`${API_BASE}/documents/ocr-extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to extract OCR metadata');
    return res.json();
  },

  async scanAndImportDocument(data: {
    patientId: string;
    documentType: string;
    title: string;
    hospitalOrClinic?: string;
    doctorName?: string;
    documentDate?: string;
    fileName?: string;
    fileType?: string;
    fileData?: string;
    ocrText?: string;
    extractedMetadata?: any;
    notes?: string;
  }) {
    const res = await authFetch(`${API_BASE}/documents/scan-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to import document');
    return res.json();
  },

  // Patient Case-Taking & Clinical Summary
  async getClinicalIntakeSessions(patientId: string) {
    const res = await authFetch(`${API_BASE}/clinical-intake/${patientId}`);
    if (!res.ok) throw new Error('Failed to load clinical intake sessions');
    return res.json();
  },

  async saveClinicalIntakeSession(data: any) {
    const res = await authFetch(`${API_BASE}/clinical-intake/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save clinical intake session');
    return res.json();
  },

  async processClinicalIntake(data: {
    transcript?: string;
    chiefComplaint?: string;
    language?: string;
    ayushEnabled?: boolean;
  }) {
    const res = await authFetch(`${API_BASE}/clinical-intake/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to process clinical intake input');
    return res.json();
  },

  async clinicalIntakeVoiceChat(data: {
    patientId?: string;
    message: string;
    history?: Array<{ role: 'assistant' | 'patient'; text: string }>;
    language?: string;
    currentClinicalData?: Record<string, any>;
    ayushEnabled?: boolean;
  }) {
    const res = await authFetch(`${API_BASE}/clinical-intake/voice-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to communicate with Case Line Voice Assistant');
    return res.json();
  },

  async getDoctorClinicalSummary(patientId: string) {
    const res = await authFetch(`${API_BASE}/clinical-summary/${patientId}`);
    if (!res.ok) throw new Error('Failed to load doctor clinical summary');
    return res.json();
  },

  async generateDoctorClinicalSummary(patientId: string) {
    const res = await authFetch(`${API_BASE}/clinical-intake/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (!res.ok) throw new Error('Failed to generate doctor clinical summary');
    return res.json();
  },

  async generateDoctorSummary(payload: any) {
    const res = await authFetch(`${API_BASE}/clinical-intake/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate doctor clinical summary');
    return res.json();
  },

  async performOcr(fileData: string, docType?: string) {
    return this.extractDocumentOcr({
      fileData,
      mimeType: fileData.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg',
      fileName: `doc_${Date.now()}.${docType || 'record'}`,
    });
  },
};
