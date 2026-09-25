-- ==========================================================
-- CASE LINE - Supabase PostgreSQL Schema & Security Policies
-- "Your Health. Your History. Your Control."
-- ==========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  full_name TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_code VARCHAR(20) NOT NULL UNIQUE, -- PT-000001
  case_line_patient_id VARCHAR(20) UNIQUE, -- CL-10001; permanent cross-channel identity
  dob DATE NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  aadhaar_last4 VARCHAR(4) NOT NULL, -- Masked identity (UIDAI mock)
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_code VARCHAR(20) NOT NULL UNIQUE, -- DR-000001
  registration_number VARCHAR(50) NOT NULL UNIQUE,
  specialization VARCHAR(100) NOT NULL,
  qualification VARCHAR(100) NOT NULL,
  experience_years INT NOT NULL DEFAULT 0,
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (verification_status IN ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')),
  rating NUMERIC(2,1) DEFAULT 4.9,
  available_timings VARCHAR(100) DEFAULT '09:00 AM - 05:00 PM',
  certificate_file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EMERGENCY CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email TEXT,
  address TEXT,
  blood_group VARCHAR(5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEDICAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('Consultation', 'Diagnosis', 'Prescription', 'Discharge Summary')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  record_date DATE NOT NULL,
  notes TEXT,
  vital_signs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MEDICAL TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.medical_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  doctor_name TEXT,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  description TEXT NOT NULL,
  report_attachment JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BIOPSY REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.biopsy_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  specimen_type TEXT NOT NULL,
  site_of_biopsy TEXT NOT NULL,
  collection_date DATE NOT NULL,
  report_date DATE NOT NULL,
  pathologist_name TEXT NOT NULL,
  histopathological_findings TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  grade_stage TEXT,
  margins TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Benign', 'Malignant', 'Inconclusive', 'Normal')),
  is_sensitive BOOLEAN DEFAULT TRUE,
  report_file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LAB REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  test_category VARCHAR(100) NOT NULL,
  report_date DATE NOT NULL,
  tests JSONB NOT NULL, -- Array of { testName, result, unit, referenceRange, status }
  pathologist_summary TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  report_file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TREATMENTS TABLE
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  treatment_name TEXT NOT NULL,
  medications JSONB NOT NULL,
  dosage_instructions TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'Ongoing' CHECK (status IN ('Ongoing', 'Completed', 'Paused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  appointment_date TIMESTAMPTZ NOT NULL,
  purpose TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-show')),
  hospital_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CONSENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.consent_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'GRANTED', 'DENIED', 'REVOKED')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_role VARCHAR(20) NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details TEXT NOT NULL,
  ip_address VARCHAR(45)
);

-- 13. CLINICS & HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Clinic', 'Hospital', 'Diagnostic Center')),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  distance_km NUMERIC(4,1) DEFAULT 2.5,
  rating NUMERIC(2,1) DEFAULT 4.7,
  open_hours VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  emergency_24x7 BOOLEAN DEFAULT TRUE,
  latitude NUMERIC(10,6) NOT NULL,
  longitude NUMERIC(10,6) NOT NULL,
  specialties JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13A. CROSS-CHANNEL HOSPITAL ENCOUNTERS
-- One row represents one hospital visit. Patient-facing exposure is restricted
-- to verified/completed encounters by the RLS policy below.
CREATE TABLE IF NOT EXISTS public.encounters (
  encounter_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE RESTRICT,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  chief_complaint TEXT NOT NULL DEFAULT '',
  clinical_summary TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'doctor_review', 'verified', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Existing clinical artifacts can be linked to an encounter without breaking
-- historical rows that predate the encounter model.
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES public.encounters(encounter_id) ON DELETE SET NULL;
ALTER TABLE public.medical_timeline ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES public.encounters(encounter_id) ON DELETE SET NULL;
ALTER TABLE public.biopsy_reports ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES public.encounters(encounter_id) ON DELETE SET NULL;
ALTER TABLE public.lab_reports ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES public.encounters(encounter_id) ON DELETE SET NULL;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES public.encounters(encounter_id) ON DELETE SET NULL;

-- Backfill one permanent CASE LINE identity for existing patients.
UPDATE public.patients
SET case_line_patient_id = 'CL-' || LPAD((10000 + COALESCE(NULLIF(REGEXP_REPLACE(patient_code, '\D', '', 'g'), '')::INTEGER, 0))::TEXT, 5, '0')
WHERE case_line_patient_id IS NULL;

ALTER TABLE public.patients ALTER COLUMN case_line_patient_id SET NOT NULL;

-- 14. BLOOD BANKS TABLE
CREATE TABLE IF NOT EXISTS public.blood_banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  distance_km NUMERIC(4,1) DEFAULT 3.0,
  latitude NUMERIC(10,6) NOT NULL,
  longitude NUMERIC(10,6) NOT NULL,
  operating_hours VARCHAR(100) DEFAULT '24 Hours Open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. BLOOD INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.blood_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blood_bank_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  available_units INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blood_bank_id, blood_group)
);

-- 16. BLOOD EMERGENCY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.blood_emergency_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_code VARCHAR(20) NOT NULL UNIQUE, -- REQ-000001
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  units_required INT NOT NULL CHECK (units_required > 0),
  hospital_name TEXT NOT NULL,
  hospital_location TEXT NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  required_at TIMESTAMPTZ NOT NULL,
  emergency_level VARCHAR(20) NOT NULL CHECK (emergency_level IN ('CRITICAL', 'URGENT', 'STANDARD')),
  additional_notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ACCEPTED', 'RESERVED', 'COLLECTED', 'REJECTED')),
  allocated_blood_bank_id UUID REFERENCES public.blood_banks(id) ON DELETE SET NULL,
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. HEALTH CAMPS TABLE
CREATE TABLE IF NOT EXISTS public.health_camps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  specialization VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  start_time VARCHAR(20) NOT NULL,
  end_time VARCHAR(20) NOT NULL,
  location TEXT NOT NULL,
  contact VARCHAR(20) NOT NULL,
  total_slots INT NOT NULL,
  available_slots INT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. HEALTH CAMP REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.health_camp_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id UUID NOT NULL REFERENCES public.health_camps(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'Registered',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(camp_id, patient_id)
);

-- 19. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_patients_code ON public.patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_patients_case_line_id ON public.patients(case_line_patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_profile ON public.patients(profile_id);
CREATE INDEX IF NOT EXISTS idx_doctors_code ON public.doctors(doctor_code);
CREATE INDEX IF NOT EXISTS idx_timeline_patient ON public.medical_timeline(patient_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_biopsy_patient ON public.biopsy_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_patient ON public.lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consent_patient_doctor ON public.consent_requests(patient_id, doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_patient ON public.blood_emergency_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_encounters_patient_date ON public.encounters(patient_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_encounters_status ON public.encounters(status);
CREATE INDEX IF NOT EXISTS idx_encounters_doctor ON public.encounters(doctor_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_encounter ON public.medical_records(encounter_id);
CREATE INDEX IF NOT EXISTS idx_timeline_encounter ON public.medical_timeline(encounter_id);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biopsy_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;

-- 1. Patients read their own records
CREATE POLICY "Patients view own profile" ON public.profiles FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Patients manage own profile" ON public.profiles FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Patients view own patient record" ON public.patients FOR SELECT 
  USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Patients manage emergency contacts" ON public.emergency_contacts FOR ALL
  USING (patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid()));

CREATE POLICY "Patients view own timeline" ON public.medical_timeline FOR SELECT
  USING (patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid()));

CREATE POLICY "Patients view verified encounters" ON public.encounters FOR SELECT
  USING (
    status IN ('verified', 'completed')
    AND patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid())
  );

CREATE POLICY "Doctors manage own encounters" ON public.encounters FOR ALL
  USING (
    doctor_id IN (SELECT d.id FROM public.doctors d JOIN public.profiles pr ON d.profile_id = pr.id WHERE pr.auth_user_id = auth.uid())
  )
  WITH CHECK (
    doctor_id IN (SELECT d.id FROM public.doctors d JOIN public.profiles pr ON d.profile_id = pr.id WHERE pr.auth_user_id = auth.uid())
  );

CREATE POLICY "Patients view own biopsy reports" ON public.biopsy_reports FOR SELECT
  USING (patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid()));

CREATE POLICY "Patients view own lab reports" ON public.lab_reports FOR SELECT
  USING (patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid()));

-- 2. Doctors view patient data with consent
CREATE POLICY "Doctors view biopsy with consent" ON public.biopsy_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consent_requests cr
      JOIN public.doctors d ON cr.doctor_id = d.id
      JOIN public.profiles pr ON d.profile_id = pr.id
      WHERE pr.auth_user_id = auth.uid()
        AND cr.patient_id = biopsy_reports.patient_id
        AND cr.status = 'GRANTED'
        AND (cr.expires_at IS NULL OR cr.expires_at > NOW())
    )
    OR doctor_id IN (SELECT d.id FROM public.doctors d JOIN public.profiles pr ON d.profile_id = pr.id WHERE pr.auth_user_id = auth.uid())
  );

-- ==========================================================
-- MEDICAL INSURANCE MODULE TABLES & POLICIES
-- ==========================================================

-- 14. INSURANCE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.insurance_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  insurance_provider TEXT NOT NULL,
  policy_number VARCHAR(100) NOT NULL,
  policy_type VARCHAR(100) NOT NULL,
  coverage_amount NUMERIC(12, 2) NOT NULL,
  remaining_coverage NUMERIC(12, 2),
  deductible TEXT,
  copay TEXT,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  tpa_name TEXT,
  tpa_contact TEXT,
  tpa_email TEXT,
  network_hospitals JSONB DEFAULT '[]'::jsonb,
  policy_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (policy_status IN ('ACTIVE', 'RENEWAL_DUE', 'EXPIRED', 'PENDING_VERIFICATION', 'LAPSED')),
  insurance_card_url TEXT,
  policy_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. INSURANCE CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  insurance_profile_id UUID REFERENCES public.insurance_profiles(id) ON DELETE CASCADE,
  insurance_provider TEXT NOT NULL,
  policy_number VARCHAR(100) NOT NULL,
  hospital TEXT NOT NULL,
  treatment TEXT NOT NULL,
  treatment_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  date_of_treatment DATE NOT NULL,
  amount_claimed NUMERIC(12, 2) NOT NULL,
  amount_approved NUMERIC(12, 2) DEFAULT 0.00,
  claim_status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED' CHECK (claim_status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'SETTLED')),
  submitted_date TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  required_documents JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. INSURANCE DOCUMENTS TABLE (Private Storage)
CREATE TABLE IF NOT EXISTS public.insurance_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  insurance_profile_id UUID REFERENCES public.insurance_profiles(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES public.insurance_claims(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('insurance_card', 'policy_document', 'discharge_summary', 'hospital_bill', 'prescription', 'investigation_report', 'other')),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size VARCHAR(20) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Insurance Module
CREATE INDEX IF NOT EXISTS idx_insurance_profiles_patient ON public.insurance_profiles(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_profiles_policy ON public.insurance_profiles(policy_number);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient ON public.insurance_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON public.insurance_claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_insurance_docs_claim ON public.insurance_documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_insurance_docs_patient ON public.insurance_documents(patient_id);

-- Row Level Security for Insurance Module
ALTER TABLE public.insurance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_documents ENABLE ROW LEVEL SECURITY;

-- Patients have full access to their own insurance profiles, claims, and documents
CREATE POLICY "Patients view own insurance profile" ON public.insurance_profiles FOR SELECT
  USING (patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid()));

CREATE POLICY "Patients manage own insurance profile" ON public.insurance_profiles FOR ALL
  USING (patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid()));

CREATE POLICY "Patients view own insurance claims" ON public.insurance_claims FOR SELECT
  USING (patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid()));

CREATE POLICY "Patients manage own insurance claims" ON public.insurance_claims FOR ALL
  USING (patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid()));

CREATE POLICY "Patients view own insurance documents" ON public.insurance_documents FOR SELECT
  USING (patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid()));

CREATE POLICY "Patients manage own insurance documents" ON public.insurance_documents FOR ALL
  USING (patient_id IN (SELECT p.id FROM public.patients p JOIN public.profiles pr ON p.profile_id = pr.id WHERE pr.auth_user_id = auth.uid()));

-- Doctors ONLY view insurance profile/claim if explicit consent has been granted for Insurance / Cashless billing
CREATE POLICY "Doctors view insurance with explicit consent" ON public.insurance_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consent_requests cr
      JOIN public.doctors d ON cr.doctor_id = d.id
      JOIN public.profiles pr ON d.profile_id = pr.id
      WHERE pr.auth_user_id = auth.uid()
        AND cr.patient_id = insurance_profiles.patient_id
        AND cr.status = 'GRANTED'
        AND (cr.resource_type = 'Insurance Information' OR cr.resource_type = 'All Medical Records')
        AND (cr.expires_at IS NULL OR cr.expires_at > NOW())
    )
  );

-- ==========================================================
-- SUPABASE STORAGE BUCKETS
-- ==========================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('medical-reports', 'medical-reports', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-certificates', 'doctor-certificates', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('insurance-documents', 'insurance-documents', false);
